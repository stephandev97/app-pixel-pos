import styled, { css, keyframes } from 'styled-components';

export const NAV_H = 2; // alto navbar superior
export const CART_H = 2; // alto cart bar

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

/* Tu contenedor de Home, ahora con padding arriba/abajo para no tapar nada */
export const ContainerHome = styled.main`
  min-height: 100vh;
  box-sizing: border-box;
  padding: calc(${NAV_H}px + 0px) 0px
    ${({ $hasCart }) =>
      $hasCart ? `calc(${CART_H}px + 0px + env(safe-area-inset-bottom))` : `0px`}
    0px;
  background: #f7f8fa;
`;

// --- Animaciones ---
const bump = keyframes`
  0%{ transform: scale(1) }
  20%{ transform: scale(1.12) }
  60%{ transform: scale(1.06) }
  100%{ transform: scale(1) }
`;

const glow = keyframes`
  0%{ box-shadow: 0 0 0 0 rgba(29,78,216,.35) }
  100%{ box-shadow: 0 0 0 14px rgba(29,78,216,0) }
`;

const fillSwipe = keyframes`
  0%  { transform: scaleX(0); opacity: .9 }
  100%{ transform: scaleX(1); opacity: 0 }
`;

/* Barra de carrito flotante */
export const CartBar = styled.div`
  position: fixed;
  left: 56px;
  right: 0;
  bottom: 0;
  height: 72px;
  background: #fff;
  border-top: 1px solid #e7ebef;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  box-shadow: 0 -10px 30px rgba(15, 23, 42, 0.06);
  z-index: 98; /* bien arriba */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
  transform: translateY(${(p) => (p.$hidden ? '100%' : '0')});
  opacity: ${(p) => (p.$hidden ? 0 : 1)};
  /* Halo suave cuando “bump” está activo */
  ${(p) =>
    p.$bump &&
    css`
      animation: ${glow} 0.6s ease;
    `}
`;

// barrita que “llena” cuando se agrega
export const CartFillFX = styled.div`
  position: absolute;
  left: 56px;
  right: 0;
  bottom: 0;
  height: 4px;
  background: linear-gradient(90deg, #1d4ed8, #60a5fa, #93c5fd);
  transform-origin: left;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  animation: ${fillSwipe} 0.6s ease forwards;
  pointer-events: none;
`;

export const TotalBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.4rem;

  span:first-child {
    color: #6b7280; /* gris medio */
    font-weight: 500; /* menos grueso */
  }

  span:last-child {
    color: #111; /* negro fuerte */
    font-weight: 800; /* más destacado */
  }
`;

export const CheckoutBtn = styled.button`
  border: 0;
  cursor: pointer;
  background: black;
  color: #fff;
  height: 50px;
  padding: 0 30px;
  border-radius: 999px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Satoshi', sans-serif;

  &:hover {
    filter: brightness(1.05);
  }
  &:active {
    transform: translateY(1px);
  }
`;

export const CartCount = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1d4ed8; /* mismo color que el botón, podés cambiar */
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  ${(p) =>
    p.$bump &&
    css`
      animation: ${bump} 0.5s ease;
    `}
`;

export const ClearBtn = styled.button`
  border: 0;
  cursor: pointer;
  background: #ef4444; /* rojo */
  color: #fff;
  height: 50px;
  padding: 0 20px;
  border-radius: 999px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Satoshi', sans-serif;
  font-size: 1rem;
  gap: 6px;

  &:hover {
    filter: brightness(1.1);
  }
  &:active {
    transform: translateY(1px);
  }
`;
