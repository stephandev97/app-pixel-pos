import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';

import { toggleAddress, toggleHiddenCart } from '../../redux/actions/actionsSlice';
import { clearCart } from '../../redux/cart/cartSlice';
import { fetchTotalOrdersCount } from '../../redux/orders/ordersSlice';
import Products from '../Products/Products';
import {
  CartBar,
  CartCount,
  CartFillFX,
  CheckoutBtn,
  ClearBtn,
  ContainerHome,
  TotalBlock,
} from './HomeStyles';

export default function Home() {
  const dispatch = useDispatch();
  // ajustá estas rutas/props según tu store
  const items = useSelector((s) => s.cart?.cartItems ?? []);
  const hasCart = items.length > 0;
  const total = items.reduce((acc, item) => {
    return (acc += item.price * item.quantity);
  }, 0);
  const cantidad = items.reduce((acc, item) => {
    return (acc += item.quantity);
  }, 0);

  // estado local para animar en cada cambio de carrito
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (!hasCart) return; // no animes si quedó vacío
    setBump(true);
    const t = setTimeout(() => setBump(false), 500);
    return () => clearTimeout(t);
  }, [cantidad, total, hasCart]); // dispara cuando sube cantidad o cambia total

  useEffect(() => {
    dispatch(fetchTotalOrdersCount());
  }, [dispatch]);

  return (
    <>
      {/* Contenido: agrega padding-top por el navbar y padding-bottom si hay carrito */}
      <ContainerHome $hasCart={hasCart}>
        <Products />
      </ContainerHome>

      {createPortal(
        <CartBar $hidden={!hasCart} $bump={bump}>
          {bump && <CartFillFX />}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <CartCount $bump={bump}>{cantidad}</CartCount>
            <TotalBlock $bump={bump}>
              <span>${total.toLocaleString('es-AR')}</span>
            </TotalBlock>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ClearBtn
              onClick={() => {
                dispatch(clearCart());
                dispatch(toggleAddress(true));
              }}
              title="Vaciar carrito"
            >
              ✕
            </ClearBtn>
            <CheckoutBtn $bump={bump} onClick={() => dispatch(toggleHiddenCart())}>
              Ir al pedido
            </CheckoutBtn>
          </div>
        </CartBar>,
        document.body
      )}
    </>
  );
}
