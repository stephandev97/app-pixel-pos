import PrintIcon from '@mui/icons-material/Print';
import Checkbox from '@mui/material/Checkbox';
import { useEffect, useMemo, useState, useCallback } from 'react';
import React, { useRef } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'react-feather';
import { BiHomeAlt2 } from 'react-icons/bi';
import { BsCash } from 'react-icons/bs';
import { FaExchangeAlt } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { HiCheck, HiX } from 'react-icons/hi';
import { MdEdit } from 'react-icons/md';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useDispatch, useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import { computeBusinessDate } from '../../utils/stats';

import logoPixel from '../../assets/logoprint.png';
import mpLogoWhite from '../../assets/mercadopagowhite.png';
import {
  hydrateOrdersFromPocket,
  removeOrderFromBoth,
  subscribeOrdersRealtime,
  syncPendingOrders,
  fetchMoreOrders,
  upsertOrder,
} from '../../redux/orders/ordersSlice';
import { pb, ensureServiceAuth } from '../../lib/pb';
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
  ListProducts,
  Print,
  TitleCard,
  TotalPrint,
  LoadMoreButton,
} from './OrdersStyles';
import { Banknote, CreditCard, Logs, Search, TriangleAlert, ArrowUp } from 'lucide-react';

// Agrega esto en tu archivo Orders.js
const ticketStyles = {
  container: {
    width: "280px",      // Ancho ideal para 58mm
    padding: "0",
    margin: "0",
    fontSize: "12px",    // Tamaño de fuente legible para térmica
    fontFamily: "monospace", // Las térmicas aman las fuentes monoespaciadas
    backgroundColor: "white",
    color: "black"
  }
};


const SCAN_MAP = {
  y: "0",
  "9": "1",
  w: "2",
  e: "3",
  r: "4",
  t: "5",
  "1": "6",
  "2": "7",
  k: "8",
  l: "9",
};

function normalizeScan(raw) {
  if (!raw) return "";

  const cleaned = raw.trim().toLowerCase();

  // Si ya es numérico puro, no tocar
  if (/^\d+$/.test(cleaned)) {
    return cleaned;
  }

  let fixed = "";
  for (const ch of cleaned) {
    if (/\d/.test(ch)) {
      fixed += ch;
    } else if (SCAN_MAP[ch]) {
      fixed += SCAN_MAP[ch];
    }
  }

  return fixed;
}


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
    background: '#111',
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
    position: 'relative',
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
    border: `1px solid ${hasError ? '#ff4d4d' : '#2e2e2e'}`,
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

        <div style={pills}>
          {['Efectivo', 'Transferencia', 'Mixto'].map((m) => (
            <button key={m} onClick={() => setMethod(m)} style={pillBtn(method === m)}>
              {m}
            </button>
          ))}
        </div>

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
            borderRadius: '12',
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
  client,
  points,
  pointsClaimed,
  showDevTicketPreview,
  copied,
  pagoDebito,
}) => {

  const isLinux = navigator.userAgent.toLowerCase().includes('linux');
 


  const [editPayOpen, setEditPayOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [localPay, setLocalPay] = useState(null);
  const [viewVersion, setViewVersion] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkId, setLinkId] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');
  const [clientPreview, setClientPreview] = useState(null);
  const [clientPreviewError, setClientPreviewError] = useState('');
  const lastLookupRef = useRef(0);
  const viewPago = localPay?.pago ?? pago;
  const viewEf = localPay?.pagoEfectivo ?? Number(pagoEfectivo || 0);
  const viewMp = localPay?.pagoMp ?? Number(pagoMp || 0);
  const viewDb = localPay?.pagoDebito ?? Number(pagoDebito || 0);

  const methodNorm = String(localPay?.method ?? method ?? '').toLowerCase();

  const isRetiro =
    String(direccion || '')
      .trim()
      .toLowerCase() === 'retiro';

  let ef = Number(pagoEfectivo || 0);
  let mp = Number(pagoMp || 0);

  const ticketPago =
    methodNorm === 'mixto'
      ? 'Mixto'
      : methodNorm === 'transferencia'
        ? 'Transferencia'
        : methodNorm === 'debito'
          ? 'Débito'
          : viewPago;
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
        : methodNorm === 'debito'
          ? Number(viewDb) || Number(total || 0)
          : Number(viewPago || 0);
  const dispatch = useDispatch();
  const [copiado, setCopiado] = useState();
  const [hidden, setHidden] = useState(() => {
    const saved = localStorage.getItem(`order-hidden-${id}`);
    return saved === 'true'; // default: false
  });
  const pedidoMap = items.map((item) => item.name);
  const listaItems = pedidoMap.flat();
  const repetidos = [];

  const itemsNorm = useMemo(() => {
    const hasEnvio = items.some((it) => /envio/i.test(String(it?.name || '')));
    const base = items.map((it) => ({
      ...it,
      name: String(it?.name || '').replace(/^\s*envio\s*\d*/i, 'Envío'),
    }));

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

  function onScan(rawValue) {
  const code = normalizeScan(rawValue);

  console.log("RAW:", rawValue);
  console.log("FIXED:", code);

}

  // Reset de input/preview al cerrar el modal
  useEffect(() => {
    if (!linkOpen) {
      setLinkId('');
      setLinkMsg('');
      setClientPreview(null);
      setClientPreviewError('');
    }
  }, [linkOpen]);

  // Lookup de cliente para previsualizar nombre/dni al escanear/pegar
  useEffect(() => {
    if (!linkOpen) {
      setClientPreview(null);
      setClientPreviewError('');
      return;
    }
    const trimmed = normalizeScan(linkId);
    if (!trimmed) {
      setClientPreview(null);
      setClientPreviewError('');
      return;
    }

    const lookupId = Date.now();
    lastLookupRef.current = lookupId;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        await ensureServiceAuth();
        const safeVal = trimmed.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const list = await pb.collection('clients').getList(1, 1, {
          filter: `qrCodeValue = "${safeVal}" || qrCodeValue ~ "${safeVal}"`,
          signal: controller.signal,
        });
        if (lastLookupRef.current !== lookupId) return;
        const rec = list?.items?.[0] || null;
        if (!rec) {
          setClientPreview(null);
          setClientPreviewError('Cliente no encontrado');
          return;
        }
        const name =
          `${rec.name || ''} ${rec.surname || ''}`.trim() || rec.name || rec.email || rec.id;
        const dni = rec.dni || rec.document || rec.documento || '';
        setClientPreview({ name, dni, email: rec.email });
        setClientPreviewError('');
      } catch (err) {
        if (controller.signal.aborted) return;
        if (lastLookupRef.current !== lookupId) return;
        setClientPreview(null);
        if (err?.status === 404) setClientPreviewError('Cliente no encontrado');
        else setClientPreviewError('No se pudo buscar cliente');
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [linkId, linkOpen]);

  const removeOrder = (id) => {
    dispatch(removeOrderFromBoth({ id }));
  };

  const toggleHidden = () => {
    setHidden((prev) => {
      localStorage.setItem(`order-hidden-${id}`, String(!prev));
      return !prev;
    });
  };

  const handleLinkClient = async () => {
    setClientPreviewError('');
    if (pointsClaimed) {
      setLinkMsg('Los puntos ya fueron reclamados para este pedido.');
      return;
    }
    try {
      if (pending) {
        alert('No se puede vincular mientras el pedido est� offline.');
        return;
      }
      // solo retiro
      if (
        String(direccion || '')
          .trim()
          .toLowerCase() !== 'retiro'
      ) {
        alert('Solo se pueden sumar puntos en pedidos de retiro.');
        return;
      }
      const trimmed = linkId.trim();
      if (!trimmed) {
        setLinkMsg('Escane�/peg� el c�digo QR del cliente.');
        return;
      }
      setLinkLoading(true);
      setLinkMsg('');

      // asegurar sesi��n de servicio antes de consultar PB
      try {
        const authModel = await ensureServiceAuth();
        if (!pb.authStore.isValid) {
          setLinkMsg('No se pudo iniciar sesi�n de servicio (revis� variables y reglas).');
          return;
        }
        console.info('[link-client] autenticado como', authModel?.email || authModel?.id);
      } catch (authErr) {
        console.error('No se pudo autenticar service user', authErr);
        if (authErr?.message === 'missing-service-env') {
          setLinkMsg('Faltan variables REACT_APP_PB_SERVICE_EMAIL / PASS (reinicia la app).');
        } else if (authErr?.message === 'service-auth-failed') {
          setLinkMsg('Login del servicio fall��: revis� email/pass o crea el usuario/admin en PB.');
        } else {
          setLinkMsg('No se pudo autenticar servicio. Revis� email/pass y reglas en PB.');
        }
        return;
      }

      // buscar cliente por qrCodeValue (escapando) o por ID directo como fallback
      const safeVal = trimmed.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      let clientRec = null;
      try {
        const list = await pb.collection('clients').getList(1, 1, {
          filter: `qrCodeValue = "${safeVal}" || qrCodeValue ~ "${safeVal}"`,
        });
        clientRec = list?.items?.[0] || null;
      } catch (e) {
        if (e?.status !== 404) throw e;
      }
      if (!clientRec) {
        setLinkMsg('No se encontr� un cliente con ese c�digo QR.');
        return;
      }

      const currentBalance = Number(clientRec?.pointsBalance || 0);

      const pts = Math.floor(Number(total || 0) / 1100);

      await pb.collection('clients').update(clientRec.id, {
        pointsBalance: currentBalance + pts,
      });

      await pb.collection('orders').update(id, {
        client: clientRec.id,
        points: pts,
        pointsClaimed: true,
      });

      dispatch(
        upsertOrder({
          id,
          client: clientRec.id,
          points: pts,
          pointsClaimed: true,
        })
      );

      setLinkMsg(`Cliente vinculado. Se sumaron ${pts} puntos.`);
      setLinkId('');
      setLinkOpen(false);
    } catch (e) {
      console.error('Error vinculando cliente:', e);
      const reason = e?.message || e?.data?.message || '';
      setLinkMsg(`No se pudo vincular. ${reason}`);
    } finally {
      setLinkLoading(false);
    }
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

      setLocalPay(payload);
      setViewVersion((v) => v + 1);

      await pb.collection('orders').update(id, payload);

      setEditPayOpen(false);
    } catch (e) {
      console.error('Error guardando pago:', e);
      setLocalPay(null);
      alert('No se pudo guardar el pago.');
    }
  };

  const copyOrder = () => {
    const lines = [];

    lines.push(`📍 *${direccion}*`);

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
      if (qty > 1 && /^1\s*kg\b/i.test(baseName)) {
        baseName = baseName.replace(/^1\s*/i, '');
      }
      return qty === 1 ? `• ${baseName}` : `• ${qty} ${baseName}`;
    });
    if (productosLines.length) lines.push(...productosLines);

    const extrasGrouped = items
      .filter(
        (it) =>
          String(it.category || '')
            .toLowerCase()
            .includes('extra') && /vasito|cucurucho/i.test(it.name)
      )
      .reduce((acc, it) => {
        const m = String(it.name).match(/^(\d+)/);
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

  const clickBtnCopy = async () => {
    copyOrder();
    setCopiado(true);

    try {
      await pb.collection('orders').update(id, { copied: true });

      // Traer el registro completo (con businessDate, etc.)
      await pb.collection('orders').update(id, { copied: true });

      // actualizar Redux sin depender del realtime
      dispatch(upsertOrder({ id, copied: true }));
    } catch (e) {
      console.error('Error actualizando copied:', e);
    }

    setTimeout(() => setCopiado(false), 1800);
  };

  const createdMs = useMemo(() => {
    if (typeof clientCreatedAt === 'number') return clientCreatedAt;
    if (created) return new Date(created).getTime();
    return Date.now();
  }, [clientCreatedAt, created]);

  const rel = useMemo(() => relativeTimeFrom(createdMs), [createdMs]);
  const extrasCalc = items
    .filter((it) => it.category === 'Extras')
    .map((it) => {
      const match = it.name.match(/^(\d+)/);
      const base = match ? parseInt(match[1], 10) : 1;
      const total = base * it.quantity;
      const label = it.name.replace(/^\d+\s*/, '');
      return `${total} ${label}`;
    });

  const Ticket58 = React.forwardRef(
    ({ direccion, itemsNorm, total, pago, ef, mp, totalPagado, formatPrice, logo }, ref) => {
      return (
        <Print
          ref={ref}
          className="ticket58"
          style={{
            width: '48mm',
            maxWidth: '48mm',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '0 2mm',
            boxSizing: 'border-box',
            lineHeight: 1.25,
            fontSize: '3.2mm',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
            <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />

            <img
              src={logo}
              alt="Logo"
              style={{ width: '30mm', height: 'auto', display: 'block', margin: '0 auto' }}
            />
          </div>

          <div style={{ width: '100%', textAlign: 'center', margin: '1.5mm 0 .8mm' }}>
            <div
              style={{
                fontSize: '3.5mm',
                lineHeight: 1.2,
                maxWidth: '100%',
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
@page {
  margin: 0;
}
@media print {
  html, body {
    width: 48mm;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;



  const [isPrinting, setIsPrinting] = useState(false);

  const _reactToPrint = useReactToPrint({
    content: () => contentRef.current,
    pageStyle,
    removeAfterPrint: false,
    onBeforePrint: async () => {
      if (!isLinux) setIsPrinting(true);

      if (document.fonts?.ready) await document.fonts.ready;

      const root = contentRef.current;
      if (root) {
        const imgs = Array.from(root.querySelectorAll('img'));
        await Promise.all(
          imgs.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((res) => {
                img.onload = res;
                img.onerror = res;
              })
          )
        );
      }

      await new Promise((r) => requestAnimationFrame(r));
    },
    onAfterPrint: () => {
      if (!isLinux) setIsPrinting(false);
    },
    onPrintError: () => {
      if (!isLinux) setIsPrinting(false);
    },
  });

  // En Linux lo anulamos completamente
  const reactToPrintFn = isLinux ? () => { } : _reactToPrint;


  const handlePrint = async () => {
    if (isPrinting) return;

    const el = contentRef.current;
    if (!el) return;

    setIsPrinting(true);

    try {
      // juntamos TODOS los estilos runtime (styled-components)
      const styles = Array.from(document.querySelectorAll('style'))
        .map(s => s.outerHTML)
        .join('\n');

      const html = `
<!DOCTYPE html>
<html>
  <head>
    ${styles}
    <style>
      @page { margin: 0; }
      html, body {
        width: 48mm;
        margin: 0;
        padding: 0;
        background: white;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    </style>
  </head>
  <body>
    ${el.outerHTML}
  </body>
</html>
`;

      if (isLinux && window.electron?.ipcRenderer) {
        // ⏳ espera REAL hasta que termina de imprimir
        await window.electron.ipcRenderer.invoke('print-ticket', html);
      } else {
        // Windows / navegador
        await reactToPrintFn?.();
      }
    } catch (err) {
      console.error('Error al imprimir:', err);
    } finally {
      setIsPrinting(false);
    }
  };



  const groupedItems = useMemo(() => {
    const map = {};

    itemsNorm.forEach((it) => {
      const saboresKey = (it.sabores || []).join('|');
      const key = `${it.name}__${saboresKey}`;

      if (!map[key]) {
        map[key] = {
          ...it,
          quantity: Number(it.quantity || 1),
        };
      } else {
        map[key].quantity += Number(it.quantity || 1);
      }
    });

    return Object.values(map);
  }, [itemsNorm]);

  return (
    <ContainerCard
      key={viewVersion}
      style={pending ? { border: '2px dashed orange' } : {}}
      $pulse={copiado}
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
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          #{numeracion}
          {copied && (
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 900,
                background: '#23a76d',
                color: '#fff',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginLeft: 10,
              }}
            >
              ✓ Enviado
            </span>
          )}
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
          {!pointsClaimed &&
            String(direccion || '')
              .trim()
              .toLowerCase() === 'retiro' && (
              <ButtonTitle onClick={() => setLinkOpen(true)} title="Vincular cliente (QR)">
                <QrCodeScannerIcon fontSize="small" />
              </ButtonTitle>
            )}
          {/* Botón Copiar (solo si NO es retiro) */}
          {!isRetiro && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {copiado ? (
                <ButtonCopy onClick={clickBtnCopy} style={{ background: '#6528F7', color: '#fff' }}>
                  Copiado
                </ButtonCopy>
              ) : (
                <ButtonCopy onClick={clickBtnCopy}>Copiar</ButtonCopy>
              )}
            </div>
          )}

          <ButtonPrint
            variant="contained"
            disabled={isPrinting}
            onClick={handlePrint}
          >
            <PrintIcon />
          </ButtonPrint>

          <ButtonTitle onClick={() => setEditPayOpen(true)} title="Editar pago">
            <MdEdit size={16} />
          </ButtonTitle>

          <ButtonTitle onClick={() => setConfirmOpen(true)} title="Borrar">
            <FaXmark size={16} />
          </ButtonTitle>
        </ContentButtonsTitle>
      </TitleCard>
      <DirCard>
        {direccion === 'Retiro' ? <BiHomeAlt2 size={18} /> : <MapPin size={18} />}
        <Direccion>{direccion}</Direccion>
        <Checkbox icon={<ChevronDown />} checkedIcon={<ChevronUp />} onClick={toggleHidden} />
      </DirCard>
      {extrasCalc.length > 0 && (
        <div
          style={{
            margin: '10px 0',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <span
            style={{
              padding: '6px 10px',
              background: '#fff3cd',
              border: '2px solid #ff9800',
              borderRadius: 10,
              fontWeight: '900',
              color: '#333',
              fontSize: '0.9rem',
              display: 'flex',
              whiteSpace: 'nowrap',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <TriangleAlert size={18} /> {extrasCalc.join(', ')}
          </span>
        </div>
      )}
      {hidden ? null : (
        <>
          {/* Productos: integrado tipo footer */}
          <div style={{ margin: '0px 0 14px 0' }}>
            <div
              style={{
                background: '#fcfcfcff', // similar a footer
                borderRadius: 16,
                padding: '12px 14px',
                border: '1px solid rgba(0, 0, 0, 0.40)',
                fontFamily: "'JetBrains Mono', monospace",
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}
            >
              {/* Header mini */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                }}
              ></div>

              {/* Lista */}
              <div style={{ display: 'grid', gap: 8, fontSize: '0.90rem' }}>
                <div style={{ display: 'grid', gap: 6, fontSize: '0.92rem' }}>
                  {/* Header tipo ticket */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 52px 90px',
                      gap: 10,
                      fontWeight: 900,
                      opacity: 0.65,
                      fontSize: 12,
                      paddingBottom: 6,
                      borderBottom: '1px dashed rgba(0,0,0,0.25)',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>Producto</div>
                    <div style={{ textAlign: 'center' }}>Cant</div>
                    <div style={{ textAlign: 'center' }}>$</div>
                  </div>

                  {groupedItems.map((it, idx) => {
                    const cantidad = it.quantity;
                    const nombre = it.name;
                    // si en tus items existe price, total, subtotal, etc, lo tomamos
                    const unitPrice = Number(it?.price ?? it?.unitPrice ?? it?.precio ?? 0) || 0;

                    const lineTotal =
                      Number(it?.total ?? it?.subtotal ?? 0) ||
                      (unitPrice ? unitPrice * cantidad : 0);

                    const sabores = Array.isArray(it?.sabores) ? it.sabores.filter(Boolean) : [];

                    return (
                      <div key={idx} style={{ display: 'grid', gap: 3 }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 60px 90px',
                            gap: 10,
                            alignItems: 'baseline',
                          }}
                        >
                          {/* Producto */}
                          <div style={{ fontWeight: 800, lineHeight: 1.15, textAlign: 'left' }}>
                            {nombre}
                          </div>

                          {/* Cantidad */}
                          <div style={{ textAlign: 'center', fontWeight: 900, opacity: 0.85 }}>
                            {cantidad}
                          </div>

                          {/* Precio */}
                          <div style={{ textAlign: 'center', fontWeight: 900 }}>
                            {lineTotal ? formatPrice(lineTotal) : '—'}
                          </div>
                        </div>

                        {/* Sabores abajo, como subticket */}
                        {!!sabores.length && (
                          <div
                            style={{
                              marginLeft: 0,
                              paddingLeft: 10,
                              borderLeft: '2px solid rgba(0,0,0,0.08)',
                              opacity: 0.85,
                              fontSize: 12,
                              fontWeight: 800,
                              display: 'grid',
                              gap: 2,
                              textAlign: 'left',
                              margin: '4px 0',
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
              </div>
            </div>
          </div>
        </>
      )}

      <FooterCard>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            rowGap: 12,
            columnGap: 12,
            alignItems: 'center',
            padding: '10px 25px',
          }}
        >
          {/* Fila 1 */}
          <div style={{ opacity: 0.75, fontWeight: 700, justifySelf: 'start', textAlign: 'left' }}>
            Total
          </div>
          <div style={{ fontWeight: 900, fontSize: '1em', textAlign: 'right' }}>
            {formatPrice(total)}
          </div>

          {/* Fila 2 */}
          <div style={{ opacity: 0.75, fontWeight: 700, justifySelf: 'start', textAlign: 'left' }}>
            {isRetiro ? 'Pagó' : 'Paga'}
          </div>

          {(() => {
            const tot = Number(total) || 0;

            // EFECTIVO
            if (methodNorm === 'efectivo') {
              const paid = Number(viewPago) || 0;
              const change = Math.max(0, paid - tot);

              return (
                <div
                  style={{
                    justifySelf: 'end',
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    textAlign: 'right',
                  }}
                >
                  {/* Badge: total abonado */}
                  <span
                    style={{
                      color: '#2f965cff',
                      borderRadius: 999,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                      textAlign: 'right',
                    }}
                  >
                    {isRetiro ? 'Efectivo' : formatPrice(paid)}
                  </span>
                </div>
              );
            }

            // DÉBITO
            if (methodNorm === 'debito') {
              return (
                <div style={{ justifySelf: 'end', textAlign: 'right' }}>
                  <span
                    style={{
                      color: '#7322a8ff',
                      borderRadius: 999,
                      fontSize: 15,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                      textAlign: 'right',
                    }}
                  >
                    Débito
                  </span>
                </div>
              );
            }

            // TRANSFERENCIA
            if (methodNorm === 'transferencia') {
              return (
                <div style={{ justifySelf: 'end', textAlign: 'right' }}>
                  <span
                    style={{
                      color: '#1e6cff',
                      borderRadius: 999,
                      fontSize: 15,
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      textAlign: 'right',
                    }}
                  >
                    Transferencia
                  </span>
                </div>
              );
            }

            // MIXTO (mostrar detalle EF + MP, sin decir "Mixto")
            const cash = Number(viewEf) || 0;
            const mpAmt = Number(viewMp) || 0;

            return (
              <div style={{ justifySelf: 'end', textAlign: 'right' }}>
                <span
                  style={{
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    alignItems: 'center',
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      color: '#2f965cff',
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Banknote size={20} /> {formatPrice(cash)}
                  </span>
                  <span style={{ opacity: 0.6 }}> + </span>
                  <span
                    style={{
                      color: '#1e6cff',
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <CreditCard size={18} /> {formatPrice(mpAmt)}
                  </span>
                </span>
              </div>
            );
          })()}

          {/* Fila 3: Cambio (solo si corresponde) */}
          {(() => {
            const tot = Number(total) || 0;

            if (methodNorm === 'efectivo') {
              const paid = Number(viewPago) || 0;
              const change = Math.max(0, paid - tot);
              if (change <= 0) return null;

              return (
                <>
                  <div
                    style={{
                      opacity: 0.75,
                      fontWeight: 700,
                      justifySelf: 'start',
                      textAlign: 'left',
                    }}
                  >
                    Cambio
                  </div>
                  <div
                    style={{
                      fontWeight: 900,
                      color: '#c0392b',
                      textAlign: 'right',
                      justifySelf: 'end',
                    }}
                  >
                    {formatPrice(change)}
                  </div>
                </>
              );
            }

            if (methodNorm === 'mixto') {
              const cash = Number(viewEf) || 0;
              const mpAmt = Number(viewMp) || 0;

              // Cambio real: lo que sobra del efectivo después de cubrir lo que no cubrió MP
              const restanteTrasMP = Math.max(tot - mpAmt, 0);
              const change = Math.max(cash - restanteTrasMP, 0);

              if (change <= 0) return null;

              return (
                <>
                  <div
                    style={{
                      opacity: 0.75,
                      fontWeight: 700,
                      justifySelf: 'start',
                      textAlign: 'left',
                    }}
                  >
                    Cambio
                  </div>
                  <div
                    style={{
                      fontWeight: 900,
                      color: '#c0392b',
                      textAlign: 'right',
                      justifySelf: 'end',
                    }}
                  >
                    {formatPrice(change)}
                  </div>
                </>
              );
            }

            return null;
          })()}
        </div>
      </FooterCard>

      <div
        id="ticket-root"
        style={{
          position: 'fixed',
          top: 0,
          left: '0',
          transform: 'translateX(-100%)',
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
      {process.env.NODE_ENV === 'development' && showDevTicketPreview && (
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
        orderTotal={Number(total) || 0}
      />

      <ConfirmOverlay
        open={confirmOpen}
        onConfirm={() => {
          removeOrder(id);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      {linkOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLinkOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 420,
              padding: '20px 22px',
              height: 'auto',
              boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              overflow: 'hidden',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'inherit' }}>
              Pedido #{numeracion} - Vincular QR
            </div>
            <div style={{ fontSize: '0.9rem', color: '#444', fontFamily: 'inherit' }}>
              Escanea el QR (pega el ID) para sumar puntos al cliente.
            </div>
            <input
  autoFocus
  placeholder="ID del cliente"
  value={linkId}
  onChange={(e) => setLinkId(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      const fixed = normalizeScan(linkId);

      console.log("RAW SCAN:", linkId);
      console.log("FIXED SCAN:", fixed);

if (fixed.length === 6) {
  setLinkId(fixed);
  handleLinkClient();
}

      setLinkId("");
    }
  }}
  style={{
    width: "100%",
    padding: "16px 18px",
    borderRadius: 14,
    border: "1px solid #ddd",
    fontSize: "1rem",
    fontFamily: "inherit",
  }}
/>
            {clientPreview && (
              <div
                style={{
                  fontSize: '1rem',
                  color: '#111',
                  background: '#f6f6f6',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid #e5e5e5',
                }}
              >
                {clientPreview.name && (
                  <div>
                    Nombre: <strong>{clientPreview.name}</strong>
                  </div>
                )}
                {clientPreview.dni && (
                  <div>
                    DNI: <strong>{clientPreview.dni}</strong>
                  </div>
                )}
              </div>
            )}
            {!clientPreview && clientPreviewError && (
              <div
                style={{
                  fontSize: '0.95rem',
                  color: '#d32f2f',
                  background: '#fde8e8',
                  padding: 10,
                  borderRadius: 10,
                  border: '1px solid #f6cfd0',
                }}
              >
                {clientPreviewError}
              </div>
            )}
            {pointsClaimed && (
              <div
                style={{
                  fontSize: '1rem',
                  color: '#8a6d3b',
                  background: '#fff3cd',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid #f0d58c',
                }}
              >
                Puntos ya reclamados para este pedido.
              </div>
            )}
            <div
              style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 'auto' }}
            >
              <button
                onClick={() => setLinkOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #ccc',
                  background: '#f7f7f7',
                  cursor: 'pointer',
                  minWidth: 120,
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLinkClient}
                disabled={linkLoading}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#111',
                  color: '#fff',
                  cursor: 'pointer',
                  minWidth: 140,
                  fontSize: '1rem',
                  opacity: linkLoading ? 0.7 : 1,
                  fontFamily: 'inherit',
                }}
              >
                {linkLoading ? 'Guardando...' : 'Vincular'}
              </button>
            </div>
            {linkMsg && (
              <div style={{ fontSize: '1rem', color: '#d32f2f', marginTop: 4 }}>{linkMsg}</div>
            )}
          </div>
        </div>
      )}
    </ContainerCard>
  );
};

export default function Orders() {
  const dispatch = useDispatch();
  const unsubRef = useRef(null);
  const { orders, pagination, status } = useSelector((s) => s.orders);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const isLoadingMore = status === 'loadingMore';

  const scrollRef = useRef(null); // contenedor scrolleable
  const lastScrollTopRef = useRef(0); // último scrollTop

  const [hideTopBar, setHideTopBar] = useState(false); // oculta búsqueda+filtros
  const [showToTop, setShowToTop] = useState(false); // muestra botón ↑

  const hideTopBarRef = useRef(false);

  useEffect(() => {
    hideTopBarRef.current = hideTopBar;
  }, [hideTopBar]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const TOP_LOCK = 60; // arriba de esto siempre visible
    const DELTA_HIDE = 6; // bajar poquito => ocultar
    const DELTA_SHOW = 12; // subir claro => mostrar

    const onScroll = () => {
      const st = el.scrollTop;
      const last = lastScrollTopRef.current || 0;
      const delta = st - last;

      setShowToTop(st > 350);

      // cerca del top: siempre visible
      if (st <= TOP_LOCK) {
        if (hideTopBarRef.current) {
          hideTopBarRef.current = false;
          setHideTopBar(false);
        }
        lastScrollTopRef.current = st;
        return;
      }

      // bajando: ocultar
      if (delta > DELTA_HIDE) {
        if (!hideTopBarRef.current) {
          hideTopBarRef.current = true;
          setHideTopBar(true);
        }
        lastScrollTopRef.current = st;
        return;
      }

      // subiendo: mostrar
      if (delta < -DELTA_SHOW) {
        if (hideTopBarRef.current) {
          hideTopBarRef.current = false;
          setHideTopBar(false);
        }
        lastScrollTopRef.current = st;
        return;
      }

      lastScrollTopRef.current = st;
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: 'smooth' });
    hideTopBarRef.current = false;
    setHideTopBar(false);
  }, []);

  const handleLoadMore = () => {
    dispatch(fetchMoreOrders());
  };

  useEffect(() => {
    dispatch(hydrateOrdersFromPocket({ page: 1, perPage: 14 })).finally(() =>
      setIsInitialLoading(false)
    );
  }, [dispatch]);

  useEffect(() => {
    unsubRef.current = dispatch(subscribeOrdersRealtime());
    return () => {
      if (typeof unsubRef.current === 'function') unsubRef.current();
    };
  }, [dispatch]);

  useEffect(() => {
    const handleOnline = () => {
      dispatch(syncPendingOrders());
      if (navigator.onLine) {
        dispatch(hydrateOrdersFromPocket({ page: 1, perPage: 14 }));
      }
    };
    window.addEventListener('online', handleOnline);
    if (navigator.onLine) dispatch(syncPendingOrders());
    return () => window.removeEventListener('online', handleOnline);
  }, [dispatch]);

  const todayBusinessDate = computeBusinessDate(new Date(), 3);
  const todayOrders = useMemo(() => {
    return orders.filter((order) => order.businessDate === todayBusinessDate);
  }, [orders, todayBusinessDate]);

  const sortedTodayOrders = useMemo(() => {
    return [...todayOrders].sort((a, b) => {
      const ta = a.clientCreatedAt ?? new Date(a.created ?? 0).getTime();
      const tb = b.clientCreatedAt ?? new Date(b.created ?? 0).getTime();
      return tb - ta;
    });
  }, [todayOrders]);

  const [addressQuery, setAddressQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all'); // 'all' | 'retiro' | 'delivery'

  const isDev = process.env.NODE_ENV === 'development';
  const [showDevTicketPreview, setShowDevTicketPreview] = useState(true);

  const filteredTodayOrders = useMemo(() => {
    const q = addressQuery.trim().toLowerCase();

    return sortedTodayOrders.filter((o) => {
      const dirRaw = String(o?.direccion ?? '');
      const dir = dirRaw.toLowerCase();

      const isRetiro = dir.trim() === 'retiro';
      const isDelivery = !isRetiro;

      // filtro por tipo
      if (orderTypeFilter === 'retiro' && !isRetiro) return false;
      if (orderTypeFilter === 'delivery' && !isDelivery) return false;

      // filtro por búsqueda
      if (!q) return true;
      return dir.includes(q);
    });
  }, [sortedTodayOrders, addressQuery, orderTypeFilter]);

  const { totalTodayCount, rankById } = useMemo(() => {
    const pendingCount = sortedTodayOrders.filter((o) => o?.pending).length;

    const serverCount =
      typeof pagination?.totalItems === 'number' && Number.isFinite(pagination.totalItems)
        ? pagination.totalItems
        : sortedTodayOrders.filter((o) => !o?.pending).length;

    const total = serverCount + pendingCount;

    const map = new Map();
    sortedTodayOrders.forEach((o, idx) => {
      map.set(o.id, total - idx);
    });

    return { totalTodayCount: total, rankById: map };
  }, [sortedTodayOrders, pagination?.totalItems]);

  return (
    <GlobalOrders>
      <ContainerOrders ref={scrollRef} style={{ overflowY: 'auto' }}>
        {isInitialLoading ? (
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
            <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 8, color: '#333' }}>
              Cargando pedidos...
            </h2>
            <p style={{ fontSize: '1rem', opacity: 0.8 }}>Esto no debería tardar mucho.</p>
          </div>
        ) : todayOrders.length === 0 ? (
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
              src={logoPixel}
              alt="Sin pedidos"
              style={{ width: 120, height: 'auto', marginBottom: 20, opacity: 0.8 }}
            />
            <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 8, color: '#333' }}>
              No hay pedidos para hoy
            </h2>
            <p style={{ fontSize: '1rem', opacity: 0.8 }}>
              Cuando lleguen, aparecerán acá automáticamente.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                position: 'sticky',
                top: -10,
                zIndex: 20,
                background: '#f6f6f6',
                transform: hideTopBar ? 'translateY(-120%)' : 'translateY(0)',
                transition: 'transform 180ms ease',
                willChange: 'transform',
                paddingBottom: 10,
              }}
            >
              {/* Barra de búsqueda */}
              <div style={{ background: '#f6f6f6', padding: '10px 10px 6px' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    background: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: 12,
                    padding: '10px 12px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  <span
                    style={{ fontSize: 16, opacity: 0.75, display: 'flex', alignItems: 'center' }}
                  >
                    <Search size={20} />
                  </span>

                  <input
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    placeholder="Buscar por dirección"
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '1rem',
                      background: 'transparent',
                      fontFamily: "'Satoshi', sans-serif",
                      fontWeight: 600,
                    }}
                  />

                  {addressQuery.trim() && (
                    <button
                      onClick={() => setAddressQuery('')}
                      style={{
                        border: 'none',
                        background: '#111',
                        color: '#fff',
                        borderRadius: 10,
                        padding: '8px 10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                      title="Limpiar"
                    >
                      <FaXmark size={14} />
                    </button>
                  )}

                  {isDev && (
                    <button
                      onClick={() => setShowDevTicketPreview((v) => !v)}
                      style={{
                        border: 'none',
                        background: showDevTicketPreview ? '#23a76d' : '#eaeaea',
                        color: showDevTicketPreview ? '#fff' : '#111',
                        borderRadius: 10,
                        padding: '8px 10px',
                        cursor: 'pointer',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                      title="Mostrar/ocultar vista ticket (solo dev)"
                    >
                      <PrintIcon style={{ fontSize: 18 }} />
                      {showDevTicketPreview ? 'Ticket' : 'Normal'}
                    </button>
                  )}
                </div>

                {!!addressQuery.trim() && (
                  <div style={{ fontSize: 12, marginTop: 6, opacity: 0.75 }}>
                    Mostrando {filteredTodayOrders.length} de {sortedTodayOrders.length}
                  </div>
                )}
              </div>

              {/* Filtros */}
              <div
                style={{
                  marginTop: 10,
                  background: '#e9edf5',
                  borderRadius: 999,
                  padding: 6,
                  display: 'flex',
                  gap: 6,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                  marginLeft: 10,
                  marginRight: 10,
                }}
              >
                {[
                  ['all', 'Todo'],
                  ['retiro', 'Retiro'],
                  ['delivery', 'Delivery'],
                ].map(([key, label]) => {
                  const active = orderTypeFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setOrderTypeFilter(key)}
                      style={{
                        flex: 1,
                        border: active ? '2px solid black' : 'transparent',
                        cursor: 'pointer',
                        borderRadius: 999,
                        padding: '10px 12px',
                        fontWeight: 800,
                        fontSize: 14,
                        background: active ? 'white' : 'transparent',
                        color: active ? 'black' : '#111',
                        boxShadow: active ? '0 6px 16px rgba(0,0,0,0.18)' : 'none',
                        transition: 'all 150ms ease',
                        fontFamily: "'Satoshi'",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredTodayOrders.map((o) => {
              const displayNum = rankById.get(o.id) ?? o.numeracion ?? '';

              return (
                <CardOrders
                  key={o.id}
                  numeracion={displayNum}
                  {...o}
                  showDevTicketPreview={showDevTicketPreview}
                />
              );
            })}

            {pagination.hasMore && (
              <LoadMoreButton onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? 'Cargando...' : 'Ver más pedidos'}
              </LoadMoreButton>
            )}

            {showToTop && (
              <button
                onClick={scrollToTop}
                title="Subir arriba"
                style={{
                  position: 'fixed',
                  right: 18,
                  bottom: 18,
                  zIndex: 9999,
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: '#111',
                  color: '#fff',
                  boxShadow: '0 10px 26px rgba(0,0,0,0.28)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <ArrowUp size={20} />
              </button>
            )}
          </>
        )}
      </ContainerOrders>
    </GlobalOrders>
  );
}
