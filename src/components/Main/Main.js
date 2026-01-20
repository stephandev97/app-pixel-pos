import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';

import Config from '../../pages/Config/Config'; // si no existe, podés borrar este import
import Home from '../../pages/Home/Home';
import Orders from '../../pages/Orders/Orders';

// Variantes de animación (slide horizontal)
const variantsRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.28, ease: 'easeInOut' } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.24, ease: 'easeInOut' } },
};
const variantsLeft = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.28, ease: 'easeInOut' } },
  exit: { x: '-100%', opacity: 0, transition: { duration: 0.24, ease: 'easeInOut' } },
};

export default function Main() {
  const activeOrders = useSelector((s) => s.actions.toggleOrders);
  const activeConfig = useSelector((s) => s.actions.toggleConfig);

  // Garantiza 1 sola pantalla; fallback a Home
  const screen = activeOrders ? 'orders' : activeConfig ? 'config' : 'home';

  return (
    <div style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: '#fff' }}>
      <AnimatePresence initial={false} mode="wait">
        {screen === 'orders' && (
          <motion.div
            key="orders"
            variants={variantsRight}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0, // necesario para scroll interno correcto
              background: '#fff',
              zIndex: 150,
            }}
          >
            <Orders />
          </motion.div>
        )}

        {screen === 'home' && (
          <motion.div
            key="home"
            variants={variantsLeft}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              background: '#fff',
              zIndex: 120,
            }}
          >
            <Home />
          </motion.div>
        )}

        {screen === 'config' && (
          <motion.div
            key="config"
            variants={variantsRight}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              background: '#fff',
              zIndex: 130,
            }}
          >
            <Config />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
