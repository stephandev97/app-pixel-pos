import { CheckCircle } from "react-feather"
import { ButtonFinished, Container, IconCircle } from "./OrderFinishedStyles"
import { useDispatch, useSelector } from "react-redux"
import { toggleFinishOrder, toggleHiddenCart } from "../../redux/actions/actionsSlice"
import Dialog from "@mui/material/Dialog"
import Button from "@mui/material/Button"
import Slide from "@mui/material/Slide"
import { forwardRef } from "react"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Zoom from '@mui/material/Zoom';
import { makeStyles } from "@mui/material/styles"

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const OrderFinished = () => {
    const dispatch = useDispatch();
    const showFinished = useSelector(state => state.actions.finishOrder)

    const handleClose = () => {
        dispatch(toggleFinishOrder(false))
    }

    return (
        <>
            <Dialog slots={{transition: Transition}} fullScreen open={showFinished} onClose={handleClose}>
                <Container>
                    <div>
                        <Zoom in={showFinished} style={{ transitionDelay: showFinished ? '200ms' : '0ms' }}>
                            <CheckCircleIcon sx={{fontSize: 120, color: "white", marginBottom: "0.2em"}}/>
                        </Zoom>
                        <a>Pedido creado con éxito</a>
                        <ButtonFinished onClick={handleClose}>Volver al inicio</ButtonFinished>
                    </div>
                </Container>
            </Dialog>
        </>
    )
}

const OrderFinished2 = () => {
    const dispatch = useDispatch()

    return (
        <>
            <Container>
            <div>
                <IconCircle>
                    <CheckCircle size={100}/>
                </IconCircle>
                <a>Pedido creado con exito</a>
            </div>
            <button onClick={() => dispatch(toggleFinishOrder(false))}>Volver al inicio</button>
            </Container>
        </>
    )
}

export default OrderFinished