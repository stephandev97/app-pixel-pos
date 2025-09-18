import { useDispatch, useSelector } from "react-redux";
import { Bar, Item, Divider, LogoBox, Spacer } from "./SidebarStyles";
import {
  toggleHome, toggleOrders, toggleConfig, toggleEditor
} from "../../redux/actions/actionsSlice";

import { HiSquares2X2, HiOutlineSquares2X2 } from "react-icons/hi2";
import { HiClipboardList, HiOutlineClipboardList } from "react-icons/hi";
import { HiOutlineCog6Tooth, HiCog6Tooth } from "react-icons/hi2";

export default function Sidebar() {
  const dispatch = useDispatch();
  const activeHome   = useSelector(s => s.actions.toggleHome);
  const activeOrders = useSelector(s => s.actions.toggleOrders);
  const activeConfig = useSelector(s => s.actions.toggleConfig);

  const goHome = () => {
    dispatch(toggleHome(true));
    dispatch(toggleOrders(false));
    dispatch(toggleConfig(false));
    dispatch(toggleEditor(true));
  };
  const goOrders = () => {
    dispatch(toggleHome(false));
    dispatch(toggleOrders(true));
    dispatch(toggleConfig(false));
    dispatch(toggleEditor(true));
  };
  const goConfig = () => {
    dispatch(toggleHome(false));
    dispatch(toggleOrders(false));
    dispatch(toggleConfig(true));
    dispatch(toggleEditor(true));
  };

  return (
    <Bar>
      <LogoBox>🍦</LogoBox>

      <Item aria-label="Inicio" data-active={activeHome} onClick={goHome}>
        {activeHome ? <HiSquares2X2 size={22}/> : <HiOutlineSquares2X2 size={22}/>}
      </Item>

      <Item aria-label="Pedidos" data-active={activeOrders} onClick={goOrders}>
        {activeOrders ? <HiClipboardList size={22}/> : <HiOutlineClipboardList size={22}/>}
      </Item>

      <Divider />

      <Item aria-label="Ajustes" data-active={activeConfig} onClick={goConfig}>
        {activeConfig ? <HiCog6Tooth size={22}/> : <HiOutlineCog6Tooth size={22}/>}
      </Item>

      <Spacer /> {/* empuja lo de abajo si agregás más ítems */}
    </Bar>
  );
}