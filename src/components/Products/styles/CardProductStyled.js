import styled from "styled-components";
import Select from "react-select";

export const CardProductStyled = styled.div`
    display: flex;
    height: 70px;
    justify-content: center;
    align-items: center;
    border-radius: 15px;
    background: white;
    margin: 5px;
    cursor: pointer;
    user-select: none;
    font-weight: bold;

    &:hover {
    {/*border: 2px solid #6528F7;*/}
    background: black;
    color: white;
    }
`

export const Background = styled.div`
    position: absolute;
    width: 100vw;
    height: 100vh;
    z-index: 200;
    top:0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    transition: 0.1s all ease;
`

export const WindowProductStyled = styled.form`
    position: absolute;
    justify-content: center;
    padding: 1em;
    background: #F3F7FF;
    left: 0;
    right: 0;
    top: 0;
    margin: 2em;

    z-index: 201;
    border-radius: 1em;

`
export const Title = styled.div`
    font-size: 1.8em;
    font-weight: bold;
    text-align: left;
    margin: 0.5em 0 0.2em 0.3em;
    display: flex;
    justify-content: space-between;
`
export const BotonCompraLocal = styled.button`
    background: lightgreen;
    border: 2px solid lightgreen;
    border-radius: 15px;
    font-weight: bold;
    font-family: 'Satoshi', sans-serif;
    padding: 1em;
    cursor: pointer;

    &:hover {
        border: 2px solid black;
    }
`

export const ContainerBoton = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;

`

export const Boton = styled.button`
    background: white;
    border: 2px solid white;
    border-radius: 1em;
    font-weight: bold;
    cursor: pointer;
    height: 50px;
    margin: 0.2em;
    font-family: 'Satoshi', sans-serif;
    font-size: 0.9em;

    &:hover {
    border: 2px solid black !important;
    }
`

export const ContainerSelect = styled.div`
    display: grid;
`

export const TitleSabor = styled.label`
    width: 100%;
    text-align: left;
    margin: 0.5em 0.2em;
    font-weight: bold;
    justify-content: space-between;
    align-items: center;
    display: flex;

    & a {
        font-size: 1em;
    }
`

export const CheckEnabled = styled.input`
    color: red;
`

export const SelectStyles = styled(Select)`
    width: 100%;
    text-align: left;
    padding: 0.2em;
    font-family: 'Satoshi', sans-serif;

    &.Select--multi  {

		.Select-value {
               background: black
               }	
	}
`

export const ContentAclaracion = styled.div`
    width: 100%;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: white;
    border: 1px solid black;
    border-radius: 15px;
    margin-top: 1em;

    & div {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;

        & button {
        margin-right: 1em;
        width: 20px;
        height: 20px;
        }
    }

    & a {
        width: 100%;
        font-weight: bold;
        text-align: left;
        margin-left: 1em;
        margin-top: 1em;
        margin-bottom: 1em;
    }
`

export const InputDetalle = styled.input`
    width: 85%;
    padding: 0.6em 1em;
    border: none;
    border-radius: 10px;
    margin-bottom: 1em;
    border: 1px solid black;
    font-family: 'Satoshi', sans-serif;
    font-size: 1em;
`

export const BotonAgregar = styled.button`
    background: black;
    color: white;
    font-family: 'Satoshi', sans-serif;
    font-size: 1em;
    font-weight: bold;
    border: none;
    border-radius: 15px;
    height: 45px;
    margin: 1.2em 0 1em 0;
    cursor: pointer;
`