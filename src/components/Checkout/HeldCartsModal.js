import React from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, PauseCircle, RotateCcw, Trash2, X } from 'lucide-react';
import styled from 'styled-components';

import {
  toggleAddress,
  toggleBarista,
  toggleConfig,
  toggleCustomPrint,
  toggleEditor,
  toggleHiddenCart,
  toggleHome,
  toggleOrders,
  toggleRewards,
  toggleTvSabores,
} from '../../redux/actions/actionsSlice';
import { discardHeldCart, restoreHeldCart } from '../../redux/cart/cartSlice';
import { formatPrice } from '../../utils/formatPrice';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 16px 16px calc(var(--sidebar-w, 60px) + 16px);
  animation: fadeIn 0.15s ease-out;

  @media (max-width: 640px) {
    padding: 12px 12px 12px calc(var(--sidebar-w, 48px) + 12px);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 380px;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes scaleUp {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;

  .title-group {
    display: flex;
    align-items: center;
    gap: 10px;

    svg {
      color: #4d0012;
    }

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
    }
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }
`;

const ModalBody = styled.div`
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
`;

const HeldCardItem = styled.div`
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.15s ease;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    .held-badge {
      font-size: 12px;
      font-weight: 700;
      color: #4d0012;
      background: #fff0f3;
      border: 1px solid rgba(77, 0, 18, 0.15);
      padding: 3px 8px;
      border-radius: 6px;
    }

    .held-total {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
    }
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    background: #f8fafc;
    border-radius: 8px;
    padding: 8px 10px;

    .item-row {
      font-size: 12.5px;
      color: #334155;
      line-height: 1.35;

      .item-qty {
        font-weight: 700;
        color: #0f172a;
        margin-right: 4px;
      }

      .item-flavors {
        font-size: 11.5px;
        color: #64748b;
        margin-left: 4px;
      }
    }
  }

  .card-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 2px;

    .restore-btn {
      flex: 1;
      background: #4d0012;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      height: 36px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.15s ease;

      &:hover {
        background: #35000c;
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(77, 0, 18, 0.25);
      }
    }

    .discard-btn {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #fee2e2;
        color: #ef4444;
        border-color: #fecaca;
      }
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 36px 16px;
  color: #64748b;

  p {
    margin: 8px 0 0;
    font-size: 14px;
    font-weight: 600;
  }
`;

const HeldCartsModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const heldCarts = useSelector((state) => state.cart.heldCarts) || [];

  if (!isOpen) return null;

  const handleRestore = (cartId) => {
    const targetHeld = heldCarts.find((c) => c.id === cartId);
    dispatch(restoreHeldCart(cartId));
    dispatch(toggleOrders(false));
    dispatch(toggleConfig(false));
    dispatch(toggleRewards(false));
    dispatch(toggleTvSabores(false));
    dispatch(toggleBarista(false));
    dispatch(toggleCustomPrint(false));
    dispatch(toggleHome(true));
    dispatch(toggleEditor(true));
    dispatch(toggleHiddenCart(false));
    if (targetHeld?.deliveryInfo) {
      dispatch(toggleAddress(targetHeld.deliveryInfo.isRetiro ?? true));
    }
    onClose();
  };

  const handleDiscard = (cartId) => {
    dispatch(discardHeldCart(cartId));
    if (heldCarts.length <= 1) {
      onClose();
    }
  };

  return createPortal(
    <Backdrop onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalCard>
        <ModalHeader>
          <div className="title-group">
            <PauseCircle size={22} />
            <h3>Pedidos en Espera ({heldCarts.length})</h3>
          </div>
          <button className="close-btn" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </ModalHeader>

        <ModalBody>
          {heldCarts.length === 0 ? (
            <EmptyState>
              <PauseCircle size={36} style={{ opacity: 0.3 }} />
              <p>No hay pedidos en espera</p>
            </EmptyState>
          ) : (
            heldCarts.map((held, idx) => (
              <HeldCardItem key={held.id || idx}>
                <div className="card-top">
                  <span className="held-badge">
                    Pedido en espera #{idx + 1}
                  </span>
                  <span className="held-total">{formatPrice(held.totalPrice)}</span>
                </div>

                <div className="items-list">
                  {held.items?.map((it, itemIdx) => {
                    const flavorsText =
                      it.sabores && it.sabores.length > 0
                        ? `(${it.sabores.join(', ')})`
                        : '';
                    return (
                      <div className="item-row" key={it.id || itemIdx}>
                        <span className="item-qty">{it.quantity}x</span>
                        <span className="item-name">{it.name}</span>
                        {flavorsText && (
                          <span className="item-flavors">{flavorsText}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {held.deliveryInfo &&
                  !held.deliveryInfo.isRetiro &&
                  held.deliveryInfo.direccion &&
                  held.deliveryInfo.direccion !== 'Retiro' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#0f766e',
                        background: '#f0fdfa',
                        border: '1px solid #ccfbf1',
                        padding: '4px 8px',
                        borderRadius: '7px',
                      }}
                    >
                      <MapPin size={13} style={{ flexShrink: 0 }} />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Delivery: {held.deliveryInfo.direccion}
                      </span>
                    </div>
                  )}

                <div className="card-actions">
                  <button
                    className="restore-btn"
                    onClick={() => handleRestore(held.id)}
                    title="Cargar pedido al carrito"
                  >
                    <RotateCcw size={15} />
                    <span>Recuperar al carrito</span>
                  </button>
                  <button
                    className="discard-btn"
                    onClick={() => handleDiscard(held.id)}
                    title="Descartar pedido en espera"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </HeldCardItem>
            ))
          )}
        </ModalBody>
      </ModalCard>
    </Backdrop>,
    document.body
  );
};

export default HeldCartsModal;
