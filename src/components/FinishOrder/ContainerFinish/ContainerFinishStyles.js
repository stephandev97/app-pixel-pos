import styled from "styled-components";
import { Formik as FormikContainer, Form as FormikForm } from 'formik';
import { TotalStyled } from "../../Checkout/styles/ProductsCheckoutStyles";

export const Container = styled.div`
    width: 100%;
    height: 100%;

`

export const ContentForm = styled.form`
    width: 100%;
    height: 440px;
    display: flex;
    flex-direction: column;
    align-items: center;
`

export const ContentTabs = styled.div`
    height: 80%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`

export const Tab = styled.div`
    background: #F7F7FF;
    border-radius: 10px;
    display: flex;
    width: 380px;
    height: 42px;
    justify-content: space-around;
    align-items: center;
    margin: 1.0em 0;
`

export const ButtonToggle = styled.button`
    color: black;
    font-weight: bold;
    font-size: 0.9em;
    border: none;
    width: 46%;
    height: 80%;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.4s all ease;
    font-family: 'Satoshi', sans-serif;

`

export const Input = styled.input`
    border: 0;
    font-weight: bold;
    background: #F7F7FF;
    width: 88%;
    height: 100%;
    font-size: 1.1em;
    font-family: 'Satoshi', sans-serif;
    position: absolute;
    border-radius: 15px;
    padding: 0.2em 3em;

    &::-webkit-input-placeholder {
        color: lightgrey;
        font-weight: bold;
    }
    &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        -moz-appearance: textfield;
        margin: 0;
`

export const Submit = styled.button`
    background: black;
    color: white;
    width: 300px;
    border: none;
`

export const Formik = styled(FormikContainer)`
    display: flex;
    align-items: center;
    flex-direction: column;
    height: 100%;
    width: 100%;
`

export const Form = styled(FormikForm)`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100vw;
`
export const DivInput = styled.div`
    position: relative;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 1em;
    border-radius: 20px;
    width: 320px;
    height: 40px;
`

export const ButtonPaste = styled.div`
    font-weight: bold;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    right: -1.5em;
    width: 30px;
    height: 30px;
    display: flex;
    border-radius: 10px;
    cursor: pointer;
    color: black;

    &:hover {
        color: lightgreen;
    }
`

export const TotalFinish = styled(TotalStyled)`
    width: 80%;
    position: absolute;
    bottom: 0;
    background: white;
    padding-top: 1em;
`

export const SignPrefix = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    z-index: 1;
    left: -1.2em;
    color: lightgrey;
`