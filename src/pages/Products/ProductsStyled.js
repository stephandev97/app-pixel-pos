import styled from 'styled-components';

export const GlobalProducts = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f7f8fa;
`;

export const ProductsHeader = styled.div`
  position: relative;
  z-index: 30;
  background: #f7f8fa;
  flex-shrink: 0;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

export const ContainerCategory = styled.div`
  margin: 24px 0;
`;

export const TitleCategory = styled.div`
  width: 100%;
  margin: 0 0 12px 0;
  font-weight: 900;
  font-size: 1.2rem;
  text-align: left;
  color: #4d0012; /* Color bordo */
`;

export const ContainerProducts = styled.div`
  padding: 12px 16px 140px 16px;
  width: 100%;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  contain: paint;
  isolation: isolate;

  @media (max-width: 600px) {
    padding: 8px 8px 140px 8px;
  }
`;

export const GridProducts = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) {
    gap: 12px;
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    gap: 8px;
  }
`;

export const TitleProducts = styled.div`
  font-weight: bold;
  font-size: 2em;
  width: 90%;
  color: black;
  margin: 0.8em 0 0.2em 0;
  position: relative;
  display: flex;
  align-items: center;
`;

export const CardPlus = styled.div`
  position: absolute;
  display: flex;
  background: black;
  color: white;
  right: 0;
  font-weight: bold;
  transition: all 0.2s;
  border-radius: 10px;
  padding: 0.2em;
  cursor: pointer;

  &:hover {
  }
`;

// --- Headers de categoría ---
export const CategoryWrap = styled.section`
  scroll-margin-top: 8px;
  margin-bottom: 20px;
`;

export const CategoryHeader = styled.header`
  padding: 6px 0 8px;
  background: transparent;
`;

export const CategoryTitle = styled.h3`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  letter-spacing: 0.2px;
  font-size: 1.15rem;
  color: #4d0012; /* Color bordo */
`;

export const CategoryIcon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #111;
  color: #fff;
  font-size: 12px;
  line-height: 1;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.16);
`;

export const CategoryPill = styled.span`
  margin-left: auto;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0b0b0c;
  background: #eef2ff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 4px 10px;
  border-radius: 999px;
`;

export const CategoryUnderline = styled.div`
  height: 3px;
  border-radius: 3px;
  margin-top: 6px;
  background: linear-gradient(
    90deg,
    rgba(17, 17, 17, 0.08) 36%,
    rgba(17, 17, 17, 0.08) 36%,
    rgba(17, 17, 17, 0.08) 36%,
    rgba(17, 17, 17, 0.03) 100%
  );
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 14px 10px 14px;
  background: transparent;
`;

export const ChromeTab = styled.button`
  all: unset;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 20px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: ${(p) => (p.$active ? '#4d0012' : '#64748b')};
  background: ${(p) => (p.$active ? '#ffffff' : '#e2e8f0')};
  border: 1.5px solid ${(p) => (p.$active ? '#4d0012' : 'transparent')};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: ${(p) => (p.$active ? '0 2px 8px rgba(77, 0, 18, 0.12)' : 'none')};
  text-align: center;
  user-select: none;

  &:hover {
    background: ${(p) => (p.$active ? '#ffffff' : '#cbd5e1')};
    color: ${(p) => (p.$active ? '#4d0012' : '#1e293b')};
  }

  &:active {
    transform: scale(0.98);
  }
`;
