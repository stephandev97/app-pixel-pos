import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import actionsReducer from './actions/actionsSlice';
import cartReducer from './cart/cartSlice';
import dataReducer from './data/dataSlice';
import ordersReducer from './orders/ordersSlice';

const reducers = combineReducers({
  cart: cartReducer,
  orders: ordersReducer,
  actions: actionsReducer,
  data: dataReducer,
});

// --- Corte de día de negocio (cambiá a 4 si querés 04:00) ---
const CUTOFF_HOUR = 3;
function isInTodayWindow(createdIso) {
  if (!createdIso) return false;
  const now = new Date();
  const start = new Date(now);
  if (start.getHours() < CUTOFF_HOUR) start.setDate(start.getDate() - 1);
  start.setHours(CUTOFF_HOUR, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const t = new Date(createdIso).getTime();
  return t >= start.getTime() && t < end.getTime();
}
const ordersTodayTransform = createTransform(
  (inbound) => inbound,
  (outbound) => {
    const list = Array.isArray(outbound?.orders) ? outbound.orders : outbound?.list || [];
    const kept = list.filter((o) => o?.pending === true || isInTodayWindow(o?.created));
    return { ...(outbound || {}), orders: kept, list: kept };
  },
  { whitelist: ['orders'] }
);

const persistConfig = {
  key: 'pixelapp',
  storage,
  whitelist: ['cart', 'orders', 'data'],
  transforms: [ordersTodayTransform],
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
