import styled from 'styled-components';

export const Container = styled.div`
  position: absolute;
  z-index: 100;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: 'Satoshi', sans-serif;
  background: #04a485;

  & div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 5em;
  }

  & a {
    font-size: 1.8em;
    font-weight: bold;
  }
`;

export const IconCircle = styled.div`
  font-size: 10em;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin-bottom: 0.2em;
`;

export const ButtonFinished = styled.button`
  width: 400px;
  height: 60px;
  border-radius: 15px;
  font-size: 1.2em;
  font-weight: bold;
  border: 0;
  background: white;
  color: #04a485;
  cursor: pointer;
  font-family: 'Satoshi', sans-serif;
  margin-top: 2em;

  &:hover {
  }
`;
