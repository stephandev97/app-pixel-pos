import { createSlice } from '@reduxjs/toolkit';

import { addItemToCart, AddNewProduct, removeItemFromCart } from './cart-utils';

const INITIAL_STATE = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: INITIAL_STATE,
  reducers: {
    addToCart: (state, action) => {
      return {
        ...state,
        cartItems: addItemToCart(state.cartItems, action.payload),
      };
    },
    removeFromCart: (state, action) => {
      return {
        ...state,
        cartItems: removeItemFromCart(state.cartItems, action.payload),
      };
    },
    clearCart: (state) => {
      return {
        ...state,
        cartItems: [],
      };
    },
    addNewProductToCart: (state, action) => {
      return {
        ...state,
        cartItems: AddNewProduct(state.cartItems, action.payload),
      };
    },
    incrementById: (state, { payload: id }) => {
      const it = state.cartItems.find((x) => x.id === id);
      if (it) it.quantity = (it.quantity || 1) + 1;
    },
    decrementById: (state, { payload: id }) => {
      const it = state.cartItems.find((x) => x.id === id);
      if (!it) return;
      if ((it.quantity || 1) > 1) it.quantity -= 1;
      else state.cartItems = state.cartItems.filter((x) => x.id !== id);
    },
  },
});

export const {
  incrementById,
  decrementById,
  addToCart,
  removeFromCart,
  clearCart,
  addNewProductToCart,
} = cartSlice.actions;

export default cartSlice.reducer;
