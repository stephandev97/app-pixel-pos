import {combineReducers, configureStore} from '@reduxjs/toolkit'
import cartReducer from './cart/cartSlice'
import ordersReducer from './orders/ordersSlice'
import actionsReducer from './actions/actionsSlice';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist'
import dataReducer from './data/dataSlice'

const reducers = combineReducers({
    cart: cartReducer,
    orders: ordersReducer,
    actions: actionsReducer,
    data: dataReducer,
  })
  
  const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['cart', 'orders', 'data'],
  };
  
  const persistedReducer = persistReducer(persistConfig, reducers);
  
  export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  });
  
  export const persistor = persistStore(store);