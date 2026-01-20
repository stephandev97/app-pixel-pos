// Sidebar.js
import { HiClipboardList, HiOutlineClipboardList } from 'react-icons/hi';
import { HiOutlineSquares2X2, HiSquares2X2 } from 'react-icons/hi2';
import { HiCog6Tooth, HiOutlineCog6Tooth } from 'react-icons/hi2';
import { QrCode, IceCream, Tv } from 'lucide-react'; // ✅ nuevo
import { useDispatch, useSelector } from 'react-redux';

import logoPixelWhite from '../../assets/logoprintwhite.png';
import {
  toggleConfig,
  toggleEditor,
  toggleHome,
  toggleOrders,
  toggleRewards,
  toggleTvSabores, // ✅ nuevo
} from '../../redux/actions/actionsSlice';
import { Bar, Divider, Item, LogoBox, Spacer } from './SidebarStyles';

export default function Sidebar() {
  const dispatch = useDispatch();

  const activeHome = useSelector((s) => s.actions.toggleHome);
  const activeOrders = useSelector((s) => s.actions.toggleOrders);
  const activeConfig = useSelector((s) => s.actions.toggleConfig);
  const activeRewards = useSelector((s) => s.actions.toggleRewards);
  const activeTvSabores = useSelector((s) => s.actions.toggleTvSabores); // ✅ nuevo

  const resetViews = () => {
    dispatch(toggleHome(false));
    dispatch(toggleOrders(false));
    dispatch(toggleConfig(false));
    dispatch(toggleRewards(false));
    dispatch(toggleTvSabores(false));
  };

  const goHome = () => {
    resetViews();
    dispatch(toggleHome(true));
    dispatch(toggleEditor(true));
  };

  const goOrders = () => {
    resetViews();
    dispatch(toggleOrders(true));
    dispatch(toggleEditor(true));
  };

  const goConfig = () => {
    resetViews();
    dispatch(toggleConfig(true));
    dispatch(toggleEditor(true));
  };

  const goQr = () => {
    resetViews();
    dispatch(toggleRewards(true));
    dispatch(toggleEditor(true));
  };

  const goTvSabores = () => {
    resetViews();
    dispatch(toggleTvSabores(true));
    dispatch(toggleEditor(true));
  };

  return (
    <Bar>
      <LogoBox>
        <img
          src={logoPixelWhite}
          alt="Pixel"
          style={{ width: 42, height: 'auto', marginBottom: 0, opacity: 1 }}
        />
      </LogoBox>

      <Item aria-label="Inicio" data-active={activeHome} onClick={goHome}>
        {activeHome ? <HiSquares2X2 size={22} /> : <HiOutlineSquares2X2 size={22} />}
      </Item>

      <Item aria-label="Pedidos" data-active={activeOrders} onClick={goOrders}>
        {activeOrders ? <HiClipboardList size={22} /> : <HiOutlineClipboardList size={22} />}
      </Item>

      <Item aria-label="QR" data-active={activeRewards} onClick={goQr} title="QR">
        <QrCode size={22} />
      </Item>

      {/* ✅ nuevo botón */}
      <Item
        aria-label="TV Sabores"
        data-active={activeTvSabores}
        onClick={goTvSabores}
        title="TV Sabores"
      >
        <Tv size={22} />
      </Item>

      <Divider />

      <Item aria-label="Ajustes" data-active={activeConfig} onClick={goConfig}>
        {activeConfig ? <HiCog6Tooth size={22} /> : <HiOutlineCog6Tooth size={22} />}
      </Item>

      <Spacer />
    </Bar>
  );
}
