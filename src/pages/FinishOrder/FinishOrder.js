import Slide from '@mui/material/Slide';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ContainerFinish from '../../components/FinishOrder/ContainerFinish/ContainerFinish';
import { toggleHiddenCart, toggleHiddenFinish } from '../../redux/actions/actionsSlice';
import { ContentDialogStyled, GlobalStyled } from './FinishOrderStyles';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FinishOrder = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const show = useSelector((state) => state.actions.hiddenFinish);

  const price = cartItems.reduce((acc, item) => {
    return (acc += item.price * item.quantity);
  }, 0);

  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const closingRef = useRef(false);

  // Reiniciar estado al abrir
  useEffect(() => {
    if (!show) {
      closingRef.current = false;
      setIsClosing(false);
      setIsDragging(false);
      setDragOffset(0);
    }
  }, [show]);

  const closeAndReturnToCart = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setIsClosing(true);
    setTimeout(() => {
      dispatch(toggleHiddenFinish(true));
      dispatch(toggleHiddenCart(false));
      setDragOffset(0);
    }, 240);
  };

  const handlePointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startYRef.current = e.clientY;
    setDragOffset(0);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    // Solo permitir arrastrar hacia abajo
    const newOffset = Math.max(0, deltaY);
    setDragOffset(newOffset);
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const deltaY = e.clientY - startYRef.current;

    // Si fue click/toque rápido (< 8px) o arrastre hacia abajo (> 45px), cerrar y volver al carrito
    if (Math.abs(deltaY) < 8 || deltaY > 45) {
      closeAndReturnToCart();
    } else {
      // Rebotar hacia arriba a la posición original
      setDragOffset(0);
    }
  };

  const handlePointerCancel = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <GlobalStyled
      slots={{ transition: Transition }}
      open={!show}
      onClose={closeAndReturnToCart}
      transitionDuration={{ enter: 280, exit: 0 }}
      slotProps={{
        backdrop: {
          sx: {
            transition: 'opacity 0.24s ease',
            opacity: isClosing ? '0 !important' : undefined,
          },
        },
      }}
      PaperProps={{
        sx: {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          top: '10%',
          margin: 0,
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: '100%',
          height: '90%',
          maxHeight: '90%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: isClosing
            ? 'translateY(100%)'
            : isDragging
              ? `translateY(${dragOffset}px)`
              : 'translateY(0px)',
          transition: isDragging
            ? 'none'
            : 'transform 0.24s cubic-bezier(0.2, 0.8, 0.4, 1)',
        },
      }}
    >
      {/* Barra superior con línea de arrastre para bajar/cerrar y volver al carrito */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 16px 8px',
          background: '#ffffff',
          cursor: isDragging ? 'grabbing' : 'pointer',
          touchAction: 'none',
          userSelect: 'none',
          flexShrink: 0,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
        }}
        title="Desliza hacia abajo o toca para volver al carrito"
      >
        <div
          style={{
            width: '44px',
            height: '4.5px',
            borderRadius: '999px',
            backgroundColor: isDragging ? '#64748b' : '#cbd5e1',
            transition: 'background-color 0.15s ease',
          }}
        />
      </div>

      <ContentDialogStyled>
        <ContainerFinish cartItems={cartItems} price={price} />
      </ContentDialogStyled>
    </GlobalStyled>
  );
};

export default FinishOrder;
