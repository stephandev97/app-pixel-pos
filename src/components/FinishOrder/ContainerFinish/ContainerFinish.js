import React from "react";
import uniqid from 'uniqid';
import { useForm } from "react-hook-form";
import { ButtonNext } from "../../Checkout/styles/ProductsCheckoutStyles";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../../redux/cart/cartSlice";
import { changePago, toggleAddress, toggleEfectivo, toggleFinishOrder, toggleHiddenCart, toggleHiddenFinish } from "../../../redux/actions/actionsSlice";
import { ContentForm, ContentTabs, TotalFinish } from "./ContainerFinishStyles";
import TabPago from "../TabPago/TabPago";
import { formatPrice } from "../../../utils/formatPrice";
import { addToOrders } from "../../../redux/orders/ordersSlice";
import TabDireccion from "../TabDireccion/TabDireccion";
import { syncAllOrdersToServer } from "../../../redux/orders/ordersSlice";


const ContainerFinish = ({cartItems, price}) => {
  const showFinished = useSelector(state => state.actions.finishOrder)
  const generateId = uniqid()
  const dispatch = useDispatch();
  const { register, handleSubmit, setValue, getValues } = useForm()
  const pagoState = useSelector((state) => state.actions.pago)
  const isEfectivo = useSelector((state) => state.actions.toggleEfectivo)
  const isRetiro = useSelector((state) => state.actions.toggleAddress)
  const isJusto = price === pagoState
  const status = useSelector(s => s.orders.status)
  const lastSync = useSelector(s => s.orders.lastSync)

  const updatePago = (e) => {
    const value = e.target.value;
    dispatch(changePago(value))
    setValue("pago")
    console.log(value)
  }

  const onSubmit = () => {
    const dir = getValues("direccion")
    const date = new Date()
    const time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    const cambio = pagoState - price

    const orderData = {
      number: generateId,
      items: cartItems,
      direccion: dir,
      total: price,
      pago: pagoState,
      cambio: cambio,
      check: false,
      hora: time,
    }

    if(!isEfectivo){orderData.pago = "Transferencia"}
    if(dir === "Retiro"){orderData.check = true}
    
    dispatch(addToOrders(orderData));
    dispatch(syncAllOrdersToServer())
    dispatch(clearCart())
    dispatch(changePago(0))
    dispatch(toggleHiddenFinish(true))
    dispatch(toggleHiddenCart(true))
    dispatch(toggleAddress(true))
    dispatch(toggleFinishOrder(true))
    dispatch(toggleEfectivo(true))
    setValue("direccion","Retiro")
  }

    return (
      <ContentForm onSubmit={handleSubmit(onSubmit)}>
        <ContentTabs>
          <TabDireccion isRetiro={isRetiro} register={register} setValue={setValue} required/>
          <TabPago isEfectivo={isEfectivo} price={price} updatePago={updatePago} register={register} setValue={setValue} required/>
        </ContentTabs>  
        <TotalFinish>
          <div>
            <span>Total</span>
            <span>{formatPrice(price)}</span>
          </div>
          {isEfectivo && pagoState >= price ?
          <>
            <div>
              <span>Paga</span>
              <span>{formatPrice(pagoState)}</span>
            </div> 
            <div>
              <span>Cambio</span>
              {isJusto? <span>Justo</span> : <span>{pagoState - price}</span>}
            </div>
          </>
            : 
            null 
            }
          {!isEfectivo ?
          <div>
            <span>Paga</span>
            <span>Transferencia</span>
          </div>
          :
          null
          }
          <ButtonNext type="submit">Crear Pedido</ButtonNext>
        </TotalFinish>
      </ContentForm>
    )
}

export default ContainerFinish