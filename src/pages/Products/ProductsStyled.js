import styled from 'styled-components';

export const GlobalProducts = styled.div`
  width: 100%;
  min-height: 100%;
  display: block;
`;

export const ContainerCategory = styled.div`
  margin: 24px 0;
`;

export const TitleCategory = styled.div`
  width: 100%;
  margin: 0 0 12px 0;
  font-weight: 800;
  font-size: 1.2rem;
  text-align: left;
  color: #111;
`;

export const ContainerProducts = styled.div`
  padding: 0 16px 24px 16px;
  width: 100%;
  height: 95vh;
  box-sizing: border-box;
  overflow: scroll;
  overflow-x: hidden;
  padding-bottom: 100px;
  scroll-padding-bottom: 100px;
`;

export const GridProducts = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  width: 100%;
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

// --- Headers de categoría (look pro + sticky) ---
export const CategoryWrap = styled.section`
  scroll-margin-top: 8px;
`;

export const CategoryHeader = styled.header`
  position: sticky;
  top: 0; /* pega bajo el tope del contenedor scrolleable */
  z-index: 2;
  padding: 8px 2px 6px;
  background: linear-gradient(
    180deg,
    rgba(247, 248, 251, 0.95),
    rgba(247, 248, 251, 0.78) 60%,
    rgba(247, 248, 251, 0)
  );
  backdrop-filter: blur(3px);
`;

export const CategoryTitle = styled.h3`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Satoshi', sans-serif;
  font-weight: 900;
  letter-spacing: 0.2px;
  font-size: 1rem;
  color: #121316;
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
  font-family: 'Satoshi', sans-serif;
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
