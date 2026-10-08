// ContainerFinishStyles.js
import styled, { css, keyframes } from 'styled-components';

import { TotalStyled } from '../../Checkout/styles/ProductsCheckoutStyles';

const togglePulse = keyframes`
  0% { background: #4d0012; }
  50% { background: #ff6b9d; }
  100% { background: #4d0012; }
`;

export const ContentForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  padding-bottom: 20px;
  box-sizing: border-box;
  font-size: clamp(14px, 1.5vw, 20px);
  height: 100%;
  min-height: 0;

  @media (max-width: 1024px) {
    font-size: clamp(13px, 1.4vw, 18px);
    padding-bottom: 16px;
  }

  @media (pointer: coarse) {
    font-size: clamp(15px, 2vw, 22px);
  }
`;

export const ContentTabs = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0 16px;
  padding-bottom: 10px;
  box-sizing: border-box;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
`;

export const BottomSpacer = styled.div`
  height: var(--summary-h);
  width: 100%;
`;

export const Tab = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 580px;
  height: 42px;
  margin: 8px 0;
  padding: 4px;
  overflow: hidden !important;
  border-radius: 10px;
  background: #eef0f6;
  border: 1px solid #e3e6ee;
  box-shadow: none;

  @media (max-width: 1024px) {
    height: 38px;
    margin: 6px 0;
  }

  @media (pointer: coarse) {
    height: 50px;
    font-size: 16px;
  }
`;

export const ButtonToggle = styled.button`
  flex: 1;
  min-width: 0;
  overflow: hidden !important;
  height: 34px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #4d0012;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.2px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  text-align: center;
  justify-content: center;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    background 0.12s ease,
    color 0.12s ease,
    border-color 0.12s ease;

  @media (max-width: 1024px) {
    height: 30px;
    font-size: 12px;
  }

  @media (pointer: coarse) {
    height: 42px;
    font-size: 15px;
  }

  &:hover {
    background: #fff;
    border-color: #e6e6ee;
  }
  &:focus-visible {
    outline: 0;
    box-shadow: 0 0 0 2px #4d0012; /* Color bordo para focus */
    background: #fff;
  }

  /* Estado ACTIVO (via data-active="true") */
  &[data-active='true'] {
    background: #4d0012;
    color: #fff;
    border-color: #4d0012;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
    animation: togglePulse 1s ease-in-out 2;
  }
  &[data-active='true']:hover {
    filter: brightness(1.1);
    animation: none;
  }
`;

export const TotalFinish = styled(TotalStyled)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 16px 16px 0 0;
  background: #fff;
  padding: 10px 24px 12px;
  box-sizing: border-box;
  box-shadow: 0 -4px 12px rgba(16, 24, 40, 0.12);
  z-index: 10;

  @media (max-width: 1024px) {
    padding: 8px 20px 10px;
  }
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center !important;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  background: #ececf6;
  color: #111;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  ${(p) => p.kind === 'ef' && `background:#39975c;color:#fff;`}
  ${(p) => p.kind === 'mp' && `background:#2563eb;color:#fff;`}
`;

export const SummaryBox = styled.div`
  position: relative;
  z-index: 2;
  margin-top: 8px;
  padding: 12px 16px;
  background: #f7f7ff;
  border-radius: 12px;
  width: 100% !important;
  max-width: 580px;
  margin-left: auto;
  margin-right: auto;
  display: block !important;

  @media (max-width: 1024px) {
    padding: 10px 14px;
    margin-top: 6px;
  }

  @media (pointer: coarse) {
    font-size: 1.2rem;
    padding: 14px 18px;
  }
`;

export const Row = styled.div`
  width: 100%;
  display: grid !important;
  grid-template-columns: 1fr auto; /* etiqueta | valor */
  align-items: center;
  column-gap: 12px;
  min-height: 34px;
  margin-bottom: 8px;
`;

export const Label = styled.span`
  color: #6b6b7a;
  letter-spacing: 0.2px;
  display: flex;
  align-items: center;
  line-height: 1;

  @media (pointer: coarse) {
    font-size: 1.4rem;
  }
`;

export const Value = styled.span`
  justify-self: end; /* alinea a la derecha en su columna */
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-size: 1.3rem;

  @media (max-width: 1024px) {
    font-size: 1.2rem;
  }

  @media (pointer: coarse) {
    font-size: 1.5rem;
  }
`;

export const StatusPill = styled(Pill)`
  background: ${(p) => (p.kind === 'ok' ? '#39975c' : p.kind === 'warn' ? '#f59e0b' : '#ef4444')};
  color: #fff;
  font-size: 1rem;
`;

export const RightChips = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  justify-self: end; /* alinea el grupo de chips a la derecha */
  margin-bottom: 0 !important;
  overflow: hidden !important;
`;

/* Inputs */
export const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 580px;
  margin: 10px auto;
  overflow: hidden !important;
`;

export const Icon = styled.span`
  position: absolute;
  left: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: #6b6b7a;
  font-size: 18px;
  z-index: 10;
`;

export const Input = styled.input`
  border: 0;
  font-weight: bold;
  background: #f6f7ff;
  width: 100%;
  height: 44px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.4em 0.8em 0.4em 2.5em;
  background: #f6f7ff;
  border: 1px solid #e6e6ee;
  box-shadow: inset 0 1px 0 #fff;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  transform: translateZ(0);

  @media (max-width: 1024px) {
    height: 40px;
    font-size: 0.95rem;
  }

  @media (pointer: coarse) {
    height: 52px;
    font-size: 1.1rem;
  }

  &::placeholder {
    color: #9aa3b2;
    font-weight: 500;
  }
  &:hover {
    background: #fff;
    border-color: #d7dbea;
  }
  &:focus {
    outline: 0;
    background: #fff;
    border-color: #111;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
  }
  &[aria-invalid='true'] {
    background: #fff1f2;
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.14);
  }
  &:disabled {
    background: #f3f4f6;
    color: #9aa3b2;
    opacity: 0.85;
    cursor: not-allowed;
  }
`;

export const ButtonPaste = styled.button`
  position: absolute;
  top: 50%;
  right: 8px; /* dentro del input */
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e6e6ee;
  background: #ffffff;
  border-radius: 8px;
  color: #111;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    background 0.12s ease,
    border-color 0.12s ease;
  &:hover {
    background: #f8fafc;
    border-color: #d7dbea;
  }
  &:active {
    transform: translateY(-50%) scale(0.98);
  }
`;

// debajo de ButtonPaste...

/* Grupo vertical para opciones de envío (full-width) */
export const ShippingGroup = styled.div`
  width: 100%;
  max-width: 580px;
  margin: 10px auto 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  overflow: hidden !important;
`;

/* Botón-card de opción (diferente a los tabs) */
export const ShippingBtn = styled.button`
  width: 100%;
  min-height: 48px;
  border-radius: 12px;
  border: 1px solid #e3e6ee;
  background: #ffffff;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  transition:
    box-shadow 0.12s ease,
    border-color 0.12s ease,
    transform 0.12s ease;
  transform: translateZ(0);
  will-change: transform;

  &:hover {
    border-color: #d7dbea;
    box-shadow: 0 2px 10px rgba(16, 24, 40, 0.06);
  }
  &:active {
    transform: scale(0.998);
  }

  /* “radio” a la izquierda */
  &::before {
    content: '';
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 2px solid #9aa3b2;
    display: inline-block;
  }

  /* activo por data-active */
  &[data-active='true'] {
    border-color: #111;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  }
  &[data-active='true']::before {
    border-color: #111;
    background: radial-gradient(#111 0 6px, transparent 7px);
  }

  /* título */
  > span.title {
    font-family: 'Inter', sans-serif;
    font-weight: 800;
    color: #111;
  }
`;

/* Badge de precio a la derecha */
export const ShippingPrice = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f6f7ff;
  border: 1px solid #e6e6ee;
`;

// Grupo horizontal de botones de envío (chips)
export const ShippingInline = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 10px;
  margin: 10px auto 0;
  width: 100%;
  max-width: 580px;
`;

// Botón-chip de envío (diferente a los tabs)
export const ShippingOption = styled.button`
  position: relative;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1.5px dashed #cfd5e3; /* <-- borde punteado */
  background: #fbfbff; /* <-- más claro que los tabs */
  color: #0f172a;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 0.92rem; /* <-- un toque más chica */
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    border-color 0.12s ease,
    box-shadow 0.12s ease,
    background 0.12s ease;
  transform: translateZ(0);
  will-change: transform;

  /* Halo sutil al hover (no sólido como el tab) */
  &:hover {
    background: #ffffff;
    border-color: #b8c0d4;
    box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
  }

  /* Estado ACTIVO: borde sólido, check y leve levantado */
  &[data-active='true'] {
    border-style: solid;
    border-color: #111;
    background: #fff;
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  }

  /* Check (solo activo) */
  &[data-active='true']::after {
    content: '✔';
    position: absolute;
    right: 10px;
    top: 50%;
    translate: 0 -50%;
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

/* Badge de precio opcional, si querés mostrar $ en el botón */
export const ShippingMini = styled.span`
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #e7e9f2;
  background: #f6f7ff;
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.2px;
`;

export const Prefix = styled.span`
  position: absolute;
  left: 12px;
  font-weight: 700;
  font-size: 1rem;
  color: #6b6b7a;
  pointer-events: none;
`;

/* --- Motion helpers --- */
const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translate3d(0, 15px, 0); } /* Slightly larger distance for clearer "entry" */
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(.98); }
  to   { opacity: 1; transform: scale(1); }
`;

export const motionSafe = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
`;

/* Sección que entra con fade/slide al montarse */
export const AnimSection = styled.div`
  animation: ${fadeSlideIn} 0.18s ease-out both;
  width: 100%;
  margin-bottom: 0 !important;
  overflow: hidden;
  ${motionSafe};
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
`;

/* Lista con "stagger" para sus hijos (cada item un poquito después) */
export const StaggerList = styled.div`
  & > * {
    opacity: 1;
    transform: translate3d(0, 6px, 0);
    animation: ${fadeSlideIn} 0.22s ease-out forwards;
    ${motionSafe}
    will-change: transform, opacity;
  }
  & > *:nth-child(1) {
    animation-delay: 0s;
  }
  & > *:nth-child(2) {
    animation-delay: 0.03s;
  }
  & > *:nth-child(3) {
    animation-delay: 0.06s;
  }
  & > *:nth-child(4) {
    animation-delay: 0.09s;
  }
  & > *:nth-child(5) {
    animation-delay: 0.12s;
  }
`;

/* Item con “pop” suave (ideal para chips/botones) */
export const AnimItem = styled.div`
  animation: ${popIn} 0.14s ease-out both;
  ${motionSafe}
`;

/* Opcional: aplica pop-in a cualquier botón chip que se monte */
export const ShippingOptionAnimated = styled(ShippingOption)`
  animation: ${popIn} 0.14s ease-out both;
  ${motionSafe}
`;
