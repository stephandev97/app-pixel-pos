import { css, keyframes, styled } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.01); } /* Reduced scale */
  100% { transform: scale(1); }
`;

export const NAV_HEIGHT = 60;

/* Lienzo de la pantalla Orders (dentro del motion.div que ocupa 100vh) */
export const GlobalOrders = styled.div`
  width: 100%;
  max-width: 500px;
  background: #8b8b8b11;
`;

/* Header fijo (navbar superior) */
export const Navbar = styled.div`
  position: fixed; /* fijo al viewport */
  top: 0;
  left: 0;
  right: 0;
  height: ${NAV_HEIGHT}px;
  z-index: 1000; /* por encima del contenido */
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease;
  transform: translateY(${(p) => (p.$hidden ? `-${NAV_HEIGHT}px` : '0')});

  @media (max-width: 600px) {
    height: 52px;
  }
`;

/* Título centrado en el navbar */
export const NavbarTitle = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: #111;
  font-family:
    'League Spartan',
    'Poppins',
    system-ui,
    -apple-system,
    sans-serif;

  @media (max-width: 600px) {
    font-size: 1.4rem;
  }
`;

/* Botón flecha para volver (izquierda del navbar) */
export const BackButton = styled.button`
  position: absolute;
  left: 16px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  color: #111;

  &:hover {
    background: #f3f4f6;
  }
  &:focus-visible {
    outline: 2px solid #6528f7;
    outline-offset: 2px;
  }
`;

/* Área scrolleable — ocupa todo entre el navbar y el borde inferior */
export const ContainerOrders = styled.div`
  position: absolute;
  background: #f5f5f5ff;
  width: 100%;
  height: 98vh;
  overflow-y: auto;
  padding: 10px;

  @media (max-width: 600px) {
    padding: 8px 6px;
  }

  /* Scrollbar neutra (opcional) */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f3f4f6;
  }
  &::-webkit-scrollbar-thumb {
    background: #c7ccd1;
    border-radius: 6px;
  }
`;

export const ContainerCard = styled.div`
  position: relative;
  width: 100%;
  border-radius: 16px;
  background: #fff;
  padding: 16px 16px;
  margin: 14px 0 18px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Simplified shadow */
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* PERF: aísla layout/pintado de cada card */
  contain: layout paint;
  transform: translateZ(0);
  will-change: transform;

  /* asegurá contenido por encima de la franja */
  & > * {
    position: relative;
    z-index: 1;
  }

  border: ${({ $done }) => ($done ? '1px solid #23a76d' : 'none')};

  ${({ $pulse }) =>
    $pulse &&
    css`
      animation: ${pulse} 420ms ease-out;
    `}
`;

/* Encabezado dentro de la card */
export const TitleCard = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`;

/* Acciones visibles en el header (imprimir/copiar/etc.) */
export const ContentButtonsTitle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
`;

/* Botón chip genérico para acciones en el header de la card */
export const ButtonTitle = styled.span`
  width: 26px;
  height: 26px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #475569;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
  }
`;

/* Footer de la card (totales/estado de pago) */
export const FooterCard = styled.div`
  border-top: 1px solid #dfe3ea;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  background: #f7f9fc;
  border-radius: 20px;
`;

/* “Píldora” de total protagonista */
export const TotalPill = styled.span`
  background: #000;
  color: #fff;
  border-radius: 16px;
  padding: 4px 12px;
  font-weight: 800;
  font-size: 1.2rem;
  font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
`;

/* Chip de estado de pago (justo/transferencia/cambio/incompleto) */
export const EstadoChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $type }) => ($type === 'cambio' ? '#111' : '#fff')};
  background: ${({ $type }) => {
    if ($type === 'justo') return '#28a745';
    if ($type === 'transferencia') return '#007bff';
    if ($type === 'cambio') return '#ffc107';
    return '#dc3545'; // incompleto
  }};
`;

/* Texto auxiliar (hora) */
export const Hora = styled.span`
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  height: 24px;
  padding: 0 7px;
  box-sizing: border-box;
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
`;

/* Línea de dirección / info principal */
export const DirCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin: 4px 0 12px 0;
  padding: 7px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  box-sizing: border-box;
`;

/* Contenedor de lista de productos (dentro de la card) */
export const ListProducts = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-left: 0.8em;
  gap: 4px;
`;

export const TitleOrders = styled.h1`
  margin: 0; /* saca separación arriba */
  padding: 0; /* sin relleno extra */
  font-size: 2.7rem;
  text-align: left; /* asegura alineación izquierda */
  color: #121212; /* texto fuerte */
  font-family: 'Poppins', sans-serif;
`;

export const HaceMin = styled.div`
  font-size: 0.8em;
  opacity: 0.8;
  position: absolute;
  right: 0;

  ${ContainerCard}:hover & {
    opacity: 0;
  }
`;

export const TitleCheck = styled.span`
  margin-left: 1em;
  font-size: 0.9em;
  color: #8decb4;
  font-weight: bold;
`;

export const ButtonCheck = styled(ButtonTitle)`
  /* background: #41b06e; removed to be transparent */
`;
export const ButtonPrint = styled(ButtonTitle)`
  &:hover {
    background: #f1f5f9 !important;
    color: #0f172a !important;
    border-color: #cbd5e1 !important;
  }
`;

export const ButtonCopy = styled.span`
  height: 26px;
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-size: 0.72rem;
  background: #ffffff;
  color: #334155;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 800;
  user-select: none;
  font-family: inherit;
  flex-shrink: 0;
  white-space: nowrap;

  &:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }
`;

export const DivProducts = styled(DirCard)`
  justify-content: flex-start;
`;

export const BtnFooter = styled.div`
  background: #f7f7ff;
  width: 30%;
  border-radius: 10px;
  padding: 0.3em;
  font-weight: bold;
  display: flex;
  flex-direction: column;

  & span {
    margin: 0.1em 0;
  }
`;

export const Direccion = styled.span`
  flex: 1;
  min-width: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1e293b;
`;

export const Print = styled.div`
  left: 0;
  top: 0;
  background: white;
  padding: 1.5em 1.5em 1.5em 1em;
  justify-content: center;
  align-items: center;
  width: 200px;
  font-size: 1.1em;
  font-family: 'Inter';
  font-display: swap;

  @media print {
    display: block;
  }
`;
export const LogoPrint = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  & img {
    width: 50%;
  }
`;

export const TitlePrint = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 1.2em;
  margin-top: 1em;
`;

export const TitlePrintProducts = styled.div`
  display: grid;
  grid-template-columns: 1fr 4fr;
  margin-top: 1.2em;
  margin-bottom: 1em;
  font-size: 1.2em;

  & a {
    display: flex;
    text-align: left;
    padding: 0.2em;
    font-weight: bold;
  }
`;

export const PrintProduct = styled.div`
  display: grid;
  grid-template-columns: 1fr 4fr;

  & a {
    display: flex;
    justify-content: start;
    font-size: 1em;
    text-align: left;
  }

  & p {
    text-align: left;
    margin: 0.1em 0;
    font-size: 0.8em;
    font-weight: bold;
  }
`;
export const LineaPrint = styled.div`
  width: 100%;
  height: 8px;
  margin: 1.5em 0 0 0;
  font-weight: bold;
`;

export const PrintSabores = styled.div`
  margin-top: 0.8em;
  font-size: 0.9em;
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 100%;
  grid-column-start: 1;
  grid-column-end: 3;

  & a {
    width: 100%;
    text-overflow: ellipsis;
  }
`;

export const TotalPrint = styled.div`
  margin-top: 1.4em;
  font-size: 1.2em;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

export const LoadMoreButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  font-family: 'Inter', sans-serif;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 20px auto;
  display: block;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
`;
