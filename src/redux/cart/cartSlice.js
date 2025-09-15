import {
  AddNewProduct,
    addItemToCart,
    removeItemFromCart,
  } from './cart-utils';
  
  import { createSlice } from '@reduxjs/toolkit';
  
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
      clearCart: state => {
        return {
          ...state,
          cartItems: [],
        };
      },
      addNewProductToCart: (state, action) => {
        return {
          ...state,
          cartItems: AddNewProduct(state.cartItems, action.payload)
        }
      }
    
  }});
  
  export const { addToCart, removeFromCart, clearCart, addNewProductToCart} =
    cartSlice.actions;
  
  export default cartSlice.reducer;