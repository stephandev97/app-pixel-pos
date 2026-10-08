import styled, { css, keyframes } from 'styled-components';

export const NAV_H = 2; // alto navbar superior
export const CART_H = 92; // alto cart bar

export const TopNav = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${NAV_H}px;
  background: #fff;
  border-bottom: 1px solid #eef0f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.2px;
`;

export const ActionBtn = styled.button`
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: #111;
  color: #fff;
  font-size: 20px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    filter: brightness(1.05);
  }
`;

/* Tu contenedor de Home, ahora como flex container de pantalla completa */
export const ContainerHome = styled.main`
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding-top: ${NAV_H}px;
  background: #f7f8fa;
`;

// --- Animaciones ---
const barMicroNudge = keyframes`
  0%   { transform: translateY(0) scale(1); }
  25%  { transform: translateY(-3px) scale(1.006); }
  55%  { transform: translateY(1px) scale(0.998); }
  80%  { transform: translateY(-0.5px) scale(1.001); }
  100% { transform: translateY(0) scale(1); }
`;

const glow = keyframes`
  0%   { box-shadow: 0 -10px 30px rgba(15, 23, 42, 0.06), 0 0 0 0 rgba(77, 0, 18, 0.35); }
  50%  { box-shadow: 0 -12px 35px rgba(15, 23, 42, 0.1), 0 0 0 6px rgba(77, 0, 18, 0.08); }
  100% { box-shadow: 0 -10px 30px rgba(15, 23, 42, 0.06), 0 0 0 10px rgba(77, 0, 18, 0); }
`;

const countPop = keyframes`
  0%   { transform: scale(1); }
  25%  { transform: scale(1.3) rotate(-5deg); background: #6a0020; box-shadow: 0 4px 14px rgba(77, 0, 18, 0.35); }
  50%  { transform: scale(0.9) rotate(2deg); }
  75%  { transform: scale(1.1) rotate(-1deg); }
  100% { transform: scale(1) rotate(0deg); background: #4d0012; box-shadow: none; }
`;

const pricePop = keyframes`
  0%   { transform: scale(1); }
  30%  { transform: scale(1.08); color: #4d0012; }
  100% { transform: scale(1); color: inherit; }
`;

const btnPulse = keyframes`
  0%   { transform: scale(1); }
  30%  { transform: scale(1.04); background: linear-gradient(135deg, #74001c 0%, #4d0012 100%); box-shadow: 0 8px 24px rgba(77, 0, 18, 0.45); }
  100% { transform: scale(1); background: linear-gradient(135deg, #5c0016 0%, #3e000e 100%); box-shadow: 0 6px 20px rgba(77, 0, 18, 0.35); }
`;

const fillSwipe = keyframes`
  0%   { transform: scaleX(0); opacity: 1; }
  50%  { opacity: 0.9; }
  100% { transform: scaleX(1); opacity: 0; }
`;

/* Barra de carrito flotante */
export const CartBar = styled.div`
  position: fixed;
  left: 84px;
  right: 0;
  bottom: 0;
  height: ${CART_H}px;
  background: #fff;
  font-family: 'Inter', sans-serif;
  border-top: 1px solid #e7ebef;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -10px 32px rgba(15, 23, 42, 0.08);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.25s ease;
  transform: translateY(${(p) => (p.$hidden ? '100%' : '0')});
  opacity: ${(p) => (p.$hidden ? 0 : 1)};
  pointer-events: ${(p) => (p.$hidden ? 'none' : 'auto')};

  ${(p) =>
    p.$bump &&
    !p.$hidden &&
    css`
      animation:
        ${barMicroNudge} 0.5s cubic-bezier(0.25, 1, 0.5, 1),
        ${glow} 0.55s ease;
    `}

  @media (max-width: 1024px) and (min-width: 768px) {
    left: 72px;
    transform: translateY(${(p) => (p.$hidden ? '100%' : '0')});
    opacity: ${(p) => (p.$hidden ? 0 : 1)};
    will-change: transform;
  }
  @media (max-width: 767px) {
    left: 0;
    border-radius: 18px 18px 0 0;
    padding: 0 16px;
    height: 80px;
  }
`;

// barrita que “llena” cuando se agrega
export const CartFillFX = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  background: linear-gradient(90deg, #4d0012 0%, #880e2e 35%, #e11d48 70%, #fda4af 100%);
  transform-origin: left;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  animation: ${fillSwipe} 0.55s ease-out forwards;
  pointer-events: none;
`;

export const TotalBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.65rem;
  transition: transform 0.15s ease;

  @media (max-width: 600px) {
    font-size: 1.3rem;
  }

  ${(p) =>
    p.$bump &&
    css`
      animation: ${pricePop} 0.45s ease;
    `}

  span:first-child {
    color: #111;
    font-weight: 800;
  }
`;

export const CheckoutBtn = styled.button`
  border: 0;
  cursor: pointer;
  background: linear-gradient(135deg, #5c0016 0%, #3e000e 100%);
  color: #fff;
  height: 66px;
  padding: 0 46px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 1.45rem;
  letter-spacing: 0.3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 6px 22px rgba(77, 0, 18, 0.38);
  transition:
    transform 0.15s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  @media (max-width: 767px) {
    height: 56px;
    padding: 0 26px;
    font-size: 1.2rem;
  }

  ${(p) =>
    p.$bump &&
    css`
      animation: ${btnPulse} 0.45s ease;
    `}

  &:hover {
    background: linear-gradient(135deg, #74001c 0%, #4d0012 100%);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 28px rgba(77, 0, 18, 0.48);
  }
  &:active {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 3px 10px rgba(77, 0, 18, 0.25);
  }
`;

export const CartCount = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #4d0012;
  color: #fff;
  font-weight: 800;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  @media (max-width: 600px) {
    width: 36px;
    height: 36px;
    font-size: 0.95rem;
  }

  ${(p) =>
    p.$bump &&
    css`
      animation: ${countPop} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    `}
`;

export const ClearBtn = styled.button`
  border: 0;
  cursor: pointer;
  background: #fef2f2;
  color: #ef4444;
  border: 1.5px solid #fee2e2;
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: 50%;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  line-height: 1;
  transition:
    transform 0.15s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  @media (max-width: 767px) {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
  }

  &:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #dc2626;
    transform: scale(1.06);
  }
  &:active {
    transform: scale(0.95);
  }
`;
