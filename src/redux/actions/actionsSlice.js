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
  toggleTestOrders: false,
  toggleRewards: false,
  toggleTvSabores: false,
  toggleBarista: false,
  toggleCustomPrint: false,
  toggleEditorSabores: false,
  finishOrder: false,
  pago: 0,
  toggleDailyStats: false,
  toggleCafeCosts: false,
  showLoginModal: false,
  isAdmin: false,
  showDevQr: typeof window !== 'undefined' ? localStorage.getItem('show_dev_qr') === 'true' : false,
  showSectionProducts:
    typeof window !== 'undefined'
      ? localStorage.getItem('show_section_products') !== 'false'
      : true,
  showSectionOrders:
    typeof window !== 'undefined' ? localStorage.getItem('show_section_orders') !== 'false' : true,
  showSectionBarista:
    typeof window !== 'undefined' ? localStorage.getItem('show_section_barista') === 'true' : false,
  showSectionNotes:
    typeof window !== 'undefined' ? localStorage.getItem('show_section_notes') !== 'false' : true,
  showSectionTvSabores:
    typeof window !== 'undefined'
      ? localStorage.getItem('show_section_tv_sabores') !== 'false'
      : true,
  showSectionCafeCosts:
    typeof window !== 'undefined'
      ? localStorage.getItem('show_section_cafe_costs') === 'true'
      : false,
  showTabCafeteria:
    typeof window !== 'undefined' ? localStorage.getItem('show_tab_cafeteria') === 'true' : false,
  isTestMode:
    typeof window !== 'undefined' ? localStorage.getItem('is_test_mode') === 'true' : false,
  simulatedPendingOrder:
    typeof window !== 'undefined'
      ? localStorage.getItem('simulated_pending_order') === 'true'
      : false,
  cupSizesStock: (() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('cup_sizes_stock') : null;
      if (raw) {
        return {
          '8oz': true,
          '12oz': true,
          '16oz': true,
          '12oz_cold': true,
          '16oz_cold': true,
          ...JSON.parse(raw),
        };
      }
    } catch (_) {}
    return { '8oz': true, '12oz': true, '16oz': true, '12oz_cold': true, '16oz_cold': true };
  })(),
  extrasStock: (() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('extras_stock') : null;
      if (raw) return { crema: true, leche_almendras: true, extra_shot: true, ...JSON.parse(raw) };
    } catch (_) {}
    return { crema: true, leche_almendras: true, extra_shot: true };
  })(),
  loginIntent: null,
};

const actionsSlice = createSlice({
  name: 'actions',
  initialState: INITIAL_STATE,
  reducers: {
    toggleHiddenCart: (state, action) => {
      return {
        ...state,
        hiddenCart: typeof action?.payload === 'boolean' ? action.payload : !state.hiddenCart,
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
    toggleTvSabores: (state, action) => {
      state.toggleTvSabores = action.payload;
    },
    toggleBarista: (state, action) => {
      state.toggleBarista = action.payload;
    },
    toggleCustomPrint: (state, action) => {
      state.toggleCustomPrint = action.payload;
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
    toggleTestOrders: (state, action) => {
      state.toggleTestOrders = action.payload;
    },
    toggleRewards: (state, action) => {
      state.toggleRewards = action.payload;
    },
    toggleDailyStats: (state, action) => {
      state.toggleDailyStats = action.payload;
    },
    toggleCafeCosts: (state, action) => {
      state.toggleCafeCosts = action.payload;
    },
    setShowLoginModal: (state, action) => {
      state.showLoginModal = action.payload;
    },
    setIsAdmin: (state, action) => {
      state.isAdmin = action.payload;
    },
    setShowDevQr: (state, action) => {
      state.showDevQr = Boolean(action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('show_dev_qr', String(Boolean(action.payload)));
      }
    },
    toggleDevQr: (state) => {
      const next = !state.showDevQr;
      state.showDevQr = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem('show_dev_qr', String(next));
      }
    },
    toggleSectionProducts: (state) => {
      const next = !state.showSectionProducts;
      state.showSectionProducts = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem('show_section_products', String(next));
      }
    },
    toggleSectionOrders: (state) => {
      const next = !state.showSectionOrders;
      state.showSectionOrders = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem('show_section_orders', String(next));
      }
    },
    toggleSectionBarista: (state) => {
      const next = !state.showSectionBarista;
      state.showSectionBarista = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem('show_section_barista', String(next));
      }
    },
    toggleSectionNotes: (state) => {
      const next = !state.showSectionNotes;
      state.showSectionNotes = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem('show_section_notes', String(next));
      }
    },
    toggleSectionTvSabores: (state) => {
      const next = !state.showSectionTvSabores;
      state.showSectionTvSabores = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem('show_section_tv_sabores', String(next));
      }
    },
    toggleSectionCafeCosts: (state) => {
      const next = !state.showSectionCafeCosts;
      state.showSectionCafeCosts = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem('show_section_cafe_costs', String(next));
      }
    },
    toggleTabCafeteria: (state) => {
      const next = !state.showTabCafeteria;
      state.showTabCafeteria = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem('show_tab_cafeteria', String(next));
      }
    },
    toggleTestMode: (state, action) => {
      const next = typeof action?.payload === 'boolean' ? action.payload : !state.isTestMode;
      state.isTestMode = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem('is_test_mode', String(next));
      }
    },
    setLoginIntent: (state, action) => {
      state.loginIntent = action.payload;
    },
    toggleSimulatedPendingOrder: (state, action) => {
      const next =
        typeof action?.payload === 'boolean' ? action.payload : !state.simulatedPendingOrder;
      state.simulatedPendingOrder = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem('simulated_pending_order', String(next));
        if (next) {
          localStorage.removeItem('order-copied-mock-pending-delivery-dev');
          localStorage.removeItem('order-hidden-mock-pending-delivery-dev');
        }
      }
    },
    setCupSizesStock: (state, action) => {
      state.cupSizesStock = { ...(state.cupSizesStock || {}), ...action.payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem('cup_sizes_stock', JSON.stringify(state.cupSizesStock));
      }
    },
    toggleCupSizeStock: (state, action) => {
      const sz = action.payload;
      const current = state.cupSizesStock?.[sz] !== false;
      state.cupSizesStock = { ...(state.cupSizesStock || {}), [sz]: !current };
      if (typeof window !== 'undefined') {
        localStorage.setItem('cup_sizes_stock', JSON.stringify(state.cupSizesStock));
      }
    },
    setExtrasStock: (state, action) => {
      state.extrasStock = { ...(state.extrasStock || {}), ...action.payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem('extras_stock', JSON.stringify(state.extrasStock));
      }
    },
    toggleExtraStock: (state, action) => {
      const key = action.payload;
      const current = state.extrasStock?.[key] !== false;
      state.extrasStock = { ...(state.extrasStock || {}), [key]: !current };
      if (typeof window !== 'undefined') {
        localStorage.setItem('extras_stock', JSON.stringify(state.extrasStock));
      }
    },
  },
});

export const {
  setShowLoginModal,
  setIsAdmin,
  setShowDevQr,
  toggleDevQr,
  toggleSectionProducts,
  toggleSectionOrders,
  toggleSectionBarista,
  toggleSectionNotes,
  toggleSectionTvSabores,
  toggleSectionCafeCosts,
  toggleTabCafeteria,
  setCupSizesStock,
  toggleCupSizeStock,
  setExtrasStock,
  toggleExtraStock,
  toggleTestMode,
  toggleSimulatedPendingOrder,
  setLoginIntent,
  toggleDailyStats,
  toggleCafeCosts,
  toggleOrders,
  toggleTestOrders,
  toggleRewards,
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
  toggleTvSabores,
  toggleBarista,
  toggleCustomPrint,
} = actionsSlice.actions;

export default actionsSlice.reducer;
