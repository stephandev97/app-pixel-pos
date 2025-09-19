import Select from 'react-select';
import styled from 'styled-components';

// === tokens
const Z_BASE = 5000;
const R = 12; // radius
const PAD = 14; // padding
const GAP = 10; // gap vertical

export const selectCompact = {
  control: (base, state) => ({
    ...base,
    fontFamily: "'Satoshi', sans-serif",
    minHeight: 40,
    height: 40,
    borderRadius: 10,
    borderColor: state.isFocused ? '#0b0b0c' : 'rgba(0,0,0,.12)',
    boxShadow: 'none',
    ':hover': { borderColor: '#0b0b0c' },
    cursor: 'pointer', // clicky también en el control
  }),
  valueContainer: (b) => ({ ...b, padding: '0 12px' }),
  indicatorsContainer: (b) => ({ ...b, paddingRight: 6 }),
  dropdownIndicator: (b) => ({ ...b, padding: '0 6px', cursor: 'pointer' }),
  clearIndicator: (b) => ({ ...b, padding: '0 6px', cursor: 'pointer' }),
  input: (b) => ({ ...b, fontFamily: "'Satoshi', sans-serif" }),
  singleValue: (b) => ({ ...b, fontFamily: "'Satoshi', sans-serif" }),
  placeholder: (b) => ({ ...b, fontFamily: "'Satoshi', sans-serif" }),
  option: (b, s) => ({
    ...b,
    fontFamily: "'Satoshi', sans-serif",
    padding: '8px 10px',
    fontSize: 14,
    cursor: 'pointer',
  }),
  menuPortal: (b) => ({ ...b, zIndex: Z_BASE + 10 }),
  menu: (b) => ({ ...b, zIndex: Z_BASE + 10 }),
};

export const SelectStyles = styled(Select)`
  width: 100%;
  text-align: left;
  padding: 0.2em;
  font-family: 'Satoshi', sans-serif;

  &.Select--multi {
    .Select-value {
      background: black;
    }
  }
`;

export const Background = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
  z-index: ${Z_BASE};
`;

// Botón verde "Retiro por el local" (si ya lo tenés, dejá el tuyo)
export const BotonCompraLocal = styled.button`
  height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 12px;
  background: #57d78a;
  color: #0a291a;
  font-weight: 700;
  font-family: 'Satoshi', sans-serif;
  cursor: pointer;
  font-weight: 800;
`;

// --- BODY SCROLLEABLE ---
export const ContainerSelect = styled.div`
  flex: 1;
  overflow: auto;
  padding: 14px 18px calc(86px + env(safe-area-inset-bottom));
`;
// Título “Sabor X”
export const TitleSabor = styled.div`
  font-weight: 700;
  font-size: 14px;
  margin: 10px 0 6px;
  color: #23262a;
  opacity: 0.9;
`;

export const InputDetalle = styled.input`
  width: 100%;
  margin-top: 8px;
  height: 42px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  outline: none;
`;

// --- BOTONES RÁPIDOS (Paletas) ---
export const ContainerBoton = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 10px 18px 0;
`;
export const Boton = styled.button`
  height: 36px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  border-radius: 10px;
`;

// --- CARD RESUMEN EN GRID (catálogo) ---
export const CardProductStyled = styled.div`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;

  padding: 12px 14px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  cursor: pointer;

  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease;
  will-change: transform, box-shadow;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.1);
    border-color: rgba(0, 0, 0, 0.12);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  }
  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(17, 17, 17, 0.14),
      0 10px 24px rgba(0, 0, 0, 0.12);
  }

  .left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(p) => p.$accent || '#111'};
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04) inset;
    flex: 0 0 10px;
  }
  .name {
    font-family: 'Satoshi', sans-serif;
    font-weight: 800;
    color: #111;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .price {
    font-family: 'Satoshi', sans-serif;
    font-weight: 900;
    font-size: 13px;
    line-height: 1;
    padding: 6px 10px;
    border-radius: 999px;
  }
`;

// --- SKELETON CON SHIMMER ---
export const Skeleton = styled.div`
  --h: ${(p) => p.h || 44}px;
  --r: ${(p) => p.r || 10}px;
  height: var(--h);
  border-radius: var(--r);
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.12) 37%,
    rgba(0, 0, 0, 0.06) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.25s linear infinite;

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`;
// === modal
export const WindowProductStyled = styled.form`
  position: fixed;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: min(480px, 92vw);
  max-height: 84vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fb;
  border-radius: ${R}px;
  box-shadow: 0 16px 48px rgba(21, 25, 36, 0.18);
  overflow: hidden;
  z-index: ${Z_BASE + 1};
  font-family: 'Satoshi', sans-serif;
`;

export const Title = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  padding: 0 ${PAD}px;
  background: rgba(247, 248, 251, 0.95);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  a {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 0.2px;
  }
`;

export const BodyScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${PAD}px ${PAD}px ${PAD - 4}px;
  display: flex;
  flex-direction: column;
  gap: ${GAP}px;
`;

export const Field = styled.div`
  display: grid;
  gap: 6px;
  font-size: 1.2em;
`;

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  font-size: 14px;
  font-weight: 700;
  color: #2a2f36;
  opacity: 0.9;
`;

export const RemoveLink = styled.button`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: transparent;
  border: 0;
  padding: 2px 6px;
  border-radius: 8px;
  transition: background 0.15s;
  &:hover {
    color: red;
  }
  font-family: 'Satoshi', sans-serif;
  cursor: pointer;
  font-size: 1.1em;
`;

export const GhostPill = styled.button`
  align-self: center;
  height: 32px;
  padding: 0 12px;
  margin-top: 2px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  font-weight: 600;
  font-size: 13px;
  font-family: 'Satoshi', sans-serif;
  cursor: pointer;
`;

export const ContentAclaracion = styled.div`
  padding: 10px 12px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: ${R - 2}px;
  display: grid;
  gap: 8px;
`;

export const FooterSticky = styled.div`
  position: sticky;
  bottom: 0;
  z-index: ${Z_BASE + 2};
  padding: 10px ${PAD}px calc(10px + env(safe-area-inset-bottom));
  background: linear-gradient(
    to top,
    #f7f8fb 0%,
    rgba(247, 248, 251, 0.95) 60%,
    rgba(247, 248, 251, 0) 100%
  );
  border-top: 1px solid rgba(0, 0, 0, 0.06);
`;

export const BotonAgregar = styled.button`
  width: 100%;
  height: 60px;
  border: 0;
  border-radius: ${R}px;
  font-weight: 600;
  background: #0b0b0c;
  color: #fff;
  font-size: 1.1em;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  font-family: 'Satoshi', sans-serif;
  cursor: pointer;

  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.08s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    opacity 0.2s ease;
  will-change: transform, box-shadow;

  /* brillo sutil al pasar el mouse */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      transparent 0%,
      rgba(255, 255, 255, 0.18) 50%,
      transparent 100%
    );
    transform: translateX(-120%);
    transition: transform 0.6s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-1px);
    background: #141416;
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.22);
  }
  &:hover::after {
    transform: translateX(120%);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(11, 11, 12, 0.4),
      0 10px 22px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &::after {
      display: none;
    }
  }
`;

export const Header = styled(Title)`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  /* igualamos spacing del Title */
  padding: 16px 20px 0px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

// Subtítulo “Elegí tu sabor” (derecha)
export const Subtitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #64748b; /* gris suave */
  letter-spacing: 0.2px;
`;

// Grilla de opciones
export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 8px 0 16px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr; /* en pantallas chicas, 1 columna */
  }
`;

// Botón de opción “pill” con micro-relieve
export const OptionBtn = styled.button`
  appearance: none;
  cursor: pointer;
  border: 1px solid #e5e7eb; /* gris claro */
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 600;
  color: #111827; /* gris muy oscuro */
  box-shadow:
    0 1px 0 rgba(17, 24, 39, 0.04),
    inset 0 2px 6px rgba(2, 6, 23, 0.06);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease,
    background-color 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(2, 6, 23, 0.08);
    background: linear-gradient(180deg, #ffffff, #f3f4f6);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(2, 6, 23, 0.06);
  }

  &:focus-visible {
    outline: 0;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.35); /* anillo violeta suave */
    border-color: #6366f1;
  }
`;
