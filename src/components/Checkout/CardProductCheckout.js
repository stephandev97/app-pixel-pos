import React, { useMemo, useState } from 'react';
import { Check, Coffee, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';

import {
  decrementById,
  decrementFlavorInItem,
  incrementById,
  incrementFlavorInItem,
} from '../../redux/cart/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import { isBaristaItem } from '../../utils/cafeStockSync';
import { getCleanItemNote, getFormattedDrinkName, getCleanSizeLabel, getSizeBadgeInfo } from '../Orders/baristaRecipesData';
import {
  BaristaFlagBadge,
  ButtonMinus,
  ButtonQuantity,
  CardCheckoutStyled,
  ContainerSabores,
  DeleteItemBtn,
  DetailsSection,
  EditButton,
  HeaderLeft,
  HeaderRight,
  MainHeaderRow,
  NameCard,
  PriceCard,
  QuantityBadge,
  QuantityStyled,
} from './styles/CardProductCheckoutStyled';

const CardProductCheckout = ({
  name,
  price,
  id,
  quantity,
  removeAndHide,
  sabores,
  saboresBreakdown,
  size,
  extras,
  vaso,
  note,
  listdetalle,
  isCafeteria,
  category,
  temperature,
  isCold,
  ...restProps
}) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);

  const itemNote = getCleanItemNote({
    name,
    category,
    size,
    extras,
    vaso,
    note,
    listdetalle,
    sabores,
    ...restProps,
  });
  const hasBreakdown =
    saboresBreakdown &&
    typeof saboresBreakdown === 'object' &&
    Object.keys(saboresBreakdown).length > 0;

  const isForBarista = useMemo(() => {
    return isBaristaItem({
      name,
      category,
      size,
      extras,
      vaso,
      note,
      listdetalle,
      isCafeteria,
      temperature,
      isCold,
      ...restProps,
    });
  }, [
    name,
    category,
    size,
    extras,
    vaso,
    note,
    listdetalle,
    isCafeteria,
    temperature,
    isCold,
    restProps,
  ]);

  return (
    <CardCheckoutStyled $isBarista={isForBarista}>
      {/* Fila superior: Nombre, Editar, Cantidades, Precio y Eliminar alineados verticalmente */}
      <MainHeaderRow>
        <HeaderLeft>
          <NameCard>
            <span>
              {getFormattedDrinkName({ name, category, ...restProps }) || name}
              {!hasBreakdown && sabores && sabores.length === 1 && ` · ${sabores[0]}`}
            </span>
          </NameCard>

          {isForBarista && (
            <BaristaFlagBadge title="Este ítem se envía a la comanda de Barista">
              <Coffee size={11} strokeWidth={2.6} />
              Barista
            </BaristaFlagBadge>
          )}

          {hasBreakdown && (
            <EditButton
              type="button"
              $isEditing={isEditing}
              onClick={() => setIsEditing((prev) => !prev)}
              title={isEditing ? 'Listo' : 'Editar cantidades de sabores'}
            >
              {isEditing ? (
                <>
                  <Check size={11} strokeWidth={2.5} />
                  <span>Listo</span>
                </>
              ) : (
                <>
                  <Pencil size={11} strokeWidth={2} />
                  <span>Editar</span>
                </>
              )}
            </EditButton>
          )}
        </HeaderLeft>

        <HeaderRight>
          {/* Si NO tiene desglose de sabores (producto simple), mostramos el stepper general */}
          {!hasBreakdown ? (
            <QuantityStyled>
              <ButtonMinus
                className="minus"
                onClick={() => (quantity > 1 ? dispatch(decrementById(id)) : removeAndHide(id))}
                title="Restar 1"
              >
                <Minus size={14} />
              </ButtonMinus>
              <div>{quantity}</div>
              <ButtonQuantity
                onClick={() => dispatch(incrementById(id))}
                title="Sumar 1"
              >
                <Plus size={14} />
              </ButtonQuantity>
            </QuantityStyled>
          ) : (
            <QuantityBadge title={`Total: ${quantity}`}>
              {quantity}
            </QuantityBadge>
          )}

          <PriceCard>{formatPrice(price * quantity)}</PriceCard>

          <DeleteItemBtn
            type="button"
            onClick={() => removeAndHide(id)}
            title="Eliminar producto del pedido"
          >
            <Trash2 size={16} />
          </DeleteItemBtn>
        </HeaderRight>
      </MainHeaderRow>

      {/* Sección inferior: Desglose de sabores y detalles secundarios */}
      {(hasBreakdown ||
        (sabores && sabores.length > 1) ||
        size ||
        (extras && extras.length > 0) ||
        vaso ||
        itemNote) && (
        <DetailsSection>
          {/* Sabores / Variedades desglosadas */}
          {hasBreakdown ? (
            <ContainerSabores>
              {isEditing ? (
                // MODO EDICIÓN: Steppers individuales por sabor
                Object.entries(saboresBreakdown).map(([flavor, count]) => (
                  <div key={flavor} className="flavor-row">
                    <span className="flavor-name">{flavor}</span>
                    <div className="flavor-stepper">
                      <button
                        type="button"
                        className="stepper-btn minus"
                        onClick={() => dispatch(decrementFlavorInItem({ id, flavor }))}
                        title={`Restar 1 ${flavor}`}
                      >
                        −
                      </button>
                      <span className="stepper-count">{count}</span>
                      <button
                        type="button"
                        className="stepper-btn plus"
                        onClick={() => dispatch(incrementFlavorInItem({ id, flavor }))}
                        title={`Sumar 1 ${flavor}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // MODO RESUMEN: Pills limpias de cantidades por sabor
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {Object.entries(saboresBreakdown).map(([flavor, count]) => (
                    <a key={flavor}>
                      {count}x {flavor}
                    </a>
                  ))}
                </div>
              )}
            </ContainerSabores>
          ) : sabores && sabores.length > 1 ? (
            <ContainerSabores>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {sabores.map((s, idx) => (
                  <a key={idx}>{s}</a>
                ))}
              </div>
            </ContainerSabores>
          ) : null}

          {/* Detalles secundarios (Cafetería, notas, etc.) */}
          {(size || (extras && extras.length > 0) || vaso || itemNote) && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                paddingLeft: '4px',
                borderLeft: '2px solid rgba(77, 0, 18, 0.2)',
                textAlign: 'left',
                marginTop: 2,
              }}
            >
              {getCleanSizeLabel(size) && (() => {
                const szInfo = getSizeBadgeInfo(size);
                return (
                  <div style={{ fontSize: '11px', color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Tamaño:
                    <span
                      style={{
                        color: szInfo ? szInfo.color : '#4d0012',
                        background: szInfo ? szInfo.bg : 'transparent',
                        border: szInfo ? (szInfo.isLarge ? `1.5px solid ${szInfo.border}` : `1px solid ${szInfo.border}`) : 'none',
                        padding: szInfo ? '1px 6px' : 0,
                        borderRadius: 4,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}
                    >
                      {szInfo ? szInfo.label : getCleanSizeLabel(size)}
                    </span>
                  </div>
                );
              })()}
              {extras && extras.length > 0 && (
                <div style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>
                  Extras: <span style={{ color: '#333' }}>{extras.join(', ')}</span>
                </div>
              )}
              {vaso && (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#666',
                    fontWeight: 600,
                    fontStyle: 'italic',
                  }}
                >
                  Vaso: <span style={{ color: '#333' }}>"{vaso}"</span>
                </div>
              )}
              {itemNote && (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#666',
                    fontWeight: 600,
                    fontStyle: 'italic',
                  }}
                >
                  Nota: <span style={{ color: '#4d0012' }}>"{itemNote}"</span>
                </div>
              )}
            </div>
          )}
        </DetailsSection>
      )}
    </CardCheckoutStyled>
  );
};

export default CardProductCheckout;
