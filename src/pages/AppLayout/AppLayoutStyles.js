import styled from 'styled-components';

const SIDEBAR_W = 84; // ancho compacto; subilo a 240 si querés labels completos

export const Sidebar = styled.aside`
  position: fixed;
  inset: 0 auto 0 0; /* top:0; left:0; bottom:0 */
  width: ${SIDEBAR_W}px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: none; /* oculto en mobile */
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 8px;
  z-index: 150;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .brand {
    font-weight: 800;
    font-size: 1rem;
    margin: 8px 6px 12px;
  }

  @media (min-width: 768px) {
    display: flex; /* visible en tablet/desktop */
  }
`;

export const SidebarItem = styled.button.attrs(({ icon, label }) => ({
  children: (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {icon}
      <span style={{ fontSize: 12 }}>{label}</span>
    </div>
  ),
}))`
  all: unset;
  cursor: pointer;
  width: 100%;
  border-radius: 10px;
  padding: 10px 6px;
  color: ${({ active }) => (active ? '#111' : '#6b7280')};
  background: ${({ active }) => (active ? '#f3f4f6' : 'transparent')};
  text-align: center;

  &:hover {
    background: #f8f9fa;
    color: #111;
  }
`;

export const SidebarFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #111;
    color: #fff;
    border: 0;
    padding: 10px 8px;
    border-radius: 12px;
    cursor: pointer;
  }
  .primary:hover {
    opacity: 0.92;
  }
`;

export const Content = styled.main`
  min-height: 100vh;
  padding: 16px;
  @media (min-width: 768px) {
    margin-left: ${SIDEBAR_W}px; /* deja lugar a la sidebar */
    padding: 24px;
  }

  /* bottom navbar — visible solo en mobile */
  + .bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 66px;
    background: #fff;
    border-top: 1px solid #e5e7eb;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    z-index: 160;

    button {
      background: none;
      border: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: #6b7280;
      font-size: 12px;
    }
    button.active {
      color: #111;
    }
  }
  @media (min-width: 768px) {
    + .bottom-nav {
      display: none;
    } /* ocultar barra inferior en desktop */
  }
`;
