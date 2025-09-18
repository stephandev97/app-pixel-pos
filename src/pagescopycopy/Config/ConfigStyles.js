import styled from "styled-components"

export const Container = styled.div `
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
`

export const TitlePage = styled.div `
    font-size: 2em;
    font-weight: bold;
    text-align: left;
    width: 90%;
    margin: 0.8em 0 0 0;
`

export const ContainerPages = styled.div`
    margin-top: 1em;
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
`

export const ButtonPage = styled.button`
    font-weight: bold;
    background: white;
    font-family: 'Satoshi', sans-serif;
    border: 0;
    border-bottom: 1px solid lightgray;
    font-size: 1.2em;
    cursor: pointer;
    height: 50px;
    width: 90%;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    cursor: pointer;

    & * {
        margin: 0 0.2em;
    }

    & span {
        position: absolute;
        right: 2em;
        display: flex;
        align-items: center;
    }
`

export const IconButton = styled.div`
    border-radius: 10px;
    width: 40px; 
    height: 40px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: black;
`

export const Background = styled.div`
    position: absolute;
    background-color: rgba(0, 0, 0, 0.5);
    transition: 0.1s all ease;
    width: 100vw;
    height: 100vh;
    z-index: 100;

`

export const MsjNav = styled.div`
    width: 320px;
    height: 100px;
    top: 40%;
    background: black;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1em;
    border-radius: 20px;
    position: absolute;
    transition: all 0.4s ease;
    z-index: 101;
    font-weight: bold;

    & span {
        font-size: 1.4em;
    }

    & div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
`

export const MsjButton = styled.button`
    width: 150px;
    height: 40px;
    border-radius: 5px;
    border: 0;
    margin: 0.2em;
    cursor: pointer;
    color: #D20062;
`
export const InputFile = styled.input`
    font-family: 'Satoshi', sans-serif;

    &::file-selector-button {
        border: 1px solid lightgray;
        font-family: 'Satoshi', sans-serif;
        padding: 0.8em 0.6em;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 200ms;
        background: white;
    }
    &::file-selector-button:hover{
        background: #f3f4f6
    }
    &::file-selector-button:active {
        background-color: #e5e7eb;
}
`

export const ButtonUpload = styled.button`
    border-radius: 10px;
    width: 40px;
    height: 40px;
    border: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #04a485;
    color: white;
    cursor: pointer;
`

export const ContentUploadFile = styled.div`
    display: flex;
    flex-direction: column;
    font-family: 'Satoshi', sans-serif;
    margin-bottom: 1em;
`

export const TitleUpload = styled.div`
    font-weight: bold;
    font-size: 1.5em;
    margin-bottom: 0.5em;
`

export const ContentInput = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 0;
    background: white;
    padding: 0.5em;
    border-radius: 10px;
`

export const Separador = styled.div`
    width: 100%;
    height: 3px;
    background: black;
    margin: 0.5em 0;
`