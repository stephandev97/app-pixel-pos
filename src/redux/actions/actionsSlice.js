import { createSlice } from '@reduxjs/toolkit';

const INITIAL_STATE = {
  hiddenCart: true,
  hiddenFinish: true,
  toggleEfectivo: true,
  toggleAddress: true,
  toggleHome: true,
  toggleConfig: false,
  toggleEditor: false,
  toggleOrders: false,
  toggleEditorSabores: false,
  finishOrder: false,
  pago: 0,
  toggleDailyStats: false,
  showLoginModal: false,
  isAdmin: false,
};

const actionsSlice = createSlice({
  name: 'actions',
  initialState: INITIAL_STATE,
  reducers: {
    toggleHiddenCart: (state) => {
      return {
        ...state,
        hiddenCart: !state.hiddenCart,
      };
    },
    toggleHiddenFinish: (state) => {
      return {
        ...state,
        hiddenFinish: !state.hiddenFinish,
      };
    },
    toggleEfectivo: (state, action) => {
      state.toggleEfectivo = action.payload;
    },
    toggleAddress: (state, action) => {
      state.toggleAddress = action.payload;
    },
    changePago: (state, action) => {
      state.pago = action.payload;
    },
    toggleHome: (state, action) => {
      state.toggleHome = action.payload;
    },
    toggleEditor: (state, action) => {
      state.toggleEditor = action.payload;
    },
    toggleEditorSabores: (state, action) => {
      state.toggleEditorSabores = action.payload;
    },
    toggleFinishOrder: (state, action) => {
      state.finishOrder = action.payload;
    },
    toggleConfig: (state, action) => {
      state.toggleConfig = action.payload;
    },
    toggleOrders: (state, action) => {
      state.toggleOrders = action.payload;
    },
    toggleDailyStats: (state, action) => {
      state.toggleDailyStats = action.payload;
    },
    setShowLoginModal: (state, action) => {
      state.showLoginModal = action.payload;
    },
    setIsAdmin: (state, action) => {
      state.isAdmin = action.payload;
    },
  },
});

export const {
  setShowLoginModal,
  setIsAdmin,
  toggleDailyStats,
  toggleOrders,
  toggleConfig,
  toggleFinishOrder,
  toggleHiddenCart,
  toggleHiddenFinish,
  toggleEfectivo,
  toggleAddress,
  changeDir,
  changePago,
  toggleHome,
  toggleEditor,
  toggleEditorSabores,
} = actionsSlice.actions;

export default actionsSlice.reducer;
