import {
  HiDotsHorizontal,
  HiOutlineDotsHorizontal,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiViewGrid,
  HiViewList,
} from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';

import {
  toggleConfig,
  toggleEditor,
  toggleHome,
  toggleOrders,
} from '../../redux/actions/actionsSlice';
import { ButtonPage, ContainerNavbar, TextButton } from './NavbarStyles';

export default function Navbar() {
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
    dispatch(toggleOrders(true));
    dispatch(toggleHome(false));
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
    <ContainerNavbar role="navigation" aria-label="Navegación principal">
      {/* Menú */}
      <ButtonPage
        onClick={goHome}
        aria-current={activeHome ? 'page' : undefined}
        data-active={activeHome}
      >
        {activeHome ? <HiViewGrid size={22} /> : <HiOutlineViewGrid size={22} />}
        <TextButton>Menú</TextButton>
      </ButtonPage>

      {/* Pedidos */}
      <ButtonPage
        onClick={goOrders}
        aria-current={activeOrders ? 'page' : undefined}
        data-active={activeOrders}
      >
        {activeOrders ? <HiViewList size={22} /> : <HiOutlineViewList size={22} />}
        <TextButton>Pedidos</TextButton>
      </ButtonPage>

      {/* Más */}
      <ButtonPage
        onClick={goConfig}
        aria-current={activeConfig ? 'page' : undefined}
        data-active={activeConfig}
      >
        {activeConfig ? <HiDotsHorizontal size={22} /> : <HiOutlineDotsHorizontal size={22} />}
        <TextButton>Más</TextButton>
      </ButtonPage>
    </ContainerNavbar>
  );
}
