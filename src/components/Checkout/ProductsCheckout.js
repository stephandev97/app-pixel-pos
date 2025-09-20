import React from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import { toggleHiddenCart, toggleHiddenFinish } from '../../redux/actions/actionsSlice';
import { removeFromCart } from '../../redux/cart/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import CardProductCheckout from './CardProductCheckout';
import {
  ButtonNext,
  ButtonTitle,
  ContainerCards,
  ProductsContainer,
  TitleCheckout,
  TotalStyled,
} from './styles/ProductsCheckoutStyles';

const ProductsCheckout = ({ cartItems, price, cantidad }) => {
  const dispatch = useDispatch();
  const numPedido = useSelector((state) => state.orders.orders.length);
  const removeAndHide = (id) => {
    dispatch(removeFromCart(id));
    if (cantidad === 1) {
      dispatch(toggleHiddenCart());
    }
  };

  return (
    <ProductsContainer>
      <TitleCheckout>
        <ButtonTitle
          onClick={() => {
            dispatch(toggleHiddenCart());
          }}
        >
          <FaChevronLeft />
        </ButtonTitle>
        <span>Pedido #{numPedido + 1}</span>
      </TitleCheckout>
      <ContainerCards>
        {cartItems.length ? (
          cartItems.map((item) => (
            <CardProductCheckout key={item.id} {...item} removeAndHide={removeAndHide} />
          ))
        ) : (
          <>
            <p>Esta vacío</p>
          </>
        )}
      </ContainerCards>
      <TotalStyled>
        <div style={{ fontSize: '1.1em' }}>
          <span>Total</span>
          <span>{formatPrice(price)}</span>
        </div>
        <ButtonNext onClick={() => dispatch(toggleHiddenFinish(true))} type="button">
          Siguiente
        </ButtonNext>
      </TotalStyled>
    </ProductsContainer>
  );
};

export default ProductsCheckout;
