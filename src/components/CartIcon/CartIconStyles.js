import styled from 'styled-components';

export const ButtonNavCart = styled.a`
  position: absolute;
  bottom: 3em;
  background: black;
  color: white;
  border-radius: 15px;
  margin: 0.8em;
  width: 90%;
  height: 60px;
  font-size: 1.1em;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  & span {
    display: flex;
    margin: 0 2em;
  }

  & .item-count {
    color: #4d0012; /* Color bordo para el número de items */
  }

  & div {
    display: flex;
  }
`;
