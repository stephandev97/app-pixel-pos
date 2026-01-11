import { createAsyncThunk } from '@reduxjs/toolkit';
import { pb } from '../../lib/pb';
import {
  computeBusinessDate,
  detectFulfillment,
  itemsCountFrom,
  upsertCustomerFromOrder,
  upsertDailyStatsJsonSmart,
} from '../../utils/stats';

// Secciones de importación de acciones de Redux
import {
  upsertOrder,
  removeOrderById,
  addLocalOrder,
  markOrderSynced,
} from '../../redux/orders/ordersSlice';

// ---------- Helpers de persistencia ----------
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
});

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
      
      const totalCount = await pb.collection('orders').getList(1, 1, { filter }).then(res => res.totalItems);
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
        const localId = 'local-' + Date.now();
        dispatch(addLocalOrder({ ...withTs, id: localId, clientId: localId }));
        return null;
      }
      const created = await pb.collection('orders').create(withTs);
      return pbToOrder(created);
    } catch (err) {
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
      const orders = getState()?.orders?.orders ?? [];
      let target = orders.find((o) => (id && o.id === id) || (number && o.number === number));

      if (!target) {
        if (id) {
          target = await pb.collection('orders').getOne(id);
        } else if (number) {
          target = await pb.collection('orders').getFirstListItem(`number="${number}"`);
        }
      }
      if (!target) return rejectWithValue('Orden no encontrada');

      await pb.collection('orders').delete(target.id);

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

export const syncPendingOrders = createAsyncThunk(
  'orders/syncPendingOrders',
  async (_, { getState, dispatch }) => {
    if (!navigator.onLine) return;
    const state = getState();
    const pendings = state?.orders?.orders?.filter((o) => o.pending) || [];

    for (const p of pendings) {
      try {
        let existingOrder = null;
        try {
          existingOrder = await pb.collection('orders').getFirstListItem(`number="${p.number}"`);
          dispatch(markOrderSynced({ localId: p.id, serverOrder: pbToOrder(existingOrder) }));
          continue;
        } catch (e) {
          if (e.status !== 404) {
            console.error('Error checking for existing order:', e);
            continue;
          }
        }

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
      }
    }
  }
);
