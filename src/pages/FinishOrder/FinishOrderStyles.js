import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import styled from 'styled-components';

export const ContainerGlobal = styled.div`
  width: 100%;
  height: 100%;
  transition: all 0.5s ease;
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 100;
  font-size: clamp(14px, 2vw, 24px);
`;
export const GlobalStyled = styled(Dialog)``;

export const Background = styled.div`
  display: flex;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  transition: 0.1s all ease;
  width: 100vw;
  height: 100vh;
  z-index: 100;
`;

export const ContentDialogStyled = styled(DialogContent)`
  font-family: 'Inter', sans-serif;
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  height: 100%;
  max-height: 100vh;
  padding-bottom: 140px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding-bottom: 120px;
  }
`;

export const ContainerCheckout = styled.div`
  width: 100%;
  transition: all 0.4s;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5em 0;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 101;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
`;
