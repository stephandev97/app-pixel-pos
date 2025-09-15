import React from "react";
import { ButtonPaste, ButtonToggle, DivInput, Input, SignPrefix, Tab } from "../ContainerFinish/ContainerFinishStyles";
import { TabContainer } from "./TabPagoStyles";
import { useDispatch, useSelector } from "react-redux";
import { changePago, toggleEfectivo } from "../../../redux/actions/actionsSlice";
import { FaDollarSign, FaEquals } from "react-icons/fa";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

const TabPago = ({price, updatePago, isEfectivo, register, setValue, required}) => {
    const dispatch = useDispatch();
    const pagoState = useSelector((state) => state.actions.pago)

    const clickPaste = () => {
        dispatch(changePago(price))
        setValue("pago", price)
      }

    return (
        <TabContainer>
            <Tab>
                <ButtonToggle type="button" onClick={() => dispatch(toggleEfectivo(true))} style={{'background':` ${isEfectivo ? 'black' : '#F7F7FF'}`, 'color': `${isEfectivo ? '#F7F7FF' : 'black'}` }}>Efectivo</ButtonToggle>
                <ButtonToggle type="button" onClick={() => dispatch(toggleEfectivo(false))} style={{'background':` ${isEfectivo ? '#F7F7FF' : 'black'}`, 'color': `${isEfectivo ? 'black' : '#F7F7FF'}` }}>MercadoPago</ButtonToggle>
            </Tab>
            {isEfectivo?
            <DivInput>
                <SignPrefix><FaDollarSign size={18}/></SignPrefix>
                <Input value={pagoState} {...register("pago", { onChange: updatePago, required: true, min: price})}/>
                <ButtonPaste onClick={() => clickPaste()}>
                    <FaEquals/>
                </ButtonPaste>
            </DivInput>
            : null
            }      
        </TabContainer>
    )
}

export default TabPago