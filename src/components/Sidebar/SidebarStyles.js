import styled from 'styled-components';

export const SIDEBAR_W = 60; // ancho del rail

export const Bar = styled.aside`
  position: fixed;
  top: ${(p) => (p.$isElectron ? '35px' : p.$isTestMode ? '28px' : '0')};
  bottom: 0;
  left: 0;
  width: ${SIDEBAR_W}px;
  background: #4d0012; /* Color bordo muy oscuro */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  z-index: 100005;
  flex: 0 0 60px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    width: 48px;
    flex: 0 0 48px;
    padding: 6px 0;
  }
`;

export const LogoBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  display: grid;
  place-items: center;
  margin: 6px 0 10px 0;

  @media (max-width: 640px) {
    width: 38px;
    height: 38px;
    margin: 4px 0 6px 0;
    img {
      max-width: 28px;
      max-height: 28px;
    }
  }
`;

export const Item = styled.button`
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  cursor: pointer;
  border-radius: 12px;
  color: #fff; /* Iconos blancos por defecto */
  display: grid;
  place-items: center;
  margin: 6px 0;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.08s ease;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    margin: 3px 0;
    border-radius: 10px;

    svg {
      width: 19px !important;
      height: 19px !important;
    }
  }

  &:hover {
    background: #f2f5f8;
    color: #333; /* Gris oscuro para mejor contraste con fondo bordo */
  }
  &:active {
    transform: translateY(1px);
  }

  &[data-active='true'] {
    background: #f6faffff;
    color: #4d0012; /* Color bordo cuando está seleccionado */
    box-shadow: inset 0 0 0 1px #d6e4ff;
  }
`;

export const Divider = styled.div`
  width: 28px;
  height: 1px;
  background: #e6e9ee;
  margin: 8px 0;
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const HeldCartsItem = styled(Item)`
  position: relative;
  margin-top: auto;
  margin-bottom: 6px;
  background: ${(p) => (p.$hasHeld ? 'rgba(255, 255, 255, 0.15)' : 'transparent')};

  &:hover {
    background: #f2f5f8;
    color: #333;
  }
`;

export const HeldBadge = styled.span`
  position: absolute;
  top: -3px;
  right: -3px;
  background: #ff4757;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  border: 2px solid #4d0012;
  pointer-events: none;
  line-height: 1;
`;

