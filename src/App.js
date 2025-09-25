import './App.css';

import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import Sidebar from './components/Sidebar/Sidebar';
import { SIDEBAR_W } from './components/Sidebar/SidebarStyles';
import Checkout from './pages/Checkout/Checkout';
import Config from './pages/Config/Config';
import DailyStats from './pages/DailyStats/DailyStats';
import FinishOrder from './pages/FinishOrder/FinishOrder';
import Home from './pages/Home/Home';
import OrderFinished from './pages/OrderFinished/OrderFinished';
import Orders from './pages/Orders/Orders';
import { persistor } from './redux/store';
import { createGlobalStyle } from 'styled-components';

const GlobalNoDialogScroll = createGlobalStyle`
  .MuiDialogContent-root { overflow-y: clip !important; }
  .MuiDialog-paper { overflow: visible !important; }
`;

export default function App() {
  const activeOrders = useSelector((s) => s.actions.toggleOrders);
  const activeConfig = useSelector((s) => s.actions.toggleConfig);
  const activeDaily = useSelector((s) => s.actions.toggleDailyStats);

  // elegimos UNA sola pantalla y le damos un key único
  const screen = activeOrders ? 'orders' : activeConfig ? 'config' : activeDaily ? 'daily' : 'home';

  return (
    <PersistGate loading={null} persistor={persistor}>
      <div className="App">
        {/* Navbar superior con pestañas + spacer interno */}
        <Sidebar />
        <GlobalNoDialogScroll />
        <div
          className="app-main"
          style={{
            flex: 1,
            boxSizing: 'border-box', // ← el padding NO aumenta el ancho
            paddingLeft: SIDEBAR_W, // ← reserva espacio para el sidebar
            minWidth: 0, // ← permite encoger
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden', // el scroll va dentro de .screen
          }}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={screen}
              className="screen" // <- dale una clase para tus reglas existentes
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                height: '100%',
                minWidth: 0,
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              {screen === 'orders' ? (
                <Orders />
              ) : screen === 'config' ? (
                <Config />
              ) : screen === 'daily' ? (
                <DailyStats />
              ) : (
                <Home />
              )}
            </motion.div>
          </AnimatePresence>

          {/* overlays */}
          <Checkout />
          <FinishOrder />
          <OrderFinished />

          {/* navbar solo si no estás en Orders */}
        </div>
      </div>
    </PersistGate>
  );
}
