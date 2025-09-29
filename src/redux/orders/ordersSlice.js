import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { pb } from '../../lib/pb';
import {
  computeBusinessDate,
  detectFulfillment,
  itemsCountFrom,
  upsertCustomerFromOrder,
  upsertDailyStatsJsonSmart,
} from '../../utils/stats';
// ---------- Helpers de persistencia ----------
const PENDING_KEY = 'orders_pending_v1';

// helpers (colocalo arriba del slice)
function normalizePaymentFields({ pago, total, pagoDetalle, pagoEfectivo, pagoMp }) {
  let ef = Number(pagoEfectivo || 0);
  let mp = Number(pagoMp || 0);

  // Si es mixto y no vino desglosado, intentar parsear del texto ("EF $2000 + MP $8600")
  if (String(pago) === 'Mixto' && ef === 0 && mp === 0 && typeof pagoDetalle === 'string') {
    const m = pagoDetalle.match(/EF\s*\$?\s*([\d.,]+)\s*\+\s*MP\s*\$?\s*([\d.,]+)/i);
    if (m) {
      const toNum = (s) => Number(String(s).replace(/[^\d.-]/g, '')) || 0;
      ef = toNum(m[1]);
      mp = toNum(m[2]);
    }
  }

  // Si pago es número → asumimos todo EF
  if (typeof pago === 'number' && ef === 0 && mp === 0) {
    ef = Number(pago || 0);
  }

  // Si es Transferencia y no vino desglose → todo MP == total
  if (String(pago).toLowerCase().includes('transferencia') && ef === 0 && mp === 0) {
    mp = Number(total || 0);
  }

  return { pagoEfectivo: ef, pagoMp: mp };
}

function detectPayment(pago, fallbackRevenue) {
  const isFiniteNumber = (v) =>
    typeof v === 'number'
      ? Number.isFinite(v)
      : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v));

  if (isFiniteNumber(pago)) {
    const num = Number(pago);
    return { method: 'efectivo', paidAmount: num, revenueAmount: Number(fallbackRevenue || 0) };
  }
  if (String(pago).toLowerCase().includes('transferencia')) {
    const rev = Number(fallbackRevenue || 0);
    return { method: 'transferencia', paidAmount: rev, revenueAmount: rev };
  }
  const rev = Number(fallbackRevenue || 0);
  return { method: 'otro', paidAmount: rev, revenueAmount: rev };
}

const loadPendingFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  } catch {
    return [];
  }
};

const savePendingToStorage = (orders) => {
  try {
    const onlyPending = orders.filter((o) => o.pending === true);
    localStorage.setItem(PENDING_KEY, JSON.stringify(onlyPending));
  } catch {
    // manejo futuro
  }
};

const pbToOrder = (rec) => ({
  id: rec.id,
  number: rec.number ?? rec.id,
  direccion: rec.direccion ?? '',
  total: Number(rec.total ?? 0),
  pago: rec.pago ?? '',
  cambio: Number(rec.cambio ?? 0),
  check: !!rec.check,
  items: Array.isArray(rec.items) ? rec.items : [],
  hora: rec.hora ?? '',
  created: rec.created,
  updated: rec.updated,
  clientCreatedAt: rec.clientCreatedAt ?? null,
  // -------- NUEVO: campos de pago y metadata --------
  pagoEfectivo: Number(rec.pagoEfectivo ?? 0),
  pagoMp: Number(rec.pagoMp ?? 0),
  pagoDetalle: rec.pagoDetalle ?? null,
  method: rec.method ?? null,
  paidAmount: rec.paidAmount ?? null,
  revenueAmount: rec.revenueAmount ?? null,
  businessDate: rec.businessDate ?? rec.day ?? null,
  mode: rec.mode ?? null,
  address: rec.address ?? null,
  phone: rec.phone ?? null,
  name: rec.name ?? null,
});

// ---------- Thunks existentes ----------
export const hydrateOrdersFromPocket = createAsyncThunk(
  'orders/hydrate',
  async ({ page = 1, perPage = 20 }, { rejectWithValue }) => {
    try {
      const startOfBusinessDay = computeBusinessDate(new Date(), 3);
      const filter = `businessDate = "${startOfBusinessDay}"`;
      
      const list = await pb.collection('orders').getList(page, perPage, {
        filter,
        sort: '-clientCreatedAt,-created',
      });
      
      return list; // <-- devuelve todo el objeto de paginación
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al hidratar pedidos');
    }
  }
);

export const fetchMoreOrders = createAsyncThunk(
  'orders/fetchMoreOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { pagination } = getState().orders;
      if (!pagination.hasMore) return null;

      const nextPage = pagination.page + 1;
      const startOfBusinessDay = computeBusinessDate(new Date(), 3);
      const filter = `businessDate = "${startOfBusinessDay}"`;
      
      const list = await pb.collection('orders').getList(nextPage, pagination.perPage, {
        filter,
        sort: '-clientCreatedAt,-created',
      });
      
      return list;
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener más pedidos');
    }
  }
);


export const addOrderOnBoth = createAsyncThunk(
  'orders/addOrderOnBoth',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const withTsBase = {
        clientCreatedAt: payload.clientCreatedAt ?? Date.now(),
        ...payload,
      };
      const { pagoEfectivo, pagoMp } = normalizePaymentFields(withTsBase);
      const withTs = { ...withTsBase, pagoEfectivo, pagoMp };
      if (!navigator.onLine) {
        // Offline → guardamos local
        const localId = 'local-' + Date.now();
        dispatch(addLocalOrder({ ...withTs, id: localId, clientId: localId }));
        return null; // no rompe
      }
      const created = await pb.collection('orders').create(withTs);
      return pbToOrder(created);
    } catch (err) {
      // Falló el server → guardamos local igual
      const localId = 'local-' + Date.now();
      dispatch(
        addLocalOrder({
          ...payload,
          clientCreatedAt: payload.clientCreatedAt ?? Date.now(),
          id: localId,
          clientId: localId,
        })
      );
      return rejectWithValue(err?.message || 'No se pudo crear en servidor (guardado offline)');
    }
  }
);

export const removeOrderFromBoth = createAsyncThunk(
  'orders/removeOrderFromBoth',
  async ({ id, number }, { getState, rejectWithValue }) => {
    try {
      // 1) Resolver la orden (del state o PB)
      const orders = getState()?.orders?.orders ?? [];
      let target = orders.find((o) => (id && o.id === id) || (number && o.number === number));

      if (!target) {
        // buscá por id o por number en PB
        if (id) {
          target = await pb.collection('orders').getOne(id);
        } else if (number) {
          target = await pb.collection('orders').getFirstListItem(`number="${number}"`);
        }
      }
      if (!target) return rejectWithValue('Orden no encontrada');

      // 2) Borrar primero en PB (si falla, no descontamos)
      await pb.collection('orders').delete(target.id);

      // 3) Descontar del DAILY del MISMO día de negocio (corte 03:00)
      //    Construimos una dayKey robusta:
      const createdMs =
        typeof target.clientCreatedAt === 'number'
          ? target.clientCreatedAt
          : target.created
            ? new Date(target.created).getTime()
            : Date.now();
      const createdDate = new Date(createdMs);
      // computeBusinessDate ya aplica el corte 03:00 -> 'YYYY-MM-DD'
      const day = target.businessDate || computeBusinessDate(createdDate, 3);

      // 4) Método y montos pagados
      const { method: detectedMethod, revenueAmount: detectedRevenue } = detectPayment(
        target.pago,
        target.total
      );
      const method = target.method ?? detectedMethod ?? null;
      const revenueAmount = Number(target.revenueAmount ?? detectedRevenue ?? 0);

      // Reconstruimos paidAmount si no vino como JSON
      const ef = Number(target.pagoEfectivo ?? 0);
      const mp = Number(target.pagoMp ?? 0);
      let paidAmount =
        target.paidAmount && typeof target.paidAmount === 'object'
          ? target.paidAmount
          : ef || mp
            ? {
                ...(ef ? { efectivo: ef } : {}),
                ...(mp ? { transferencia: mp } : {}),
              }
            : method
              ? { [method]: revenueAmount }
              : {};

      // Modo (retiro/delivery) y address para métricas
      const { mode, address } = detectFulfillment(target.direccion);

      await upsertDailyStatsJsonSmart({
        day,
        addRevenue: revenueAmount, // resta el ingreso
        addOrders: 1, // resta 1 orden
        addItems: itemsCountFrom(target.items), // resta cantidades por ítem
        paidAmount, // resta por método (mapa)
        method, // si no hay mapa, usa único método
        mode,
        address,
        sign: -1,
        pruneZero: true, // limpia claves a 0
        deleteIfEmpty: true, // elimina el doc si queda vacío
      });

      if (mode === 'delivery' && address) {
        await upsertCustomerFromOrder({
          address,
          phone: target.phone ?? null,
          name: target.name ?? null,
          total: revenueAmount,
          businessDate: day,
          sign: -1,
          pruneZero: true,
          deleteIfEmpty: true,
        });
      }

      // 4) Devolver info para limpiar Redux local
      return { id: target.id, number: target.number };
    } catch (err) {
      console.error('Error al borrar orden:', err?.status, err?.data || err);
      return rejectWithValue(err?.data || String(err));
    }
  }
);

export const subscribeOrdersRealtime = createAsyncThunk(
  'orders/subscribeRealtime',
  async (_, { dispatch }) => {
    try {
      const unsub = await pb.collection('orders').subscribe('*', (e) => {
        if (e.action === 'create' || e.action === 'update') {
          dispatch(upsertOrder(e.record));
        } else if (e.action === 'delete') {
          dispatch(removeOrderById(e.record.id));
        }
      });
      return unsub;
    } catch (err) {
      console.error('Failed to subscribe to orders:', err);
      throw err;
    }
  }
);

// Reintento de sincronización de pendings
export const syncPendingOrders = createAsyncThunk(
  'orders/syncPendingOrders',
  async (_, { getState, dispatch }) => {
    if (!navigator.onLine) return;
    const state = getState();
    const pendings = state?.orders?.orders?.filter((o) => o.pending) || [];

    for (const p of pendings) {
      try {
        // 1. Verificar si la orden ya existe en el servidor
        let existingOrder = null;
        try {
          // Asume que el campo 'number' es un identificador único.
          // Si no tienes un campo 'number', puedes usar 'id' o 'clientCreatedAt'
          existingOrder = await pb.collection('orders').getFirstListItem(`number="${p.number}"`);
          // Si existe, actualiza el estado local y salta a la siguiente orden
          dispatch(markOrderSynced({ localId: p.id, serverOrder: pbToOrder(existingOrder) }));
          continue; // Salta a la siguiente iteración del bucle
        } catch (e) {
          if (e.status !== 404) {
            console.error('Error checking for existing order:', e);
            continue; // Si es un error inesperado, salta a la siguiente orden
          }
          // Si el status es 404, significa que no existe, y continuamos con la creación
        }

        // 2. Si no existe, proceder con la creación
        const { pagoEfectivo, pagoMp } = normalizePaymentFields(p);
        const created = await pb.collection('orders').create({
          number: p.number,
          direccion: p.direccion,
          total: p.total,
          pago: p.pago,
          cambio: p.cambio,
          check: p.check,
          items: p.items,
          hora: p.hora,
          clientCreatedAt: p.clientCreatedAt ?? Date.now(),
          pagoEfectivo,
          pagoMp,
          pagoDetalle: p.pagoDetalle ?? null,
          method: p.method ?? null,
          paidAmount: p.paidAmount ?? null,
          revenueAmount: p.revenueAmount ?? null,
          businessDate: p.businessDate ?? null,
          mode: p.mode ?? null,
          address: p.address ?? null,
          phone: p.phone ?? null,
          name: p.name ?? null,
        });
        dispatch(markOrderSynced({ localId: p.id, serverOrder: pbToOrder(created) }));
      } catch (e) {
        console.error('Failed to sync pending order:', e);
        // si falla, queda pendiente para el próximo intento
      }
    }
  }
);

// ---------- Slice ----------
const initialState = {
  orders: loadPendingFromStorage(), // arrancamos con los pending guardados
  status: 'idle',
  error: null,
  pagination: {
    page: 0,
    perPage: 20, // <-- ajusta este valor como quieras
    totalItems: 0,
    totalPages: 0,
    hasMore: true,
  },
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // realtime create/update desde server
    upsertOrder(state, { payload: o }) {
      // Si existe un pending con mismo "number", hacemos "synced" en vez de duplicar
      const pendingIdx = state.orders.findIndex((x) => x.pending && x.number === o.number);
      if (pendingIdx >= 0) {
        state.orders[pendingIdx] = { ...o }; // reemplaza el local por el server
        savePendingToStorage(state.orders);
        return;
      }
      const i = state.orders.findIndex((x) => x.id === o.id);
      if (i >= 0) state.orders[i] = o;
      else state.orders.unshift(o);
      savePendingToStorage(state.orders);
    },
    removeOrderById(state, { payload: id }) {
      state.orders = state.orders.filter((o) => o.id !== id);
      savePendingToStorage(state.orders);
    },
    clearOrders(state) {
      state.orders = [];
      state.status = 'idle';
      state.error = null;
      state.pagination = { ...initialState.pagination }; // <-- Reset paginación
      savePendingToStorage(state.orders);
    },

    // --- Offline helpers ---
    addLocalOrder(state, { payload }) {
      const localOrder = {
        ...payload,
        pending: true,
      };
      state.orders.unshift(localOrder);
      savePendingToStorage(state.orders);
    },
    markOrderSynced(state, { payload }) {
      const { localId, serverOrder } = payload;
      const idx = state.orders.findIndex((o) => o.id === localId);
      if (idx >= 0) state.orders[idx] = { ...serverOrder };
      savePendingToStorage(state.orders);
    },
  },
  extraReducers: (b) => {
    b.addCase(hydrateOrdersFromPocket.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    });
    b.addCase(hydrateOrdersFromPocket.fulfilled, (s, { payload }) => {
      s.status = 'succeeded';
      // Mezclamos: primero los del server, y dejamos arriba los pending locales
      const pendings = s.orders.filter((o) => o.pending);
      s.orders = [...pendings, ...payload.items.map(pbToOrder)];
      s.pagination = {
        page: payload.page,
        perPage: payload.perPage,
        totalItems: payload.totalItems,
        totalPages: payload.totalPages,
        hasMore: payload.page < payload.totalPages,
      };
      savePendingToStorage(s.orders);
    });
    b.addCase(hydrateOrdersFromPocket.rejected, (s, { payload }) => {
      s.status = 'failed';
      s.error = payload || 'Fallo al hidratar';
    });

    b.addCase(fetchMoreOrders.pending, (s) => {
      s.status = 'loadingMore';
    });
    b.addCase(fetchMoreOrders.fulfilled, (s, { payload }) => {
      s.status = 'succeeded';
      s.orders = [...s.orders, ...payload.items.map(pbToOrder)];
      s.pagination = {
        page: payload.page,
        perPage: payload.perPage,
        totalItems: payload.totalItems,
        totalPages: payload.totalPages,
        hasMore: payload.page < payload.totalPages,
      };
      savePendingToStorage(s.orders);
    });
    b.addCase(fetchMoreOrders.rejected, (s, { payload }) => {
      s.status = 'failed';
      s.error = payload || 'Fallo al cargar más pedidos';
    });
    
    b.addCase(addOrderOnBoth.fulfilled, (s, { payload }) => {
      if (payload) {
        // caso online ok → el server devolvió algo
        s.orders.unshift(payload);
        savePendingToStorage(s.orders);
      }
    });
    b.addCase(addOrderOnBoth.rejected, (s, { payload }) => {
      // ya se agregó local; guardamos el error informativo si querés
      s.error = payload || null;
    });

    b.addCase(removeOrderFromBoth.fulfilled, (s, { payload }) => {
      s.orders = s.orders.filter((o) => o.id !== payload.id);
      savePendingToStorage(s.orders);
    });
    b.addCase(removeOrderFromBoth.rejected, (s, { payload }) => {
      s.error = payload || 'Fallo al borrar';
    });

    b.addCase(syncPendingOrders.fulfilled, (s) => {
      // no-op (markOrderSynced ya actualiza)
    });
  },
});

export const { upsertOrder, removeOrderById, clearOrders, addLocalOrder, markOrderSynced } =
  ordersSlice.actions;

export default ordersSlice.reducer;