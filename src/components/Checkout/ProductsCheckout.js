import React from "react"
import { ProductsContainer, TitleCheckout, ButtonTitle, TotalStyled, ContainerCards, ButtonNext } from "./styles/ProductsCheckoutStyles"
import CardProductCheckout from "./CardProductCheckout"
import { formatPrice } from "../../utils/formatPrice"
import { toggleHiddenCart, toggleHiddenFinish } from "../../redux/actions/actionsSlice"
import { useDispatch, useSelector } from "react-redux";
import {ChevronLeft} from 'react-feather';
import { removeFromCart } from "../../redux/cart/cartSlice"
import { FaChevronLeft } from "react-icons/fa"

const ProductsCheckout = ({cartItems, price, cantidad}) => {
  const dispatch = useDispatch()
  const numPedido = useSelector((state) => state.orders.orders.length)
  const removeAndHide = (id) => {
    dispatch(removeFromCart(id))
    if(cantidad === 1) {
    dispatch(toggleHiddenCart())
    }
}

    return (
        <ProductsContainer>
            <TitleCheckout>
              <ButtonTitle onClick={() => {dispatch(toggleHiddenCart())}}><FaChevronLeft/></ButtonTitle>
                <span>Pedido #{numPedido + 1}</span>
              </TitleCheckout>
            <ContainerCards>
            {cartItems.length ? (
          cartItems.map(item => <CardProductCheckout key={item.id} {...item} removeAndHide={removeAndHide}/>)
        ) : (
          <>
            <p>Esta vacío</p>
          </>
          )}
            </ContainerCards>
            <TotalStyled>
              <div>
                <span>Total</span>
                <span>{formatPrice(price)}</span>
              </div>
              <ButtonNext onClick={() => dispatch(toggleHiddenFinish(true))} type="button">Siguiente</ButtonNext>
            </TotalStyled>
        </ProductsContainer>
    )
}

export default ProductsCheckout