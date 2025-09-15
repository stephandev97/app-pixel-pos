import { ButtonPaste, ButtonToggle, DivInput, Input, SignPrefix, Tab } from "../ContainerFinish/ContainerFinishStyles";
import { useDispatch, useSelector } from "react-redux";
import { toggleAddress } from "../../../redux/actions/actionsSlice";
import { TabContainer } from "../TabPago/TabPagoStyles";
import { FaRegPaste } from "react-icons/fa6";
import { FiMapPin } from "react-icons/fi";

const TabDireccion = ({register, setValue}) => {
    const dispatch = useDispatch()

    const clickPaste = () => {
    navigator.clipboard
        .readText()
        .then((text) => {
        setValue("direccion", text)
        })
    } 
    const isRetiro = useSelector((state) => state.actions.toggleAddress)

    const changeDelivery = () => {
        dispatch(toggleAddress(false))
        setValue("direccion", "")
    }
    const changeRetiro = () => {
        dispatch(toggleAddress(true))
        setValue("direccion", "Retiro")
    }

    return (
        <TabContainer>
            <div>
                <Tab>
                    <ButtonToggle type="button" onClick={() => changeRetiro()} style={{'background':` ${isRetiro ? 'black' : '#F7F7FF'}`, 'color': `${isRetiro ? '#F7F7FF' : 'black'}` }}>Retiro</ButtonToggle>
                    <ButtonToggle type="button" onClick={() => changeDelivery()} style={{'background':`${isRetiro ? '#F7F7FF' : 'black'}`, 'color': `${isRetiro ? 'black' : '#F7F7FF'}` }}>Delivery</ButtonToggle>
                </Tab>
            </div>
            {isRetiro ? 
                <DivInput>
                    <SignPrefix>
                        <FiMapPin/>
                    </SignPrefix>
                    <Input
                    {...register("direccion", { required: true })}
                    type='text'
                    value="Retiro"
                    />
                </DivInput>
                    :
                <DivInput>
                    <SignPrefix>
                        <FiMapPin/>
                    </SignPrefix>
                    <Input
                    {...register("direccion", { required: true })}
                    type='text'
                    placeholder='Escribí la dirección...'
                    />
                    <ButtonPaste onClick={() => clickPaste()}>
                        <FaRegPaste/>
                    </ButtonPaste>
                </DivInput>
                }
        </TabContainer>
    )
}

export default TabDireccion