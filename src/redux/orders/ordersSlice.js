import { createSlice } from '@reduxjs/toolkit';
import { addPedidoToOrders, removeOrder, minNumOrder, toggleCheck } from './orders-utils';
  
  const INITIAL_STATE = {
    orders: [],
  };
  
  const ordersSlice = createSlice({
    name: 'orders',
    initialState: INITIAL_STATE,
    reducers: {
      addToOrders: (state, action) => {
        return {
          ...state,
          orders: addPedidoToOrders(state.orders, action.payload),
        }
      },
      removeFromOrders: (state, action) => {
        return {
          ...state,
          orders: removeOrder(state.orders, action.payload),
        }
      },
      reduceNumOrder: (state, action) => {
        return {
          ...state,
          orders: minNumOrder(state.orders, action.payload)
        }
      },
      changeCheck: (state, action) => {
        return {
        ...state,
        orders: toggleCheck(state.orders, action.payload)
        }
      },
      removeOrders: state => {
        return {
          ...state,
          orders: []
        }
      },
}});
  
  export const { addToOrders, removeFromOrders, reduceNumOrder, changeCheck, removeOrders } = ordersSlice.actions;
  
  export default ordersSlice.reducer;