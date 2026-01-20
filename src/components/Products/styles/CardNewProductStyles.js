import styled from 'styled-components';

export const Background = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  transition: 0.1s all ease;
  z-index: 99;
`;

export const ContainerCard = styled.form`
  position: absolute;
  top: 35%;
  z-index: 100;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  padding: 2em;
  background: white;
  border-radius: 5px;
`;

export const DivInput = styled.div`
  position: relative;
  background: #f7f7ff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  margin-bottom: 0.5em;
`;

export const PreFix = styled.span`
  position: absolute;
  left: 0.5em;
  color: lightgrey;
  display: flex;
`;

export const Input = styled.input`
  border: 0;
  width: 100%;
  height: 100%;
  background: none;
  font-weight: bold;
  border-radius: 5px;
  font-size: 1.1em;
  font-family: 'Satoshi', sans-serif;
  padding: 0.5em 2em;

  &::-webkit-input-placeholder {
    color: lightgrey;
    font-weight: normal;
  }
`;

export const Button = styled.button`
  background: black;
  border-radius: 5px;
  margin-top: 1.2em;
  height: 42px;
  border: 0;
  font-family: 'Satoshi', sans-serif;
  font-weight: bold;
  color: white;
  font-size: 1em;
  cursor: pointer;
`;
