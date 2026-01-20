import styled from 'styled-components';

/* altura del navbar */
const NAV_H = 64;

export const ContainerNavbar = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(${NAV_H}px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  z-index: 200;

  /* opcional: si tu contenido principal queda tapado, agregá un spacer
     al final de tus páginas con height: NAV_H */
`;

export const ButtonPage = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  height: ${NAV_H}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: #6b7280; /* gris */
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: #f8f9fa;
    color: #111;
  }

  /* estado activo */
  &[data-active='true'] {
    color: #111;
    font-weight: 700;
  }

  /* accesibilidad: focus ring */
  &:focus-visible {
    outline: 2px solid #6528f7;
    outline-offset: -2px;
    border-radius: 12px;
  }
`;

export const TextButton = styled.span`
  font-size: 12px;
  line-height: 1;
`;
