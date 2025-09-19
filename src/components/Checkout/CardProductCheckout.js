import React from 'react';
import { Minus, Plus } from 'react-feather';
import { IoTrashBinOutline } from 'react-icons/io5';
import { useDispatch } from 'react-redux';

import { decrementById, incrementById } from '../../redux/cart/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import {
  ButtonMinus,
  ButtonQuantity,
  CardCheckoutStyled,
  ContainerSabores,
  LeftCol,
  MainRow,
  NameCard,
  PriceCard,
  QuantityStyled,
  RightCol,
} from './styles/CardProductCheckoutStyled';

const CardProductCheckout = ({ name, price, id, quantity, removeAndHide, sabores }) => {
  const dispatch = useDispatch();

  return (
    <CardCheckoutStyled>
      <MainRow>
        <LeftCol>
          {/* Nombre + sabores (como ya lo tenías): */}
          <NameCard>
            <span>
              {name}
              {sabores && sabores.length === 1 && ` · ${sabores[0]}`}
            </span>
          </NameCard>
          {sabores && sabores.length > 1 && (
            <ContainerSabores>
              {sabores.map((s) => (
                <a key={s}>{s}</a>
              ))}
            </ContainerSabores>
          )}
        </LeftCol>

        <RightCol>
          <QuantityStyled>
            {quantity > 1 ? (
              <ButtonMinus className="minus" onClick={() => dispatch(decrementById(id))}>
                <Minus />
              </ButtonMinus>
            ) : (
              <ButtonMinus className="minus" onClick={() => removeAndHide(id)}>
                <IoTrashBinOutline />
              </ButtonMinus>
            )}
            <div>{quantity}</div>
            <ButtonQuantity onClick={() => dispatch(incrementById(id))}>
              <Plus />
            </ButtonQuantity>
          </QuantityStyled>

          <PriceCard>{formatPrice(price * quantity)}</PriceCard>
        </RightCol>
      </MainRow>
    </CardCheckoutStyled>
  );
};

export default CardProductCheckout;
