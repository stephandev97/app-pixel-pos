// ContainerFinishStyles.js
import styled from 'styled-components';

import { TotalStyled } from '../../Checkout/styles/ProductsCheckoutStyles';

export const ContentForm = styled.form`
  display: flex;
  flex-direction: column;
  width: min(560px, calc(100vw - 48px));
  margin: 0 auto;
  height: 600px;
  overflow: hidden;
  box-sizing: border-box;
`;

export const ContentTabs = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0 16px;
  box-sizing: border-box;
`;

export const Tab = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 520px;
  height: 46px;
  margin: 12px 0;
  padding: 6px;
  border-radius: 14px;
  background: #eef0f6; /* más contraste */
  border: 1px solid #e3e6ee;
  box-shadow:
    inset 0 1px 0 #fff,
    0 2px 10px rgba(16, 24, 40, 0.06);
`;

export const ButtonToggle = styled.button`
  flex: 1 1 0;
  height: 34px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: #111;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.2px;
  cursor: pointer;
  padding: 0 14px;
  font-family: 'Satoshi', sans-serif;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    background 0.12s ease,
    color 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    background: #fff;
    border-color: #e6e6ee;
  }
  &:focus-visible {
    outline: 0;
    box-shadow: 0 0 0 2px #111;
    background: #fff;
  }

  /* Estado ACTIVO (via data-active="true") */
  &[data-active='true'] {
    background: #111;
    color: #fff;
    border-color: #111;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }
  &[data-active='true']:hover {
    filter: brightness(1.05);
  }
`;

export const TotalFinish = styled(TotalStyled)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 0 16px;
  box-shadow: 0 -8px 24px rgba(16, 24, 40, 0.08);
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center !important;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.9em;
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
  margin-top: 12px;
  padding: 14px 16px;
  background: #f7f7ff;
  border-radius: 14px;
  display: block !important;
  width: 450px !important;

  /* A PRUEBA DE REGLAS GLOBALES tipo ".jptxRf div" */
  &&& > div {
    width: 100% !important;
    margin: 0 !important;
    display: grid !important;
    grid-template-columns: 1fr auto !important;
    align-items: center !important;
    column-gap: 12px !important;
    min-height: 34px;
    justify-content: unset !important; /* anula space-between global */
  }
`;

export const Row = styled.div`
  width: 100%;
  display: contents; /* deja que el SummaryBox fuerce el grid a cada hijo directo */
`;

export const Label = styled.span`
  color: #6b6b7a;
  letter-spacing: 0.2px;
  display: flex;
  align-items: center;
  line-height: 1;
`;

export const Value = styled.span`
  justify-self: end; /* valor a la derecha */
  align-self: center;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
`;

export const StatusPill = styled(Pill)`
  background: ${(p) => (p.kind === 'ok' ? '#39975c' : p.kind === 'warn' ? '#f59e0b' : '#ef4444')};
  color: #fff;
`;

export const RightChips = styled.div`
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  margin-bottom: 0 !important;
  display: inline-flex;
`;

/* Inputs */
export const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 520px;
  margin: 10px auto;
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
`;

export const Input = styled.input`
  border: 0;
  font-weight: bold;
  background: #f7f7ff;
  width: 100%;
  height: 40px;
  font-size: 1.1em;
  font-family: 'Satoshi', sans-serif;
  border-radius: 12px;
  padding: 0.2em 1em 0.2em 2.5em; /* deja espacio para el icono */
  width: 100%;
  height: 46px;
  border-radius: 12px;
  font-family: 'Satoshi', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  padding: 0 0.9em 0 2.75em; /* icono a la izquierda */
  padding-right: 3em; /* espacio para el botón "=" */

  background: #f6f7ff;
  border: 1px solid #e6e6ee;
  box-shadow: inset 0 1px 0 #fff;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

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
