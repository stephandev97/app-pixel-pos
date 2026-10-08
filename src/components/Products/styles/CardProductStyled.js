import Select from 'react-select';
import styled from 'styled-components';

// === tokens
const Z_BASE = 99999;
const R = 12; // radius
const PAD = 14; // padding
const GAP = 10; // gap vertical

// --- CARD RESUMEN EN GRID (catálogo) ---
export const CardProductStyled = styled.div`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;

  padding: ${(p) => (p.$isElectron ? '12px 14px' : '16px 18px')};
  min-height: ${(p) => (p.$isElectron ? '40px' : '72px')};
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  cursor: pointer;

  will-change: transform;
  transform: translateZ(0);

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 0, 0, 0.12);
  }
  &:active {
    transform: translateY(0);
  }
  &:focus-visible {
    outline: none;
    border-color: #000;
  }

  @media (max-width: 768px) {
    padding: 14px 16px;
    border-radius: 14px;
  }

  @media (max-width: 600px) {
    padding: 10px 10px;
    min-height: 52px;
    border-radius: 12px;
    gap: 6px;

    .left {
      gap: 6px;
    }
    .dot {
      width: 8px;
      height: 8px;
      flex: 0 0 8px;
    }
    .name {
      font-size: 13.5px;
      font-weight: 700;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-word;
    }
    .price {
      font-size: 11.5px;
      padding: 4px 6px;
      font-weight: 800;
    }
  }

  .left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .dot {
    width: ${(p) => (p.$isElectron ? '8px' : '10px')};
    height: ${(p) => (p.$isElectron ? '8px' : '10px')};
    border-radius: 50%;
    background: ${(p) => p.$accent || '#111'};
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04) inset;
    flex: 0 0 ${(p) => (p.$isElectron ? '8px' : '10px')};
  }
  .name {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    color: #111;
    font-size: ${(p) => (p.$isElectron ? '15px' : '16px')};
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  }
  .price {
    font-family: 'Inter', sans-serif;
    font-weight: 900;
    font-size: ${(p) => (p.$isElectron ? '12px' : '13px')};
    line-height: 1;
    padding: ${(p) => (p.$isElectron ? '4px 8px' : '6px 10px')};
    border-radius: 999px;
  }
`;

export const selectCompact = {
  control: (base, state) => ({
    ...base,
    fontFamily: "'Inter', sans-serif",
    minHeight: 36,
    height: 36,
    fontSize: 13,
    borderRadius: 8,
    borderColor: state.isFocused ? '#0b0b0c' : 'rgba(0,0,0,.12)',
    boxShadow: 'none',
    ':hover': { borderColor: '#0b0b0c' },
    cursor: 'pointer', // clicky también en el control
  }),
  valueContainer: (b) => ({ ...b, padding: '0 10px' }),
  indicatorsContainer: (b) => ({ ...b, paddingRight: 4 }),
  dropdownIndicator: (b) => ({ ...b, padding: '0 4px', cursor: 'pointer' }),
  clearIndicator: (b) => ({ ...b, padding: '0 4px', cursor: 'pointer' }),
  input: (b) => ({ ...b, fontFamily: "'Inter', sans-serif", fontSize: 13 }),
  singleValue: (b) => ({ ...b, fontFamily: "'Inter', sans-serif", fontSize: 13 }),
  placeholder: (b) => ({ ...b, fontFamily: "'Inter', sans-serif", fontSize: 13 }),
  option: (b, s) => ({
    ...b,
    fontFamily: "'Inter', sans-serif",
    padding: '6px 10px',
    fontSize: 13,
    cursor: 'pointer',
  }),
  menuPortal: (b) => ({ ...b, zIndex: Z_BASE + 10 }),
  menu: (b) => ({ ...b, zIndex: Z_BASE + 10 }),
};

export const SelectStyles = styled(Select)`
  width: 100%;
  text-align: left;
  padding: 0.2em;
  font-family: 'Inter', sans-serif;
  font-size: 14px;

  &.Select--multi {
    .Select-value {
      background: black;
    }
  }
`;

export const Background = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: ${Z_BASE};
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
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
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  font-weight: 800;
`;

// --- BODY SCROLLEABLE ---
export const ContainerSelect = styled.div`
  flex: 1;
  overflow: auto;
  padding: 14px 18px calc(86px + env(safe-area-inset-bottom));
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
`;
// Título "Sabor X"
export const TitleSabor = styled.div`
  font-weight: 700;
  font-size: 14px;
  margin: 10px 0 6px;
  color: #23262a;
  opacity: 0.9;
`;

export const InputDetalle = styled.input`
  width: 100%;
  margin-top: 6px;
  height: 36px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
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
  top: ${(p) => (p.$isHelado ? 'max(24px, calc(50vh - 262px))' : '50%')};
  left: calc(50% + var(--sidebar-w, 60px) / 2);
  transform: ${(p) => (p.$isHelado ? 'translate(-50%, 0)' : 'translate(-50%, -50%)')};
  width: min(430px, calc(100vw - var(--sidebar-w, 60px) - 20px));
  max-width: calc(100vw - var(--sidebar-w, 60px) - 20px);
  height: auto;
  max-height: min(630px, 92vh);
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.22),
    0 0 0 1px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  z-index: ${Z_BASE + 1};
  font-family: 'Inter', sans-serif;
  will-change: transform, opacity;
  animation: ${(p) =>
    p.$isHelado
      ? 'modalFixedTopIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
      : 'modalCenterIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)'};
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  @media (max-width: 640px) {
    top: ${(p) => (p.$isHelado ? 'max(16px, calc(50vh - 262px))' : '50%')};
    left: calc(50% + var(--sidebar-w, 48px) / 2);
    width: min(430px, calc(100vw - var(--sidebar-w, 48px) - 16px));
    max-width: calc(100vw - var(--sidebar-w, 48px) - 16px);
    max-height: 94vh;
    border-radius: 14px;
  }

  @keyframes modalCenterIn {
    from {
      opacity: 0;
      transform: translate(-50%, -48%) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes modalFixedTopIn {
    from {
      opacity: 0;
      transform: translate(-50%, -8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0) scale(1);
    }
  }
`;

export const Title = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  height: auto;
  padding: 8px 14px;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  a {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #1e1e2d;
    line-height: 1.15;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  }
`;

export const BodyScroll = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  max-height: calc(88vh - 110px);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fafbfc;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
`;

export const Field = styled.div`
  display: grid;
  gap: 4px;
  font-size: 0.95em;
  background: #fff;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
`;

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const RemoveLink = styled.button`
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  background: #f1f5f9;
  border: 0;
  padding: 3px 6px;
  border-radius: 6px;
  transition: all 0.15s;
  &:hover {
    color: #ef4444;
    background: #fef2f2;
  }
  font-family: 'Inter', sans-serif;
  cursor: pointer;
`;

export const GhostPill = styled.button`
  align-self: center;
  height: 28px;
  padding: 0 12px;
  margin-top: 2px;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  background: #fff;
  font-weight: 600;
  font-size: 11.5px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;

  &:hover {
    border-color: #4d0012;
    color: #4d0012;
    background: #fffbfb;
  }
`;

export const ContentAclaracion = styled.div`
  padding: 10px 12px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  display: grid;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
`;

export const FooterSticky = styled.div`
  position: sticky;
  bottom: 0;
  z-index: ${Z_BASE + 2};
  flex-shrink: 0;
  margin-top: auto;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
`;

export const BotonAgregar = styled.button`
  width: 100%;
  height: 40px;
  border: ${(p) => (p.$isOmitir ? '2px solid #4d0012' : '2px solid transparent')};
  border-radius: 10px;
  font-weight: 700;
  font-size: ${(p) => (p.$isOmitir ? '13px' : '14px')};
  letter-spacing: -0.01em;
  background: ${(p) =>
    p.$isOmitir
      ? '#ffffff'
      : 'linear-gradient(135deg, #4d0012 0%, #2d000a 100%)'};
  color: ${(p) => (p.$isOmitir ? '#4d0012' : '#ffffff')};
  box-shadow: ${(p) =>
    p.$isOmitir
      ? '0 3px 10px rgba(77, 0, 18, 0.12)'
      : '0 3px 10px rgba(77, 0, 18, 0.25)'};
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  box-sizing: border-box;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  will-change: transform;
  transform: translateZ(0);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${(p) =>
      p.$isOmitir
        ? '0 6px 18px rgba(77, 0, 18, 0.25)'
        : '0 6px 20px rgba(77, 0, 18, 0.35)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(77, 0, 18, 0.25);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(77, 0, 18, 0.2);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 46px;
  height: auto;
  padding: 8px 14px;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  a {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #1e1e2d;
    line-height: 1.15;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  }
`;

// Subtítulo "Elegí tu sabor" (derecha)
export const Subtitle = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.3px;
  text-transform: uppercase;
`;

// Grilla de opciones
export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: ${(p) => (p.$twoCols ? '1fr 1fr' : '1fr')};
  gap: 8px;
  padding: 8px 0 12px;
`;

// Botón de opción "pill" interactivo con contador circular
export const OptionBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  font-family: 'Inter', sans-serif;
  appearance: none;
  cursor: pointer;

  background: ${(p) => (p.$isSelected ? '#fff5f7' : '#fff')};
  border: 1.5px solid ${(p) => (p.$isSelected ? '#4d0012' : '#e2e4ea')};
  border-radius: 9px;
  padding: 7px 10px;

  font-size: 13px;
  font-weight: ${(p) => (p.$isSelected ? 700 : 600)};
  color: ${(p) => (p.$isSelected ? '#4d0012' : '#1e293b')};
  letter-spacing: -0.01em;

  box-shadow: ${(p) => (p.$isSelected ? '0 2px 6px rgba(77, 0, 18, 0.08)' : '0 1px 2px rgba(0, 0, 0, 0.02)')};
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  &:hover {
    border-color: ${(p) => (p.$isSelected ? '#4d0012' : '#94a3b8')};
    background: ${(p) => (p.$isSelected ? '#fff0f3' : '#f8fafc')};
    color: ${(p) => (p.$isSelected ? '#4d0012' : '#0f172a')};
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: none;
    border-color: #4d0012;
    box-shadow: 0 0 0 3px rgba(77, 0, 18, 0.1);
  }

  .label-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 6px;
  }

  .btn-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .minus-btn {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid #cbd5e1;
    background: #fff;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    line-height: 1;
    padding: 0;

    &:hover {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fca5a5;
      transform: scale(1.08);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .count-badge {
    min-width: 20px;
    height: 20px;
    padding: 0 4px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    transition: all 0.15s ease;

    &.empty {
      width: 18px;
      height: 18px;
      padding: 0;
      border-radius: 50%;
      border: 1.5px solid #cbd5e1;
      background: transparent;
      color: #94a3b8;
      font-size: 11px;
    }

    &.active {
      background: #4d0012;
      color: #fff;
      box-shadow: 0 2px 5px rgba(77, 0, 18, 0.3);
      animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
  }

  @keyframes popIn {
    0% {
      transform: scale(0.6);
      opacity: 0.5;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
