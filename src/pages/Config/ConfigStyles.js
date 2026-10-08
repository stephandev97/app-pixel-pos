import styled from 'styled-components';

const bg = '#2d0009'; /* Color bordo aún más oscuro */
const card = '#4d0012'; /* Color bordo para botones */
const card2 = '#6d0022'; /* Color bordo más claro para iconos */
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
  padding: 24px 16px 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// limita el ancho útil y centra
export const PageInner = styled.div`
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  min-width: 0;
`;

export const TitlePage = styled.div`
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 8px 0 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  & > a {
    color: ${text};
    text-decoration: none;
  }
`;

export const ContainerPages = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  box-sizing: border-box;
  min-width: 0;
`;

export const ButtonPage = styled.button`
  all: unset;
  cursor: pointer;
  background: ${card};
  border: 1px solid ${border};
  border-radius: 14px;
  padding: 10px 14px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 11px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease,
    background 0.12s ease;
  overflow: hidden;
  min-width: 0;
  max-width: 100%;

  /* efecto hover */
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    border-color: rgba(255, 255, 255, 0.12);
    background: #5a0017;
  }

  /* titulo */
  & > a {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.1px;
    color: ${text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* flecha */
  & > span {
    display: grid;
    place-items: center;
    opacity: 0.8;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  /* variantes por acción usando el primer hijo (IconButton) */
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
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: ${card2};
  border: 1px solid ${border};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const SwitchToggle = styled.div`
  position: relative;
  width: 36px;
  height: 20px;
  background: ${(p) => (p.$checked ? '#10b981' : 'rgba(255, 255, 255, 0.16)')};
  border-radius: 999px;
  transition: background 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);

  .thumb {
    position: absolute;
    top: 2px;
    left: ${(p) => (p.$checked ? '18px' : '2px')};
    width: 16px;
    height: 16px;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: left 0.2s cubic-bezier(0.16, 1, 0.3, 1);
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
