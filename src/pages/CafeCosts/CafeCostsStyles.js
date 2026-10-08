import styled from 'styled-components';

const bg = '#240007';
const bgCard = '#3d000f';
const bgCardHover = '#4d0014';
const text = '#EDEDEE';
const sub = '#B4B6C9';
const border = 'rgba(255, 255, 255, 0.08)';

export const Container = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  height: 100%;
  background: ${bg};
  color: ${text};
  overflow-y: auto;
  overflow-x: hidden;
  padding: 14px 16px 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  @media (max-width: 640px) {
    padding: 10px 10px 24px;
  }

  /* Scrollbar estético */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.18);
    border-radius: 4px;
  }
  /* Animación de rotación para loaders */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 18px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (min-width: 860px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 26px;
    padding-bottom: 20px;
  }
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 14px;
  flex-wrap: wrap;

  .title-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h1 {
    font-size: 26px;
    font-weight: 850;
    margin: 0;
    letter-spacing: -0.025em;
    color: #fff;
    line-height: 1.15;
  }

  @media (min-width: 860px) {
    width: auto;
    justify-content: flex-start;

    h1 {
      font-size: 28px;
    }
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 23px;
    }
  }
`;

export const PbBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(76, 205, 153, 0.15);
  border: 1px solid rgba(76, 205, 153, 0.35);
  color: #4ccd99;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4ccd99;
    box-shadow: 0 0 6px #4ccd99;
  }
`;

export const TabsNav = styled.div`
  display: flex;
  gap: 5px;
  background: rgba(0, 0, 0, 0.3);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid ${border};
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const TabButton = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  color: ${(p) => (p.$active ? '#fff' : sub)};
  background: ${(p) => (p.$active ? bgCardHover : 'transparent')};
  box-shadow: ${(p) => (p.$active ? '0 2px 8px rgba(0,0,0,0.3)' : 'none')};
  transition: all 0.15s ease;
  text-align: center;

  &:hover {
    color: #fff;
    background: ${(p) => (p.$active ? bgCardHover : 'rgba(255,255,255,0.05)')};
  }

  @media (max-width: 768px) {
    flex: 1;
    min-width: 0;
    padding: 7px 4px;
    font-size: 12px;
    gap: 5px;
  }
`;

export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-bottom: 14px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    margin-bottom: 10px;
  }
`;

export const MetricCard = styled.div`
  background: ${bgCard};
  border: 1px solid ${border};
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);

  .label {
    font-size: 10.5px;
    font-weight: 700;
    color: ${sub};
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .value {
    font-size: 19px;
    font-weight: 800;
    color: #fff;
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .subtext {
    font-size: 10.5px;
    color: ${(p) => p.$color || sub};
    font-weight: 500;
    opacity: 0.85;
  }

  @media (max-width: 640px) {
    padding: 8px 10px;
    .label {
      font-size: 9.5px;
    }
    .value {
      font-size: 16px;
    }
    .subtext {
      font-size: 9.5px;
    }
  }
`;

/* Componentes minimalistas para Insumos Base y Vasos */
export const SupplyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SupplyItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 9px;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.32);
    border-color: rgba(255, 255, 255, 0.09);
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

export const SupplyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;

  .name {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
  }
`;

export const SupplyInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MiniInputNumber = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 7px;
  padding: 4px 8px;
  gap: 4px;
  width: ${(p) => p.$width || '110px'};
  box-sizing: border-box;

  span.prefix {
    color: ${sub};
    font-weight: 600;
    font-size: 12px;
  }

  input {
    all: unset;
    width: 100%;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    &::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
  }

  span.unit {
    color: ${sub};
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }
`;

export const RateBadge = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #4ccd99;
  background: rgba(76, 205, 153, 0.1);
  border: 1px solid rgba(76, 205, 153, 0.25);
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
  text-align: right;
  min-width: 90px;
`;

export const CupMatrixTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th {
    background: rgba(0, 0, 0, 0.3);
    color: ${sub};
    font-weight: 700;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 8px 10px;
    border-bottom: 1px solid ${border};
    text-align: left;

    &:last-child {
      text-align: right;
    }
  }

  td {
    padding: 9px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    vertical-align: middle;
    color: ${text};

    &:last-child {
      text-align: right;
    }
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

export const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    gap: 8px;
    margin-bottom: 12px;
  }
`;

export const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${bgCard};
  border: 1px solid ${border};
  border-radius: 10px;
  padding: 8px 14px;
  width: 100%;
  max-width: 320px;

  input {
    all: unset;
    color: #fff;
    font-size: 13px;
    width: 100%;
    &::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
  }

  @media (max-width: 640px) {
    max-width: 100%;
    padding: 7px 10px;
  }
`;

export const CategoryFilter = styled.div`
  display: flex;
  gap: 6px;
  max-width: 100%;
  flex-wrap: wrap;
  align-items: center;
  box-sizing: border-box;
`;

export const CatChip = styled.button`
  all: unset;
  cursor: pointer;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 9px;
  border-radius: 7px;
  border: 1px solid ${(p) => (p.$active ? '#4ccd99' : border)};
  background: ${(p) => (p.$active ? 'rgba(76,205,153,0.18)' : bgCard)};
  color: ${(p) => (p.$active ? '#4ccd99' : sub)};
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover {
    color: #fff;
    background: ${(p) => (p.$active ? 'rgba(76,205,153,0.25)' : bgCardHover)};
  }

  @media (max-width: 640px) {
    padding: 4px 8px;
    font-size: 11px;
  }
`;

export const TableWrap = styled.div`
  background: ${bgCard};
  border: 1px solid ${border};
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: visible;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

  /* Scrollbar horizontal limpio */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.25);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px;

  th {
    background: rgba(0, 0, 0, 0.35);
    color: ${sub};
    font-weight: 700;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 8px 8px;
    border-bottom: 1px solid ${border};
    white-space: nowrap;
  }

  td {
    padding: 7px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    vertical-align: middle;
    color: ${text};
  }

  tbody tr {
    transition: background 0.12s ease;
    &:hover {
      background: ${bgCardHover};
    }
    &:last-child td {
      border-bottom: none;
    }
  }

  @media (max-width: 640px) {
    font-size: 12px;
    th {
      padding: 7px 6px;
      font-size: 10px;
    }
    td {
      padding: 7px 6px;
      font-size: 11.5px;
    }
  }
`;

export const CategoryHeaderRow = styled.tr`
  background: rgba(0, 0, 0, 0.38) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  td {
    padding: 7px 10px !important;
    font-size: 11.5px !important;
    font-weight: 700 !important;
    color: #4ccd99 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.04em !important;
    border-bottom: 1px solid rgba(76, 205, 153, 0.2) !important;
  }
`;

export const MarginPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
  background: ${(p) =>
    p.$variant === 'good'
      ? 'rgba(76, 205, 153, 0.15)'
      : p.$variant === 'warn'
        ? 'rgba(234, 179, 8, 0.15)'
        : 'rgba(239, 68, 68, 0.15)'};
  color: ${(p) =>
    p.$variant === 'good' ? '#4ccd99' : p.$variant === 'warn' ? '#eab308' : '#ef4444'};
  border: 1px solid
    ${(p) =>
      p.$variant === 'good'
        ? 'rgba(76, 205, 153, 0.3)'
        : p.$variant === 'warn'
          ? 'rgba(234, 179, 8, 0.3)'
          : 'rgba(239, 68, 68, 0.3)'};
`;

export const ActionButton = styled.button`
  all: unset;
  cursor: pointer;
  padding: 5px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid ${border};
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

export const RecipeBadge = styled.button`
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 7px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  font-size: 11px;
  font-family: inherit;
  transition: all 0.15s ease;
  line-height: 1.25;
  box-sizing: border-box;

  &:hover {
    background: rgba(76, 205, 153, 0.15);
    border-color: rgba(76, 205, 153, 0.4);
    color: #fff;
    transform: translateY(-1px);
  }

  .size-tag {
    font-weight: 800;
    font-size: 9.5px;
    padding: 1px 4px;
    border-radius: 4px;
    background: rgba(76, 205, 153, 0.18);
    color: #4ccd99;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .recipe-text {
    font-weight: 500;
    white-space: nowrap;
  }

  .edit-hint {
    opacity: 0.35;
    color: #4ccd99;
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  &:hover .edit-hint {
    opacity: 1;
    transform: scale(1.15);
  }
`;


/* Formularios para Insumos Base */
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const FormCard = styled.div`
  background: ${bgCard};
  border: 1px solid ${border};
  border-radius: 14px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

  .card-title {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding-bottom: 12px;
  }

  @media (max-width: 640px) {
    padding: 14px;
    gap: 12px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: ${text};
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .hint {
    font-size: 11px;
    color: #4ccd99;
    font-weight: 600;
  }

  .subhint {
    font-size: 11px;
    color: ${sub};
    line-height: 1.3;
  }
`;

export const InputNumber = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid ${border};
  border-radius: 10px;
  padding: 8px 12px;
  gap: 6px;

  span.prefix {
    color: ${sub};
    font-weight: 600;
    font-size: 13px;
  }

  input {
    all: unset;
    width: 100%;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    &::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
  }

  span.unit {
    color: ${sub};
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
`;

export const PrimaryButton = styled.button`
  all: unset;
  cursor: pointer;
  background: #4ccd99;
  color: #0b1d16;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s ease;
  box-shadow: 0 4px 12px rgba(76, 205, 153, 0.25);

  &:hover {
    background: #5ee2ad;
    box-shadow: 0 6px 18px rgba(76, 205, 153, 0.35);
    transform: translateY(-1px);
  }
`;

/* Modal de edición de receta */
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;

  @media (max-width: 640px) {
    padding: 6px;
  }
`;

export const ModalContent = styled.div`
  background: ${bgCard};
  border: 1px solid ${border};
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: min(90vh, 740px);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  margin: auto;

  @media (max-width: 640px) {
    max-height: 96vh;
    border-radius: 14px;
  }
`;

export const ModalHeader = styled.div`
  padding: 18px 22px 14px;
  border-bottom: 1px solid ${border};
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  background: ${bgCard};

  @media (max-width: 640px) {
    padding: 12px 14px 10px;
  }
`;

export const ModalBodyScroll = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;

  /* Scrollbar interno */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.35);
  }

  @media (max-width: 640px) {
    padding: 12px 12px;
    gap: 10px;
  }
`;

export const ModalFooter = styled.div`
  padding: 12px 22px 16px;
  border-top: 1px solid ${border};
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
  background: ${bgCard};

  @media (max-width: 640px) {
    padding: 10px 12px;
    gap: 6px;
    flex-wrap: wrap;

    button {
      flex: 1 1 auto;
      text-align: center;
      justify-content: center;
    }
  }
`;

export const UnitButton = styled.button`
  all: unset;
  cursor: pointer;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 5px;
  border: 1px solid ${(p) => (p.$active ? '#4ccd99' : 'rgba(255, 255, 255, 0.12)')};
  background: ${(p) => (p.$active ? 'rgba(76, 205, 153, 0.22)' : 'rgba(255, 255, 255, 0.05)')};
  color: ${(p) => (p.$active ? '#4ccd99' : '#B4B6C9')};
  transition: all 0.15s ease;
  line-height: 1.2;
  box-sizing: border-box;

  &:hover {
    color: #fff;
    border-color: ${(p) => (p.$active ? '#4ccd99' : 'rgba(255, 255, 255, 0.25)')};
    background: ${(p) => (p.$active ? 'rgba(76, 205, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)')};
  }
`;

export const FlavorSelect = styled.select`
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 7px;
  color: #4ccd99;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 8px;
  outline: none;
  cursor: pointer;
  width: 100%;
  margin-top: 5px;
  transition: all 0.15s ease;

  &:focus {
    border-color: #4ccd99;
  }

  option {
    background: #240007;
    color: #fff;
  }
`;

export const AddFlavorButton = styled.button`
  all: unset;
  cursor: pointer;
  background: rgba(76, 205, 153, 0.12);
  border: 1px solid rgba(76, 205, 153, 0.3);
  color: #4ccd99;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(76, 205, 153, 0.22);
    border-color: #4ccd99;
    color: #fff;
  }
`;

export const DeleteFlavorButton = styled.button`
  all: unset;
  cursor: pointer;
  color: #ef4444;
  opacity: 0.6;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    opacity: 1;
    background: rgba(239, 68, 68, 0.15);
  }
`;

/* Styled Components para la Pestaña de Recetario */
export const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
  margin-top: 14px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const RecipeCard = styled.div`
  background: ${bgCard};
  border: 1px solid ${border};
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: rgba(76, 205, 153, 0.3);
    transform: translateY(-2px);
  }
`;

export const RecipeCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;

  .title-area {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .item-name {
    font-size: 16px;
    font-weight: 800;
    color: #fff;
    line-height: 1.25;
  }

  .category-tag {
    font-size: 11px;
    font-weight: 600;
    color: ${sub};
    text-transform: capitalize;
  }
`;

export const RecipePillsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const RecipePill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  background: ${(p) => p.$bg || 'rgba(255, 255, 255, 0.05)'};
  color: ${(p) => p.$color || '#fff'};
  border: 1px solid ${(p) => p.$border || 'rgba(255, 255, 255, 0.08)'};
`;

export const RecipeSizeSection = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .size-title {
    font-size: 12px;
    font-weight: 700;
    color: #4ccd99;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

export const RecipeMethodBox = styled.div`
  background: rgba(0, 0, 0, 0.35);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  color: #e2e8f0;
  line-height: 1.4;
  border-left: 3px solid #4ccd99;
`;

export const IngredientBadge = RecipePill;


