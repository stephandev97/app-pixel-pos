import styled from "styled-components";

export const NAV_H = 60;

export const Bar = styled.header`
  position: fixed;
  top: 0; left: 0; right: 0;
  height: ${NAV_H}px;
  background: #f8f9fa; /* gris claro */
  z-index: 1000;

  display: flex;
  align-items: center;
`;

export const Tabs = styled.nav`
  display: flex;
  width: 100%;
  height: 100%;
`;

export const TabBtn = styled.button`
  flex: 1;                        /* cada tab ocupa el mismo ancho */
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;

  &[data-active="true"] {
    background: #000;   /* pestaña activa */
    color: #fff;
  }

  &:hover:not([data-active="true"]) {
    background: #e5e7eb; /* gris hover */
  }
`;