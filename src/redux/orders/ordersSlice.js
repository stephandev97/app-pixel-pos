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

function normalizePaymentFields({
  pago,
  total,
  pagoDetalle,
  pagoEfectivo,
  pagoMp,
  pagoDebito,
  method,
}) {
  let ef = Number(pagoEfectivo || 0);
  let mp = Number(pagoMp || 0);
  let db = Number(pagoDebito || 0);

  // ✅ Si vino débito explícito o method=debito, no lo conviertas a efectivo
  const isDebito =
    String(method || '').toLowerCase() === 'debito' ||
    String(pagoDetalle || '')
      .toLowerCase()
      .includes('débito') ||
    String(pagoDetalle || '')
      .toLowerCase()
      .includes('debito') ||
    db > 0;

  if (isDebito) {
    // blindaje: dejamos efectivo y mp en 0, y débito como venga (o total)
    if (db === 0) db = Number(total || pago || 0);
    return { pagoEfectivo: 0, pagoMp: 0, pagoDebito: db };
  }

  // Si es mixto y no vino desglosado, intentar parsear del texto ("EF $2000 + MP $8600")
  if (String(pago) === 'Mixto' && ef === 0 && mp === 0 && typeof pagoDetalle === 'string') {
    const m = pagoDetalle.match(/EF\s*\$?\s*([\d.,]+)\s*\+\s*MP\s*\$?\s*([\d.,]+)/i);
    if (m) {
      const toNum = (s) => Number(String(s).replace(/[^\d.-]/g, '')) || 0;
      ef = toNum(m[1]);
      mp = toNum(m[2]);
    }
  }

  // Si pago es número → asumimos todo EF (solo si no es débito)
  if (typeof pago === 'number' && ef === 0 && mp === 0 && db === 0) {
    ef = Number(pago || 0);
  }

  // Si es Transferencia y no vino desglose → todo MP == total
  if (String(pago).toLowerCase().includes('transferencia') && ef === 0 && mp === 0) {
    mp = Number(total || 0);
  }

  return { pagoEfectivo: ef, pagoMp: mp, pagoDebito: db };
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

const TEST_ORDERS_KEY = 'pixel_pos_test_orders_v1';

const loadTestOrdersFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(TEST_ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveTestOrdersToStorage = (testOrders) => {
  try {
    localStorage.setItem(TEST_ORDERS_KEY, JSON.stringify(testOrders));
  } catch {
    // ignore
  }
};

const loadPendingFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  } catch {
    return [];
  }
};

const savePendingToStorage = (orders) => {
  try {
    const onlyPending = orders.filter(
      (o) => o.pending === true && !o.isTestOrder && !(typeof o.id === 'string' && o.id.startsWith('local-test-'))
    );
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

  // cliente y puntos
  client: rec.client ?? rec.clientId ?? null,
  points: Number(rec.points ?? 0),
  pointsClaimed: !!rec.pointsClaimed,
  copied: !!rec.copied,

  pagoDebito: Number(rec.pagoDebito ?? 0),
});

export const hydrateOrdersFromPocket = createAsyncThunk(
  'orders/hydrate',
  async ({ page = 1, perPage = 10 }, { rejectWithValue }) => {
    try {
      const startOfBusinessDay = computeBusinessDate(new Date(), 3);
      const filter = `businessDate = "${startOfBusinessDay}"`;

      const list = await pb.collection('orders').getList(page, perPage, {
        filter,
        sort: '-clientCreatedAt,-created',
      });

      return list;
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al hidratar pedidos');
    }
  }
);

export const fetchTotalOrdersCount = createAsyncThunk(
  'orders/fetchTotalOrdersCount',
  async (_, { rejectWithValue }) => {
    try {
      const startOfBusinessDay = computeBusinessDate(new Date(), 3);
      const filter = `businessDate = "${startOfBusinessDay}"`;

      const totalCount = await pb
        .collection('orders')
        .getList(1, 1, { filter })
        .then((res) => res.totalItems);
      return totalCount;
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener el conteo total');
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

      const list = await pb.collection('orders').getList(nextPage, 10, {
        filter,
        sort: '-clientCreatedAt,-created',
      });

      return list;
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener más pedidos');
    }
  }
);

export const hydrateAllTodayOrders = createAsyncThunk(
  'orders/hydrateAllToday',
  async (_, { rejectWithValue }) => {
    try {
      const startOfBusinessDay = computeBusinessDate(new Date(), 3);
      const filter = `businessDate = "${startOfBusinessDay}"`;
      const perPage = 20;
      let page = 1;
      let allItems = [];

      const first = await pb.collection('orders').getList(page, perPage, {
        filter,
        sort: '-clientCreatedAt,-created',
      });

      allItems = [...first.items];
      const totalPages = first.totalPages || 1;
      const totalItems = first.totalItems || allItems.length;

      while (page < totalPages) {
        page += 1;
        const next = await pb.collection('orders').getList(page, perPage, {
          filter,
          sort: '-clientCreatedAt,-created',
        });
        allItems.push(...next.items);
      }

      return {
        items: allItems,
        page,
        perPage,
        totalItems,
        totalPages,
      };
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al cargar todos los pedidos del día');
    }
  }
);

export const fetchTodayPendingOrders = createAsyncThunk(
  'orders/fetchTodayPendingOrders',
  async (_, { rejectWithValue }) => {
    try {
      const startOfBusinessDay = computeBusinessDate(new Date(), 3);
      const filter = `businessDate = "${startOfBusinessDay}" && direccion != "Retiro" && copied != true`;

      const res = await pb.collection('orders').getList(1, 50, {
        filter,
        sort: '-clientCreatedAt,-created',
      });

      return {
        totalItems: res.totalItems,
        items: res.items.map(pbToOrder),
      };
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener pedidos pendientes del día');
    }
  }
);

export const addOrderOnBoth = createAsyncThunk(
  'orders/addOrderOnBoth',
  async (payload, { dispatch, getState }) => {
    const isTestMode = Boolean(getState()?.actions?.isTestMode);
    const localId = (isTestMode ? 'local-test-' : 'local-') + Date.now();
    const orderData = {
      ...payload,
      isTestOrder: isTestMode,
      clientCreatedAt: payload.clientCreatedAt ?? Date.now(),
    };

    // Si estamos en Modo Prueba, retornamos la orden de prueba local sin tocar PocketBase
    if (isTestMode) {
      const localOrder = { ...orderData, id: localId, clientId: localId, pending: false, isTestOrder: true };
      return localOrder;
    }

    // Si estamos offline, guardamos localmente y retornamos la orden local.
    if (!navigator.onLine) {
      const localOrder = { ...orderData, id: localId, clientId: localId, pending: true };
      dispatch(ordersSlice.actions.addLocalOrder(localOrder));
      return localOrder;
    }

    // Si estamos online, intentamos crearla en el servidor.
    try {
      const { pagoEfectivo, pagoMp, pagoDebito } = normalizePaymentFields(orderData);
      const created = await pb.collection('orders').create({
        ...orderData,
        pagoEfectivo,
        pagoMp,
        pagoDebito,
      });
      return pbToOrder(created);
    } catch (err) {
      // Si falla, guardamos localmente y retornamos la orden local.
      console.error('Error creando orden en servidor, guardando localmente:', err);
      const localOrder = { ...orderData, id: localId, clientId: localId, pending: true };
      return localOrder;
    }
  }
);

export const removeOrderFromBoth = createAsyncThunk(
  'orders/removeOrderFromBoth',
  async ({ id, number, reason }, { getState, rejectWithValue }) => {
    try {
      const orders = getState()?.orders?.orders ?? [];
      const testOrders = getState()?.orders?.testOrders ?? [];
      let target =
        orders.find((o) => (id && o.id === id) || (number && o.number === number)) ||
        testOrders.find((o) => (id && o.id === id) || (number && o.number === number));

      if (!target && id && id.startsWith('local-test-')) {
        return { id };
      }

      if (!target) {
        if (id) {
          target = await pb.collection('orders').getOne(id);
        } else if (number) {
          target = await pb.collection('orders').getFirstListItem(`number="${number}"`);
        }
      }
      if (!target) return rejectWithValue('Orden no encontrada');

      // Si es una orden de prueba o local (pending), solo la borramos del estado y retornamos.
      if (target.isTestOrder || (typeof target.id === 'string' && target.id.startsWith('local-test-')) || target.pending) {
        return { id: target.id };
      }

      await pb.collection('orders').delete(target.id);

      try {
        const deletedAtIso = new Date().toISOString();
        const createdMs =
          typeof target.clientCreatedAt === 'number'
            ? target.clientCreatedAt
            : target.created
              ? new Date(target.created).getTime()
              : Date.now();
        const createdDate = new Date(createdMs);
        const dayForLog = target.businessDate || computeBusinessDate(createdDate, 3);
        const { method: detectedMethod, revenueAmount: detectedRevenue } = detectPayment(
          target.pago,
          target.total
        );
        const method = target.method ?? detectedMethod ?? null;
        const revenueAmount = Number(target.revenueAmount ?? detectedRevenue ?? 0);
        const ef = Number(target.pagoEfectivo ?? 0);
        const mp = Number(target.pagoMp ?? 0);
        const db = Number(target.pagoDebito ?? 0);
        const paidAmount =
          target.paidAmount && typeof target.paidAmount === 'object'
            ? target.paidAmount
            : ef || mp || db
              ? {
                  ...(ef ? { efectivo: ef } : {}),
                  ...(mp ? { transferencia: mp } : {}),
                  ...(db ? { debito: db } : {}),
                }
              : method
                ? { [method]: revenueAmount }
                : {};
        const { mode, address } = detectFulfillment(target.direccion);

        await pb.collection('order_deletions').create({
          orderId: target.id,
          number: target.number ?? target.id,
          businessDate: dayForLog,
          deletedAt: deletedAtIso,
          total: Number(target.total ?? 0),
          reason: String(reason || '').trim() || null,
          method,
          revenueAmount,
          paidAmount,
          pagoEfectivo: ef,
          pagoMp: mp,
          pagoDebito: db,
          mode,
          address,
          phone: target.phone ?? null,
          name: target.name ?? null,
          itemsCount: itemsCountFrom(target.items),
          clientCreatedAt: new Date(createdMs).toISOString(),
          items: Array.isArray(target.items) ? target.items : [],
        });
      } catch (_) {
        void 0;
      }

      const createdMs =
        typeof target.clientCreatedAt === 'number'
          ? target.clientCreatedAt
          : target.created
            ? new Date(target.created).getTime()
            : Date.now();
      const createdDate = new Date(createdMs);
      const day = target.businessDate || computeBusinessDate(createdDate, 3);

      const { method: detectedMethod, revenueAmount: detectedRevenue } = detectPayment(
        target.pago,
        target.total
      );
      const method = target.method ?? detectedMethod ?? null;
      const revenueAmount = Number(target.revenueAmount ?? detectedRevenue ?? 0);

      const ef = Number(target.pagoEfectivo ?? 0);
      const mp = Number(target.pagoMp ?? 0);
      const db = Number(target.pagoDebito ?? 0);
      let paidAmount =
        target.paidAmount && typeof target.paidAmount === 'object'
          ? target.paidAmount
          : ef || mp || db
            ? {
                ...(ef ? { efectivo: ef } : {}),
                ...(mp ? { transferencia: mp } : {}),
                ...(db ? { debito: db } : {}),
              }
            : method
              ? { [method]: revenueAmount }
              : {};

      const { mode, address } = detectFulfillment(target.direccion);

      await upsertDailyStatsJsonSmart({
        day,
        addRevenue: revenueAmount,
        addOrders: 1,
        addItems: itemsCountFrom(target.items),
        paidAmount,
        method,
        mode,
        address,
        sign: -1,
        pruneZero: true,
        deleteIfEmpty: true,
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
          dispatch(ordersSlice.actions.upsertOrder(pbToOrder(e.record)));
        } else if (e.action === 'delete') {
          dispatch(ordersSlice.actions.removeOrderById(e.record.id));
        }
      });
      return unsub;
    } catch (err) {
      console.error('Failed to subscribe to orders:', err);
      throw err;
    }
  }
);

export const syncPendingOrders = createAsyncThunk(
  'orders/syncPendingOrders',
  async (_, { getState, dispatch }) => {
    if (!navigator.onLine) return;
    const state = getState();
    const pendings = state?.orders?.orders?.filter((o) => o.pending && !o.isTestOrder) || [];

    for (const p of pendings) {
      try {
        let existingOrder = null;
        try {
          existingOrder = await pb.collection('orders').getFirstListItem(`number="${p.number}"`);
          dispatch(
            ordersSlice.actions.markOrderSynced({
              localId: p.id,
              serverOrder: pbToOrder(existingOrder),
            })
          );
          continue;
        } catch (e) {
          if (e.status !== 404) {
            console.error('Error checking for existing order:', e);
            continue;
          }
        }

        const { pagoEfectivo, pagoMp, pagoDebito } = normalizePaymentFields(p);

        // Excluimos id y pending para que PB genere su ID
        const { id, pending, ...restOfOrder } = p;

        const payload = {
          ...restOfOrder,
          pagoEfectivo,
          pagoMp,
          pagoDebito,
          // Aseguramos que clientCreatedAt exista
          clientCreatedAt: p.clientCreatedAt ?? Date.now(),
        };

        const created = await pb.collection('orders').create(payload);
        dispatch(
          ordersSlice.actions.markOrderSynced({
            localId: p.id,
            serverOrder: pbToOrder(created),
          })
        );
      } catch (e) {
        console.error('Failed to sync pending order:', e);
      }
    }
  }
);

export const updateOrderPayment = createAsyncThunk(
  'orders/updatePayment',
  async ({ id, payload }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const orders = state?.orders?.orders ?? [];
      const target = orders.find((o) => o.id === id);
      if (!target) return rejectWithValue('Orden no encontrada en el estado local');

      // 1) Obtener datos viejos para restar de stats
      const createdMs =
        typeof target.clientCreatedAt === 'number'
          ? target.clientCreatedAt
          : target.created
            ? new Date(target.created).getTime()
            : Date.now();
      const createdDate = new Date(createdMs);
      const day = target.businessDate || computeBusinessDate(createdDate, 3);

      const { method: oldMethod, revenueAmount: oldRevenue } = detectPayment(
        target.pago,
        target.total
      );
      const methodBefore = target.method ?? oldMethod ?? null;
      const revenueBefore = Number(target.revenueAmount ?? oldRevenue ?? 0);
      const efBefore = Number(target.pagoEfectivo ?? 0);
      const mpBefore = Number(target.pagoMp ?? 0);
      const dbBefore = Number(target.pagoDebito ?? 0);

      const paidBefore =
        target.paidAmount && typeof target.paidAmount === 'object'
          ? target.paidAmount
          : efBefore || mpBefore || dbBefore
            ? {
                ...(efBefore ? { efectivo: efBefore } : {}),
                ...(mpBefore ? { transferencia: mpBefore } : {}),
                ...(dbBefore ? { debito: dbBefore } : {}),
              }
            : methodBefore
              ? { [methodBefore]: revenueBefore }
              : {};
      // 2) Actualizar en PocketBase
      const updatedRecord = await pb.collection('orders').update(id, payload);
      const updatedOrder = pbToOrder(updatedRecord);

      // 3) Obtener datos nuevos para sumar a stats
      const methodAfter = updatedOrder.method ?? null;
      const revenueAfter = Number(updatedOrder.revenueAmount ?? updatedOrder.total ?? 0);
      const efAfter = Number(updatedOrder.pagoEfectivo ?? 0);
      const mpAfter = Number(updatedOrder.pagoMp ?? 0);
      const dbAfter = Number(updatedOrder.pagoDebito ?? 0);

      const paidAfter =
        updatedOrder.paidAmount && typeof updatedOrder.paidAmount === 'object'
          ? updatedOrder.paidAmount
          : efAfter || mpAfter || dbAfter
            ? {
                ...(efAfter ? { efectivo: efAfter } : {}),
                ...(mpAfter ? { transferencia: mpAfter } : {}),
                ...(dbAfter ? { debito: dbAfter } : {}),
              }
            : methodAfter
              ? { [methodAfter]: revenueAfter }
              : {};

      // 4) Actualizar stats (restar viejo, sumar nuevo)
      await upsertDailyStatsJsonSmart({
        day,
        addRevenue: revenueBefore,
        addOrders: 0,
        addItems: {},
        paidAmount: paidBefore,
        method: Object.keys(paidBefore).length ? null : methodBefore,
        mode: null,
        address: null,
        sign: -1,
        pruneZero: true,
        deleteIfEmpty: false,
      });

      await upsertDailyStatsJsonSmart({
        day,
        addRevenue: revenueAfter,
        addOrders: 0,
        addItems: {},
        paidAmount: paidAfter,
        method: Object.keys(paidAfter).length ? null : methodAfter,
        mode: null,
        address: null,
        sign: 1,
        pruneZero: true,
        deleteIfEmpty: false,
      });

      return updatedOrder;
    } catch (err) {
      console.error('Error al actualizar pago:', err?.status, err?.data || err);
      return rejectWithValue(err?.data || String(err));
    }
  }
);

// ---------- Slice ----------
const initialState = {
  orders: loadPendingFromStorage(), // arrancamos con los pending guardados
  testOrders: loadTestOrdersFromStorage(),
  status: 'idle',
  error: null,
  totalOrdersCount: 0,
  pagination: {
    page: 0,
    perPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasMore: false,
  },
  lastCreatedOrder: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addTestOrder(state, { payload }) {
      if (!payload) return;
      if (!Array.isArray(state.testOrders)) {
        state.testOrders = loadTestOrdersFromStorage();
      }
      const exists = state.testOrders.some((o) => o.id === payload.id);
      if (!exists) {
        state.testOrders.unshift(payload);
      } else {
        const idx = state.testOrders.findIndex((o) => o.id === payload.id);
        if (idx >= 0) state.testOrders[idx] = payload;
      }
      saveTestOrdersToStorage(state.testOrders);
    },
    deleteTestOrder(state, { payload: id }) {
      if (!Array.isArray(state.testOrders)) {
        state.testOrders = loadTestOrdersFromStorage();
      }
      state.testOrders = state.testOrders.filter((o) => o.id !== id);
      state.orders = state.orders.filter((o) => o.id !== id);
      saveTestOrdersToStorage(state.testOrders);
      savePendingToStorage(state.orders);
    },
    clearTestOrders(state) {
      state.testOrders = [];
      state.orders = state.orders.filter(
        (o) => !o.isTestOrder && !(typeof o.id === 'string' && o.id.startsWith('local-test-'))
      );
      saveTestOrdersToStorage(state.testOrders);
      savePendingToStorage(state.orders);
    },
    upsertOrder(state, { payload: o }) {
      const pendingIdx = state.orders.findIndex((x) => x.pending && x.number === o.number);

      if (pendingIdx >= 0) {
        state.orders[pendingIdx] = { ...state.orders[pendingIdx], ...o };
        savePendingToStorage(state.orders);
        return;
      }

      const i = state.orders.findIndex((x) => x.id === o.id);
      if (i >= 0) state.orders[i] = { ...state.orders[i], ...o };
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
      state.pagination = { ...initialState.pagination };
      savePendingToStorage(state.orders);
    },
    clearLastCreatedOrder(state) {
      state.lastCreatedOrder = null;
    },

    // --- Offline helpers ---
    addLocalOrder(state, { payload }) {
      const localOrder = {
        ...payload,
        pending: true,
      };
      state.orders.unshift(localOrder);
      state.lastCreatedOrder = localOrder;
      savePendingToStorage(state.orders);
    },
    markOrderSynced(state, { payload }) {
      const { localId, serverOrder } = payload;
      const idx = state.orders.findIndex((o) => o.id === localId);
      if (idx >= 0) {
        state.orders[idx] = { ...serverOrder };

        // Migrar estado de impresión (local -> server)
        try {
          const printedKey = `order-printed-${localId}`;
          if (localStorage.getItem(printedKey) === 'true') {
            localStorage.setItem(`order-printed-${serverOrder.id}`, 'true');
            localStorage.removeItem(printedKey);
          }
          // Migrar estado oculto
          const hiddenKey = `order-hidden-${localId}`;
          const hiddenVal = localStorage.getItem(hiddenKey);
          if (hiddenVal !== null) {
            localStorage.setItem(`order-hidden-${serverOrder.id}`, hiddenVal);
            localStorage.removeItem(hiddenKey);
          }
        } catch (e) {
          console.warn('Error migrando localStorage keys', e);
        }
      }
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
      const pendings = s.orders.filter((o) => o.pending);
      // Mantener pedidos pendientes de delivery cargados previamente
      const pendingDeliveries = s.orders.filter((o) => {
        const isRet = String(o?.direccion ?? '').trim().toLowerCase() === 'retiro';
        return !isRet && !o.copied;
      });
      const incoming = payload.items.map(pbToOrder);
      const incomingIds = new Set(incoming.map((o) => o.id));
      const preservedDeliveries = pendingDeliveries.filter((o) => !incomingIds.has(o.id));

      s.orders = [...pendings, ...incoming, ...preservedDeliveries];
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

    b.addCase(fetchTodayPendingOrders.fulfilled, (s, { payload }) => {
      if (!payload?.items) return;
      const existingIds = new Set(s.orders.map((o) => o.id));
      payload.items.forEach((pOrder) => {
        if (!existingIds.has(pOrder.id)) {
          s.orders.push(pOrder);
          existingIds.add(pOrder.id);
        } else {
          const idx = s.orders.findIndex((o) => o.id === pOrder.id);
          if (idx >= 0) {
            s.orders[idx] = { ...s.orders[idx], ...pOrder };
          }
        }
      });
      savePendingToStorage(s.orders);
    });

    b.addCase(hydrateAllTodayOrders.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    });
    b.addCase(hydrateAllTodayOrders.fulfilled, (s, { payload }) => {
      s.status = 'succeeded';
      const pendings = s.orders.filter((o) => o.pending);
      s.orders = [...pendings, ...payload.items.map(pbToOrder)];
      s.pagination = {
        page: payload.page,
        perPage: payload.perPage,
        totalItems: payload.totalItems,
        totalPages: payload.totalPages,
        hasMore: false,
      };
      savePendingToStorage(s.orders);
    });
    b.addCase(hydrateAllTodayOrders.rejected, (s, { payload }) => {
      s.status = 'failed';
      s.error = payload || 'Fallo al hidratar todos';
    });

    b.addCase(fetchMoreOrders.pending, (s) => {
      s.status = 'loadingMore';
    });
    b.addCase(fetchMoreOrders.fulfilled, (s, { payload }) => {
      s.status = 'succeeded';
      if (!payload) return;
      const existingIds = new Set(s.orders.map((o) => o.id));
      const newItems = payload.items.map(pbToOrder).filter((o) => !existingIds.has(o.id));
      s.orders = [...s.orders, ...newItems];
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

    // ✅ CLAVE: status correcto + anti-duplicados
    b.addCase(addOrderOnBoth.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    });
    b.addCase(addOrderOnBoth.fulfilled, (s, { payload }) => {
      s.status = 'succeeded';
      if (!payload) return;

      if (payload.isTestOrder) {
        if (!Array.isArray(s.testOrders)) {
          s.testOrders = loadTestOrdersFromStorage();
        }
        const exists = s.testOrders.some((o) => o.id === payload.id);
        if (!exists) {
          s.testOrders.unshift(payload);
        } else {
          const idx = s.testOrders.findIndex((o) => o.id === payload.id);
          if (idx >= 0) s.testOrders[idx] = payload;
        }
        saveTestOrdersToStorage(s.testOrders);
        s.lastCreatedOrder = payload;
        return;
      }

      // anti-duplicados (realtime + fulfilled)
      ordersSlice.caseReducers.upsertOrder(s, { payload });
      s.lastCreatedOrder = payload;
    });
    b.addCase(addOrderOnBoth.rejected, (s, { payload }) => {
      s.status = 'failed';
      s.error = payload || null;
    });

    b.addCase(removeOrderFromBoth.fulfilled, (s, { payload }) => {
      s.orders = s.orders.filter((o) => o.id !== payload.id);
      if (!Array.isArray(s.testOrders)) {
        s.testOrders = loadTestOrdersFromStorage();
      }
      s.testOrders = s.testOrders.filter((o) => o.id !== payload.id);
      savePendingToStorage(s.orders);
      saveTestOrdersToStorage(s.testOrders);
    });
    b.addCase(removeOrderFromBoth.rejected, (s, { payload }) => {
      s.error = payload || 'Fallo al borrar';
    });

    b.addCase(updateOrderPayment.fulfilled, (s, { payload }) => {
      s.status = 'succeeded';
      const idx = s.orders.findIndex((o) => o.id === payload.id);
      if (idx >= 0) {
        s.orders[idx] = { ...payload };
      }
      savePendingToStorage(s.orders);
    });

    b.addCase(syncPendingOrders.fulfilled, () => {
      // no-op (markOrderSynced ya actualiza)
    });

    b.addCase(fetchTotalOrdersCount.fulfilled, (s, { payload }) => {
      s.totalOrdersCount = payload;
    });
  },
});

export const {
  addTestOrder,
  deleteTestOrder,
  clearTestOrders,
  upsertOrder,
  removeOrderById,
  clearOrders,
  addLocalOrder,
  markOrderSynced,
  clearLastCreatedOrder,
} = ordersSlice.actions;

export default ordersSlice.reducer;
