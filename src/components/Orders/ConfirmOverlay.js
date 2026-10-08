// src/components/Orders/ConfirmOverlay.js
import React, { useEffect, useState } from 'react';

export default function ConfirmOverlay({ open, onConfirm, onCancel }) {
  const [phase, setPhase] = useState(open ? 'enter' : 'closed');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setPhase('enter');
      const id = requestAnimationFrame(() => setPhase('open'));
      return () => cancelAnimationFrame(id);
    } else {
      setPhase((prev) => (prev === 'closed' ? 'closed' : 'exit'));
      const t = setTimeout(() => setPhase('closed'), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  const hidden = phase === 'closed';

  const style = {
    position: 'absolute',
    inset: 0,
    background: '#c41717ff',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    zIndex: 5,
    textAlign: 'center',
    transform:
      phase === 'enter'
        ? 'translateX(100%)'
        : phase === 'open'
          ? 'translateX(0)'
          : phase === 'exit'
            ? 'translateX(100%)'
            : 'translateX(100%)',
    opacity: phase === 'open' ? 1 : 0.9,
    transition: 'transform 180ms ease-out, opacity 180ms ease-out',
    visibility: hidden ? 'hidden' : 'visible',
    pointerEvents: hidden ? 'none' : 'auto',
    borderRadius: 16,
  };

  return (
    <div style={style} role="dialog" aria-modal="true" aria-hidden={hidden}>
      <div style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2 }}>
        ¿Seguro que querés borrarlo?
      </div>
      <div style={{ opacity: 0.9, fontSize: '0.9rem', maxWidth: 360 }}>
        Esta acción eliminará el pedido de la lista.
      </div>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Escribí el motivo"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.65)',
            background: '#fff',
            color: '#111',
            outline: 'none',
            fontWeight: 600,
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 6,
        }}
      >
        <button
          onClick={() => onConfirm(reason)}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            background: '#fff',
            color: '#d32f2f',
            minWidth: 120,
            fontFamily: 'Inter',
          }}
          disabled={!String(reason).trim()}
        >
          Borrar
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 16px',
            borderRadius: '12',
            border: '2px solid #fff',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'transparent',
            color: '#fff',
            minWidth: 120,
            fontFamily: 'Inter',
          }}
        >
          Volver
        </button>
      </div>
      <div style={{ marginTop: 6, fontSize: '0.8rem', opacity: 0.8 }}>
        Presioná Esc para cancelar
      </div>
    </div>
  );
}
