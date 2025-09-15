import styled from "styled-components";
import { TitleProducts } from "../Products/ProductsStyled";
import Checkbox from "@mui/material/Checkbox";


export const GlobalOrders = styled.div`
    width: 100%;
    height: 85vh;
    position: absolute;
`

export const TitleOrders = styled(TitleProducts)`
    padding-left: 0.8em;
    margin-bottom: 0.5em;
    font-weight: bold;
`

export const ContainerOrders = styled.div`
    width: 100%;
    height: 90%;
    background: #F3F7FF;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
`

export const ContainerCard = styled.div`
    width: 90%;
    height: auto;
    margin-top: 0.5em;
    border-radius: 10px;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 0;
    user-select: none;
`

export const TitleCard = styled.div`
    width: 90%;
    display: flex;
    font-weight: 700;
    border-bottom: 1px solid #F7F7FF;
    padding-bottom: 0.8em;
    position: relative;
    font-size: 1.2em;
    align-items: center;
    color: black;
`
export const TitleCheck = styled.span`
    margin-left: 1em;
    font-size: 0.9em;
    color: #8DECB4;
    font-weight: bold;

`

export const ContentButtonsTitle = styled.div`
    position: absolute;
    right: 0;
    opacity: 0;
    display: flex;
    align-items: center;

    ${ContainerCard}:hover & {
        opacity: 1;
      }
`

export const ButtonTitle = styled.span`
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: white;
    border-radius: 5px;
    margin: 0 0.2em;
    background: #F11A7B;
`

export const ButtonCheck = styled(ButtonTitle)`
    background: #41B06E;
`
export const ButtonPrint = styled(ButtonTitle)`
    background: black;
`

export const ButtonCopy = styled.span`
    margin-right: 0.5em;
    padding: 0.2em 0.8em;
    border-radius: 5px;
    font-size: 0.8em;
    background: #F7F7FF;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
`

export const DirCard = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 90%;
    margin: 1em 0 0.4em 0;
    position: relative;
    font-weight: bold;
    font-size: 1.1em;

    & span {
        font-size: 1em;
        display: flex;
        align-items: center;
        margin: 0 0.5em;
        text-align: left;
    }
`

export const DivProducts = styled(DirCard)`
    justify-content: flex-start;
`

export const FooterCard = styled.div`
    border-top: 2px solid #F7F7FF;
    padding-top: 1em;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    width: 90%;
    margin-top: 0.8em;

    & div {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        margin-bottom: 0.6em;
    }
`

export const BtnFooter = styled.div`
    background: #F7F7FF;
    width: 30%;
    border-radius: 10px;
    padding: 0.3em;
    font-weight: bold;
    display: flex;
    flex-direction: column;

    & span {
        margin: 0.1em 0;
    }
`

export const Hora = styled.span`
    margin-left: 1em;
    color: lightgray;
    opacity: 0;

    ${ContainerCard}:hover & {
        opacity: 1;
      }
`

export const Direccion = styled.span`
    width: 72%;
`

export const Print = styled.div`
    left:0;
    top: 0;
    background: white;
    padding: 1.5em 1.5em 1.5em 1em;
    justify-content: center;
    align-items: center;
    width: 200px;
    font-size: 1.1em;
    font-family: 'Satoshi';
    font-display: swap;

    @media print {
    display: block;
  }
`
export const LogoPrint = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;

    & img {
    width: 50%;}
`

export const TitlePrint = styled.div`
    display: flex;
    flex-direction: column;
    text-align: left;
    font-size: 1.2em;
    margin-top: 1em;
`

export const TitlePrintProducts = styled.div`
    display: grid;
    grid-template-columns: 1fr 4fr;
    margin-top: 1.2em;
    margin-bottom: 1em;
    font-size: 1.2em;

    & a {
        display: flex;
        text-align: left;
        padding: 0.2em;
        font-weight: bold;
    }
    
` 

export const PrintProduct = styled.div`
    display: grid;
    grid-template-columns: 1fr 4fr;
    
    & a {
        display: flex;
        justify-content: start;
        font-size: 1em;
        text-align: left;
    }

    & p {
        text-align: left;
        margin: 0.1em 0;
        font-size: 0.8em;
        font-weight: bold;
    }
`
export const LineaPrint = styled.div`
    width: 100%;
    height: 8px;
    margin: 1.5em 0 0 0;
    font-weight: bold;
`

export const PrintSabores = styled.div`
    margin-top: 0.8em;
    font-size: 0.9em;
    display: flex;
    flex-direction: column;
    text-align: left;
    width: 100%;
    grid-column-start:1;
    grid-column-end: 3;

    & a {
        width: 100%;
        text-overflow: ellipsis;
    }
`

export const TotalPrint = styled.div`
    margin-top: 1.4em;
    font-size: 1.2em;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
`

export const ListProducts = styled.div`
    display: flex;
    flex-direction: column;
    text-align: left;
    margin-left: 0.8em;
`