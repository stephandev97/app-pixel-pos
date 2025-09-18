import styled from 'styled-components'
import { CardProductStyled } from '../../components/Products/styles/CardProductStyled'

export const GlobalProducts = styled.div`
    width: 100%;
    height: 95%;
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    transition: all 0.2s;
`

export const ContainerCategory = styled.div`
    margin-bottom: 1em;

`

export const TitleCategory = styled.div`
    width: 100vw;
    font-weight: bold;
    font-size: 1.2em;
    text-align: left;
    padding-left: 3em;
`

export const ContainerProducts = styled.div`
    margin: 0 1em;
    margin-top: 0.8em;
    display: inline-grid;
    align-items: center;
    justify-content: center;
    width: 500px;
    background: #F3F7FF;
    overflow: scroll;
    margin-bottom: 5em;
    overflow-x: hidden;
`

export const GridProducts = styled.div`
    margin: 0 1em;
    margin-top: 0.8em;
    display: inline-grid;
    grid-template-columns: repeat(3, 32%);
    {/*grid-template-rows: repeat(5, 17%);*/}
    align-items: center;
    justify-content: center;
    width: 90%;
    height: 85%;
    background: #F3F7FF;
`

export const TitleProducts = styled.div`
    font-weight: bold;
    font-size: 2em;
    text-align: left;
    width: 90%;
    color: black;
    margin: 0.8em 0 0.2em 0;
    position: relative;
    display: flex;
    align-items: center;
`

export const CardPlus = styled.div`
    position: absolute;
    display: flex;
    right: 0;
    background: #F3F7FF;
    font-weight: bold;
    transition: all 0.2s;
    border-radius: 10px;
    padding: 0.2em;
    cursor: pointer;

    &:hover {
        background: black;
        color: #F3F7FF;
    }
`