import styled, { keyframes } from 'styled-components';

const pulseAnimation = keyframes`
  0% { background-color: #ffffff; }
  50% { background-color: #fce4ec; }
  100% { background-color: #ffffff; }
`;

const pulseActivation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const ProductsContainer = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  font-size: 1.2em;
  justify-content: space-between;
  overflow-y: auto;
  padding-bottom: 140px;
  background: linear-gradient(180deg, #f4f4f4 0%, #ffffff 100%);
`;

export const TitleCheckout = styled.div`
  margin: 0.5em 0.5em;
  text-align: center;
  font-size: 1.8em;
  font-weight: 700;
  justify-content: center;
  align-items: center;
  height: 120px;
  display: flex;
  position: relative;
  color: #4d0012; /* Color bordo */

  & span {
    position: absolute;
    width: 100%;
  }
`;

export const ButtonTitle = styled.button`
  left: 0;
  background: none;
  border: none;
  font-size: 0.7em;
  cursor: pointer;
  position: absolute;
  display: flex;
  align-items: center;
  z-index: 1;
  color: black;
`;

export const HeaderCards = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 1em;

  & div {
    width: 25%;
    text-align: center;
    margin: 0.5em;
  }
`;

export const RowHeaderItems = styled.div`
  width: 65% !important;
  text-align: left !important;
`;

export const ContainerCards = styled.div`
  overflow-y: auto;
  height: 80%;
  scrollbar-width: thin;
  scrollbar-color: #6969dd #e0e0e0;
`;

export const TotalStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1em;
  padding: 1em;
  border-radius: 14px;
  font-weight: 700;
  background: #fff;
  box-shadow: 0 -4px 16px rgba(16, 24, 40, 0.08);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;

  & div {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1em;
    font-size: 1.01rem;
    color: #111;
  }
`;

export const ButtonNext = styled.button`
  width: 100%;
  max-width: 580px;
  height: 3em;
  border: 2px solid #4d0012;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.4em;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  background: #ffffff;
  color: #4d0012;
  font-weight: bold;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #4d0012;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 0;
  }

  &:hover::before {
    transform: translateX(0);
  }

  &:not(:disabled):not(:hover) {
    animation: pulseAnimation 1.5s ease-in-out infinite;
  }

  &:hover {
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(77, 0, 18, 0.3);
    animation: none;
  }

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    border-color: #e5e7eb;
    transform: none;
    cursor: not-allowed;
    box-shadow: none;
    &::before {
      display: none;
    }
  }

  & span,
  &:hover span {
    position: relative;
    z-index: 1;
  }
`;

export const CheckoutToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 1em 0.6em;
  margin-top: -10px;
`;

export const HeldPillBtn = styled.button`
  background: #fff0f3;
  color: #4d0012;
  border: 1.5px solid rgba(77, 0, 18, 0.2);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
  font-family: 'Inter', sans-serif;

  &:hover {
    background: #4d0012;
    color: #ffffff;
    border-color: #4d0012;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(77, 0, 18, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const HoldActionBtn = styled.button`
  background: #ffffff;
  color: #475569;
  border: 1.5px solid #e2e8f0;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  transition: all 0.15s ease;
  font-family: 'Inter', sans-serif;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const EmptyStateCart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
  color: #64748b;

  .empty-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #334155;
    margin-top: 12px;
    margin-bottom: 4px;
  }

  .empty-subtitle {
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 16px;
  }
`;
