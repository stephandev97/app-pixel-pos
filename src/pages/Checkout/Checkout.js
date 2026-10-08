import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import React, { forwardRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ProductsCheckout from '../../components/Checkout/ProductsCheckout';
import { toggleHiddenCart } from '../../redux/actions/actionsSlice';
import { ContainerCheckout } from './CheckoutStyles';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Checkout = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const cantidad = (cartItems || []).reduce((acc, item) => {
    return (acc += item.quantity);
  }, 0);
  const show = useSelector((state) => state.actions.hiddenCart);

  const price = (cartItems || []).reduce((acc, item) => {
    return (acc += item.price * item.quantity);
  }, 0);

  useEffect(() => {
    if (!show && (!cartItems || cartItems.length === 0)) {
      dispatch(toggleHiddenCart(true));
    }
  }, [show, cartItems, dispatch]);

  return (
    <>
      <Dialog
        slots={{ transition: Transition }}
        open={!show && cartItems && cartItems.length > 0}
        fullScreen
        onClose={() => dispatch(toggleHiddenCart(true))}
      >
        <ContainerCheckout>
          <ProductsCheckout cartItems={cartItems} price={price} cantidad={cantidad} />
        </ContainerCheckout>
      </Dialog>
    </>
  );
};

export default Checkout;
