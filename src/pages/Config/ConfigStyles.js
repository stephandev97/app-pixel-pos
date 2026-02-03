import styled from 'styled-components';

const bg = '#0B0B0F';
const card = '#11121A';
const card2 = '#141624';
const text = '#EDEDEE';
const sub = '#A9AABC';
const accent = '#4CCD99';
const accentSoft = 'rgba(76,205,153,0.18)';
const dangerSoft = 'rgba(210,0,98,0.15)';
const border = 'rgba(255,255,255,0.06)';

export const Container = styled.div`
  width: 100%;
  min-height: 100%;
  background: ${bg};
  color: ${text};
  overflow-x: hidden;
  padding: 12px 16px;
  @media (min-width: 700px) {
    padding: 24px clamp(16px, 3vw, 32px);
  }
`;

// nuevo: limita el ancho útil y centra
export const PageInner = styled.div`
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  min-width: 0; /* ← importante cuando está dentro de flex/grid */
`;

export const TitlePage = styled.div`
  font-size: clamp(24px, 3.2vw, 36px);
  font-weight: 800;
  letter-spacing: 0.2px;
  margin: 8px 0 18px;
  & > a {
    color: ${text};
    text-decoration: none;
  }
`;

export const ContainerPages = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr); /* siempre 1 columna y NUNCA empuja */
  gap: 12px;
  width: 400px;
  min-width: 0; /* clave en grids dentro de contenedores estrechos */
`;

export const ButtonPage = styled.button`
  all: unset;
  cursor: pointer;
  background: ${card};
  border: 1px solid ${border};
  border-radius: 20px;
  padding: 16px 18px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  position: relative;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
  overflow: hidden; /* si hay sombras o textos extensos */
  min-width: 0; /* clave para grids */
  max-width: 100%;
  width: 100%;
  overflow: hidden;

  /* efecto hover */
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
    border-color: rgba(255, 255, 255, 0.12);
  }

  /* titulo */
  & > a {
    font-size: clamp(16px, 2vw, 18px);
    font-weight: 700;
    letter-spacing: 0.2px;
    color: ${text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* flecha */
  & > span {
    display: grid;
    place-items: center;
    opacity: 0.6;
  }

  /* variantes por acción usando el primer hijo (IconButton) */
  &[data-variant='save'] ${'' /* Guardar */} {
  }
  &[data-variant='delete'] {
    background: linear-gradient(180deg, ${dangerSoft}, ${card});
    border-color: rgba(210, 0, 98, 0.25);
  }
  &[data-variant='upload'] {
    background: linear-gradient(180deg, rgba(100, 149, 237, 0.12), ${card});
    border-color: rgba(100, 149, 237, 0.22);
  }
`;

export const IconButton = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: ${card2};
  border: 1px solid ${border};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);

  svg {
    width: 22px;
    height: 22px;
  }
`;

/* ====== Overlays de confirmación que ya usabas ====== */
export const Background = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 20;
  overflow: hidden;
`;

export const MsjNav = styled.div`
  position: fixed;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  width: min(640px, calc(100% - 28px));
  background: ${card2};
  color: ${text};
  border: 1px solid ${border};
  border-radius: 16px;
  padding: 12px 14px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);

  & > span {
    font-weight: 700;
  }
  & > div {
    display: flex;
    gap: 8px;
  }
`;

export const MsjButton = styled.button`
  all: unset;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: ${card};
  border: 1px solid ${border};
  transition:
    transform 0.14s ease,
    background 0.14s ease;

  &:hover {
    transform: translateY(-1px);
  }
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const InputFile = styled.input`
  background: ${card};
  border: 1px solid ${border};
  border-radius: 12px;
  padding: 10px 12px;
  color: ${text};
`;

export const ButtonUpload = styled.button`
  all: unset;
  cursor: pointer;
  background: ${accent};
  color: #0a0f0d;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 800;
  box-shadow: 0 8px 22px rgba(76, 205, 153, 0.38);
  display: grid;
  place-items: center;
  transition: transform 0.12s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

/* ====== Subcomponentes del modal de carga que ya tenías ====== */
export const ContentUploadFile = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
`;

export const TitleUpload = styled.div`
  font-weight: 800;
  letter-spacing: 0.2px;
`;

export const ContentInput = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
`;

/* Separador por si lo reutilizás */
export const Separador = styled.div`
  height: 1px;
  background: ${border};
  margin: 10px 0;
`;

/* ====== KPI row ====== */
export const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 14px;
  margin: 8px 0 18px;

  @media (max-width: 1050px) {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background: ${card};
  border: 1px solid ${border};
  border-radius: 18px;
  padding: 14px 16px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;

  &[data-variant='accent'] {
    background: linear-gradient(180deg, ${accentSoft}, ${card});
    border-color: rgba(76, 205, 153, 0.25);
  }
  &[data-variant='dark'] {
    background: ${card2};
  }

  &:hover {
    transform: translateY(-2px);
  }
`;

export const StatLabel = styled.div`
  font-size: 12px;
  color: ${sub};
  letter-spacing: 0.4px;
  text-transform: uppercase;
`;

export const StatNumber = styled.div`
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 800;
  margin-top: 4px;
`;

/* ====== Modal: Turnos y Cierre ====== */
export const ModalSection = styled.div`
  display: grid;
  gap: 16px;
  font-family:
    'Inter',
    'Inter-Variable',
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    Arial,
    sans-serif;
  color: ${text};
`;

export const ModalTitle = styled.div`
  font-size: clamp(20px, 2.6vw, 24px);
  font-weight: 900;
  letter-spacing: 0.2px;
`;

export const ModalGridRows = styled.div`
  display: grid;
  gap: 12px;
  background: ${card2};
  border: 1px solid ${border};
  border-radius: 18px;
  padding: 16px 18px;
  box-shadow:
    0 14px 34px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
`;

export const RowLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
`;
export const RowLabel = styled.span`
  color: ${sub};
  letter-spacing: 0.3px;
  font-size: 13px;
`;
export const RowValue = styled.strong`
  text-align: right;
  flex-shrink: 0;
  font-size: clamp(16px, 2vw, 18px);
  font-weight: 800;
  &[data-variant='danger'] {
    color: #d20062;
  }
`;

export const DenomsTitle = styled.div`
  font-weight: 800;
  margin-top: 6px;
  font-size: 16px;
`;
export const DenomsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  @media (min-width: 780px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;
export const DenomItem = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 10px;
`;
export const DenomLabel = styled.span`
  opacity: 0.8;
  text-align: right;
  margin-bottom: 2px;
`;
export const DenomInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid ${border};
  color: ${text};
  background: ${card2};
  text-align: right;
  font-size: 16px;
  font-family:
    'Inter',
    'Inter-Variable',
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    Arial,
    sans-serif;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  &:focus {
    border-color: rgba(76, 205, 153, 0.45);
    box-shadow: 0 0 0 3px ${accentSoft};
  }
`;

export const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
  justify-content: flex-end;
`;
export const PrimaryButton = styled.button`
  all: unset;
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 14px;
  background: ${accent};
  color: #0a0f0d;
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(76, 205, 153, 0.38);
  border: 1px solid rgba(76, 205, 153, 0.32);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(76, 205, 153, 0.44);
  }
`;
export const SecondaryButton = styled.button`
  all: unset;
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid ${border};
  background: ${card};
  color: ${text};
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;
  &:hover {
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
  }
`;
