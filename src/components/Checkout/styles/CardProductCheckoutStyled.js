import styled from 'styled-components';

export const CardCheckoutStyled = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
  margin: 0.6em 0.8em;
  border-radius: 14px;
  padding: 0.9em 1em;
  font-weight: 600;
  color: #111;
  box-shadow: 0 3px 8px rgba(16, 24, 40, 0.08);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(16, 24, 40, 0.12);
  }
`;

export const RowCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.4em;
`;

export const RowCardName = styled.div`
  margin-bottom: 0.4em;
  width: 100%;
`;

export const QuantityStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6em;
  background: #f7f7ff;
  border-radius: 10px;
  padding: 4px 8px;
  user-select: none;
  & div {
    min-width: 28px;
    text-align: center;
    font-weight: 700;
  }
`;

export const ButtonQuantity = styled.div`
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;
  &:hover {
    background: #e6e9f2;
    color: #111;
  }
  &:active {
    transform: scale(0.9);
  }
`;

export const ButtonMinus = styled(ButtonQuantity)`
  &:hover {
    background: #fee2e2;
    color: #b91c1c;
  }
`;

export const ContainerSabores = styled.div`
  display: flex;
  font-size: 0.6em;
  flex-direction: column;
  font-weight: normal;
  margin-top: 0.4em;
  margi-bottom: 0.2em;
`;

export const SpanDelivery = styled.span`
  margin-left: 0.8em;
  font-size: 0.8em;
  color: #52be80;
`;
export const NameCard = styled.div``;

export const Detalle = styled.div`
  font-size: 0.8em;
  margin-top: 0.3em;
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  padding: 0.25em 0.6em;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

export const MainRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const LeftCol = styled.div`
  flex: 1 1 auto;
  min-width: 0; /* evita saltos cuando el nombre es largo */
`;

export const RightCol = styled.div`
  display: flex;
  align-items: center;
  gap: 12px; /* espacio entre qty y total */
`;

// (Opcional) asegurar alineado del precio
export const PriceCard = styled.span`
  font-weight: 700;
  font-size: 1.05rem;
  text-align: right;
  min-width: 96px; /* todos los totales alineados */
`;
