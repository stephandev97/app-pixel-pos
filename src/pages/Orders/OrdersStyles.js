import styled from 'styled-components';

export const NAV_HEIGHT = 60;

/* Lienzo de la pantalla Orders (dentro del motion.div que ocupa 100vh) */
export const GlobalOrders = styled.div`
  width: 500px;
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
  margin: 10px 0 14px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* franja lateral de estado (no tapa contenido) */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    border-radius: 8px 0 0 8px;
    background: ${({ $estado }) => {
      if ($estado === 'justo') return '#28a745';
      if ($estado === 'transferencia') return '#007bff';
      if ($estado === 'cambio') return '#ffc107';
      return '#dc3545'; // incompleto/otro
    }};
    z-index: 0;
    pointer-events: none;
  }

  /* asegurá contenido por encima de la franja */
  & > * {
    position: relative;
    z-index: 1;
  }
`;

/* Encabezado dentro de la card */
export const TitleCard = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #111;
  font-size: 1.1rem;
  border-bottom: 1px solid #f5f6fa;
  padding-bottom: 10px;
`;

/* Acciones visibles al hover (imprimir/copiar/etc.) */
export const ContentButtonsTitle = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${ContainerCard}:hover & {
    opacity: 1;
    z-index: 200;
  }
`;

/* Botón chip genérico para acciones en el header de la card */
export const ButtonTitle = styled.span`
  min-width: 28px;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #fff;
  background: #111;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #b12e2eff;
  }
`;

/* Footer de la card (totales/estado de pago) */
export const FooterCard = styled.div`
  border-top: 2px solid #f5f6fa;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
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
  font-weight: 700;
  color: ${({ $type }) => ($type === 'cambio' ? '#111' : '#fff')};
  background: ${({ $type }) => {
    if ($type === 'justo') return '#28a745';
    if ($type === 'transferencia') return '#007bff';
    if ($type === 'cambio') return '#ffc107';
    return '#dc3545'; // incompleto
  }};
`;

/* Texto auxiliar (hora relativa, etc.) que aparece al hover */
export const Hora = styled.span`
  margin-left: 8px;
  color: #9ca3af;
  opacity: 0;
  transition: opacity 0.15s ease;

  ${ContainerCard}:hover & {
    opacity: 1;
  }
`;

/* Línea de dirección / info principal */
export const DirCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin: 12px 0 8px 0;
  font-weight: 700;
  font-size: 1.05rem;

  & span {
    display: flex;
    align-items: center;
    text-align: left;
  }
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
  background: #41b06e;
`;
export const ButtonPrint = styled(ButtonTitle)`
  background: black;

  &:hover {
    background: #279494ff !important;
    color: white;
  }
`;

export const ButtonCopy = styled.span`
  margin-right: 0.5em;
  padding: 0.2em 0.8em;
  border-radius: 5px;
  font-size: 0.8em;
  background: #f7f7ff;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #5931e7ff !important;
    color: white !important;
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
  width: 72%;
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
  font-family: 'Satoshi';
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