// src/components/Orders/CardOrders.js
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';

import PrintIcon from '@mui/icons-material/Print';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import {
  ArrowUp,
  Banknote,
  BookOpen,
  Check,
  CheckCheck,
  Clock,
  Coffee,
  CreditCard,
  CupSoda,
  Flame,
  FlaskConical,
  Package,
  RotateCcw,
  Search,
  Snowflake,
  Sparkles,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { ChevronDown, ChevronUp, MapPin } from 'react-feather';
import { BiHomeAlt2 } from 'react-icons/bi';
import { BsCash } from 'react-icons/bs';
import { FaXmark } from 'react-icons/fa6';
import { HiCheck, HiX } from 'react-icons/hi';
import { MdEdit, MdSort } from 'react-icons/md';

import logoPixel from '../../assets/logoprint.png';
import mpLogoWhite from '../../assets/mercadopagowhite.png';
import { pb } from '../../lib/pb';
import {
  removeOrderFromBoth,
  upsertOrder,
  updateOrderPayment,
} from '../../redux/orders/ordersSlice';
import { logoBase64 as logo } from '../../utils/logoBase64';
import { isBaristaItem } from '../../utils/cafeStockSync';
import { getSmoothieFlavor, getCleanItemNote, getFormattedDrinkName, getCleanSizeLabel, getSizeBadgeInfo } from './baristaRecipesData';
import { formatPrice } from '../../utils/formatPrice';
import { getOrderCashNet } from '../../utils/payments';
import { POINTS_RATE, pointsApiClient } from '../../utils/pointsApiClient';
import { computeBusinessDate } from '../../utils/stats';
import { relativeTimeFrom } from '../../utils/time';

import {
  ButtonCopy,
  ButtonPrint,
  ButtonTitle,
  ContainerCard,
  ContentButtonsTitle,
  DirCard,
  Direccion,
  FooterCard,
  HaceMin,
  Hora,
  Print,
  TitleCard,
  TotalPrint,
} from '../../pages/Orders/OrdersStyles';

import PaymentEditorModal from './PaymentEditorModal';
import ConfirmOverlay from './ConfirmOverlay';
import { normalizeScan } from './ordersUtils';

const CardOrders = React.memo(({
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
  pointsClaimed,
  showDevTicketPreview,
  copied,
  pagoDebito,
  envio,
  envioOpcion,
  isBarista = false,
  isTestOrder = false,
  isPrepared = false,
  baristaDone = false,
  onMarkPrepared,
  onUnmarkPrepared,
  onOpenRecipe,
  onDeleteTestOrder,
}) => {
  const isLinux = navigator.userAgent.toLowerCase().includes('linux');

  // Recuperar el valor del envío deducido (subtotal items vs. total order)
  const implicitEnvio = useMemo(() => {
    if (envio !== undefined && envio !== null) return Number(envio);
    const sub = (items || []).reduce((acc, it) => {
      // Remover cualquier símbolo $ o punto y convertir a número
      const p = Number(String(it.price || 0).replace(/[^\d.-]/g, '')) || 0;
      const q = Number(it.quantity || 1);
      return acc + p * q;
    }, 0);
    return Math.max(0, Number(total || 0) - sub);
  }, [envio, items, total]);

  const fromRedux = useSelector((s) => s.products?.products);
  const fromCache = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('pb_products_v1') || '[]');
    } catch {
      return [];
    }
  }, []);
  const allProducts = Array.isArray(fromRedux) && fromRedux.length ? fromRedux : fromCache;

  const envioName = useMemo(() => {
    if (!envioOpcion) return '';
    const found = allProducts.find(
      (p) => String(p.id) === String(envioOpcion) || String(p.key) === String(envioOpcion)
    );
    return found ? String(found.name).toLowerCase() : '';
  }, [envioOpcion, allProducts]);

  const normalizeStr = (s) =>
    (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const safeEnvioName = normalizeStr(envioName);

  const isEnvio1 =
    String(envioOpcion) === '20' ||
    String(envioOpcion) === 'd2fr4wo58t35n3y' ||
    safeEnvioName.includes('envio 1') ||
    safeEnvioName.includes('zona 1') ||
    (safeEnvioName && safeEnvioName.includes('1')) ||
    items.some(
      (it) => normalizeStr(it.name).includes('envio 1') || normalizeStr(it.name).includes('zona 1')
    ) ||
    (implicitEnvio > 0 && implicitEnvio < 1500);

  const isEnvio2 =
    String(envioOpcion) === '21' ||
    String(envioOpcion) === 'l37ofjn4rg9q0gx' ||
    safeEnvioName.includes('envio 2') ||
    safeEnvioName.includes('zona 2') ||
    (safeEnvioName && safeEnvioName.includes('2')) ||
    items.some(
      (it) => normalizeStr(it.name).includes('envio 2') || normalizeStr(it.name).includes('zona 2')
    ) ||
    (implicitEnvio >= 1500 && implicitEnvio < 2000);

  const isEnvio3 =
    String(envioOpcion) === '22' ||
    String(envioOpcion) === 'jz3v6i298mqut9g' ||
    safeEnvioName.includes('envio 3') ||
    safeEnvioName.includes('zona 3') ||
    (safeEnvioName && safeEnvioName.includes('3')) ||
    items.some(
      (it) => normalizeStr(it.name).includes('envio 3') || normalizeStr(it.name).includes('zona 3')
    ) ||
    implicitEnvio >= 2000;

  const [editPayOpen, setEditPayOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deliveryCopyOpen, setDeliveryCopyOpen] = useState(false);
  const [confirmingReady, setConfirmingReady] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [localPay, setLocalPay] = useState(null);
  const [viewVersion, setViewVersion] = useState(0);
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

  const isAdmin = useSelector((s) => s.actions?.isAdmin);
  const showDevQr = useSelector((s) => s.actions?.showDevQr);
  const isDev = process.env.NODE_ENV === 'development' || Boolean(isAdmin);

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
  const toNum = (s) => {
    if (typeof s === 'number') return Number.isFinite(s) ? s : 0;
    const str = String(s || '').trim();
    if (!str) return 0;
    const normalized = str
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.-]/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  };
  const viewPagoParsed = toNum(viewPago);
  const totalPagado =
    methodNorm === 'mixto'
      ? viewEf + viewMp
      : methodNorm === 'transferencia'
        ? Number(total || 0)
        : methodNorm === 'debito'
          ? Number(viewDb) || Number(total || 0)
          : viewPagoParsed;
  const dispatch = useDispatch();
  const [copiado, setCopiado] = useState();
  const isCopied = Boolean(copied) || localStorage.getItem(`order-copied-${id}`) === 'true';
  const [hidden, setHidden] = useState(() => {
    const saved = localStorage.getItem(`order-hidden-${id}`);
    return saved === 'true'; // default: false
  });
  const pedidoMap = items.map((item) => item.name);
  const listaItems = pedidoMap.flat();
  const repetidos = [];

  const itemsNormMemo = useMemo(() => {
    const hasEnvio = items.some((it) => /envio/i.test(String(it?.name || '')));
    const hasEnvio1 = items.some((it) => /envio\s*1/i.test(String(it?.name || '')));
    const hasEnvio2 = items.some((it) => /envio\s*2/i.test(String(it?.name || '')));
    const hasEnvio3 = items.some((it) => /envio\s*3/i.test(String(it?.name || '')));
    const base = items.map((it) => ({
      ...it,
      name: String(it?.name || '').replace(/^\s*envio\s*\d*/i, 'Envío'),
    }));

    if (direccion !== 'Retiro' && !hasEnvio) {
      base.push({ name: 'Envío', quantity: 1, category: 'Envio' });
    }
    return { items: base, hasEnvio1, hasEnvio2, hasEnvio3 };
  }, [items, direccion]);
  const itemsNorm = itemsNormMemo.items;
  const { hasEnvio1, hasEnvio2, hasEnvio3 } = itemsNormMemo;

  const repetidos2 = [];
  listaItems.forEach(function (numero) {
    repetidos[numero] = (repetidos[numero] || 0) + numero;
  });

  itemsNorm.forEach((item) => {
    const q = Number(item?.quantity || 0) || 1;
    repetidos2[item.name] = (repetidos2[item.name] || 0) + q;
  });

  const hasBaristaItems = useMemo(
    () => (itemsNorm || []).some(isBaristaItem),
    [itemsNorm]
  );

  // scan handler eliminado (no usado)

  // Reset de input/preview al cerrar el modal
  useEffect(() => {
    if (!linkOpen) {
      setLinkId('');
      setLinkMsg('');
      setClientPreview(null);
      setClientPreviewError('');
    }
  }, [linkOpen]);

  // Lookup de cliente solo al hacer click en el botón (comentado para buscar solo al hacer click)
  /*
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
    const timer = setTimeout(async () => {
      try {
        const res = await pointsApiClient.findQRCode(trimmed);

        if (lastLookupRef.current !== lookupId) return;

        if (res.found && res.type === 'client') {
          setClientPreview({
            name: res.name || res.data.name || 'Cliente',
            dni: res.clientDni || res.data.dni || '',
            email: res.data.email,
          });
          setClientPreviewError('');
        } else {
          setClientPreview(null);
          setClientPreviewError('Cliente no encontrado en sistema de puntos');
        }
      } catch (err) {
        if (lastLookupRef.current !== lookupId) return;
        setClientPreview(null);
        setClientPreviewError('Error buscando cliente');
      }
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [linkId, linkOpen]);
  // */

  const removeOrder = (id, reason) => {
    dispatch(removeOrderFromBoth({ id, reason }));
  };

  const toggleHidden = () => {
    setHidden((prev) => {
      const next = !prev;
      localStorage.setItem(`order-hidden-${id}`, String(next));
      try {
        window.dispatchEvent(new CustomEvent('order-hidden-changed', { detail: { id, hidden: next } }));
      } catch (e) {}
      return next;
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
        alert('No se puede vincular mientras el pedido está offline.');
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
        setLinkMsg('Escaneá/pegá el código QR del cliente.');
        return;
      }
      setLinkLoading(true);
      setLinkMsg('');

      console.log('🔍 pointsApiClient:', pointsApiClient);
      console.log('🔍 trimmed:', trimmed);

      // 1. Buscar cliente en sistema de puntos
      const res = await pointsApiClient.findQRCode(trimmed);

      if (!res.found || res.type !== 'client') {
        setLinkMsg('No se encontró un cliente válido con ese QR.');
        setLinkLoading(false);
        return;
      }

      const clientRec = res.data;
      const pts = Math.floor(Number(total || 0) / POINTS_RATE);

      if (pts <= 0) {
        setLinkMsg('El monto es muy bajo para sumar puntos.');
        setLinkLoading(false);
        return;
      }

      // 2. Sumar puntos en sistema externo
      const addRes = await pointsApiClient.addPointsFromPos(
        clientRec.id,
        pts,
        `Compra #${numeracion}`,
        'cajero'
      );

      if (!addRes.success) {
        setLinkMsg(`Error sumando puntos: ${addRes.message}`);
        setLinkLoading(false);
        return;
      }

      // 3. Actualizar orden local
      try {
        await pb.collection('orders').update(id, {
          client: clientRec.id,
          points: pts,
          pointsClaimed: true,
        });
      } catch (localErr) {
        console.warn('No se pudo vincular client ID localmente, pero se sumaron puntos.', localErr);
        await pb.collection('orders').update(id, {
          points: pts,
          pointsClaimed: true,
        });
      }

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
      } else if (method === 'Débito') {
        payload = {
          method: 'debito',
          pago: tot,
          pagoEfectivo: 0,
          pagoMp: 0,
          pagoDebito: tot,
          pagoDetalle: 'Débito',
        };
      } else if (method === 'Efectivo') {
        const ef = Number(cash) || 0;
        if (ef < tot) {
          alert('En efectivo, el monto debe ser ≥ al total.');
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

      await dispatch(updateOrderPayment({ id, payload })).unwrap();

      setEditPayOpen(false);
    } catch (e) {
      console.error('Error guardando pago:', e);
      setLocalPay(null);
      alert('No se pudo guardar el pago.');
    }
  };

  const copyOrder = () => {
    const lines = [];

    let emoji = '📍';
    if (direccion === 'Retiro') {
      emoji = '🏠';
    }

    lines.push(`${emoji} *${direccion}*`);

    const productosGrouped = items
      .filter(
        (it) =>
          !String(it.category || '')
            .toLowerCase()
            .includes('extra')
      )
      .reduce((acc, it) => {
        const qty = Number(it.quantity) || 0;
        const formattedName = getFormattedDrinkName(it) || it.name;
        acc[formattedName] = (acc[formattedName] || 0) + qty;
        return acc;
      }, {});
    const productosLines = Object.entries(productosGrouped).map(([name, qty]) => {
      let baseName = name.replace(/^\d+\s*x\s*/i, '').trim();
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
    setDeliveryCopyOpen(true);
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
            fontSize: '4mm',
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
                lineHeight: 1.2,
                maxWidth: '100%',
                margin: '0 auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontWeight: 700,
                fontSize: '4.2mm',
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
              }}
            >
              <span style={{ width: '6mm' }}>#</span>
              <span style={{ flex: 1, textAlign: 'left' }}>Producto</span>
            </div>

            {itemsNorm.map((it, idx) => {
              const cantidad = Number(it?.quantity ?? it?.qty ?? 1);
              const rawNombre = it?.name || it?.title || it?.label || '';
              const nombre = getFormattedDrinkName(it) || rawNombre;
              const sabores = Array.isArray(it?.sabores) ? it.sabores.filter(Boolean) : [];
              const itNL = (nombre || '').toLowerCase();
              const isSm = itNL.includes('smoothie') || String(it?.category || '').toLowerCase().includes('smoothie');
              const isCk = itNL.includes('cookie') || itNL.includes('galletita') || String(it?.category || '').toLowerCase().includes('cookie');
              return (
                <div key={idx} style={{ marginBottom: '1mm' }}>
                  <div style={{ display: 'flex', fontSize: '3.8mm' }}>
                    <span style={{ width: '6mm' }}>{cantidad}</span>
                    <span style={{ flex: 1, textAlign: 'left' }}>{nombre}</span>
                  </div>
                  {!isSm && !isCk && !!sabores.length && (
                    <div
                      style={{
                        marginLeft: '6mm',
                        marginTop: '.6mm',
                        fontSize: '3.5mm',
                        fontWeight: 700,
                        textAlign: 'left',
                      }}
                    >
                      {sabores.map((s, i) => (
                        <div key={i}>• {s}</div>
                      ))}
                    </div>
                  )}

                  {/* Detalles (Cafetería, notas, etc.) */}
                  {(() => {
                    const itNL = (it?.name || '').toLowerCase();
                    const isSm = itNL.includes('smoothie') || String(it?.category || '').toLowerCase().includes('smoothie');
                    const sz = isSm ? '12oz' : getCleanSizeLabel(it?.size || it?.medida || '');
                    const szInfo = sz ? getSizeBadgeInfo(sz) : null;
                    const exList = Array.isArray(it?.extras) ? [...it.extras] : [];
                    if ((it?.canela || it?.withCinnamon) && !exList.some((e) => /canela/i.test(e))) exList.push('Canela');
                    if (it?.leche_almendras && !exList.some((e) => /almendra/i.test(e))) exList.push('Leche Almendras');
                    if (it?.extra_shot && !exList.some((e) => /shot/i.test(e))) exList.push('Extra Shot');

                    const cleanPrintNote = getCleanItemNote(it);
                    if (!sz && !exList.length && !it?.vaso && !cleanPrintNote) return null;

                    return (
                      <div
                        style={{
                          marginLeft: '6mm',
                          marginTop: '.6mm',
                          fontSize: '3.3mm',
                          color: '#333',
                          fontWeight: 700,
                          textAlign: 'left',
                        }}
                      >
                        {sz && (
                          <div style={szInfo?.isLarge ? { fontWeight: 900, fontSize: '3.6mm', color: '#000' } : {}}>
                            • Medida: {szInfo?.label || sz} {szInfo?.isLarge ? '★ GRANDE ★' : ''}
                          </div>
                        )}
                        {exList.map((ex, i) => (
                          <div key={i}>• Adicional: {String(ex).replace(/\s*\(\+?\$?\d+\)/g, '').trim()}</div>
                        ))}
                        {it?.vaso && <div>• Vaso: "{it.vaso}"</div>}
                        {cleanPrintNote && <div>• Nota: "{cleanPrintNote}"</div>}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />

          <TotalPrint
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '2mm 0',
            }}
          >
            <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Total</a>
            <a style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(total)}</a>
          </TotalPrint>

          {pago === 'Mixto' ? (
            <>
              <TotalPrint
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '2mm 0',
                }}
              >
                <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Efectivo</a>
                <a style={{ textAlign: 'right' }}>{formatPrice(ef)}</a>
              </TotalPrint>
              <TotalPrint
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '2mm 0',
                }}
              >
                <a style={{ textAlign: 'left', fontWeight: 'bold' }}>MercadoPago</a>
                <a style={{ textAlign: 'right' }}>{formatPrice(mp)}</a>
              </TotalPrint>
              {totalPagado > total && (
                <TotalPrint
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '2mm 0',
                  }}
                >
                  <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Cambio</a>
                  <a style={{ textAlign: 'right' }}>{formatPrice(totalPagado - total)}</a>
                </TotalPrint>
              )}
            </>
          ) : (
            <TotalPrint
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2mm 0',
              }}
            >
              <a style={{ textAlign: 'left', fontWeight: 'bold' }}>
                {pago === 'Transferencia' ? 'Transferencia' : 'Paga'}
              </a>
              <a style={{ textAlign: 'right' }}>
                {pago === 'Transferencia'
                  ? ''
                  : viewPagoParsed === total
                    ? 'JUSTO'
                    : formatPrice(viewPagoParsed)}
              </a>
            </TotalPrint>
          )}
          {pago !== 'Mixto' && pago !== 'Transferencia' && totalPagado > Number(total || 0) && (
            <TotalPrint
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2mm 0',
              }}
            >
              <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Cambio</a>
              <a style={{ textAlign: 'right' }}>{formatPrice(totalPagado - Number(total || 0))}</a>
            </TotalPrint>
          )}
          <div style={{ borderTop: '1px dashed #000', margin: '24px 0' }} />
        </Print>
      );
    }
  );
  Ticket58.displayName = 'Ticket58';

  const contentRef = useRef(null);
  const [confirmPrintOpen, setConfirmPrintOpen] = useState(false);

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
    contentRef: contentRef,
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
  const reactToPrintFn = isLinux ? () => {} : _reactToPrint;

  const doPrint = async () => {
    setIsPrinting(true);
    try {
      const el = contentRef.current;
      if (!el) return;
      const styles = Array.from(document.querySelectorAll('style'))
        .map((s) => s.outerHTML)
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

      if (window.electron?.ipcRenderer) {
        // ⏳ espera REAL hasta que termina de imprimir
        await window.electron.ipcRenderer.invoke('print-ticket', html);
        localStorage.setItem(`order-printed-${id}`, 'true');
      } else {
        await reactToPrintFn?.();
        localStorage.setItem(`order-printed-${id}`, 'true');
      }
    } catch (err) {
      console.error('Error al imprimir:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrint = async () => {
    if (isPrinting) return;
    const el = contentRef.current;
    if (!el) return;
    const printedKey = `order-printed-${id}`;
    const alreadyPrinted = localStorage.getItem(printedKey) === 'true';
    if (alreadyPrinted) {
      setConfirmPrintOpen(true);
      return;
    }
    await doPrint();
  };

  const groupedItems = useMemo(() => {
    const map = {};

    const baristaItems = isBarista ? itemsNorm.filter(isBaristaItem) : [];
    const itemsToProcess = isBarista
      ? (baristaItems.length > 0 ? baristaItems : itemsNorm)
      : itemsNorm;

    itemsToProcess.forEach((it) => {
      const formattedName = getFormattedDrinkName(it);
      const saboresKey = (it.sabores || []).join('|');
      const extrasKey = (it.extras || []).join('|');
      const key = `${formattedName}__${saboresKey}__${it.size || ''}__${extrasKey}__${it.vaso || ''}`;

      if (!map[key]) {
        map[key] = {
          ...it,
          name: formattedName,
          quantity: Number(it.quantity || 1),
        };
      } else {
        map[key].quantity += Number(it.quantity || 1);
      }
    });

    return Object.values(map);
  }, [itemsNorm, isBarista]);

  const otherGroupedItems = useMemo(() => {
    if (!isBarista) return [];
    const hasBarista = (itemsNorm || []).some(isBaristaItem);
    // Si la orden no tiene ningún ítem de cafetería/barista, groupedItems ya muestra todos
    if (!hasBarista) return [];

    const nonBarista = (itemsNorm || []).filter((it) => !isBaristaItem(it));
    if (nonBarista.length === 0) return [];

    const map = {};
    nonBarista.forEach((it) => {
      const formattedName = it.name || it.nombre || 'Producto';
      const saboresKey = (it.sabores || []).join('|');
      const extrasKey = (it.extras || []).join('|');
      const key = `${formattedName}__${saboresKey}__${it.size || ''}__${extrasKey}__${it.notas || it.note || ''}`;

      if (!map[key]) {
        map[key] = {
          ...it,
          name: formattedName,
          quantity: Number(it.quantity || 1),
        };
      } else {
        map[key].quantity += Number(it.quantity || 1);
      }
    });

    return Object.values(map);
  }, [itemsNorm, isBarista]);

  if (isBarista) {
    const isTest = Boolean(isTestOrder || (id && String(id).startsWith('local-test-')));
    const dirTrim = String(direccion || '').trim();
    const isRetiro = dirTrim.toLowerCase() === 'retiro';
    const isMesa =
      dirTrim.toLowerCase().includes('mesa') ||
      dirTrim.toLowerCase().includes('salon') ||
      dirTrim.toLowerCase().includes('salón');
    const isDelivery = dirTrim && !isRetiro && !isMesa;

    const handleConfirm = () => {
      setIsDismissing(true);
      setTimeout(() => {
        if (onMarkPrepared) onMarkPrepared(id);
      }, 450);
    };

    const now = Date.now();
    const elapsedMinutes = Math.max(0, Math.floor((now - createdMs) / 60000));
    let elapsedText = 'Ahora';
    let urgencyColor = '#64748b';
    let urgencyBg = '#f1f5f9';
    let urgencyBorder = '#e2e8f0';

    if (elapsedMinutes >= 1) {
      elapsedText = `${elapsedMinutes}m`;
      if (elapsedMinutes >= 10) {
        urgencyColor = '#b91c1c';
        urgencyBg = '#fef2f2';
        urgencyBorder = '#fee2e2';
      } else if (elapsedMinutes >= 5) {
        urgencyColor = '#b45309';
        urgencyBg = '#fffbeb';
        urgencyBorder = '#fef3c7';
      }
    }

    return (
      <div
        key={id}
        style={{
          position: 'relative',
          background: isDismissing ? '#f0fdf4' : '#ffffff',
          borderRadius: 16,
          border: isDismissing
            ? '1.5px solid #86efac'
            : isPrepared
            ? '1.5px solid #bbf7d0'
            : '1px solid #e4e4e7',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Inter', -apple-system, sans-serif",
          boxShadow: isDismissing
            ? '0 8px 24px rgba(22, 163, 74, 0.15)'
            : isPrepared
            ? '0 2px 8px rgba(22, 163, 74, 0.05)'
            : '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
          margin: 0,
          animation: isDismissing
            ? 'baristaSlideOutRight 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards'
            : 'baristaCardIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: isDismissing ? 'none' : 'auto',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {/* Overlay de Confirmado / OK con tinte verde */}
        {isDismissing && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(240, 253, 244, 0.95)',
              backdropFilter: 'blur(3px)',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 16,
              animation: 'baristaFadeIn 0.18s ease-out forwards',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#dcfce7',
                border: '2px solid #86efac',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803d',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.2)',
                animation: 'baristaCheckPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              }}
            >
              <HiCheck size={28} />
            </div>
            <span
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: '#15803d',
                letterSpacing: '-0.02em',
                animation: 'baristaCheckPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              }}
            >
              ¡Comanda despachada!
            </span>
          </div>
        )}

        {/* Header */}
        <div
          style={{
            padding: '12px 14px',
            borderBottom: isPrepared ? '1px solid #dcfce7' : '1px solid #f1f5f9',
            background: isPrepared ? '#f0fdf4' : '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                color: isPrepared ? '#15803d' : '#09090b',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}
            >
              #{numeracion}
            </span>

            {isTest && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#b45309',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: 6,
                    padding: '2px 7px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <FlaskConical size={11} strokeWidth={2.4} /> Prueba
                </span>
                {onDeleteTestOrder && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTestOrder(id);
                    }}
                    title="Eliminar pedido de prueba"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px 4px',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 4,
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <Trash2 size={13} strokeWidth={2.2} />
                  </button>
                )}
              </div>
            )}

            {isRetiro ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#334155',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '2.5px 8px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Coffee size={12} strokeWidth={2.2} /> Retiro en barra
              </span>
            ) : isMesa ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#1d4ed8',
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  borderRadius: 6,
                  padding: '2.5px 8px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {dirTrim}
              </span>
            ) : isDelivery ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#c2410c',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 6,
                  padding: '2.5px 8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '180px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  flexShrink: 1,
                }}
                title={dirTrim}
              >
                <MapPin size={11} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{dirTrim}</span>
              </span>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* Time elapsed badge */}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: isPrepared ? '#15803d' : urgencyColor,
                background: isPrepared ? '#dcfce7' : urgencyBg,
                border: isPrepared ? '1px solid #bbf7d0' : `1px solid ${urgencyBorder}`,
                borderRadius: 6,
                padding: '2px 7px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <Clock size={11} strokeWidth={2.4} />
              {isPrepared ? 'Listo' : elapsedText}
            </span>

            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#94a3b8',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {hora}
            </span>
          </div>
        </div>

        {/* Lista de productos */}
        <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {groupedItems.map((it, idx) => {
            const cantidad = it.quantity || 1;
            const nombre = it.name;
            const itNameLower = (nombre || '').toLowerCase();
            const isCookie = itNameLower.includes('cookie') || itNameLower.includes('galletita');
            const isFoodOrBakery =
              itNameLower.includes('tostado') ||
              itNameLower.includes('medialuna') ||
              itNameLower.includes('croissant') ||
              itNameLower.includes('budin') ||
              itNameLower.includes('budín') ||
              isCookie ||
              itNameLower.includes('tarta') ||
              itNameLower.includes('alfajor') ||
              itNameLower.includes('sandwich') ||
              itNameLower.includes('sándwich') ||
              itNameLower.includes('panini') ||
              itNameLower.includes('muffin') ||
              itNameLower.includes('chipá') ||
              itNameLower.includes('chipa') ||
              String(it.category || '').toLowerCase().includes('pasteler');
            const isDrink = !isFoodOrBakery && isBaristaItem(it);

            const isColdDrink = Boolean(
              it?.isCold ||
              it?.temperature === 'Frío' ||
              itNameLower.includes('frio') ||
              itNameLower.includes('iced') ||
              (it?.size || '').toLowerCase().includes('frio')
            );
            const isSmoothie = itNameLower.includes('smoothie') || String(it.category || '').toLowerCase().includes('smoothie');
            const smoothieFlavor = isSmoothie ? getSmoothieFlavor(it) : '';
            const sizeLabel = isSmoothie ? '12oz' : getCleanSizeLabel(it.size || it.medida || '');
            const sizeBadge = getSizeBadgeInfo(sizeLabel);
            const isLargeCup = Boolean(sizeBadge?.isLarge);
            const sabores = Array.isArray(it.sabores) ? it.sabores.filter(Boolean) : [];

            // Consolidar extras de array y propiedades booleanas
            const itemExtras = [];
            if (Array.isArray(it.extras)) {
              it.extras.forEach((ex) => {
                if (ex) itemExtras.push(String(ex).replace(/\s*\(\+?\$?\d+\)/g, '').trim());
              });
            }
            if ((it.canela || it.withCinnamon) && !itemExtras.some((e) => /canela/i.test(e))) {
              itemExtras.push('Canela');
            }
            if ((it.leche_almendras || it.withAlmondMilk) && !itemExtras.some((e) => /almendra/i.test(e))) {
              itemExtras.push('Leche Almendras');
            }
            if (it.extra_shot && !itemExtras.some((e) => /shot/i.test(e))) {
              itemExtras.push('Extra Shot');
            }
            if ((it.sinCafe || it.withoutCoffee || it.isSinCafe) && !itemExtras.some((e) => /sin\s*caf/i.test(e))) {
              itemExtras.push('Sin café');
            }

            const cleanNote = getCleanItemNote(it);

            const hasAlmendras = Boolean(
              it.leche_almendras ||
              it.withAlmondMilk ||
              itemExtras.some((e) => /almendra/i.test(e)) ||
              (typeof it.name === 'string' && /almendra/i.test(it.name))
            );

            const isSinCafe = Boolean(
              it.sinCafe ||
              it.withoutCoffee ||
              it.isSinCafe ||
              itemExtras.some((e) => /sin\s*caf/i.test(e)) ||
              (typeof it.name === 'string' && /sin\s*caf/i.test(it.name))
            );

            // Filtrar extras visibles para no duplicar los que ya tienen badge en cabecera
            const visibleExtras = itemExtras.filter((ex) => {
              const normEx = String(ex).toLowerCase();
              if (isSinCafe && normEx.includes('sin') && normEx.includes('caf')) return false;
              if (hasAlmendras && normEx.includes('almendra')) return false;
              return true;
            });

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  paddingBottom: idx !== groupedItems.length - 1 ? 12 : 0,
                  borderBottom: idx !== groupedItems.length - 1 ? '1px solid #f4f4f5' : 'none',
                  ...(isLargeCup
                    ? {
                        background: 'linear-gradient(90deg, rgba(243, 232, 255, 0.45) 0%, rgba(255, 255, 255, 0) 100%)',
                        borderLeft: '3.5px solid #a855f7',
                        paddingLeft: 8,
                        borderRadius: 8,
                        margin: '-2px 0',
                        paddingTop: 4,
                        paddingBottom: idx !== groupedItems.length - 1 ? 10 : 4,
                      }
                    : {}),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    {/* Cantidad badge */}
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: cantidad > 1 ? '#ffffff' : '#475569',
                        background: cantidad > 1 ? '#09090b' : '#f8fafc',
                        border: cantidad > 1 ? 'none' : '1px solid #e2e8f0',
                        width: 25,
                        height: 25,
                        borderRadius: 7,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        boxShadow: cantidad > 1 ? '0 1px 3px rgba(0,0,0,0.18)' : 'none',
                      }}
                    >
                      {cantidad > 1 ? `${cantidad}×` : cantidad}
                    </span>

                    {/* Nombre y pills de tamaño/temperatura/sabor */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '0.96rem',
                          fontWeight: 700,
                          color: '#09090b',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.25,
                        }}
                      >
                        {nombre}
                      </span>

                      {/* Medida de vaso con Código de Color de Alto Contraste para Barista */}
                      {sizeBadge && (
                        <span
                          title={`Medida de vaso: ${sizeBadge.label}`}
                          style={{
                            fontSize: sizeBadge.isLarge ? '0.82rem' : '0.76rem',
                            fontWeight: 900,
                            color: sizeBadge.color,
                            background: sizeBadge.bg,
                            padding: sizeBadge.isLarge ? '3px 9px' : '2px 8px',
                            borderRadius: 7,
                            border: sizeBadge.isLarge
                              ? `2px solid ${sizeBadge.border}`
                              : `1.5px solid ${sizeBadge.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            letterSpacing: '-0.01em',
                            boxShadow: sizeBadge.isLarge
                              ? '0 2px 7px rgba(168, 85, 247, 0.3)'
                              : '0 1px 2px rgba(0, 0, 0, 0.05)',
                            flexShrink: 0,
                          }}
                        >
                          <CupSoda size={sizeBadge.isLarge ? 13 : 11.5} strokeWidth={2.6} />
                          <span>{sizeBadge.badgeText}</span>
                          {sizeBadge.isLarge && (
                            <span
                              style={{
                                background: sizeBadge.color,
                                color: '#ffffff',
                                fontSize: '0.62rem',
                                fontWeight: 900,
                                padding: '1px 5px',
                                borderRadius: 4,
                                marginLeft: 2,
                                letterSpacing: '0.04em',
                                lineHeight: 1.2,
                              }}
                            >
                              MAXI
                            </span>
                          )}
                        </span>
                      )}

                      {/* Badge Leche Almendras muy visible para Barista */}
                      {hasAlmendras && (
                        <span
                          title="Preparación con Leche de Almendras (vegetal)"
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            color: '#92400e',
                            background: '#fef3c7',
                            padding: '2px 8px',
                            borderRadius: 6,
                            border: '1.5px solid #fcd34d',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            boxShadow: '0 1px 3px rgba(146, 64, 14, 0.12)',
                          }}
                        >
                          🥛 Leche Almendras
                        </span>
                      )}

                      {/* Badge Sin Café muy visible para Barista */}
                      {isSinCafe && (
                        <span
                          title="Preparación Sin Café (No agregar espresso)"
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            color: '#b91c1c',
                            background: '#fef2f2',
                            padding: '2px 8px',
                            borderRadius: 6,
                            border: '1.5px solid #fca5a5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            boxShadow: '0 1px 3px rgba(185, 28, 28, 0.12)',
                          }}
                        >
                          🚫 Sin café
                        </span>
                      )}

                      {isDrink && (
                        isColdDrink ? (
                          <span
                            title="Bebida Fría"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: '#0284c7',
                              background: '#f0f9ff',
                              border: '1px solid #e0f2fe',
                              padding: '1.5px 6px',
                              borderRadius: 4,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              gap: 3,
                            }}
                          >
                            <Snowflake size={11} strokeWidth={2.4} /> Frío
                          </span>
                        ) : (
                          <span
                            title="Bebida Caliente"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: '#dc2626',
                              background: '#fef2f2',
                              border: '1px solid #fee2e2',
                              padding: '1.5px 6px',
                              borderRadius: 4,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              gap: 3,
                            }}
                          >
                            <Flame size={11} strokeWidth={2.4} /> Caliente
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Botón flotante para ver receta (solo bebidas) */}
                  {isDrink && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenRecipe) {
                          onOpenRecipe({
                            ...it,
                            size: sizeLabel || it.size || it.medida,
                            extras: itemExtras,
                            hasAlmendras,
                            leche_almendras: hasAlmendras,
                            isSinCafe,
                            sinCafe: isSinCafe,
                            smoothieFlavor,
                            isCold: isColdDrink,
                            isOrderItem: true,
                          });
                        }
                      }}
                      title={`Ver receta técnica de ${nombre}`}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0,
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = '#09090b';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.color = '#64748b';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <BookOpen size={11} strokeWidth={2} /> Receta
                    </button>
                  )}
                </div>

                {/* Modificadores / Extras / Vaso / Sabores / Notas (Sin duplicados con cabecera) */}
                {(visibleExtras.length > 0 || it.vaso || (!isSmoothie && !isCookie && sabores.length > 0) || cleanNote) && (
                  <div
                    style={{
                      paddingLeft: 33,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      fontSize: '0.76rem',
                      textAlign: 'left',
                      marginTop: 2,
                    }}
                  >
                    {/* Vaso / Nombre del cliente */}
                    {it.vaso && (
                      <span
                        style={{
                          color: '#7e22ce',
                          background: '#faf5ff',
                          border: '1px solid #f3e8ff',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <CupSoda size={12} strokeWidth={2.4} /> Vaso: {it.vaso}
                      </span>
                    )}

                    {/* Extras especificados con badges claros (excluyendo los que ya están en cabecera) */}
                    {visibleExtras.map((ex, i) => (
                      <span
                        key={i}
                        style={{
                          color: '#b45309',
                          background: '#fffbeb',
                          border: '1px solid #fef3c7',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        + {ex}
                      </span>
                    ))}

                    {/* Sabores de otros productos (helados, milkshakes, etc., nunca smoothies ni cookies) */}
                    {!isSmoothie && !isCookie && sabores.length > 0 && (
                      <span
                        style={{
                          color: '#047857',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        🍨 {sabores.join(' + ')}
                      </span>
                    )}

                    {/* Notas / Observaciones especiales REALES escritas por el cajero */}
                    {cleanNote && (
                      <span
                        style={{
                          color: '#4338ca',
                          background: '#eef2ff',
                          border: '1px solid #e0e7ff',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontWeight: 600,
                          fontSize: '0.74rem',
                        }}
                      >
                        Nota: {cleanNote}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Otros productos del pedido (No cafetería / Mostrador / Heladería) */}
          {otherGroupedItems.length > 0 && (
            <div
              style={{
                marginTop: 6,
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {/* Encabezado del contenedor */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 6,
                  borderBottom: '1px dashed #cbd5e1',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Package size={13} strokeWidth={2.4} />
                  <span>Otros productos del pedido</span>
                </div>
                <span
                  style={{
                    background: '#e2e8f0',
                    color: '#475569',
                    padding: '2px 7px',
                    borderRadius: 5,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                  }}
                >
                  No cafetería
                </span>
              </div>

              {/* Lista de productos no cafetería */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {otherGroupedItems.map((otherIt, oIdx) => {
                  const oQty = otherIt.quantity || 1;
                  const oName = getFormattedDrinkName(otherIt) || otherIt.name || otherIt.nombre || 'Producto';
                  const isOtherCookie = String(oName).toLowerCase().includes('cookie') || String(oName).toLowerCase().includes('galletita');
                  const oSize = otherIt.size || otherIt.medida;
                  const oSabores = Array.isArray(otherIt.sabores) ? otherIt.sabores.filter(Boolean) : [];
                  const oExtras = Array.isArray(otherIt.extras) ? otherIt.extras.filter(Boolean) : [];
                  const oNote = getCleanItemNote(otherIt);

                  return (
                    <div
                      key={oIdx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.73rem',
                            fontWeight: 800,
                            color: '#475569',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            minWidth: 22,
                            height: 22,
                            padding: '0 4px',
                            borderRadius: 6,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {oQty > 1 ? `${oQty}×` : oQty}
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            color: '#334155',
                            lineHeight: 1.25,
                          }}
                        >
                          {oName}
                        </span>
                        {oSize && (
                          <span
                            style={{
                              fontSize: '0.69rem',
                              fontWeight: 700,
                              color: '#64748b',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              padding: '1px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {oSize}
                          </span>
                        )}
                      </div>

                      {/* Sabores / Extras / Notas de otros productos */}
                      {((!isOtherCookie && oSabores.length > 0) || oExtras.length > 0 || oNote) && (
                        <div
                          style={{
                            paddingLeft: 28,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 4,
                            fontSize: '0.72rem',
                          }}
                        >
                          {!isOtherCookie && oSabores.length > 0 && (
                            <span
                              style={{
                                color: '#047857',
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                padding: '1.5px 7px',
                                borderRadius: 5,
                                fontWeight: 700,
                              }}
                            >
                              🍨 {oSabores.join(' + ')}
                            </span>
                          )}
                          {oExtras.map((ex, eIdx) => (
                            <span
                              key={eIdx}
                              style={{
                                color: '#b45309',
                                background: '#fffbeb',
                                border: '1px solid #fef3c7',
                                padding: '1.5px 7px',
                                borderRadius: 5,
                                fontWeight: 700,
                              }}
                            >
                              + {String(ex).replace(/\s*\(\+?\$?\d+\)/g, '').trim()}
                            </span>
                          ))}
                          {oNote && (
                            <span
                              style={{
                                color: '#4338ca',
                                background: '#eef2ff',
                                border: '1px solid #e0e7ff',
                                padding: '1.5px 7px',
                                borderRadius: 5,
                                fontWeight: 600,
                              }}
                            >
                              Nota: {oNote}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Botón de acción */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: isPrepared ? '1px solid #dcfce7' : '1px solid #f1f5f9',
            background: isPrepared ? '#f0fdf4' : '#fafafa',
          }}
        >
          {isPrepared ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803d', fontWeight: 700, fontSize: '0.82rem' }}>
                <CheckCheck size={16} strokeWidth={2.5} />
                <span>Despachado</span>
              </div>
              <button
                type="button"
                onClick={() => onUnmarkPrepared && onUnmarkPrepared(id)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 7,
                  padding: '5px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#09090b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                <RotateCcw size={12} strokeWidth={2.2} />
                Reabrir
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: 9,
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.01em',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(21, 128, 61, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#166534';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#15803d';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Check size={16} strokeWidth={2.6} />
              <span>Marcar Listo</span>
            </button>
          )}
        </div>
      </div>
    );
  }

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
          {!isRetiro && (
            isCopied ? (
              <span
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm('¿Volver a marcar como pendiente?')) {
                    localStorage.removeItem(`order-copied-${id}`);
                    try {
                      await pb.collection('orders').update(id, { copied: false });
                    } catch (err) {}
                    dispatch(upsertOrder({ id, copied: false }));
                    try {
                      window.dispatchEvent(new CustomEvent('order-copied-changed', { detail: { id, copied: false } }));
                    } catch (e) {}
                  }
                }}
                title="Click para volver a marcar como pendiente"
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
                  cursor: 'pointer',
                }}
              >
                <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> Enviado
              </span>
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  clickBtnCopy();
                }}
                title="Click para copiar / marcar enviado"
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  background: '#ff9800',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginLeft: 10,
                  cursor: 'pointer',
                }}
              >
                <TimerOutlinedIcon sx={{ fontSize: 14 }} /> Pendiente
              </span>
            )
          )}
          {hasBaristaItems && !isBarista && (
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 999,
                fontSize: '0.72rem',
                fontWeight: 800,
                background: baristaDone ? '#dcfce7' : '#fef3c7',
                color: baristaDone ? '#15803d' : '#b45309',
                border: `1px solid ${baristaDone ? '#bbf7d0' : '#fde68a'}`,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                marginLeft: 6,
              }}
              title={
                baristaDone
                  ? 'Cafetería / Bebidas listas por el barista'
                  : 'Cafetería / Bebidas pendientes en el barista'
              }
            >
              <Coffee size={12} strokeWidth={2.4} />
              {baristaDone ? 'Barista Listo' : 'Barista Pendiente'}
            </span>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: 8 }}>
          {!isBarista && (
            <ContentButtonsTitle>
              {showDevQr &&
                !pointsClaimed &&
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
                    <ButtonCopy
                      onClick={clickBtnCopy}
                      style={{ background: '#6528F7', color: '#fff' }}
                    >
                      Copiado
                    </ButtonCopy>
                  ) : (
                    <ButtonCopy onClick={clickBtnCopy}>Copiar</ButtonCopy>
                  )}
                </div>
              )}

              <ButtonPrint variant="contained" disabled={isPrinting} onClick={handlePrint}>
                <PrintIcon />
              </ButtonPrint>

              <ButtonTitle onClick={() => setEditPayOpen(true)} title="Editar pago">
                <MdEdit size={16} />
              </ButtonTitle>

              <ButtonTitle onClick={() => setConfirmOpen(true)} title="Borrar">
                <FaXmark size={16} />
              </ButtonTitle>
            </ContentButtonsTitle>
          )}
          <Hora>
            <ScheduleIcon sx={{ fontSize: 14, marginRight: 1 }} />
            {hora}
          </Hora>
        </span>
        <Dialog
          open={confirmPrintOpen}
          onClose={() => setConfirmPrintOpen(false)}
          PaperProps={{
            sx: {
              fontFamily: 'Inter, sans-serif',
              borderRadius: '16px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
              minWidth: 360,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            <PrintIcon sx={{ fontSize: 22 }} />
            Reimprimir pedido #{numeracion}
          </DialogTitle>
          <DialogContent
            sx={{
              fontSize: '0.95rem',
              color: '#333',
              fontWeight: 600,
              paddingTop: 1,
            }}
          >
            Este pedido ya fue impreso. ¿Querés volver a hacerlo?
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button
              onClick={() => setConfirmPrintOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                setConfirmPrintOpen(false);
                await doPrint();
              }}
              variant="contained"
              sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 600 }}
              autoFocus
            >
              Imprimir otra vez
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={deliveryCopyOpen}
          onClose={() => setDeliveryCopyOpen(false)}
          PaperProps={{
            sx: {
              fontFamily: 'Inter, sans-serif',
              borderRadius: '16px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
              minWidth: 360,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            <TimerOutlinedIcon sx={{ fontSize: 22 }} />
            Copiar pedido #{numeracion}
          </DialogTitle>
          <div
            style={{
              margin: '0 24px 16px',
              padding: '12px 16px',
              background: '#f6f7f9',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              border: '1px solid #e2e8f0',
            }}
          >
            {direccion === 'Retiro' ? <BiHomeAlt2 size={16} /> : <MapPin size={16} />}
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{direccion}</span>
          </div>
          <DialogContent
            sx={{
              fontSize: '0.95rem',
              color: '#333',
              fontWeight: 600,
              paddingTop: 1,
            }}
          >
            ¿Querés marcar este pedido como enviado al delivery?
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button
              onClick={() => {
                setDeliveryCopyOpen(false);
                copyOrder();
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1800);
              }}
              variant="outlined"
              sx={{
                borderRadius: 20,
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                color: '#000',
                borderColor: '#000',
              }}
            >
              Solo copiar
            </Button>
            <Button
              onClick={async () => {
                setDeliveryCopyOpen(false);
                copyOrder();
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1800);
                localStorage.setItem(`order-copied-${id}`, 'true');
                try {
                  await pb.collection('orders').update(id, { copied: true });
                } catch (e) {
                  console.error('Error actualizando copied:', e);
                }
                dispatch(upsertOrder({ id, copied: true }));
                try {
                  window.dispatchEvent(new CustomEvent('order-copied-changed', { detail: { id, copied: true } }));
                } catch (e) {}
              }}
              variant="contained"
              sx={{
                borderRadius: 20,
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                backgroundColor: '#23a76d',
                '&:hover': { backgroundColor: '#1e8a5c' },
              }}
              autoFocus
            >
              Delivery
            </Button>
          </DialogActions>
        </Dialog>
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

                        {/* Sabores abajo, como subticket (helados, etc., excepto smoothies y cookies) */}
                        {(() => {
                          const itNL = (nombre || '').toLowerCase();
                          const isSm = itNL.includes('smoothie') || String(it?.category || '').toLowerCase().includes('smoothie');
                          const isCk = itNL.includes('cookie') || itNL.includes('galletita') || String(it?.category || '').toLowerCase().includes('cookie');
                          if (isSm || isCk || !sabores.length) return null;
                          return (
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
                          );
                        })()}

                        {/* Detalles (Cafetería, medida, extras, smoothie, notas) */}
                        {(() => {
                          const itNL = (nombre || '').toLowerCase();
                          const isSm = itNL.includes('smoothie') || String(it?.category || '').toLowerCase().includes('smoothie');
                          const sz = isSm ? '12oz' : getCleanSizeLabel(it.size || it.medida || '');
                          const szInfo = sz ? getSizeBadgeInfo(sz) : null;
                          const exList = [];
                          if (Array.isArray(it.extras)) {
                            it.extras.forEach((ex) => {
                              if (ex) exList.push(String(ex).replace(/\s*\(\+?\$?\d+\)/g, '').trim());
                            });
                          }
                          if ((it.canela || it.withCinnamon) && !exList.some((e) => /canela/i.test(e))) exList.push('Canela');
                          if (it.leche_almendras && !exList.some((e) => /almendra/i.test(e))) exList.push('Leche Almendras');
                          if (it.extra_shot && !exList.some((e) => /shot/i.test(e))) exList.push('Extra Shot');

                          const cleanDetailNote = getCleanItemNote(it);

                          if (!sz && !exList.length && !it.vaso && !cleanDetailNote) return null;

                          return (
                            <div
                              style={{
                                marginLeft: 0,
                                paddingLeft: 8,
                                borderLeft: '2px solid rgba(77, 0, 18, 0.25)',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 5,
                                textAlign: 'left',
                                margin: '4px 0',
                                fontSize: '0.75rem',
                              }}
                            >
                              {sz && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    color: szInfo ? szInfo.color : '#1e293b',
                                    background: szInfo ? szInfo.bg : '#f1f5f9',
                                    border: szInfo
                                      ? (szInfo.isLarge ? `2px solid ${szInfo.border}` : `1.5px solid ${szInfo.border}`)
                                      : '1px solid #cbd5e1',
                                    padding: szInfo?.isLarge ? '1.5px 7px' : '1px 6px',
                                    borderRadius: 5,
                                    fontWeight: 800,
                                    fontSize: '0.72rem',
                                  }}
                                >
                                  <CupSoda size={11} strokeWidth={2.4} /> {szInfo ? szInfo.label : sz}
                                </span>
                              )}

                              {exList.map((ex, i) => (
                                <span
                                  key={i}
                                  style={{
                                    color: '#b45309',
                                    background: '#fffbeb',
                                    border: '1px solid #fef3c7',
                                    padding: '1px 7px',
                                    borderRadius: 4,
                                    fontWeight: 700,
                                  }}
                                >
                                  + {ex}
                                </span>
                              ))}

                              {it.vaso && (
                                <span
                                  style={{
                                    color: '#7e22ce',
                                    background: '#faf5ff',
                                    border: '1px solid #f3e8ff',
                                    padding: '1px 7px',
                                    borderRadius: 4,
                                    fontWeight: 700,
                                  }}
                                >
                                  Vaso: "{it.vaso}"
                                </span>
                              )}

                              {cleanDetailNote && (
                                <span
                                  style={{
                                    color: '#4338ca',
                                    background: '#eef2ff',
                                    border: '1px solid #e0e7ff',
                                    padding: '1px 7px',
                                    borderRadius: 4,
                                    fontWeight: 600,
                                  }}
                                >
                                  Nota: "{cleanDetailNote}"
                                </span>
                              )}
                            </div>
                          );
                        })()}
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

              // MIXTO (mostrar detalle según métodos usados)
              const cashNet = getOrderCashNet({
                method: 'mixto',
                pago: viewPago,
                total,
                pagoEfectivo: Number(viewEf) || 0,
                pagoMp: Number(viewMp) || 0,
                pagoDebito: Number(viewDb) || 0,
                pagoDetalle,
              });
              const mpAmt = Number(viewMp) || 0;
              const dbAmt = Number(viewDb) || 0;

              const elements = [];
              if (cashNet > 0) {
                elements.push(
                  <span
                    key="ef"
                    style={{
                      color: '#2f965cff',
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Banknote size={20} /> {formatPrice(cashNet)}
                  </span>
                );
              }
              if (dbAmt > 0) {
                elements.push(
                  <span
                    key="deb"
                    style={{
                      color: '#0f766e',
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <CreditCard size={18} /> {formatPrice(dbAmt)}
                  </span>
                );
              }
              if (mpAmt > 0) {
                elements.push(
                  <span
                    key="mp"
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
                );
              }

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
                    {elements.map((el, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span style={{ opacity: 0.6 }}> + </span>}
                        {el}
                      </React.Fragment>
                    ))}
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
      {!isBarista && showDevTicketPreview && (
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
      <PaymentEditorModal
        open={editPayOpen}
        onClose={() => setEditPayOpen(false)}
        onSave={savePayment}
        initial={{
          method:
            methodNorm === 'mixto'
              ? 'Mixto'
              : methodNorm === 'transferencia'
                ? 'Transferencia'
                : methodNorm === 'debito'
                  ? 'Débito'
                  : 'Efectivo',
          ef: Number(viewEf || 0),
          mp: Number(viewMp || 0),
        }}
        orderTotal={Number(total) || 0}
      />

      <ConfirmOverlay
        open={confirmOpen}
        onConfirm={(r) => {
          removeOrder(id, r);
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
                if (e.key === 'Enter') {
                  const fixed = normalizeScan(linkId);

                  console.log('RAW SCAN:', linkId);
                  console.log('FIXED SCAN:', fixed);

                  if (fixed.length === 6) {
                    setLinkId(fixed);
                    handleLinkClient();
                  }

                  setLinkId('');
                }
              }}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 14,
                border: '1px solid #ddd',
                fontSize: '1rem',
                fontFamily: 'inherit',
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
});

export default CardOrders;
