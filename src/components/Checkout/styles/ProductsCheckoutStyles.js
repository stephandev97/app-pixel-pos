import styled from "styled-components";

export const ProductsContainer = styled.div`
    display: flex;
    height: 100vh;
    flex-direction: column;
    font-size: 1.2em;
    justify-content: space-between;
}
`

export const TitleCheckout = styled.div`
    margin: 0.5em 0.5em;
    text-align: center;
    font-size: 1.8em;
    font-weight: 700;
    justify-content: center;
    align-items: center;
    height: 120px;
    display: flex;
    position: relative;
    color: black;

    & span {
        position: absolute;
        width: 100%;
    }
`

export const ButtonTitle = styled.button`
    left: 0;
    background: none;
    border: none;
    font-size: 0.7em;
    cursor: pointer;
    position: absolute;
    display: flex;
    align-items: center;
    z-index: 1;
    color: black;
`

export const HeaderCards = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    font-size: 1em;

    & div {
        width: 25%;
        text-align: center;
        margin: 0.5em;
    }
`

export const RowHeaderItems = styled.div`
    width: 65% !important;
    text-align: left !important;
`

export const ContainerCards = styled.div`
    overflow-y: auto;
    height: 80%;
    scrollbar-width: thin;
    scrollbar-color: #6969dd #e0e0e0;
`

export const TotalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    margin: 0 1em 1em 1em;
    padding: 1em;
    border-radius: 10px;
    font-weight: bold;
    background: white;

    & div {
        width: 90%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1em;

    }
`

export const ButtonNext = styled.button`
    width: 100%;
    height: 2.5em;
    border: 1px solid black;
    border-radius: 10px;
    border: 0;
    cursor: pointer;
    font-size: 1.1em;
    font-family: 'Satoshi', sans-serif;
    transition: all 0.2s;
    background: black;
    color: white;
    font-weight: bold;

    &:hover {
        transform: scale(1.02)
    }
`