import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { syncPendingOrders } from '../redux/orders/ordersSlice';
import { initLanSync, syncLanOrdersCache } from '../utils/lanSyncClient';

/**
 * Global listener that dispatches syncPendingOrders whenever the browser goes online or has pending orders,
 * and maintains the local LAN server/client synchronization.
 */
export const useNetworkSync = () => {
    const dispatch = useDispatch();
    const orders = useSelector((state) => state.orders.orders);
    const hasPending = orders.some((o) => o.pending);

    // Inicializar sincronización LAN una sola vez
    useEffect(() => {
        initLanSync(dispatch);
    }, [dispatch]);

    // Mantener el cache de órdenes en memoria en Electron actualizado para clientes LAN
    useEffect(() => {
        syncLanOrdersCache(orders);
    }, [orders]);

    useEffect(() => {
        const triggerSync = () => {
            if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
            dispatch(syncPendingOrders());
        };

        window.addEventListener('online', triggerSync);
        window.addEventListener('focus', triggerSync);

        // Al montar o reconectar, intentar sincronizar de inmediato
        triggerSync();

        // Reintentar periódicamente cada 15s si hay pendientes, o cada 60s como heartbeat
        const intervalTime = hasPending ? 15000 : 60000;
        const intervalId = setInterval(triggerSync, intervalTime);

        return () => {
            window.removeEventListener('online', triggerSync);
            window.removeEventListener('focus', triggerSync);
            clearInterval(intervalId);
        };
    }, [dispatch, hasPending]);
};
