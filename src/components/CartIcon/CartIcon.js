import { useDispatch, useSelector } from 'react-redux';

import { toggleHiddenCart } from '../../redux/actions/actionsSlice';
import { formatPrice } from '../../utils/formatPrice';
import { ButtonNavCart } from './CartIconStyles';

const CartIcon = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const cantidad = cartItems.reduce((acc, item) => {
    return (acc += item.quantity);
  }, 0);
  const price = cartItems.reduce((acc, item) => {
    return (acc += item.price * item.quantity);
  }, 0);

  return (
    <>
      {cartItems.length > 0 ? (
        <ButtonNavCart onClick={() => dispatch(toggleHiddenCart())}>
          <div>
            <span>{cantidad} item(s)</span>
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>Total: {formatPrice(price)}</span>
          </div>
        </ButtonNavCart>
      ) : (
        <ButtonNavCart style={{ transform: 'translateY(100px)' }} />
      )}
    </>
  );
};

export default CartIcon;
