import styled from "styled-components";

export const SIDEBAR_W = 64;      // ancho del rail

export const Bar = styled.aside`
  position: fixed;
  top: 0; bottom: 0; left: 0;
  width: ${SIDEBAR_W}px;
  background: #141414ff;
  display: flex; flex-direction: column;
  align-items: center;
  padding: 10px 0;
  z-index: 1200;
  flex: 0 0 64px;
`;

export const LogoBox = styled.div`
  width: 36px; height: 36px;
  border-radius: 12px;
  color: #fff; font-weight: 800; font-size: 18px;
  display: grid; place-items: center;
  margin: 6px 0 10px 0;
`;

export const Item = styled.button`
  width: 40px; height: 40px;
  border: 0; background: transparent; cursor: pointer;
  border-radius: 12px;
  color: #A1A8B3;
  display: grid; place-items: center;
  margin: 6px 0;
  transition: background .15s ease, color .15s ease, transform .08s ease;

  &:hover { background: #F2F5F8; color: #111; }
  &:active { transform: translateY(1px); }

  &[data-active="true"]{
    background: #f6faffff;
    color: #141414ff;
    box-shadow: inset 0 0 0 1px #D6E4FF;
  }
`;

export const Divider = styled.div`
  width: 28px; height: 1px; background: #E6E9EE;
  margin: 8px 0;
`;

export const Spacer = styled.div`
  flex: 1;
`;