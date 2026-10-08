import React from 'react';
import { PauseCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { toggleHiddenCart } from '../../redux/actions/actionsSlice';
import { formatPrice } from '../../utils/formatPrice';
import { ButtonNavCart } from './CartIconStyles';

const CartIcon = () => {
  const dispatch = useDispatch();
  const { cartItems, heldCarts } = useSelector((state) => state.cart);
  const totalHeld = heldCarts?.length || 0;

  const cantidad = (cartItems || []).reduce((acc, item) => {
    return (acc += item.quantity);
  }, 0);
  const price = (cartItems || []).reduce((acc, item) => {
    return (acc += item.price * item.quantity);
  }, 0);

  if (cartItems && cartItems.length > 0) {
    return (
      <ButtonNavCart onClick={() => dispatch(toggleHiddenCart())}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: '1.5em' }}>
          <span className="item-count" style={{ margin: 0 }}>
            {cantidad} {cantidad === 1 ? 'item' : 'items'}
          </span>
          {totalHeld > 0 && (
            <span
              style={{
                margin: 0,
                fontSize: '0.8em',
                background: '#fff0f3',
                color: '#4d0012',
                padding: '2px 8px',
                borderRadius: 999,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <PauseCircle size={12} />
              {totalHeld} en espera
            </span>
          )}
        </div>
        <div style={{ marginRight: '1.5em' }}>
          <span style={{ fontWeight: 'bold', margin: 0 }}>Total: {formatPrice(price)}</span>
        </div>
      </ButtonNavCart>
    );
  }

  if (totalHeld > 0) {
    return (
      <ButtonNavCart
        onClick={() => dispatch(toggleHiddenCart())}
        style={{
          background: '#fff0f3',
          border: '1.5px solid rgba(77, 0, 18, 0.25)',
          color: '#4d0012',
          boxShadow: '0 4px 14px rgba(77, 0, 18, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: '1.5em' }}>
          <PauseCircle size={18} />
          <span style={{ fontWeight: 700, margin: 0, color: '#4d0012' }}>
            {totalHeld} {totalHeld === 1 ? 'pedido en espera' : 'pedidos en espera'}
          </span>
        </div>
        <div style={{ marginRight: '1.5em' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9em', margin: 0, color: '#4d0012' }}>
            Ver / Recuperar →
          </span>
        </div>
      </ButtonNavCart>
    );
  }

  return <ButtonNavCart style={{ transform: 'translateY(100px)' }} />;
};

export default CartIcon;
