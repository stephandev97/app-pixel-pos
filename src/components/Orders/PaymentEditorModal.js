// src/components/Orders/PaymentEditorModal.js
import React, { useEffect, useMemo, useState } from 'react';
import { BsCash } from 'react-icons/bs';

import mpLogoWhite from '../../assets/mercadopagowhite.png';

export default function PaymentEditorModal({ open, onClose, onSave, initial, orderTotal }) {
  const [phase, setPhase] = useState(open ? 'enter' : 'closed');
  const [method, setMethod] = useState(initial?.method || 'Efectivo');
  const [cash, setCash] = useState(String(initial?.ef ?? ''));
  const [mp, setMp] = useState(String(initial?.mp ?? ''));
  const [debit, setDebit] = useState(String(initial?.db ?? ''));
  const [isSaving, setIsSaving] = useState(false);

  const parseAmount = (value) => Number(String(value).replace(/[^\d]/g, '')) || 0;
  const cashAmount = parseAmount(cash);
  const mpAmount = parseAmount(mp);
  const debitAmount = parseAmount(debit);

  useEffect(() => {
    if (!open) return;
    setMethod(initial?.method || 'Efectivo');
    setCash(String(initial?.ef ?? ''));
    setMp(String(initial?.mp ?? ''));
    setDebit(String(initial?.db ?? ''));
    setIsSaving(false);
  }, [open, initial?.method, initial?.ef, initial?.mp, initial?.db]);

  const errors = useMemo(() => {
    const errs = {};
    const tot = Number(orderTotal) || 0;
    if (method === 'Efectivo') {
      if (!cash || cashAmount < tot) {
        errs.cash = `El efectivo debe ser ≥ ${tot.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        })}`;
      }
    } else if (method === 'Mixto') {
      const activeMethods = [cashAmount, mpAmount, debitAmount].filter((amount) => amount > 0);
      if (activeMethods.length < 2) errs.sum = 'Ingresá montos en al menos dos medios de pago';
      const suma = activeMethods.reduce((total, amount) => total + amount, 0);
      if (suma < tot) {
        errs.sum = `La suma debe ser al menos ${tot.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        })}`;
      }
    }
    return errs;
  }, [method, cash, cashAmount, mpAmount, debitAmount, orderTotal]);

  const isValid = Object.keys(errors).length === 0;
  const handleSave = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    try {
      await onSave({
        method,
        cash: cashAmount,
        mp: mpAmount,
        debit: debitAmount,
      });
    } finally {
      setIsSaving(false);
    }
  };

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
    overflowY: 'auto',
  };

  const panel = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 20,
    width: '100%',
    maxWidth: 460,
    maxHeight: '100%',
    overflowY: 'auto',
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
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
    marginTop: 2,
  };

  const pillBtn = (active) => ({
    padding: '10px 8px',
    borderRadius: 12,
    cursor: 'pointer',
    border: active ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
    background: active ? '#eff6ff' : '#fff',
    color: active ? '#1d4ed8' : '#334155',
    fontWeight: 800,
    fontSize: '.85rem',
    transition: 'transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease',
    width: '100%',
  });

  const inputGroup = (hasError) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '11px 12px',
    borderRadius: 11,
    border: `1px solid ${hasError ? '#ef4444' : '#cbd5e1'}`,
    background: '#fff',
    color: '#111',
    width: '100%',
    boxShadow: hasError ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
    overflow: 'hidden',
  });

  const inputInner = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#111',
    fontSize: '1.05rem',
    fontWeight: 800,
    textAlign: 'right',
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
  };

  const actions = {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 2,
  };

  return (
    <div style={root} role="dialog" aria-modal="true" aria-labelledby="payment-editor-title">
      <form
        style={panel}
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div id="payment-editor-title" style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: 0.2, color: '#0f172a' }}>
              Editar forma de pago
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>
              Elegí cómo se abonó el pedido
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: '#fff',
              color: '#475569',
              fontSize: '1.2rem',
              lineHeight: 1,
              cursor: 'pointer',
              width: 38,
              height: 38,
              borderRadius: 11,
              border: '1px solid #e2e8f0',
            }}
          >
            ×
          </button>
        </div>

        <div style={pills}>
          {['Efectivo', 'Transferencia', 'Débito', 'Mixto'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              aria-pressed={method === m}
              style={pillBtn(method === m)}
            >
              {m}
            </button>
          ))}
        </div>

        <div
          style={{
            padding: '12px 14px',
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Total del pedido</span>
          <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
            {Number(orderTotal || 0).toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
              maximumFractionDigits: 0,
            })}
          </strong>
        </div>

        {method === 'Efectivo' && (
          <div>
            <label htmlFor="payment-cash" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: 6 }}>
              Efectivo recibido
            </label>
            <div style={inputGroup(!!errors.cash)}>
              <BsCash size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
              <span style={{ color: '#64748b', fontWeight: 700 }}>$</span>
              <input
                id="payment-cash"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={cash}
                onChange={(e) => setCash(e.target.value.replace(/[^\d]/g, ''))}
                style={inputInner}
                placeholder="Ingresar monto"
                aria-invalid={Boolean(errors.cash)}
              />
            </div>
            {errors.cash && (
              <div style={{ color: '#dc2626', fontSize: '.78rem', marginTop: 5 }}>{errors.cash}</div>
            )}
          </div>
        )}

        {method === 'Transferencia' && (
          <div style={{ padding: 12, borderRadius: 11, background: '#eff6ff', color: '#1e40af', fontSize: '.85rem', lineHeight: 1.45 }}>
            Se marcará como pagó por transferencia.
          </div>
        )}
        {method === 'Débito' && (
          <div style={{ padding: 12, borderRadius: 11, background: '#f1f5f9', color: '#334155', fontSize: '.85rem', lineHeight: 1.45 }}>
            Se marcará como pagó con tarjeta de débito.
          </div>
        )}

        {method === 'Mixto' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <label htmlFor="payment-mixed-cash" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>
              Efectivo
              <div style={{ ...inputGroup(!!errors.cash), marginTop: 6 }}>
                <BsCash size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span style={{ color: '#64748b', fontWeight: 700 }}>$</span>
                <input
                  id="payment-mixed-cash"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={cash}
                  onChange={(e) => setCash(e.target.value.replace(/[^\d]/g, ''))}
                  style={inputInner}
                  placeholder="0"
                  aria-invalid={Boolean(errors.cash)}
                />
              </div>
            </label>
            {errors.cash && (
              <div style={{ color: '#dc2626', fontSize: '.78rem', marginTop: -7 }}>{errors.cash}</div>
            )}

            <label htmlFor="payment-mixed-mp" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>
              Mercado Pago / transferencia
              <div style={{ ...inputGroup(!!errors.mp), marginTop: 6 }}>
                <img
                  src={mpLogoWhite}
                  alt=""
                  width="18"
                  height="18"
                  style={{ display: 'block', background: '#1e6cff', borderRadius: 4, padding: 2 }}
                />
                <span style={{ color: '#64748b', fontWeight: 700 }}>$</span>
                <input
                  id="payment-mixed-mp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={mp}
                  onChange={(e) => setMp(e.target.value.replace(/[^\d]/g, ''))}
                  style={inputInner}
                  placeholder="0"
                  aria-invalid={Boolean(errors.mp)}
                />
              </div>
            </label>
            {errors.mp && <div style={{ color: '#dc2626', fontSize: '.78rem', marginTop: -7 }}>{errors.mp}</div>}

            <label htmlFor="payment-mixed-debit" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>
              Débito
              <div style={{ ...inputGroup(!!errors.debit), marginTop: 6 }}>
                <span style={{ color: '#475569', fontSize: '.9rem', fontWeight: 800, flexShrink: 0 }}>D</span>
                <span style={{ color: '#64748b', fontWeight: 700 }}>$</span>
                <input
                  id="payment-mixed-debit"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={debit}
                  onChange={(e) => setDebit(e.target.value.replace(/[^\d]/g, ''))}
                  style={inputInner}
                  placeholder="0"
                  aria-invalid={Boolean(errors.debit)}
                />
              </div>
            </label>
            {errors.debit && <div style={{ color: '#dc2626', fontSize: '.78rem', marginTop: -7 }}>{errors.debit}</div>}
            {!!errors.sum && (
              <div style={{ color: '#dc2626', fontSize: '.78rem' }}>{errors.sum}</div>
            )}
          </div>
        )}

        <div style={{ ...actions, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              minHeight: 42,
              padding: '0 16px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isValid || isSaving}
            style={{
              minHeight: 42,
              minWidth: 120,
              padding: '0 16px',
              borderRadius: 10,
              border: '1px solid #15803d',
              background: !isValid || isSaving ? '#94a3b8' : '#16a34a',
              color: '#fff',
              cursor: !isValid || isSaving ? 'not-allowed' : 'pointer',
              fontWeight: 800,
            }}
          >
            {isSaving ? 'Guardando…' : 'Guardar pago'}
          </button>
        </div>
      </form>
    </div>
  );
}
