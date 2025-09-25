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
`;
export const GlobalStyled = styled(Dialog)`
  transition: all 0.5s ease;
`;

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
  font-family: 'Satoshi', sans-serif;
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
  font-family: 'Satoshi', sans-serif;
  overflow: hidden;
`;
