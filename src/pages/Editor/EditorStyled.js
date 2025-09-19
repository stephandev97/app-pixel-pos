import styled from 'styled-components';

export const ContainerEditor = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
`;

export const Background = styled.div`
  position: absolute;
  z-index: 5;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  transition: 0.1s all ease;
`;

export const CardShowAdd = styled.div`
  width: 84%;
  background: #f7f7ff;
  padding: 0.5em 0.5;
  margin-bottom: 0.4em;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em 0.6em;
  font-weight: bold;
  cursor: pointer;
  transition: 0.1s all ease;
  border: 1px solid lightgrey;

  & * {
    margin: 0 1em;
  }

  & button {
    background: none;
    margin: 0;
    border: 0;
    padding: 0;
    cursor: pointer;
  }
`;

export const FormAddProduct = styled.form`
  position: absolute;
  top: 200px;
  background: white;
  margin-top: 1.2em;
  display: flex;
  flex-direction: column;
  border-radius: 15px;
  width: 90%;
  text-align: left;
  font-size: 1em;
  z-index: 6;

  & input {
    padding: 0.6em 1em;
    margin: 0.4em 0.5em;
    border-radius: 15px;
    border: none;
    font-size: 1em;
    font-family: 'Montserrat', sans-serif;
    background: #f7f7ff;
    font-weight: bold;
  }

  & button {
    margin: 1em 1em;
    width: 90;
    height: 60px;
    font-weight: bold;
    border-radius: 10px;
    border: none;
    font-family: 'Montserrat', sans-serif;
    transition: all 0.2s;
    background: #675ae0;
    color: white;
  }

  & button {
    cursor: pointer;
  }
`;

export const TitleForm = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #675ae0;

  & a {
    width: 80%;
    margin-left: 1em;
  }
`;

export const ButtonHide = styled.button`
  background: none !important;
  color: #675ae0 !important;
`;

export const Title = styled.div`
  font-weight: bold;
  font-size: 2.3em;
  margin-bottom: 0.2em;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 150px;
  color: #675ae0;

  & button {
    background: none;
    border: none;
    cursor: pointer;
    margin: 0 2em;
    display: flex;
    align-items: center;
    position: absolute;
    right: 0;
    top: 1.5em;
  }
`;

export const ContainerMapProducts = styled.div`
  margin-top: 2em;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: scroll;
`;

export const ContainerCard = styled.div`
  display: flex;
  background: #f7f7ff;
  width: 90%;
  padding: 1em 0;
  height: 60px;
  justify-content: space-between;
  align-items: center;
  border-radius: 15px;
  margin: 0.3em 0;

  & a {
    margin: 1em;
  }
`;

export const DivInputsCard = styled.div`
  display: flex;
  justify-content: center;

  & input {
    width: 40%;
    height: 20px;
    margin: 0 0.4em;
    padding: 0.5em;
    border-radius: 10px;
    border: none;
    font-family: 'Satoshi', sans-serif;
    background: none;
    font-weight: bold;
  }
`;

export const DivButtonsCard = styled.div`
  display: flex;
  margin-right: 0.5em;

  & button {
    padding: 0.3em;
    margin: 0 0.2em;
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    background: #90d26d;
    color:;
  }
`;
