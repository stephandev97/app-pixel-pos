import React, { useState } from 'react';
import { Pause, PauseCircle } from 'lucide-react';
import { FaChevronLeft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import {
  toggleAddress,
  toggleBarista,
  toggleConfig,
  toggleCustomPrint,
  toggleEditor,
  toggleHiddenCart,
  toggleHiddenFinish,
  toggleHome,
  toggleOrders,
  toggleRewards,
  toggleTvSabores,
} from '../../redux/actions/actionsSlice';
import { holdCurrentCart, removeFromCart } from '../../redux/cart/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import CardProductCheckout from './CardProductCheckout';
import HeldCartsModal from './HeldCartsModal';
import {
  ButtonNext,
  ButtonTitle,
  CheckoutToolbar,
  ContainerCards,
  EmptyStateCart,
  HeldPillBtn,
  HoldActionBtn,
  ProductsContainer,
  TitleCheckout,
  TotalStyled,
} from './styles/ProductsCheckoutStyles';

const ProductsCheckout = ({ cartItems, price, cantidad }) => {
  const dispatch = useDispatch();
  const [showHeldModal, setShowHeldModal] = useState(false);
  const heldCarts = useSelector((state) => state.cart.heldCarts) || [];
  const totalOrdersCount = useSelector((s) => s.orders.totalOrdersCount);

  const removeAndHide = (id) => {
    dispatch(removeFromCart(id));
    if (cartItems.length <= 1) {
      dispatch(toggleHiddenCart(true));
    }
  };

  const handleHoldCart = () => {
    if (cartItems && cartItems.length > 0) {
      dispatch(holdCurrentCart());
      dispatch(toggleAddress(true));
      dispatch(toggleHiddenCart(true));
      dispatch(toggleOrders(false));
      dispatch(toggleConfig(false));
      dispatch(toggleRewards(false));
      dispatch(toggleTvSabores(false));
      dispatch(toggleBarista(false));
      dispatch(toggleCustomPrint(false));
      dispatch(toggleHome(true));
      dispatch(toggleEditor(true));
    }
  };

  const nextOrderNumber = Number.isFinite(totalOrdersCount) ? totalOrdersCount + 1 : '—';

  return (
    <>
      <ProductsContainer>
        <TitleCheckout>
          <ButtonTitle
            onClick={() => {
              dispatch(toggleHiddenCart());
            }}
          >
            <FaChevronLeft />
          </ButtonTitle>
          <span>Pedido #{nextOrderNumber}</span>
        </TitleCheckout>

        {/* Barra superior de acciones para pedidos en espera */}
        {(heldCarts.length > 0 || (cartItems && cartItems.length > 0)) && (
          <CheckoutToolbar>
            {heldCarts.length > 0 ? (
              <HeldPillBtn
                type="button"
                onClick={() => setShowHeldModal(true)}
                title="Ver pedidos guardados en espera"
              >
                <PauseCircle size={15} />
                <span>En espera ({heldCarts.length})</span>
              </HeldPillBtn>
            ) : (
              <div />
            )}

            {cartItems && cartItems.length > 0 && (
              <HoldActionBtn
                type="button"
                onClick={handleHoldCart}
                title="Poner pedido actual en espera y vaciar carrito"
              >
                <Pause size={14} />
                <span>Poner en espera</span>
              </HoldActionBtn>
            )}
          </CheckoutToolbar>
        )}

        <ContainerCards>
          {cartItems.length ? (
            cartItems.map((item) => (
              <CardProductCheckout key={item.id} {...item} removeAndHide={removeAndHide} />
            ))
          ) : (
            <EmptyStateCart>
              <PauseCircle size={40} style={{ opacity: 0.25 }} />
              <div className="empty-title">El carrito está vacío</div>
              {heldCarts.length > 0 ? (
                <>
                  <div className="empty-subtitle">
                    Tenés {heldCarts.length} {heldCarts.length === 1 ? 'pedido' : 'pedidos'} guardado(s) en espera
                  </div>
                  <HeldPillBtn
                    type="button"
                    onClick={() => setShowHeldModal(true)}
                    style={{ marginTop: 6 }}
                  >
                    <PauseCircle size={15} />
                    <span>Ver pedidos en espera ({heldCarts.length})</span>
                  </HeldPillBtn>
                </>
              ) : (
                <div className="empty-subtitle">Agregá productos para iniciar un pedido</div>
              )}
            </EmptyStateCart>
          )}
        </ContainerCards>

        {cartItems && cartItems.length > 0 && (
          <TotalStyled>
            <div style={{ fontSize: '1.1em' }}>
              <span>Total</span>
              <span>{formatPrice(price)}</span>
            </div>
            <ButtonNext
              onClick={() => dispatch(toggleHiddenFinish(true))}
              type="button"
              style={{ fontSize: '1.2rem' }}
            >
              <span>Siguiente</span>
            </ButtonNext>
          </TotalStyled>
        )}
      </ProductsContainer>

      <HeldCartsModal isOpen={showHeldModal} onClose={() => setShowHeldModal(false)} />
    </>
  );
};

export default ProductsCheckout;
