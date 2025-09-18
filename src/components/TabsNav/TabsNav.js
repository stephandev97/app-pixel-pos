import { useDispatch, useSelector } from "react-redux";
import { Bar, Tabs, TabBtn } from "./TabsNavStyles";
import { toggleHome, toggleOrders } from "../../redux/actions/actionsSlice";

export default function TabsNav() {
  const dispatch = useDispatch();
  const activeHome   = useSelector(s => s.actions.toggleHome);
  const activeOrders = useSelector(s => s.actions.toggleOrders);

  const goHome = () => {
    dispatch(toggleHome(true));
    dispatch(toggleOrders(false));
  };
  const goOrders = () => {
    dispatch(toggleHome(false));
    dispatch(toggleOrders(true));
  };

  return (
    <Bar>
      <Tabs>
        <TabBtn onClick={goHome} data-active={activeHome}>Home</TabBtn>
        <TabBtn onClick={goOrders} data-active={activeOrders}>Pedidos</TabBtn>
      </Tabs>
    </Bar>
  );
}