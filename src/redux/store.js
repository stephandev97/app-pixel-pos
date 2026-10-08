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

// Solo persistir órdenes offline pendientes y testOrders para máxima velocidad de Redux
const ordersPendingTransform = createTransform(
  (inbound) => {
    const list = Array.isArray(inbound?.orders) ? inbound.orders : [];
    const pendingOnly = list.filter((o) => o?.pending === true);
    return {
      ...(inbound || {}),
      orders: pendingOnly,
      list: pendingOnly,
      testOrders: Array.isArray(inbound?.testOrders) ? inbound.testOrders : [],
    };
  },
  (outbound) => outbound,
  { whitelist: ['orders'] }
);

const persistConfig = {
  key: 'pixelapp',
  storage,
  whitelist: ['cart', 'orders', 'data'],
  transforms: [ordersPendingTransform],
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
