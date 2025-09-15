import { Background, ContainerCheckout, ContentDialogStyled, GlobalStyled } from "./FinishOrderStyles";
import { useDispatch, useSelector } from "react-redux";
import ContainerFinish from "../../components/FinishOrder/ContainerFinish/ContainerFinish";
import { toggleHiddenFinish } from "../../redux/actions/actionsSlice";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { forwardRef } from "react";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FinishOrder = () => {
    const dispatch = useDispatch();
    const { cartItems} = useSelector((state) => state.cart);
    const show = useSelector((state) => state.actions.hiddenFinish);
    
    const price = cartItems.reduce((acc, item) => {
        return (acc += item.price * item.quantity);
      }, 0);

      return (
        <GlobalStyled
          slots={{transition: Transition}}
          open={!show} 
          onClose={() => dispatch(toggleHiddenFinish(true))}
          PaperProps={{ sx:{position: "fixed", bottom: -35, borderTopLeftRadius: "30px", borderTopRightRadius: "30px", width: "100%", height: "auto"}}}
          >
          <ContentDialogStyled>
              <ContainerFinish cartItems={cartItems} price={price}/>
          </ContentDialogStyled>
        </GlobalStyled>
        )
}

const FinishOrder2 = () => {
    const dispatch = useDispatch();
    const { cartItems} = useSelector((state) => state.cart);
    const show = useSelector((state) => state.actions.hiddenFinish);
    
    const price = cartItems.reduce((acc, item) => {
        return (acc += item.price * item.quantity);
      }, 0);

      return (
        <>
        {show ? 
        <>
          <Background style={{display: "none"}}/>
          <ContainerCheckout style={{bottom: "-500px", display:"none"}}>
            <ContainerFinish cartItems={cartItems} price={price}/>
          </ContainerCheckout>
        </>
        :
        <>
          <Background onClick={() => dispatch(toggleHiddenFinish())}/>
          <ContainerCheckout>
          <ContainerFinish cartItems={cartItems} price={price}/>
          </ContainerCheckout>
        </>
        }
        </>
        )
}
  

export default FinishOrder