import { createSlice } from "@reduxjs/toolkit";
import { addFileSaboresToList, addProductToList, deleteProductToList, editProductExist, addListProducts } from "./data-utils"

const INITIAL_STATE = {
  products: [],
}

export const dataSlice = createSlice({
    name: 'products',
    initialState: INITIAL_STATE,
    reducers: {
        addFileSabores: (state, action) => {
            return {
                ...state,
                sabores: addFileSaboresToList(state.sabores, action.payload)
            }
        },
        removeSabores: state => {
            return {
              ...state,
              sabores: []
            }
        },
        addProduct: (state, action) => {
            return {
                ...state,
                products: addProductToList(state.products, action.payload)
            }
        },
        deleteProduct: (state, action) => {
            return {
                ...state, 
                products: deleteProductToList(state.products, action.payload)
            }
        },
        editProduct: (state, action) => {
            return {
              ...state,
              products: editProductExist(state.products, action.payload)
            }
        },
        addListPro: (state, action) => {
            return {
              ...state,
              products: addListProducts(state.products, action.payload)
            }
        },
        removeProducts: state => {
            return {
              ...state,
              products: []
            }
        },
    }

})

export const { addFileSabores, removeSabores, addProduct, deleteProduct, editProduct, addListPro, removeProducts} = dataSlice.actions;

export default dataSlice.reducer;

