// src/hooks/useNetworkSync.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { syncPendingOrders } from '../redux/orders/ordersSlice';

/**
 * Global listener that dispatches syncPendingOrders whenever the browser goes online.
 * This hook should be used at the top‑level of the application (e.g., in App.js).
 */
export const useNetworkSync = () => {
    const dispatch = useDispatch();
    const orders = useSelector((state) => state.orders.orders);
    const hasPending = orders.some((o) => o.pending);

    useEffect(() => {
        const handleOnline = () => {
            dispatch(syncPendingOrders());
        };
        window.addEventListener('online', handleOnline);
        // If already online on mount, trigger sync immediately.
        if (navigator.onLine) {
            dispatch(syncPendingOrders());
        }

        let intervalId;
        if (hasPending) {
            // Intentar sincronizar cada 15 segundos si hay pendientes
            intervalId = setInterval(() => {
                if (navigator.onLine) {
                    dispatch(syncPendingOrders());
                }
            }, 15000);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            if (intervalId) clearInterval(intervalId);
        };
    }, [dispatch, hasPending]);
};
