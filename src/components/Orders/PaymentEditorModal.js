// src/components/Orders/PaymentEditorModal.js
import React, { useEffect, useState } from 'react';
import { BsCash } from 'react-icons/bs';
import { HiCheck, HiX } from 'react-icons/hi';

import mpLogoWhite from '../../assets/mercadopagowhite.png';

export default function PaymentEditorModal({ open, onClose, onSave, initial, orderTotal }) {
  const [phase, setPhase] = useState(open ? 'enter' : 'closed');
  const [method, setMethod] = useState(initial.method); // "Efectivo" | "Transferencia" | "Mixto"
  const [cash, setCash] = useState(initial.ef || 0);
  const [mp, setMp] = useState(initial.mp || 0);
  const [errors, setErrors] = useState({});

  const handleKeyDownNoDecimals = (e) => {
    if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const errs = {};
    const tot = Number(orderTotal) || 0;
    if (method === 'Efectivo') {
      const c = Number(cash) || 0;
      if (c < tot) {
        errs.cash = `El efectivo debe ser ≥ ${tot.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        })}`;
      }
    } else if (method === 'Mixto') {
      if (!Number.isFinite(cash) || cash <= 0) errs.cash = 'Debe ser mayor a 0';
      if (!Number.isFinite(mp) || mp <= 0) errs.mp = 'Debe ser mayor a 0';
      const suma = (Number(cash) || 0) + (Number(mp) || 0);
      if (suma < tot) {
        errs.sum = `La suma debe ser al menos ${tot.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        })}`;
      }
    }
    setErrors(errs);
  }, [method, cash, mp, orderTotal]);

  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Enter' && isValid) onSave({ method, cash, mp });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, isValid, method, cash, mp, onSave]);

  useEffect(() => {
    if (open) {
      setPhase('enter');
      const id = requestAnimationFrame(() => setPhase('open'));
      return () => cancelAnimationFrame(id);
    } else {
      setPhase((prev) => (prev === 'closed' ? 'closed' : 'exit'));
      const t = setTimeout(() => setPhase('closed'), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (phase === 'closed') return null;

  const root = {
    position: 'absolute',
    inset: 0,
    zIndex: 6,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    transform:
      phase === 'enter'
        ? 'translateX(100%)'
        : phase === 'open'
          ? 'translateX(0)'
          : 'translateX(100%)',
    transition: 'transform 200ms ease-out, opacity 200ms ease-out',
    opacity: phase === 'open' ? 1 : 0.98,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    boxSizing: 'border-box',
  };

  const panel = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 16,
    width: '100%',
    maxWidth: 420,
    boxSizing: 'border-box',
    background: '#fff',
    color: '#111',
    fontFamily: 'Inter, sans-serif',
    border: '1px solid #e5e7eb',
    borderRadius: 18,
    boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
  };

  const pills = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 6,
    marginTop: 2,
  };

  const pillBtn = (active) => ({
    padding: '6px 8px',
    borderRadius: 10,
    cursor: 'pointer',
    border: active ? '2px solid #111' : '1px solid #e5e7eb',
    background: active ? '#e9edf5' : '#fff',
    color: '#111',
    fontWeight: 800,
    fontSize: '.85rem',
    transition: 'transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease',
    width: '100%',
  });

  const inputGroup = (hasError) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 10px',
    borderRadius: 10,
    border: `1px solid ${hasError ? '#ff4d4d' : '#e5e7eb'}`,
    background: '#fff',
    color: '#111',
    width: '100%',
    boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.02)',
    overflow: 'hidden',
  });

  const inputInner = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#111',
    fontSize: '.95rem',
    textAlign: 'right',
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
  };

  const actions = {
    position: 'relative',
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 12,
  };

  const iconBtn = (primary = false) => ({
    width: 40,
    height: 40,
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    border: primary ? '1px solid rgba(76,205,153,0.32)' : '1px solid #e5e7eb',
    background: primary ? '#4CCD99' : '#fff',
    color: primary ? '#fff' : '#111',
    cursor: 'pointer',
    boxShadow: primary ? '0 8px 22px rgba(76,205,153,0.38)' : 'none',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease',
  });

  return (
    <div style={root} role="dialog" aria-modal="true">
      <div style={panel}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: 0.2 }}>
            Editar forma de pago
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#fff',
              color: '#111',
              fontSize: '1.2rem',
              lineHeight: 1,
              cursor: 'pointer',
              width: 36,
              height: 36,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
            }}
          >
            ×
          </button>
        </div>

        <div style={pills}>
          {['Efectivo', 'Transferencia', 'Débito', 'Mixto'].map((m) => (
            <button key={m} onClick={() => setMethod(m)} style={pillBtn(method === m)}>
              {m}
            </button>
          ))}
        </div>

        {method === 'Efectivo' && (
          <div
            style={{
              ...inputGroup(!!errors.cash),
              maxWidth: 180,
              marginTop: 4,
            }}
          >
            <BsCash size={18} style={{ color: '#4CCD99' }} />
            <input
              type="number"
              min={Number(orderTotal) || 0}
              step={1}
              inputMode="numeric"
              value={cash}
              onKeyDown={handleKeyDownNoDecimals}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '');
                setCash(Math.max(1, Math.floor(Number(val)) || 0));
              }}
              style={inputInner}
              placeholder="0"
            />
          </div>
        )}
        {method === 'Efectivo' && errors.cash && (
          <div style={{ color: '#ff4d4d', fontSize: '.8rem', marginTop: 4 }}>{errors.cash}</div>
        )}

        {method === 'Transferencia' && (
          <div style={{ opacity: 0.85, fontSize: '.95rem', marginTop: 6 }}>
            Se marcará como pagó por transferencia.
          </div>
        )}
        {method === 'Débito' && (
          <div style={{ opacity: 0.85, fontSize: '.95rem', marginTop: 6 }}>
            Se marcará como pagó con tarjeta de débito.
          </div>
        )}

        {method === 'Mixto' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxWidth: 180,
              marginTop: 4,
            }}
          >
            <div style={inputGroup(!!errors.cash)}>
              <BsCash size={18} style={{ color: '#4CCD99' }} />
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={cash}
                onKeyDown={handleKeyDownNoDecimals}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setCash(Math.max(1, Math.floor(Number(val)) || 0));
                }}
                style={inputInner}
                placeholder="0"
              />
            </div>
            {!!errors.cash && (
              <div style={{ color: '#ff4d4d', fontSize: '.8rem' }}>{errors.cash}</div>
            )}

            <div style={inputGroup(!!errors.mp)}>
              <img
                src={mpLogoWhite}
                alt="MP"
                width="18"
                height="18"
                style={{ display: 'block', background: '#1e6cff', borderRadius: 4, padding: 2 }}
              />
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={mp}
                onKeyDown={handleKeyDownNoDecimals}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setMp(Math.max(1, Math.floor(Number(val)) || 0));
                }}
                style={inputInner}
                placeholder="0"
              />
            </div>
            {!!errors.mp && <div style={{ color: '#ff4d4d', fontSize: '.8rem' }}>{errors.mp}</div>}
            {!!errors.sum && (
              <div style={{ color: '#ff4d4d', fontSize: '.8rem' }}>{errors.sum}</div>
            )}
          </div>
        )}

        <div style={actions}>
          <button
            onClick={() => isValid && onSave({ method, cash, mp })}
            style={{
              ...iconBtn(true),
              opacity: isValid ? 1 : 0.5,
              pointerEvents: isValid ? 'auto' : 'none',
            }}
            title="Guardar"
          >
            <HiCheck size={18} />
          </button>
          <button onClick={onClose} style={iconBtn(false)} title="Volver">
            <HiX size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
