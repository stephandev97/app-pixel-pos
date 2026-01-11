import { Home, List, MoreHorizontal, Plus } from 'react-feather';
import { FiQrcode } from 'react-icons/fi';

import { Content, Sidebar, SidebarFooter, SidebarItem } from './AppLayoutStyles';

export default function AppLayout({ tab, onChangeTab, children }) {
  return (
    <>
      {/* Sidebar izquierda (desktop/tablet) */}
      <Sidebar>
        <div className="top">
          <div className="brand">🍨 Pixel</div>
          <SidebarItem
            active={tab === 'menu'}
            onClick={() => onChangeTab('menu')}
            icon={<Home size={18} />}
            label="Menú"
          />
          <SidebarItem
            active={tab === 'pedidos'}
            onClick={() => onChangeTab('pedidos')}
            icon={<List size={18} />}
            label="Pedidos"
          />
          <SidebarItem
            active={tab === 'mas'}
            onClick={() => onChangeTab('mas')}
            icon={<MoreHorizontal size={18} />}
            label="Más"
          />
        </div>
        <SidebarFooter>
          <div className="actions">
            <button className="ghost" aria-label="QR" title="QR" onClick={() => onChangeTab('qr')}>
              <FiQrcode size={16} />
            </button>
            <button className="primary" onClick={() => onChangeTab('nuevo')}>
              <Plus size={16} />
              <span>Nuevo</span>
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Contenido principal */}
      <Content>{children}</Content>

      {/* Navbar inferior (solo mobile) */}
      <div className="bottom-nav">
        <button className={tab === 'menu' ? 'active' : ''} onClick={() => onChangeTab('menu')}>
          <Home size={18} />
          <span>Menú</span>
        </button>
        <button
          className={tab === 'pedidos' ? 'active' : ''}
          onClick={() => onChangeTab('pedidos')}
        >
          <List size={18} />
          <span>Pedidos</span>
        </button>
        <button className={tab === 'mas' ? 'active' : ''} onClick={() => onChangeTab('mas')}>
          <MoreHorizontal size={18} />
          <span>Más</span>
        </button>
      </div>
    </>
  );
}
