import { createSlice } from '@reduxjs/toolkit';

import { addItemToCart, AddNewProduct, removeItemFromCart } from './cart-utils';

const DEFAULT_DELIVERY_INFO = {
  isRetiro: true,
  direccion: 'Retiro',
  envioTarifa: 0,
  envioOpcion: null,
};

const formatBreakdownSabores = (breakdown = {}) => {
  const active = Object.entries(breakdown).filter(([_, c]) => c > 0);
  if (active.length === 1) return [active[0][0]];
  return active.map(([lbl, c]) => (c > 1 ? `${c}x ${lbl}` : lbl));
};

const INITIAL_STATE = {
  cartItems: [],
  heldCarts: [],
  deliveryInfo: { ...DEFAULT_DELIVERY_INFO },
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: INITIAL_STATE,
  reducers: {
    setDeliveryInfo: (state, action) => {
      state.deliveryInfo = {
        ...(state.deliveryInfo || DEFAULT_DELIVERY_INFO),
        ...action.payload,
      };
    },
    clearDeliveryInfo: (state) => {
      state.deliveryInfo = { ...DEFAULT_DELIVERY_INFO };
    },
    holdCurrentCart: (state, action) => {
      if (!state.cartItems || state.cartItems.length === 0) return;
      const note = action?.payload?.note || '';
      const totalItems = state.cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
      const totalPrice = state.cartItems.reduce(
        (acc, item) => acc + item.price * (item.quantity || 1),
        0
      );
      const newHeld = {
        id: `held-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        items: state.cartItems,
        deliveryInfo: state.deliveryInfo ? { ...state.deliveryInfo } : { ...DEFAULT_DELIVERY_INFO },
        totalItems,
        totalPrice,
        note: note.trim(),
        orderNumber: (state.heldCarts?.length || 0) + 1,
      };
      return {
        ...state,
        heldCarts: [newHeld, ...(state.heldCarts || [])],
        cartItems: [],
        deliveryInfo: { ...DEFAULT_DELIVERY_INFO },
      };
    },
    restoreHeldCart: (state, { payload: cartId }) => {
      const heldList = state.heldCarts || [];
      const heldIndex = heldList.findIndex((c) => c.id === cartId);
      if (heldIndex === -1) return;

      const targetHeld = heldList[heldIndex];
      const remainingHeld = heldList.filter((c) => c.id !== cartId);

      // Si el carrito actual tiene items, lo ponemos en espera para no perderlo
      if (state.cartItems && state.cartItems.length > 0) {
        const totalItems = state.cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
        const totalPrice = state.cartItems.reduce(
          (acc, item) => acc + item.price * (item.quantity || 1),
          0
        );
        const swappedHeld = {
          id: `held-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          items: state.cartItems,
          deliveryInfo: state.deliveryInfo ? { ...state.deliveryInfo } : { ...DEFAULT_DELIVERY_INFO },
          totalItems,
          totalPrice,
          note: '',
          orderNumber: (remainingHeld.length || 0) + 1,
        };
        return {
          ...state,
          cartItems: targetHeld.items,
          deliveryInfo: targetHeld.deliveryInfo ? { ...targetHeld.deliveryInfo } : { ...DEFAULT_DELIVERY_INFO },
          heldCarts: [swappedHeld, ...remainingHeld],
        };
      }

      return {
        ...state,
        cartItems: targetHeld.items,
        deliveryInfo: targetHeld.deliveryInfo ? { ...targetHeld.deliveryInfo } : { ...DEFAULT_DELIVERY_INFO },
        heldCarts: remainingHeld,
      };
    },
    discardHeldCart: (state, { payload: cartId }) => {
      return {
        ...state,
        heldCarts: (state.heldCarts || []).filter((c) => c.id !== cartId),
      };
    },
    clearAllHeldCarts: (state) => {
      return {
        ...state,
        heldCarts: [],
      };
    },
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
        deliveryInfo: { ...DEFAULT_DELIVERY_INFO },
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
      if (!it) return;

      if (it.saboresBreakdown && Object.keys(it.saboresBreakdown).length > 0) {
        const keys = Object.keys(it.saboresBreakdown);
        const firstKey = keys[0];
        it.saboresBreakdown[firstKey] = (it.saboresBreakdown[firstKey] || 0) + 1;

        const totalQty = Object.values(it.saboresBreakdown).reduce((acc, c) => acc + c, 0);
        it.quantity = totalQty;
        it.sabores = formatBreakdownSabores(it.saboresBreakdown);
        return;
      }

      it.quantity = (it.quantity || 1) + 1;
    },
    decrementById: (state, { payload: id }) => {
      const it = state.cartItems.find((x) => x.id === id);
      if (!it) return;

      if (it.saboresBreakdown && Object.keys(it.saboresBreakdown).length > 0) {
        const keys = Object.keys(it.saboresBreakdown);
        const lastKey = keys[keys.length - 1];
        const cnt = it.saboresBreakdown[lastKey];
        if (cnt <= 1) {
          delete it.saboresBreakdown[lastKey];
        } else {
          it.saboresBreakdown[lastKey] = cnt - 1;
        }

        const totalQty = Object.values(it.saboresBreakdown).reduce((acc, c) => acc + c, 0);
        if (totalQty <= 0) {
          state.cartItems = state.cartItems.filter((x) => x.id !== id);
          return;
        }

        it.quantity = totalQty;
        it.sabores = formatBreakdownSabores(it.saboresBreakdown);
        return;
      }

      if ((it.quantity || 1) > 1) {
        it.quantity -= 1;
      } else {
        state.cartItems = state.cartItems.filter((x) => x.id !== id);
      }
    },
    incrementFlavorInItem: (state, { payload: { id, flavor } }) => {
      const item = state.cartItems.find((x) => x.id === id);
      if (!item) return;

      const currentBreakdown = { ...(item.saboresBreakdown || {}) };
      currentBreakdown[flavor] = (currentBreakdown[flavor] || 0) + 1;

      const totalQty = Object.values(currentBreakdown).reduce((acc, c) => acc + c, 0);

      item.quantity = totalQty;
      item.saboresBreakdown = currentBreakdown;
      item.sabores = formatBreakdownSabores(currentBreakdown);
    },
    decrementFlavorInItem: (state, { payload: { id, flavor } }) => {
      const item = state.cartItems.find((x) => x.id === id);
      if (!item) return;

      const currentBreakdown = { ...(item.saboresBreakdown || {}) };
      const currentCount = currentBreakdown[flavor] || 0;

      if (currentCount <= 1) {
        delete currentBreakdown[flavor];
      } else {
        currentBreakdown[flavor] = currentCount - 1;
      }

      const totalQty = Object.values(currentBreakdown).reduce((acc, c) => acc + c, 0);

      if (totalQty <= 0) {
        state.cartItems = state.cartItems.filter((x) => x.id !== id);
        return;
      }

      item.quantity = totalQty;
      item.saboresBreakdown = currentBreakdown;
      item.sabores = formatBreakdownSabores(currentBreakdown);
    },
    setProductFlavorBreakdown: (state, action) => {
      const { id, name, price, category, quantity, sabores, saboresBreakdown, note, listdetalle } =
        action.payload;
      const existingIdx = state.cartItems.findIndex((it) => it.id === id);

      if (quantity <= 0) {
        if (existingIdx !== -1) {
          state.cartItems.splice(existingIdx, 1);
        }
        return;
      }

      const payloadItem = {
        id,
        name,
        price,
        category,
        quantity,
        sabores,
        saboresBreakdown,
        ...(note ? { note, listdetalle: note } : {}),
      };

      if (existingIdx !== -1) {
        state.cartItems[existingIdx] = {
          ...state.cartItems[existingIdx],
          ...payloadItem,
        };
      } else {
        state.cartItems.push(payloadItem);
      }
    },
  },
});

export const {
  incrementById,
  decrementById,
  incrementFlavorInItem,
  decrementFlavorInItem,
  addToCart,
  removeFromCart,
  clearCart,
  addNewProductToCart,
  setProductFlavorBreakdown,
  holdCurrentCart,
  restoreHeldCart,
  discardHeldCart,
  clearAllHeldCarts,
  setDeliveryInfo,
  clearDeliveryInfo,
} = cartSlice.actions;

export default cartSlice.reducer;
