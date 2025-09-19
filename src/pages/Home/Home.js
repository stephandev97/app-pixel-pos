import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { toggleHiddenCart } from '../../redux/actions/actionsSlice';
import { clearCart } from '../../redux/cart/cartSlice';
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
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [cantidad, total, hasCart]); // dispara cuando sube cantidad o cambia total

  return (
    <>
      {/* Contenido: agrega padding-top por el navbar y padding-bottom si hay carrito */}
      <ContainerHome $hasCart={hasCart}>
        <Products />
      </ContainerHome>

      {/* Cart bar flotante (solo si hay items) */}
      <CartBar $hidden={!hasCart} $bump={bump}>
        {bump && <CartFillFX />} {/* barrita “llenando” */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CartCount $bump={bump}>{cantidad}</CartCount>
          <TotalBlock>
            <span>${total.toLocaleString('es-AR')}</span>
          </TotalBlock>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ClearBtn onClick={() => dispatch(clearCart())}>✕</ClearBtn>
          <CheckoutBtn onClick={() => dispatch(toggleHiddenCart())}>Check Out</CheckoutBtn>
        </div>
      </CartBar>
    </>
  );
}
