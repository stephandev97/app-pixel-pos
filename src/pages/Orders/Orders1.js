import PrintIcon from '@mui/icons-material/Print';
import Checkbox from '@mui/material/Checkbox';
import { useEffect, useMemo, useState } from 'react';
import React, { useRef } from 'react';
import { ChevronDown, ChevronUp, MapPin, ShoppingBag } from 'react-feather';
import { BiHomeAlt2 } from 'react-icons/bi';
import { BsCash } from 'react-icons/bs';
import { FaExchangeAlt } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { HiCheck, HiX } from 'react-icons/hi';
import { MdEdit } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';

import logoPixel from '../../assets/logoprint.png';
import mpLogoWhite from '../../assets/mercadopagowhite.png';
import {
  hydrateOrdersFromPocket,
  removeOrderFromBoth,
  subscribeOrdersRealtime,
  syncPendingOrders,
} from '../../features/orders/ordersThunks';
import { pb } from '../../lib/pb';
import { clearOrders } from '../../redux/orders/ordersSlice';
import logo from '../../styles/img/logoprint.png';
import { formatPrice } from '../../utils/formatPrice';
import { relativeTimeFrom } from '../../utils/time';
import {
  ButtonCopy,
  ButtonPrint,
  ButtonTitle,
  ContainerCard,
  ContainerOrders,
  ContentButtonsTitle,
  DirCard,
  Direccion,
  DivProducts,
  FooterCard,
  GlobalOrders,
  HaceMin,
  Hora,
  LineaPrint,
  ListProducts,
  Print,
  TitleCard,
  TotalPrint,
} from './OrdersStyles';
const { ipcRenderer } = window.require('electron');

const Line = ({ m = 6 }) => <div style={{ borderTop: '1px dashed #000', margin: `${m}px 0` }} />;

function PaymentEditor({ open, onClose, onSave, initial, orderTotal }) {
  const [phase, setPhase] = useState(open ? 'enter' : 'closed');
  const [method, setMethod] = useState(initial.method); // "Efectivo" | "Transferencia" | "Mixto"
  const [cash, setCash] = useState(initial.ef || 0);
  const [mp, setMp] = useState(initial.mp || 0);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    const errs = {};
    const tot = Number(orderTotal) || 0;
    if (method === 'Efectivo') {
      const c = Number(cash) || 0;
      if (c < tot) {
        errs.cash = `El efectivo debe ser ≥ ${tot.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`;
      }
    } else if (method === 'Mixto') {
      if (!Number.isFinite(cash) || cash <= 0) errs.cash = 'Debe ser mayor a 0';
      if (!Number.isFinite(mp) || mp <= 0) errs.mp = 'Debe ser mayor a 0';
      const suma = (Number(cash) || 0) + (Number(mp) || 0);
      if (suma < tot)
        errs.sum = `La suma debe ser al menos ${tot.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`;
    }
    setErrors(errs);
  }, [method, cash, mp, orderTotal]);

  const isValid = Object.keys(errors).length === 0;

  // Si querés bloquear Guardar con Enter cuando es inválido
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
    borderRadius: 'inherit',
    background: '#111', // 👈 ahora sólido
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
    overflow: 'hidden',
  };

  const panel = {
    position: 'relative', // <- para ubicar acciones abajo a la derecha
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 12,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  };

  const pills = { display: 'flex', gap: 8, flexWrap: 'wrap' };

  const pillBtn = (active) => ({
    padding: '6px 10px',
    borderRadius: 10,
    cursor: 'pointer',
    border: active ? '2px solid #23a76d' : '1px solid #2e2e2e',
    background: active ? '#14261f' : '#1b1b1b',
    color: '#fff',
    fontWeight: 700,
    fontSize: '.9rem',
  });

  const inputGroup = (hasError) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 8,
    border: `1px solid ${hasError ? '#ff4d4d' : '#2e2e2e'}`, // 👈 rojo si error
    background: '#1b1b1b',
    color: '#fff',
    width: '100%',
  });
  const inputInner = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.95rem',
  };

  // acciones: mini botones redondos, abajo a la derecha
  const actions = {
    position: 'absolute',
    right: 12,
    bottom: 12,
    display: 'flex',
    gap: 8,
  };
  const iconBtn = (primary = false) => ({
    width: 38,
    height: 38,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    border: primary ? 'none' : '2px solid #fff',
    background: primary ? '#23a76d' : 'transparent',
    color: '#fff',
    cursor: 'pointer',
  });

  return (
    <div style={root} role="dialog" aria-modal="true">
      <div style={panel}>
        {/* header compacto */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 900, fontSize: '1rem' }}>Editar forma de pago</div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#fff',
              fontSize: '1.2rem',
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* método */}
        <div style={pills}>
          {['Efectivo', 'Transferencia', 'Mixto'].map((m) => (
            <button key={m} onClick={() => setMethod(m)} style={pillBtn(method === m)}>
              {m}
            </button>
          ))}
        </div>

        {/* montos: EF solo / Mixto EF+MP uno debajo del otro y full width */}
        {method === 'Efectivo' && (
          <div
            style={{
              ...inputGroup(!!errors.cash),
              maxWidth: 220,
              marginTop: 6,
            }}
          >
            <BsCash size={18} style={{ color: '#23a76d' }} />
            <input
              type="number"
              min={Number(orderTotal) || 0}
              value={cash}
              onChange={(e) => setCash(Math.max(1, Number(e.target.value) || 0))}
              style={inputInner}
              placeholder="Efectivo"
            />
          </div>
        )}

        {method === 'Transferencia' && (
          <div style={{ opacity: 0.85, fontSize: '.95rem', marginTop: 6 }}>
            Se marcará como pagó por transferencia.
          </div>
        )}

        {method === 'Mixto' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxWidth: 220,
              marginTop: 6,
            }}
          >
            {/* EF */}
            <div style={inputGroup(!!errors.cash)}>
              <BsCash size={18} style={{ color: '#23a76d' }} />
              <input
                type="number"
                min={1}
                value={cash}
                onChange={(e) => setCash(Math.max(1, Number(e.target.value) || 0))}
                style={inputInner}
                placeholder="Efectivo"
              />
            </div>

            {/* MP */}
            <div style={inputGroup(!!errors.mp)}>
              <img src={mpLogoWhite} alt="MP" width="18" height="18" style={{ display: 'block' }} />
              <input
                type="number"
                min={1}
                value={mp}
                onChange={(e) => setMp(Math.max(1, Number(e.target.value) || 0))}
                style={inputInner}
                placeholder="Mercado Pago"
              />
            </div>
          </div>
        )}

        {/* acciones abajo-derecha: solo íconos */}
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

function ConfirmOverlay({ open, onConfirm, onCancel }) {
  const [phase, setPhase] = useState(open ? 'enter' : 'closed');

  // Animación de entrada/salida
  useEffect(() => {
    if (open) {
      setPhase('enter');
      const id = requestAnimationFrame(() => setPhase('open'));
      return () => cancelAnimationFrame(id);
    } else {
      // salir -> closed
      setPhase((prev) => (prev === 'closed' ? 'closed' : 'exit'));
      const t = setTimeout(() => setPhase('closed'), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC para cancelar (hook SIEMPRE montado, pero solo escucha cuando open)
  useEffect(() => {
    if (!open) return; // no adjuntar listener si está cerrado
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  // En lugar de "return null" usamos visibilidad/interaction para ocultar
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
    // Cuando está "closed", que no bloquee la card
    visibility: hidden ? 'hidden' : 'visible',
    pointerEvents: hidden ? 'none' : 'auto',
    borderRadius: 16,
  };

  return (
    <div style={style} role="dialog" aria-modal="true" aria-hidden={hidden}>
      <div style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2 }}>
        ¿Seguro que quieres borrar?
      </div>
      <div style={{ opacity: 0.9, fontSize: '0.9rem', maxWidth: 360 }}>
        Esta acción eliminará la orden de la lista.
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
          onClick={onConfirm}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            background: '#fff',
            color: '#d32f2f',
            minWidth: 120,
            fontFamily: 'Satoshi',
          }}
        >
          Borrar
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            border: '2px solid #fff',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'transparent',
            color: '#fff',
            minWidth: 120,
            fontFamily: 'Satoshi',
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

const CardOrders = ({
  method,
  pending,
  numeracion,
  direccion,
  total,
  pago,
  id,
  items,
  hora,
  clientCreatedAt,
  created,
  pagoEfectivo,
  pagoMp,
  pagoDetalle,
}) => {
  const [editPayOpen, setEditPayOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [localPay, setLocalPay] = useState(null);
  const [viewVersion, setViewVersion] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState('');
  // Lo que la UI debe mostrar (si hay cambios recientes, usa localPay)
  const viewPago = localPay?.pago ?? pago;
  const viewEf = localPay?.pagoEfectivo ?? Number(pagoEfectivo || 0);
  const viewMp = localPay?.pagoMp ?? Number(pagoMp || 0);

  // Método real de pago (desde field `method` o parche optimista)
  const methodNorm = String(localPay?.method ?? method ?? '').toLowerCase(); // 'efectivo' | 'transferencia' | 'mixto'

  const buildPreview = async () => {
    const orderForPrint = {
      direccion,
      items: itemsNorm,
      total,
      pago: ticketPago,
      pagoEfectivo: viewEf,
      pagoMp: viewMp,
    };
    const text = await ipcRenderer.invoke('FORMAT_TICKET_TEXT', {
      order: orderForPrint,
      font: 'B',
    });
    setPreviewText(text);
    setShowPreview((v) => !v);
  };

  // 1) valores crudos
  let ef = Number(pagoEfectivo || 0);
  let mp = Number(pagoMp || 0);

  // valor para ticket/preview
  const ticketPago =
    methodNorm === 'mixto' ? 'Mixto' : methodNorm === 'transferencia' ? 'Transferencia' : viewPago;
  // 2) fallback: intentar parsear de "pagoDetalle" (ej: "EF $2000 + MP $8600")
  if (pago === 'Mixto' && ef === 0 && mp === 0 && typeof pagoDetalle === 'string') {
    const m = pagoDetalle.match(/EF\s*\$?\s*([\d.,]+)\s*\+\s*MP\s*\$?\s*([\d.,]+)/i);
    if (m) {
      const toNum = (s) => Number(String(s).replace(/[^\d.-]/g, '')) || 0;
      ef = toNum(m[1]);
      mp = toNum(m[2]);
    }
  }
  const totalPagado =
    methodNorm === 'mixto'
      ? viewEf + viewMp
      : methodNorm === 'transferencia'
        ? Number(total || 0)
        : Number(viewPago || 0);
  const dispatch = useDispatch();
  const [copiado, setCopiado] = useState();
  const [hidden, setHidden] = useState(true);
  const pedidoMap = items.map((item) => item.name);
  const listaItems = pedidoMap.flat();
  const repetidos = [];

  // arriba de donde calculás repetidos2, crea una versión normalizada de items
  const itemsNorm = useMemo(() => {
    // ¿ya viene algún item con "envio"?
    const hasEnvio = items.some((it) => /envio/i.test(String(it?.name || '')));

    // renombra "envio 1" o "envio 2" a "Envío"
    const base = items.map((it) => ({
      ...it,
      name: String(it?.name || '').replace(/^\s*envio\s*\d*/i, 'Envío'),
    }));

    // si es delivery (no "Retiro") y no existe item envío, lo agregamos virtual
    if (direccion !== 'Retiro' && !hasEnvio) {
      base.push({ name: 'Envío', quantity: 1, category: 'Envio' });
    }
    return base;
  }, [items, direccion]);

  const repetidos2 = [];
  listaItems.forEach(function (numero) {
    repetidos[numero] = (repetidos[numero] || 0) + numero;
  });

  itemsNorm.forEach((item) => {
    const q = Number(item?.quantity || 0) || 1;
    repetidos2[item.name] = (repetidos2[item.name] || 0) + q;
  });

  const removeOrder = (id) => {
    dispatch(removeOrderFromBoth({ id }));
  };

  const savePayment = async ({ method, cash, mp }) => {
    try {
      const tot = Number(total) || 0;
      let payload;

      if (method === 'Transferencia') {
        payload = {
          method: 'transferencia',
          pago: tot,
          pagoEfectivo: 0,
          pagoMp: tot,
          pagoDetalle: 'Transferencia',
        };
      } else if (method === 'Efectivo') {
        const ef = Number(cash) || 0;
        if (ef <= 0) {
          alert('El monto en efectivo debe ser mayor a 0.');
          return;
        }
        payload = {
          method: 'efectivo',
          pago: ef,
          pagoEfectivo: ef,
          pagoMp: 0,
          pagoDetalle: `EF $${ef}`,
        };
      } else {
        // Mixto
        const ef = Number(cash) || 0;
        const mpVal = Number(mp) || 0;
        if (ef <= 0 || mpVal <= 0) {
          alert('En Mixto, EF y MP deben ser > 0.');
          return;
        }
        if (ef + mpVal < tot) {
          alert('En Mixto, la suma de EF + MP no puede ser menor al total.');
          return;
        }
        payload = {
          method: 'mixto',
          pago: ef + mpVal,
          pagoEfectivo: ef,
          pagoMp: mpVal,
          pagoDetalle: `EF $${ef} + MP $${mpVal}`,
        };
      }

      // 1) parche optimista
      setLocalPay(payload);
      setViewVersion((v) => v + 1);

      // 2) persistir en PB
      await pb.collection('orders').update(id, payload);

      // 3) opcional refrescar redux
      // dispatch(syncPendingOrders());

      setEditPayOpen(false);
    } catch (e) {
      console.error('Error guardando pago:', e);
      setLocalPay(null); // revertir si falló
      alert('No se pudo guardar el pago.');
    }
  };

  const copyOrder = () => {
    const lines = [];

    // Dirección
    lines.push(`📍 *${direccion}*`);

    // --- PRODUCTOS (excepto extras) ---
    const productosGrouped = items
      .filter(
        (it) =>
          !String(it.category || '')
            .toLowerCase()
            .includes('extra')
      )
      .reduce((acc, it) => {
        const qty = Number(it.quantity) || 0;
        acc[it.name] = (acc[it.name] || 0) + qty;
        return acc;
      }, {});
    const productosLines = Object.entries(productosGrouped).map(([name, qty]) => {
      let baseName = name.trim();
      // Evitar "2 1 Kg" -> "2 Kg"
      if (qty > 1 && /^1\s*kg\b/i.test(baseName)) {
        baseName = baseName.replace(/^1\s*/i, '');
      }
      return qty === 1 ? `• ${baseName}` : `• ${qty} ${baseName}`;
    });
    if (productosLines.length) lines.push(...productosLines);

    // --- EXTRAS (solo vasitos y cucuruchos) ---
    const extrasGrouped = items
      .filter(
        (it) =>
          String(it.category || '')
            .toLowerCase()
            .includes('extra') && /vasito|cucurucho/i.test(it.name) // solo vasitos o cucuruchos
      )
      .reduce((acc, it) => {
        const m = String(it.name).match(/^(\d+)/); // ej "5 Vasitos"
        const base = m ? parseInt(m[1], 10) : 1;
        const units = base * (Number(it.quantity) || 0);
        const label = String(it.name)
          .replace(/^\d+\s*/, '')
          .trim();
        acc[label] = (acc[label] || 0) + units;
        return acc;
      }, {});
    const extrasLines = Object.entries(extrasGrouped).map(
      ([label, totalUnits]) => `• ${totalUnits} ${label}`
    );
    if (extrasLines.length) lines.push(...extrasLines);

    // --- PAGO (usa viewPago/viewEf/viewMp para que sea instantáneo) ---
    if (methodNorm === 'transferencia') {
      lines.push(`💳 Transferencia OK`);
    } else if (methodNorm === 'mixto') {
      const cash = Number(viewEf) || 0;
      const mpAmt = Number(viewMp) || 0;
      const tot = Number(total) || 0;
      const restanteTrasMP = Math.max(tot - mpAmt, 0);
      const cambioDesdeEF = Math.max(cash - restanteTrasMP, 0);

      if (cash > 0) lines.push(`💵 ${formatPrice(cash)}`);
      if (cambioDesdeEF > 0) lines.push(`🔄 ${formatPrice(cambioDesdeEF)}`);
    } else if (methodNorm === 'efectivo' && !isNaN(Number(viewPago))) {
      const cash = Number(viewPago) || 0;
      const tot = Number(total) || 0;
      const change = Math.max(cash - tot, 0);

      lines.push(`💵 ${formatPrice(cash)}`);
      if (change > 0) lines.push(`🔄 ${formatPrice(change)}`);
    }

    navigator.clipboard.writeText(lines.join('\n'));
  };

  const clickBtnCopy = () => {
    copyOrder();
    setCopiado(true);
    setTimeout(() => {
      setCopiado(false);
    }, 1800);
  };

  // timestamp base: primero clientCreatedAt (ms), si no, 'created' (ISO) -> ms
  const createdMs = useMemo(() => {
    if (typeof clientCreatedAt === 'number') return clientCreatedAt;
    if (created) return new Date(created).getTime();
    return Date.now();
  }, [clientCreatedAt, created]);

  const rel = useMemo(() => relativeTimeFrom(createdMs), [createdMs]);
  const extrasCalc = items
    .filter((it) => it.category === 'Extras')
    .map((it) => {
      // buscar número inicial en el nombre, ej: "5 vasitos"
      const match = it.name.match(/^(\d+)/);
      const base = match ? parseInt(match[1], 10) : 1;
      const total = base * it.quantity;
      // devolver el nombre sin el número, ej: "vasitos"
      const label = it.name.replace(/^\d+\s*/, '');
      return `${total} ${label}`;
    });

  // --- Ticket reusable (preview + print) ---
  const Ticket58 = React.forwardRef(
    ({ direccion, itemsNorm, total, pago, ef, mp, totalPagado, formatPrice, logo }, ref) => {
      return (
        <Print
          ref={ref}
          className="ticket58"
          style={{
            width: '40mm', // si te queda angosto, dejalo; si queda chico, probá '48mm'
            maxWidth: '40mm',
            boxSizing: 'border-box',
            margin: 0,
            padding: 0,
            lineHeight: 1.25,
            fontSize: '3.2mm', // ~9pt
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
            <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />

            <img
              src={logo}
              alt="Logo"
              style={{ width: '30mm', height: 'auto', display: 'block', margin: '0 auto' }}
            />
          </div>

          {/* Dirección / Cliente */}
          <div style={{ width: '100%', textAlign: 'center', margin: '1.5mm 0 .8mm' }}>
            <div
              style={{
                fontSize: '3.5mm',
                lineHeight: 1.2,
                maxWidth: '52mm',
                margin: '0 auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontWeight: 700,
              }}
            >
              {direccion || 'Retiro'}
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />

          {/* Tabla de productos */}
          <div style={{ width: '100%', margin: '1.5mm 0' }}>
            <div
              style={{
                display: 'flex',
                fontWeight: 'bold',
                marginBottom: '1mm',
                fontSize: '3.4mm',
              }}
            >
              <span style={{ width: '6mm' }}>#</span>
              <span style={{ flex: 1, textAlign: 'left' }}>Producto</span>
            </div>

            {itemsNorm.map((it, idx) => {
              const cantidad = Number(it?.quantity ?? it?.qty ?? 1);
              const nombre = it?.name || it?.title || it?.label || '';
              const sabores = Array.isArray(it?.sabores) ? it.sabores.filter(Boolean) : [];
              return (
                <div key={idx} style={{ marginBottom: '1mm' }}>
                  <div style={{ display: 'flex', fontSize: '3.4mm' }}>
                    <span style={{ width: '6mm' }}>{cantidad}</span>
                    <span style={{ flex: 1, textAlign: 'left' }}>{nombre}</span>
                  </div>
                  {!!sabores.length && (
                    <div
                      style={{
                        marginLeft: '6mm',
                        marginTop: '.6mm',
                        fontSize: '3mm',
                        fontWeight: 700,
                        textAlign: 'left',
                      }}
                    >
                      {sabores.map((s, i) => (
                        <div key={i}>• {s}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />

          {/* Totales */}
          <TotalPrint>
            <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Total</a>
            <a style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(total)}</a>
          </TotalPrint>

          {pago === 'Mixto' ? (
            <>
              <TotalPrint>
                <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Efectivo</a>
                <a style={{ textAlign: 'right' }}>{formatPrice(ef)}</a>
              </TotalPrint>
              <TotalPrint>
                <a style={{ textAlign: 'left', fontWeight: 'bold' }}>MercadoPago</a>
                <a style={{ textAlign: 'right' }}>{formatPrice(mp)}</a>
              </TotalPrint>
              {totalPagado > total && (
                <TotalPrint>
                  <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Cambio</a>
                  <a style={{ textAlign: 'right' }}>{formatPrice(totalPagado - total)}</a>
                </TotalPrint>
              )}
            </>
          ) : (
            <TotalPrint>
              <a style={{ textAlign: 'left', fontWeight: 'bold' }}>
                {pago === 'Transferencia' ? 'Transferencia' : 'Paga'}
              </a>
              <a style={{ textAlign: 'right' }}>
                {pago === 'Transferencia' ? '' : pago === total ? 'JUSTO' : formatPrice(pago)}
              </a>
            </TotalPrint>
          )}
          <div style={{ borderTop: '1px dashed #000', margin: '24px 0' }} />
        </Print>
      );
    }
  );

  const contentRef = useRef(null);

  const pageStyle = `
  @page { size: 58mm auto; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

  const reactToPrintFn = useReactToPrint({
    contentRef, // 👈 clave para tu versión
    pageStyle,
    removeAfterPrint: false, // deja el nodo montado (más estable)
  });

  return (
    //<ContainerCard style={{border: `2px solid ${check? '#28a745' : '#dc3545'}`}}>
    <ContainerCard
      key={viewVersion}
      style={pending ? { border: '2px dashed orange' } : {}}
      $estado={
        methodNorm === 'mixto'
          ? totalPagado === total
            ? 'justo'
            : totalPagado > total
              ? 'cambio'
              : 'incompleto'
          : methodNorm === 'transferencia'
            ? 'transferencia'
            : Number(viewPago) === Number(total)
              ? 'justo'
              : Number(viewPago) > Number(total)
                ? 'cambio'
                : 'incompleto'
      }
    >
      <TitleCard>
        <span
          style={{
            fontSize: '1.1em',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          #{numeracion}
        </span>
        <Hora>{hora}</Hora>
        <HaceMin title={new Date(createdMs).toLocaleString()}>{rel}</HaceMin>

        {pending && (
          <span
            style={{
              marginLeft: 8,
              padding: '2px 6px',
              fontSize: '0.75em',
              fontWeight: 'bold',
              color: '#fff',
              background: 'orange',
              borderRadius: 4,
            }}
          >
            OFFLINE
          </span>
        )}

        <ContentButtonsTitle>
          {copiado ? (
            <ButtonCopy onClick={clickBtnCopy} style={{ background: '#6528F7', color: '#fff' }}>
              Copiado
            </ButtonCopy>
          ) : (
            <ButtonCopy onClick={clickBtnCopy}>Copiar</ButtonCopy>
          )}

          <ButtonPrint variant="contained" onClick={() => reactToPrintFn()}>
            <PrintIcon />
          </ButtonPrint>

          {/* NUEVO: editar pago */}
          <ButtonTitle onClick={() => setEditPayOpen(true)} title="Editar pago">
            <MdEdit size={16} />
          </ButtonTitle>

          {/* existente: borrar */}
          <ButtonTitle onClick={() => setConfirmOpen(true)} title="Borrar">
            <FaXmark size={16} />
          </ButtonTitle>
        </ContentButtonsTitle>
      </TitleCard>
      <DirCard>
        {direccion === 'Retiro' ? <BiHomeAlt2 size={18} /> : <MapPin size={18} />}
        <Direccion>{direccion}</Direccion>
        <Checkbox
          icon={<ChevronDown />}
          checkedIcon={<ChevronUp />}
          onClick={() => setHidden(!hidden)}
        />
      </DirCard>
      {/* AVISO DE EXTRAS SIEMPRE VISIBLE */}
      {/* AVISO DE EXTRAS SIEMPRE VISIBLE */}
      {/* AVISO DE EXTRAS SIEMPRE VISIBLE */}
      {extrasCalc.length > 0 && (
        <div
          style={{
            margin: '10px 0',
            display: 'flex', // 👈 usa flexbox
            justifyContent: 'flex-start', // 👈 alinea a la izquierda
          }}
        >
          <span
            style={{
              padding: '6px 10px',
              background: '#fff3cd',
              border: '2px solid #ff9800',
              borderRadius: 10,
              fontWeight: 'bold',
              color: '#333',
              fontSize: '0.9rem',
              display: 'inline-block', // 👈 se ajusta al contenido
              whiteSpace: 'nowrap', // 👈 evita que se corte en varias líneas
            }}
          >
            ⚠️ {extrasCalc.join(', ')}
          </span>
        </div>
      )}
      {hidden ? null : (
        <>
          <DivProducts style={{ fontWeight: 'normal' }}>
            <ShoppingBag size={18} />
            <ListProducts style={{ fontSize: '0.9em' }}>
              {itemsNorm.map((it, idx) => {
                const cantidad = Number(it?.quantity ?? 1);
                const nombre = it?.name || '';
                const sabores = Array.isArray(it?.sabores) ? it.sabores.filter(Boolean) : [];

                return (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    <div>
                      {nombre} <a style={{ fontWeight: 'bold' }}>({cantidad})</a>
                    </div>
                    {!!sabores.length && (
                      <div style={{ marginLeft: '12px', fontSize: '0.85em', marginTop: '2px' }}>
                        {sabores.map((s, i) => (
                          <div key={i}>• {s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </ListProducts>
            {/* BLOQUE DESTACADO DE EXTRAS */}
          </DivProducts>
        </>
      )}

      <FooterCard>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* IZQUIERDA: agrupa todas las pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* MIXTO */}
            {methodNorm === 'mixto' && (
              <>
                <span
                  style={{
                    background: '#F1F1F7',
                    borderRadius: 12,
                    padding: '5px 10px',
                    fontSize: '0.9em',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <BsCash size="1.1em" style={{ marginRight: '0.4em' }} /> {formatPrice(viewEf)}
                </span>

                {totalPagado === total && (
                  <span
                    style={{
                      background: '#28a745',
                      color: '#fff',
                      borderRadius: 12,
                      padding: '5px 10px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                    }}
                  >
                    Paga justo
                  </span>
                )}
                {totalPagado > total && (
                  <span
                    style={{
                      background: '#ffc107',
                      color: '#000',
                      borderRadius: 12,
                      padding: '5px 10px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FaExchangeAlt size="1.1em" style={{ marginRight: '0.4em' }} />{' '}
                    {formatPrice(totalPagado - total)}
                  </span>
                )}
                {totalPagado < total && (
                  <span
                    style={{
                      background: '#ff6961',
                      color: '#fff',
                      borderRadius: 12,
                      padding: '5px 10px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                    }}
                  >
                    Falta {formatPrice(total - totalPagado)}
                  </span>
                )}
              </>
            )}

            {/* EFECTIVO SIMPLE */}
            {methodNorm === 'efectivo' && !isNaN(Number(viewPago)) && Number(viewPago) > 0 && (
              <>
                <span
                  style={{
                    background: '#F1F1F7',
                    borderRadius: 12,
                    padding: '5px 10px',
                    fontSize: '1em',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <BsCash size="1.1em" style={{ marginRight: '0.4em' }} />{' '}
                  {formatPrice(Number(viewPago))}
                </span>

                {/* cambio pegado a la pill de efectivo */}
                {Number(viewPago) > total && (
                  <span
                    style={{
                      background: '#ffc107',
                      color: '#000',
                      borderRadius: 12,
                      padding: '5px 10px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                    }}
                  >
                    🔄 {formatPrice(Number(viewPago) - total)}
                  </span>
                )}

                {/* falta/justo en la misma fila */}
                {Number(viewPago) < total && (
                  <span
                    style={{
                      background: '#ff6961',
                      color: '#fff',
                      borderRadius: 12,
                      padding: '5px 10px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                    }}
                  >
                    Falta {formatPrice(total - Number(viewPago))}
                  </span>
                )}
                {Number(viewPago) === total && (
                  <span
                    style={{
                      background: '#28a745',
                      color: 'white',
                      borderRadius: 12,
                      padding: '5px 10px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                    }}
                  >
                    💵 Paga justo
                  </span>
                )}
              </>
            )}

            {/* TRANSFERENCIA */}
            {methodNorm === 'transferencia' && (
              <span
                style={{
                  background: '#007bff',
                  color: 'white',
                  borderRadius: 12,
                  padding: '5px 10px',
                  fontSize: '0.9em',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                💳 Transferencia
              </span>
            )}
          </div>

          {/* DERECHA: total */}
          <span style={{ fontWeight: '800', fontSize: '1.2em' }}>{formatPrice(total)}</span>
        </div>
      </FooterCard>
      {/* PRINT AREA — SIEMPRE montada, fuera de pantalla (no display:none) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '-10000px',
          zIndex: -1,
          background: '#fff',
        }}
      >
        <Ticket58
          ref={contentRef}
          direccion={direccion}
          itemsNorm={itemsNorm}
          total={total}
          pago={ticketPago}
          ef={ef}
          mp={mp}
          totalPagado={totalPagado}
          formatPrice={formatPrice}
          logo={logo}
        />
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div style={{ border: '1px solid #ccc', marginTop: 10, padding: 8, background: '#fff' }}>
          <h4>Vista previa ticket (58mm)</h4>
          <Ticket58
            direccion={direccion}
            itemsNorm={itemsNorm}
            total={total}
            pago={ticketPago}
            ef={ef}
            mp={mp}
            totalPagado={totalPagado}
            formatPrice={formatPrice}
            logo={logo}
          />
        </div>
      )}
      <PaymentEditor
        open={editPayOpen}
        onClose={() => setEditPayOpen(false)}
        onSave={savePayment}
        initial={{
          method:
            methodNorm === 'mixto'
              ? 'Mixto'
              : methodNorm === 'transferencia'
                ? 'Transferencia'
                : 'Efectivo',
          ef: Number(viewEf || 0),
          mp: Number(viewMp || 0),
        }}
        orderTotal={Number(total) || 0} // 👈 NUEVO
      />

      <ConfirmOverlay
        open={confirmOpen}
        onConfirm={() => {
          removeOrder(id);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </ContainerCard>
  );
};

// rollover (cada 1 min) con el mismo CUTOFF_HOUR
const CUTOFF_HOUR = 3;
function getBusinessDayKey(date = new Date()) {
  const d = new Date(date);
  if (d.getHours() < CUTOFF_HOUR) d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function Orders() {
  const dispatch = useDispatch();
  const unsubRef = useRef(null);
  const { orders } = useSelector((s) => s.orders);

  // Hidratar al entrar
  useEffect(() => {
    // No limpiar si querés ver lo persistido offline.
    if (navigator.onLine) {
      dispatch(hydrateOrdersFromPocket());
    }
  }, [dispatch]);

  // Suscripción realtime al montar (una sola)
  useEffect(() => {
    unsubRef.current = dispatch(subscribeOrdersRealtime());
    return () => {
      if (typeof unsubRef.current === 'function') unsubRef.current();
    };
  }, [dispatch]);

  // Reintentar pendings cuando vuelve la conexión y al montar (si ya hay internet)
  useEffect(() => {
    const handleOnline = () => dispatch(syncPendingOrders());
    window.addEventListener('online', handleOnline);
    if (navigator.onLine) dispatch(syncPendingOrders());
    return () => window.removeEventListener('online', handleOnline);
  }, [dispatch]);

  const sortedOrders = [...orders].sort((a, b) => {
    const ta = a.clientCreatedAt ?? new Date(a.created ?? 0).getTime();
    const tb = b.clientCreatedAt ?? new Date(b.created ?? 0).getTime();
    return tb - ta; // descendente
  });

  // rollover (cada 1 min)
  useEffect(() => {
    const doRolloverIfNeeded = () => {
      const nowKey = getBusinessDayKey();
      const lastKey = localStorage.getItem('orders_business_day');
      if (lastKey && lastKey !== nowKey) {
        // Nuevo día: limpiá y tratá de hidratar si hay conexión
        dispatch(clearOrders());
        if (navigator.onLine) dispatch(hydrateOrdersFromPocket());
      }
      localStorage.setItem('orders_business_day', nowKey);
    };
    doRolloverIfNeeded();
    const t = setInterval(doRolloverIfNeeded, 60 * 1000);
    return () => clearInterval(t);
  }, [dispatch]);

  return (
    <GlobalOrders>
      <ContainerOrders>
        {orders.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            <img
              src={logoPixel} // 👉 poné un ícono tuyo (ej: una caja vacía o tu logo pixel)
              alt="Sin pedidos"
              style={{ width: 120, height: 'auto', marginBottom: 20, opacity: 0.8 }}
            />
            <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 8, color: '#333' }}>
              No hay pedidos por ahora
            </h2>
            <p style={{ fontSize: '1rem', opacity: 0.8 }}>
              Cuando lleguen, aparecerán acá automáticamente.
            </p>
          </div>
        ) : (
          orders.map((o, i) => (
            <CardOrders key={o.id || i} {...o} index={i} numeracion={sortedOrders.length - i} />
          ))
        )}
      </ContainerOrders>
    </GlobalOrders>
  );
}

//export default Orders
