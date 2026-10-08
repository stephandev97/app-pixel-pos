import styled from 'styled-components';

export const CardCheckoutStyled = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${(p) => (p.$isBarista ? '#fffdfa' : '#fff')};
  margin: 0.5em 0.8em;
  border-radius: 12px;
  padding: 0.8em 1em;
  font-weight: 600;
  color: #111;
  box-shadow: ${(p) =>
    p.$isBarista
      ? '0 2px 8px rgba(180, 83, 9, 0.07)'
      : '0 2px 6px rgba(16, 24, 40, 0.06)'};
  border: 1px solid ${(p) => (p.$isBarista ? '#fde68a' : '#f1f5f9')};
  border-left: ${(p) => (p.$isBarista ? '4px solid #b45309' : '1px solid #f1f5f9')};
  position: relative;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${(p) =>
      p.$isBarista
        ? '0 4px 12px rgba(180, 83, 9, 0.12)'
        : '0 4px 10px rgba(16, 24, 40, 0.1)'};
  }
`;

export const BaristaFlagBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3.5px;
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  white-space: nowrap;
  flex-shrink: 0;
  user-select: none;
  line-height: 1.2;

  svg {
    color: #b45309;
    flex-shrink: 0;
  }
`;

export const MainHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const MainRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
`;

export const LeftCol = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
`;

export const RightCol = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const NameCard = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  display: flex;
  align-items: center;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const EditButton = styled.button`
  background: ${(p) => (p.$isEditing ? '#1e293b' : '#f1f5f9')};
  color: ${(p) => (p.$isEditing ? '#ffffff' : '#475569')};
  border: 1px solid ${(p) => (p.$isEditing ? '#1e293b' : '#e2e8f0')};
  border-radius: 6px;
  padding: 0 7px;
  height: 24px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
  margin: 0;
  transition: all 0.15s ease;
  font-family: inherit;
  line-height: 1;

  svg {
    stroke: currentColor;
  }

  &:hover {
    background: ${(p) => (p.$isEditing ? '#0f172a' : '#e2e8f0')};
    color: ${(p) => (p.$isEditing ? '#ffffff' : '#0f172a')};
    border-color: ${(p) => (p.$isEditing ? '#0f172a' : '#cbd5e1')};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const QuantityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f7f7ff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 4px;
  height: 26px;
  width: 78px;
  min-width: 78px;
  box-sizing: border-box;
  font-size: 12px;
  font-weight: 700;
  color: #111;
  line-height: 1;
  text-align: center;
  user-select: none;
  margin: 0;
`;

export const StaticQuantityBox = QuantityBadge;

export const PriceCard = styled.span`
  font-weight: 700;
  font-size: 1.05rem;
  text-align: right;
  min-width: 72px;
  color: #0f172a;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  line-height: 1;
  margin: 0;
`;

export const QuantityStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7f7ff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2px 4px;
  height: 26px;
  width: 78px;
  min-width: 78px;
  box-sizing: border-box;
  user-select: none;
  margin: 0;

  & div {
    flex: 1;
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
  }
`;

export const ButtonQuantity = styled.div`
  cursor: pointer;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;

  &:hover {
    background: #e2e8f0;
    color: #111;
  }
  &:active {
    transform: scale(0.9);
  }
`;

export const ButtonMinus = styled.div`
  cursor: pointer;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;

  &:hover {
    background: #fee2e2;
    color: #b91c1c;
  }
  &:active {
    transform: scale(0.9);
  }
`;

export const DeleteItemBtn = styled.button`
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  transition: all 0.15s ease;
  line-height: 1;

  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }
`;

export const DetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
  width: 100%;
`;

export const ContainerSabores = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 2px;
  margin-bottom: 2px;

  a {
    color: #4d0012;
    font-weight: 700;
    font-size: 11px;
    background: #fff5f7;
    padding: 2px 7px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    width: fit-content;
    border: 1px solid rgba(77, 0, 18, 0.12);
    letter-spacing: 0.2px;
  }

  .flavor-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff8f9;
    border: 1px solid rgba(77, 0, 18, 0.12);
    border-radius: 8px;
    padding: 4px 8px;
    gap: 8px;
    max-width: 240px;
  }

  .flavor-name {
    font-size: 11.5px;
    font-weight: 700;
    color: #4d0012;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .flavor-stepper {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #fff;
    padding: 2px 4px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .stepper-btn {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: none;
    background: #f1f5f9;
    color: #334155;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
    transition: all 0.15s ease;

    &:hover {
      background: #4d0012;
      color: #fff;
    }

    &.minus:hover {
      background: #fee2e2;
      color: #ef4444;
    }
  }

  .stepper-count {
    font-size: 11.5px;
    font-weight: 800;
    color: #0f172a;
    min-width: 16px;
    text-align: center;
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

export const SpanDelivery = styled.span`
  margin-left: 0.8em;
  font-size: 0.8em;
  color: #52be80;
`;

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
