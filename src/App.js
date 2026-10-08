import './App.css';
import './animation-optimizations-final.css';

import { AnimatePresence, motion } from 'framer-motion';
import { Minus, X } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { createGlobalStyle } from 'styled-components';

import AndroidUpdatePrompt from './components/common/AndroidUpdatePrompt';
import Loader from './components/common/Loader';
import Sidebar from './components/Sidebar/Sidebar';
import { SIDEBAR_W } from './components/Sidebar/SidebarStyles';
import SplashScreen from './components/Splash/SplashScreen';
import { useNetworkSync } from './hooks/useNetworkSync';
import useOptimizedAnimation from './hooks/useOptimizedAnimation';
import Checkout from './pages/Checkout/Checkout';
import FinishOrder from './pages/FinishOrder/FinishOrder';
import OrderFinished from './pages/OrderFinished/OrderFinished';
import { persistor } from './redux/store';
import { fetchLatestPosPassword } from './utils/posPassword';

// Lazy load screens
const Config = lazy(() => import('./pages/Config/Config'));
const DailyStats = lazy(() => import('./pages/DailyStats/DailyStats'));
const Home = lazy(() => import('./pages/Home/Home'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const RewardsList = lazy(() => import('./pages/RewardsList'));
const TvSaboresPanel = lazy(() => import('./pages/TVSaboresPanel/TVSaboresPanel'));
const CustomPrint = lazy(() => import('./pages/CustomPrint/CustomPrint'));
const CafeCosts = lazy(() => import('./pages/CafeCosts/CafeCosts'));

const GlobalNoDialogScroll = createGlobalStyle`
  .MuiDialogContent-root { overflow-y: clip !important; }
  .MuiDialog-paper { overflow: visible !important; }
`;

function usePreventZoom() {
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    const handleGestureStart = (e) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('gesturestart', handleGestureStart);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('gesturestart', handleGestureStart);
    };
  }, []);
}

export default function App() {
  useNetworkSync(); // global offline sync
  usePreventZoom();
  const { motionSettings } = useOptimizedAnimation();
  const activeOrders = useSelector((s) => s.actions.toggleOrders);
  const activeTestOrders = useSelector((s) => s.actions.toggleTestOrders);
  const activeConfig = useSelector((s) => s.actions.toggleConfig);
  const activeRewards =
    useSelector((s) => s.actions.toggleRewards) &&
    (typeof import.meta !== 'undefined' ? !!import.meta.env?.DEV : false);
  const activeDaily = useSelector((s) => s.actions.toggleDailyStats);

  const activeTvSabores = useSelector((s) => s.actions.toggleTvSabores);
  const activeBarista = useSelector((s) => s.actions.toggleBarista);
  const activeCustomPrint = useSelector((s) => s.actions.toggleCustomPrint);
  const activeCafeCosts = useSelector((s) => s.actions.toggleCafeCosts);
  const isTestMode = useSelector((s) => s.actions.isTestMode);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    fetchLatestPosPassword().catch(() => {});
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200); // 2.2s splash
    return () => clearTimeout(timer);
  }, []);

  // elegimos UNA sola pantalla y le damos un key único
  const screen = activeTvSabores
    ? 'tv_sabores'
    : activeRewards
      ? 'rewards'
      : activeTestOrders
        ? 'test_orders'
        : activeOrders
          ? 'orders'
          : activeBarista
            ? 'barista'
            : activeCustomPrint
              ? 'custom_print'
              : activeCafeCosts
                ? 'cafe_costs'
                : activeConfig
                  ? 'config'
                  : activeDaily
                    ? 'daily'
                    : 'home';

  return (
    <PersistGate loading={null} persistor={persistor}>
      <div className="App app-container animation-optimized">
        {/* Custom Title Bar Region - Only in Electron */}
        {window.electron && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '35px',
              background: '#33000c', // Darker than sidebar but lighter than before
              zIndex: 99999,
              WebkitAppRegion: 'drag', // Make draggable
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px',
              justifyContent: 'flex-end', // Align to right
            }}
          >
            {isTestMode && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#f59e0b',
                  color: '#1c1917',
                  padding: '3px 14px',
                  borderRadius: '12px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  WebkitAppRegion: 'no-drag',
                  pointerEvents: 'none',
                }}
              >
                <span>🧪</span> Modo Prueba
              </div>
            )}
            <div
              style={{
                display: 'flex',
                WebkitAppRegion: 'no-drag',
                paddingRight: '10px',
                alignItems: 'center',
                marginLeft: 'auto',
                height: '100%',
              }}
            >
              <button
                onClick={() => window.electron?.ipcRenderer?.invoke('minimize-window')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  width: '26px', // Reduced size
                  height: '26px', // Reduced size
                  borderRadius: '50%', // Round
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  marginRight: '8px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
                }
              >
                <Minus size={14} />
              </button>
              <button
                onClick={() => window.electron?.ipcRenderer?.invoke('close-window')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  width: '26px', // Reduced size
                  height: '26px', // Reduced size
                  borderRadius: '50%', // Round
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e81123')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
                }
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Banner fijo superior para Modo Prueba en navegador / PWA */}
        {!window.electron && isTestMode && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '28px',
              background: '#f59e0b',
              color: '#1c1917',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              gap: 6,
            }}
          >
            <span>🧪</span> MODO PRUEBA (Pedidos locales sin impacto en base de datos)
          </div>
        )}

        {/* Navbar superior con pestañas + spacer interno */}
        <Sidebar />
        <GlobalNoDialogScroll />
        <AnimatePresence>{showSplash && <SplashScreen key="splash" />}</AnimatePresence>
        <div
          className="app-main"
          style={{
            marginTop: window.electron ? '35px' : isTestMode ? '28px' : '0px', // Push content down only if title bar exists
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
              className="screen animation-optimized" // <- dale una clase para tus reglas existentes
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={motionSettings.x}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                height: '100%',
                minWidth: 0,
                overflow: 'hidden',
                boxSizing: 'border-box',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
              }}
            >
              <Suspense fallback={<Loader />}>
                {screen === 'orders' ? (
                  <Orders />
                ) : screen === 'test_orders' ? (
                  <Orders isTestOrders={true} />
                ) : screen === 'barista' ? (
                  <Orders isBarista={true} />
                ) : screen === 'custom_print' ? (
                  <CustomPrint />
                ) : screen === 'cafe_costs' ? (
                  <CafeCosts />
                ) : screen === 'config' ? (
                  <Config />
                ) : screen === 'daily' ? (
                  <DailyStats />
                ) : screen === 'rewards' ? (
                  <RewardsList />
                ) : screen === 'tv_sabores' ? (
                  <TvSaboresPanel />
                ) : (
                  <Home />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>

          {/* overlays */}
          <AndroidUpdatePrompt />
          <Checkout />
          <FinishOrder />
          <OrderFinished />
        </div>
      </div>
    </PersistGate>
  );
}
