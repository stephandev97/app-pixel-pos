import { Calculator, Coffee, FlaskConical, Heart, QrCode, ShoppingBasket, Timer, Tv } from 'lucide-react'; // ✅ nuevo
import { useState } from 'react';
import { HiClipboardList, HiOutlineClipboardList } from 'react-icons/hi';
import {
  HiCog6Tooth,
  HiOutlineCog6Tooth,
  HiOutlineSquares2X2,
  HiSquares2X2,
} from 'react-icons/hi2';
import { useDispatch, useSelector } from 'react-redux';

import logoPixelWhite from '../../assets/logoprintwhite.png';
import {
  toggleBarista,
  toggleCafeCosts,
  toggleConfig,
  toggleCustomPrint,
  toggleEditor,
  toggleHome,
  toggleOrders,
  toggleRewards,
  toggleSimulatedPendingOrder,
  toggleTestOrders,
  toggleTvSabores, // ✅ nuevo
} from '../../redux/actions/actionsSlice';
import HeldCartsModal from '../Checkout/HeldCartsModal';
import { Bar, Divider, HeldBadge, HeldCartsItem, Item, LogoBox, Spacer } from './SidebarStyles';

export default function Sidebar() {
  const dispatch = useDispatch();

  const activeHome = useSelector((s) => s.actions.toggleHome);
  const activeOrders = useSelector((s) => s.actions.toggleOrders);
  const activeTestOrders = useSelector((s) => s.actions.toggleTestOrders);
  const activeConfig = useSelector((s) => s.actions.toggleConfig);
  const activeRewards = useSelector((s) => s.actions.toggleRewards);
  const activeTvSabores = useSelector((s) => s.actions.toggleTvSabores); // ✅ nuevo
  const activeBarista = useSelector((s) => s.actions.toggleBarista);
  const activeCustomPrint = useSelector((s) => s.actions.toggleCustomPrint);
  const activeCafeCosts = useSelector((s) => s.actions.toggleCafeCosts);
  const showDevQr = useSelector((s) => s.actions?.showDevQr);
  const showSectionProducts = useSelector((s) => s.actions?.showSectionProducts ?? true);
  const showSectionOrders = useSelector((s) => s.actions?.showSectionOrders ?? true);
  const showSectionBarista = useSelector((s) => s.actions?.showSectionBarista ?? false);
  const showSectionNotes = useSelector((s) => s.actions?.showSectionNotes ?? true);
  const showSectionTvSabores = useSelector((s) => s.actions?.showSectionTvSabores ?? true);
  const showSectionCafeCosts = useSelector((s) => s.actions?.showSectionCafeCosts ?? false);
  const isTestMode = useSelector((s) => s.actions?.isTestMode);
  const isAdmin = useSelector((s) => s.actions?.isAdmin);
  const simulatedPendingOrder = useSelector((s) => s.actions?.simulatedPendingOrder);
  const isDev = process.env.NODE_ENV === 'development' || Boolean(isAdmin) || Boolean(isTestMode);

  const [showHeldModal, setShowHeldModal] = useState(false);
  const heldCarts = useSelector((s) => s.cart?.heldCarts) || [];
  const heldCount = heldCarts.length;

  const resetViews = () => {
    dispatch(toggleHome(false));
    dispatch(toggleOrders(false));
    dispatch(toggleTestOrders(false));
    dispatch(toggleConfig(false));
    dispatch(toggleRewards(false));
    dispatch(toggleTvSabores(false));
    dispatch(toggleBarista(false));
    dispatch(toggleCustomPrint(false));
    dispatch(toggleCafeCosts(false));
  };

  const goCafeCosts = () => {
    resetViews();
    dispatch(toggleCafeCosts(true));
    dispatch(toggleEditor(true));
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

  const goTestOrders = () => {
    resetViews();
    dispatch(toggleTestOrders(true));
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

  const goBarista = () => {
    resetViews();
    dispatch(toggleBarista(true));
    dispatch(toggleEditor(true));
  };

  const goCustomPrint = () => {
    resetViews();
    dispatch(toggleCustomPrint(true));
    dispatch(toggleEditor(true));
  };

  return (
    <>
      <Bar $isElectron={!!window.electron} $isTestMode={Boolean(isTestMode)}>
        <LogoBox>
          <img
            src={logoPixelWhite}
            alt="Pixel"
            style={{ width: 46, height: 'auto', marginBottom: 0, opacity: 1 }}
          />
        </LogoBox>

        {showSectionProducts && (
          <Item aria-label="Inicio" data-active={activeHome} onClick={goHome}>
            {activeHome ? <HiSquares2X2 size={22} /> : <HiOutlineSquares2X2 size={22} />}
          </Item>
        )}

        {showSectionOrders && (
          <Item aria-label="Pedidos" data-active={activeOrders} onClick={goOrders}>
            {activeOrders ? <HiClipboardList size={22} /> : <HiOutlineClipboardList size={22} />}
          </Item>
        )}

        {isTestMode && (
          <Item
            aria-label="Pedidos de Prueba"
            data-active={activeTestOrders}
            onClick={goTestOrders}
            title="Pedidos de Prueba (Modo Test)"
            style={
              activeTestOrders
                ? {
                    color: '#fff',
                    background: '#f59e0b',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                  }
                : {
                    color: '#fbbf24',
                  }
            }
          >
            <FlaskConical size={22} />
          </Item>
        )}

        {showDevQr && (
          <Item aria-label="QR" data-active={activeRewards} onClick={goQr} title="QR">
            <QrCode size={22} />
          </Item>
        )}

        {showSectionBarista && (
          <Item
            aria-label="Barista"
            data-active={activeBarista}
            onClick={goBarista}
            title="Barista"
          >
            <Coffee size={22} />
          </Item>
        )}

        {showSectionNotes && (
          <Item
            aria-label="Dedicatorias"
            data-active={activeCustomPrint}
            onClick={goCustomPrint}
            title="Dedicatorias / Notas"
          >
            <Heart size={22} />
          </Item>
        )}

        <Divider />

        {showSectionTvSabores && (
          <Item
            aria-label="TV Sabores"
            data-active={activeTvSabores}
            onClick={goTvSabores}
            title="TV Sabores"
          >
            <Tv size={22} />
          </Item>
        )}

        {showSectionCafeCosts && (
          <Item
            aria-label="Costos de Cafetería"
            data-active={activeCafeCosts}
            onClick={goCafeCosts}
            title="Costos de Cafetería"
          >
            <Calculator size={22} />
          </Item>
        )}

        <Item aria-label="Ajustes" data-active={activeConfig} onClick={goConfig}>
          {activeConfig ? <HiCog6Tooth size={22} /> : <HiOutlineCog6Tooth size={22} />}
        </Item>

        {isDev && (
          <Item
            aria-label="Simular pedido pendiente (Dev)"
            data-active={simulatedPendingOrder}
            onClick={() => {
              dispatch(toggleSimulatedPendingOrder());
              if (!activeOrders) {
                goOrders();
              }
            }}
            title={
              simulatedPendingOrder
                ? 'Quitar pedido pendiente simulado (Dev)'
                : 'Simular pedido pendiente (Dev)'
            }
            style={
              simulatedPendingOrder
                ? {
                    color: '#ffedd5',
                    background: '#ea580c',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)',
                  }
                : { opacity: 0.7 }
            }
          >
            <Timer size={22} />
          </Item>
        )}

        <Spacer />

        {/* Botón de carritos en espera al fondo del sidebar */}
        <HeldCartsItem
          aria-label="Pedidos en espera"
          title={`Pedidos en espera (${heldCount})`}
          $hasHeld={heldCount > 0}
          onClick={() => setShowHeldModal(true)}
        >
          <ShoppingBasket size={22} />
          {heldCount > 0 && <HeldBadge>{heldCount}</HeldBadge>}
        </HeldCartsItem>
      </Bar>

      <HeldCartsModal isOpen={showHeldModal} onClose={() => setShowHeldModal(false)} />
    </>
  );
}
