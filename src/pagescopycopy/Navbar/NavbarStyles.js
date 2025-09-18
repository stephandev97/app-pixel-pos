import styled from "styled-components";

export const ContainerNavbar = styled.div`
    position: fixed;
    bottom: 0;
    display: flex;
    width: 100%;
    height: 11%;
    justify-content: space-evenly;
    align-items: center;
    z-index: 9;
    background: white;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    border-top-left-radius: 25px;
    border-top-right-radius: 25px;
    `

export const ButtonPage = styled.button`
    background: white;
    border: none;
    padding: 0;
    font-family: 'Satoshi', sans-serif;
    cursor: pointer;
    height: 70px;
    width: 70px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9;
    color: #C0C5CD;
`
export const TextButton = styled.a`
    font-size: 1.2em;
    margin-top: 0.4em;
`