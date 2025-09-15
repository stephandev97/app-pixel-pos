import styled from "styled-components";

export const CardCheckoutStyled = styled.div`
     display: flex;
     justify-content: flex-start;
     text-align: left;
     background: white;
     margin: 0.5em 0.5em;
     border-radius: 15px;
     background: #F7F7FF;
     font-weight: bold;
     color: #222831;
     padding: 0.6em 0;
     height: auto;
`

export const RowCard = styled.div`
     display: flex;
     flex-direction: column;
`

export const RowCardName = styled.div`
     margin-top: 0.3em;
     margin-left: 1.2em;
     width: 45%;

`

export const PriceCard = styled.span`
     font-weight: bold;
     text-align: right !important;
     margin-top: 0.3em;
`

export const QuantityStyled = styled.div`
     display: flex;
     justify-content: space-around;
     align-items: center;
     border-radius: 15px;
     padding: 8px 0.1em;
     margin-right: 1em;
     height: 25px;
     width: 100px;
     cursor: default;
     user-select: none;
     background: white;

     & div {
          width: 20%;
          display: flex;
          text-align: center;
          justify-content: center;
     }
`

export const ButtonQuantity = styled.div`
     cursor: pointer;
     padding: 0.2em;
     border-radius: 10px;
     width: 20px;
     height: 20px;
     display: flex;
     justify-content: center;
     align-items: center;

     & :hover {
          color: lightgreen;
     }
`

export const ButtonMinus = styled(ButtonQuantity)`
     & :hover {
          color: red;
     }
`

export const ContainerSabores = styled.div`
     display: flex;
     font-size: 0.6em;
     flex-direction: column;
     font-weight: normal;
     margin-top: 0.4em;
     margi-bottom: 0.2em;
`

export const SpanDelivery = styled.span`
     margin-left: 0.8em;
     font-size: 0.8em;
     color: #52be80;
`
export const NameCard = styled.div`

`

export const Detalle = styled.div`
     font-size: 0.8em;
     margin-top: 0.4em;
     background: white;
     color: black;
     font-weight: bold;
     padding: 0.2em 0.5em;
     border: 1px solid black;
     border-radius: 10px;
`