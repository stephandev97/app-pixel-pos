import { pb } from "../../lib/pb";
import { upsertOrder, removeOrderById } from "../../redux/orders/ordersSlice";



// al tope del archivo
let __ordersRealtimeActive = false;

export const subscribeOrdersRealtime = () => (dispatch, getState) => {
  // no intentes si no hay internet
  if (!navigator.onLine) {
    console.warn("[realtime] offline → no me suscribo todavía");
    return () => {};
  }
  // evita doble suscripción
  if (__ordersRealtimeActive) {
    console.warn("[realtime] ya estaba activo");
    return () => {};
  }

  try {
    __ordersRealtimeActive = true;

    const handler = (e) => {
      if (e.action === "delete") {
        dispatch(removeOrderById(e.record.id));
        return;
      }

      // filtro “hoy de negocio” por created con corte consistente
      const CUTOFF_HOUR = 3;
      const now = new Date();
      const localNow = new Date(now);
      if (localNow.getHours() < CUTOFF_HOUR) localNow.setDate(localNow.getDate()-1);
      const todayKey = localNow.toISOString().slice(0,10);

      let recKey = null;
      if (e.record?.created) {
        const created = new Date(e.record.created);
        const lc = new Date(created);
        if (lc.getHours() < CUTOFF_HOUR) lc.setDate(lc.getDate()-1);
        recKey = lc.toISOString().slice(0,10);
      }
      if (recKey && recKey !== todayKey) return;

      // map y upsert
      const r = e.record;
      const mapped = {
        id: r.id,
        number: r.number ?? r.id,
        direccion: r.direccion ?? "",
        total: Number(r.total ?? 0),
        pago: r.pago ?? "",
        cambio: Number(r.cambio ?? 0),
        check: !!r.check,
        items: Array.isArray(r.items) ? r.items : [],
        hora: r.hora ?? "",
        created: r.created,
        updated: r.updated,
        clientCreatedAt: r.clientCreatedAt ?? null,
      };
      dispatch(upsertOrder(mapped));
    };

    const sub = pb.collection("orders").subscribe("*", handler);

    // devolvé el “unsubscribe”
    return async () => {
      try { await pb.collection("orders").unsubscribe("*"); } finally { __ordersRealtimeActive = false; }
    };
  } catch (err) {
    // ⚠️ acá cae el “ClientResponseError 0” cuando el handshake falla
    console.error("[realtime] error al conectar:", err);
    __ordersRealtimeActive = false;
    return () => {};
  }
};

// re-exporta si ya lo hacías antes
export { hydrateOrdersFromPocket, addOrderOnBoth, removeOrderFromBoth, syncPendingOrders } from "../../redux/orders/ordersSlice";