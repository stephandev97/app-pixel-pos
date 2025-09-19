import { HiClipboardList, HiOutlineClipboardList } from 'react-icons/hi';
import { HiOutlineSquares2X2, HiSquares2X2 } from 'react-icons/hi2';
import { HiCog6Tooth, HiOutlineCog6Tooth } from 'react-icons/hi2';
import { useDispatch, useSelector } from 'react-redux';

import logoPixelWhite from '../../assets/logoprintwhite.png';
import {
  toggleConfig,
  toggleEditor,
  toggleHome,
  toggleOrders,
} from '../../redux/actions/actionsSlice';
import { Bar, Divider, Item, LogoBox, Spacer } from './SidebarStyles';

export default function Sidebar() {
  const dispatch = useDispatch();
  const activeHome = useSelector((s) => s.actions.toggleHome);
  const activeOrders = useSelector((s) => s.actions.toggleOrders);
  const activeConfig = useSelector((s) => s.actions.toggleConfig);

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
      <LogoBox>
        {' '}
        <img
          src={logoPixelWhite} // 👉 poné un ícono tuyo (ej: una caja vacía o tu logo pixel)
          alt="Sin pedidos"
          style={{ width: 42, height: 'auto', marginBottom: 0, opacity: 1 }}
        />
      </LogoBox>
      <Item aria-label="Inicio" data-active={activeHome} onClick={goHome}>
        {activeHome ? <HiSquares2X2 size={22} /> : <HiOutlineSquares2X2 size={22} />}
      </Item>
      <Item aria-label="Pedidos" data-active={activeOrders} onClick={goOrders}>
        {activeOrders ? <HiClipboardList size={22} /> : <HiOutlineClipboardList size={22} />}
      </Item>
      <Divider />
      <Item aria-label="Ajustes" data-active={activeConfig} onClick={goConfig}>
        {activeConfig ? <HiCog6Tooth size={22} /> : <HiOutlineCog6Tooth size={22} />}
      </Item>
      <Spacer /> {/* empuja lo de abajo si agregás más ítems */}
    </Bar>
  );
}
