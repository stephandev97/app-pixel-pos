import React from "react";
import { ButtonMinus, ButtonQuantity, CardCheckoutStyled, ContainerSabores, Detalle, NameCard, PriceCard, QuantityStyled, RowCard, RowCardName, SpanDelivery } from "./styles/CardProductCheckoutStyled";
import { useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "../../redux/cart/cartSlice";
import { formatPrice } from "../../utils/formatPrice";
import {Minus, Plus, Trash, X} from 'react-feather';
import { TrashIcon } from "@heroicons/react/24/outline";
import { toggleHiddenCart } from "../../redux/actions/actionsSlice";
import { TbTrash, TbTrashOff, TbTrashX } from "react-icons/tb";
import { IoTrashBinOutline } from "react-icons/io5";

const CardProductCheckout = ({name, price, id, quantity, listdetalle, removeAndHide, sabores, category}) => {
    const dispatch = useDispatch()

    return (
         <CardCheckoutStyled>
            <RowCardName>
                <NameCard>
                    <span>{name}</span>
                    {category === "Helado" && sabores ? 
                    <SpanDelivery>Delivery</SpanDelivery> : null    
                }
                </NameCard>
                {sabores? 
                    <ContainerSabores>
                        {sabores.map(sabor => {return <a>{sabor}</a>})}
                    </ContainerSabores> : null
                }
                {listdetalle ? 
                    <Detalle>{listdetalle}</Detalle> : null
                }
            </RowCardName>
            <RowCard>
                <QuantityStyled>
                    {quantity > 1 ?
                    <ButtonMinus className="minus" onClick={() => dispatch(removeFromCart(id))}><Minus/></ButtonMinus>
                    :
                    <ButtonMinus className="minus" onClick={() => removeAndHide(id)}><IoTrashBinOutline/></ButtonMinus>
                    }
                    <div>{quantity}</div>
                    <ButtonQuantity onClick={() => dispatch(addToCart({name, price, id}))}><Plus/></ButtonQuantity>
                </QuantityStyled>
            </RowCard>
            <RowCard style={{textAlign:"right !important"}}>
                <PriceCard>{formatPrice(price * quantity)}</PriceCard>
            </RowCard>
        </CardCheckoutStyled>
    )
}

export default CardProductCheckout;