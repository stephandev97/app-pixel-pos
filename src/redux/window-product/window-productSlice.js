import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
    windowproduct: [],
}

export const windowProductSlice = createSlice({
    name: 'windowproduct',
    initialState: INITIAL_STATE,
    reducers: {
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
        }
    }

})

//export const { addProduct, deleteProduct, editProduct } = productsSlice.actions;

export default productsSlice.reducer;
