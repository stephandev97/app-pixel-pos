import { pb } from '../../lib/pb';

// al tope del archivo
let __ordersRealtimeActive = false;

export const subscribeOrdersRealtime = () => () => {
  // no intentes si no hay internet
  if (!navigator.onLine) {
    console.warn('[realtime] offline → no me suscribo todavía');
    return () => {};
  }
  // evita doble suscripción
  if (__ordersRealtimeActive) {
    console.warn('[realtime] ya estaba activo');
    return () => {};
  }

  try {
    __ordersRealtimeActive = true;

    // devolvé el “unsubscribe”
    return async () => {
      try {
        await pb.collection('orders').unsubscribe('*');
      } finally {
        __ordersRealtimeActive = false;
      }
    };
  } catch (err) {
    // ⚠️ acá cae el “ClientResponseError 0” cuando el handshake falla
    console.error('[realtime] error al conectar:', err);
    __ordersRealtimeActive = false;
    return () => {};
  }
};

// re-exporta si ya lo hacías antes
export {
  addOrderOnBoth,
  hydrateOrdersFromPocket,
  removeOrderFromBoth,
  syncPendingOrders,
} from '../../redux/orders/ordersSlice';
