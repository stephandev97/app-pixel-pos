// src/components/Orders/CardOrders.js
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { scheduleLabel } from '../../utils/scheduledOrders';
import { formatFlavorPortions } from '../../utils/flavorPortions';
import { useDispatch, useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';

import PrintIcon from '@mui/icons-material/Print';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem } from '@mui/material';
import {
  ArrowUp,
  Banknote,
  Bell,
  BellOff,
  Bike,
  BookOpen,
  Check,
  CheckCheck,
  CheckCircle2,
  ChefHat,
  Clock,
  Coffee,
  Copy,
  CreditCard,
  CupSoda,
  Eye,
  Flame,
  MoreVertical,
  Package,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  Smartphone,
  Snowflake,
  Store,
  ShoppingBag,
  Trash2,
  Utensils,
  UserRound,
} from 'lucide-react';
import { ChevronDown, MapPin } from 'react-feather';
import { BiHomeAlt2 } from 'react-icons/bi';
import { BsCash } from 'react-icons/bs';
import { FaXmark } from 'react-icons/fa6';
import { HiCheck, HiX } from 'react-icons/hi';
import { MdEdit, MdSort } from 'react-icons/md';

import logoPixel from '../../assets/logoprint.png';
import mpLogoWhite from '../../assets/mercadopagowhite.png';
import { pb } from '../../lib/pb';
import { getOrdersCollectionName, isTestOrdersCollection } from '../../lib/ordersCollection';
import {
  removeOrderFromBoth,
  upsertOrder,
  updateOrderItems,
  updateOrderPayment,
  updateOrderProgress,
} from '../../redux/orders/ordersSlice';
import { logoBase64 as logo } from '../../utils/logoBase64';
import { isBaristaItem } from '../../utils/cafeStockSync';
import { getSmoothieFlavor, getCleanItemNote, getFormattedDrinkName, getCleanSizeLabel, getSizeBadgeInfo } from './baristaRecipesData';
import { formatPrice } from '../../utils/formatPrice';
import { getOrderCashNet } from '../../utils/payments';
import { getCachedPosPassword } from '../../utils/posPassword';
import { computeBusinessDate } from '../../utils/stats';
import { relativeTimeFrom } from '../../utils/time';

import {
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
import OrderItemsEditorModal from './OrderItemsEditorModal';
import ConfirmOverlay from './ConfirmOverlay';

const ORDER_PROGRESS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: '#b45309',
    bg: '#fef3c7',
    border: '#fde68a',
    headerBg: '#fffbeb',
    headerBorder: '#fde68a',
    icon: Clock,
  },
  received: {
    label: 'Recibido',
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#bae6fd',
    headerBg: '#f0f9ff',
    headerBorder: '#bae6fd',
    icon: Eye,
  },
  preparing: {
    label: 'En preparación',
    color: '#7c3aed',
    bg: '#f3e8ff',
    border: '#d8b4fe',
    headerBg: '#faf5ff',
    headerBorder: '#d8b4fe',
    icon: ChefHat,
  },
  dispatched: {
    label: 'En camino',
    color: '#4338ca',
    bg: '#e0e7ff',
    border: '#c7d2fe',
    headerBg: '#eef2ff',
    headerBorder: '#c7d2fe',
    icon: Bike,
  },
  ready: {
    label: 'Listo para retirar',
    color: '#059669',
    bg: '#d1fae5',
    border: '#a7f3d0',
    headerBg: '#ecfdf5',
    headerBorder: '#a7f3d0',
    icon: PackageCheck,
  },
  delivered: {
    label: 'Entregado',
    color: '#15803d',
    bg: '#dcfce7',
    border: '#86efac',
    headerBg: '#f0fdf4',
    headerBorder: '#86efac',
    icon: CheckCircle2,
  },
  pickedup: {
    label: 'Entregado',
    color: '#15803d',
    bg: '#dcfce7',
    border: '#86efac',
    headerBg: '#f0fdf4',
    headerBorder: '#86efac',
    icon: CheckCircle2,
  },
};

const ORDER_PROGRESS_LIST = [
  { key: 'pending', label: 'Pendiente', icon: Clock, color: '#b45309' },
  { key: 'received', label: 'Recibido', icon: Eye, color: '#0284c7' },
  { key: 'preparing', label: 'En preparación', icon: ChefHat, color: '#7c3aed' },
  { key: 'dispatched', label: 'En camino (Delivery)', icon: Bike, color: '#4338ca' },
  { key: 'ready', label: 'Listo para retirar', icon: PackageCheck, color: '#059669' },
  { key: 'delivered', label: 'Entregado', icon: CheckCircle2, color: '#15803d' },
  { key: 'pickedup', label: 'Entregado', icon: CheckCircle2, color: '#15803d' },
];

const getProgressRank = (progress) => {
  const ranks = {
    pending: 0,
    received: 1,
    preparing: 2,
    dispatched: 3,
    ready: 3,
    delivered: 4,
    pickedup: 4,
  };
  return ranks[String(progress || '').toLowerCase()] ?? -1;
};

const requiresStatusRollbackApproval = (currentProgress, nextProgress) => {
  const currentRank = getProgressRank(currentProgress);
  const nextRank = getProgressRank(nextProgress);
  return currentRank >= 0 && nextRank >= 0 && nextRank < currentRank;
};

const normalizeTicketText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

// Algunos productos guardan la variante también en `sabores`. Si ya quedó
// incluida en el nombre ("Paleta Pistacho" o "Cookie Kinder"), no hace falta
// repetirla debajo en el ticket.
const getTicketFlavors = (item, flavors, displayName) => {
  const name = normalizeTicketText(displayName || item?.name || item?.title || item?.label);

  return formatFlavorPortions(flavors.filter((flavor) => {
    const normalizedFlavor = normalizeTicketText(flavor);
    return !normalizedFlavor || !name.includes(normalizedFlavor);
  }));
};

const getDeliveryUserLabel = (user) =>
  String(user?.name || '').trim() ||
  String(user?.username || '').trim() ||
  String(user?.email || '').trim() ||
  user?.id;

const getExtraItemDetails = (item) => {
  const rawName = String(item?.name || item?.title || item?.label || '').trim();
  const quantityMatch = rawName.match(/^(\d+)\s*/);
  const name = rawName.replace(/^\d+\s*/, '').trim();
  const itemQuantity = Number(item?.quantity ?? item?.qty ?? 1) || 1;

  return {
    name,
    quantity: (quantityMatch ? Number(quantityMatch[1]) : 1) * itemQuantity,
  };
};

const isShippingItem = (item) => {
  const normalize = (value) =>
    String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  return normalize(item?.name || item?.nombre).includes('envio') ||
    normalize(item?.category).includes('envio');
};

const isBaristaDrinkItem = (item) => {
  const name = String(item?.name || item?.nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const category = String(item?.category || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const isFoodOrBakery =
    name.includes('tostado') ||
    name.includes('medialuna') ||
    name.includes('croissant') ||
    name.includes('budin') ||
    name.includes('cookie') ||
    name.includes('galletita') ||
    name.includes('tarta') ||
    name.includes('alfajor') ||
    name.includes('sandwich') ||
    name.includes('panini') ||
    name.includes('muffin') ||
    name.includes('chipa') ||
    category.includes('pasteler');
  return isBaristaItem(item) && !isFoodOrBakery;
};

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
  client,
  points,
  pointsClaimed,
  showDevTicketPreview,
  copied,
  pagoDebito,
  envio,
  envioOpcion,
  enviado,
  isBarista = false,
  isTestOrder = false,
  isPrepared = false,
  baristaDone = false,
  onMarkPrepared,
  onUnmarkPrepared,
  onOpenRecipe,
  onDeleteTestOrder,
  source,
  progress,
  mode,
  name,
  phone,
  deliveryId,
  scheduledStart,
  scheduledEnd,
}) => {
  const isLinux = navigator.userAgent.toLowerCase().includes('linux');
  const dispatch = useDispatch();
  const isTest = Boolean(isTestOrder || (id && String(id).startsWith('local-test-')));
  const isAppOrder = String(source || '').trim().toLowerCase() === 'app';
  const isAppOrTestOrder = isAppOrder || isTest;
  // Pausa temporal del seguimiento push: evita consultar /api/pixel/push/status
  // cada 15 segundos por cada tarjeta de pedido.
  const pushStatusEnabled = false;
  const appOrderCode = id ? String(id).slice(-6).toUpperCase() : '';
  const currentProgress = (progress || (isAppOrder ? 'pending' : null))?.toLowerCase();
  const [progressMenuAnchor, setProgressMenuAnchor] = useState(null);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);
  const [editItemsOpen, setEditItemsOpen] = useState(false);
  const [isPreparingAndPrinting, setIsPreparingAndPrinting] = useState(false);
  const [printError, setPrintError] = useState('');
  const [statusApproval, setStatusApproval] = useState(null);
  const [statusPin, setStatusPin] = useState('');
  const [statusPinError, setStatusPinError] = useState('');
  const [deliveryConfirmationOpen, setDeliveryConfirmationOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState(null);
  const [whatsAppCopied, setWhatsAppCopied] = useState(false);
  const doPrintRef = useRef(null);
  const printCompletionRef = useRef(null);

  useEffect(() => {
    if (!pushStatusEnabled) {
      setPushStatus(null);
      return undefined;
    }
    if (!isAppOrder || !id) {
      setPushStatus(null);
      return undefined;
    }

    if (String(id).startsWith('local-')) {
      setPushStatus({ status: 'unavailable', watching: false, devices: 0, local: true });
      return undefined;
    }

    let active = true;
    setPushStatus((current) => current || { status: 'loading', watching: false, devices: 0 });
    const loadPushStatus = () => {
      pb.send('/api/pixel/push/status', {
        method: 'POST',
        body: {
          orderCollection: isTestOrder || isTestOrdersCollection()
            ? 'orders_test'
            : 'orders',
          orderId: String(id),
        },
        requestKey: null,
      })
        .then((result) => { if (active) setPushStatus(result); })
        .catch((error) => {
          console.warn('[Push] No se pudo consultar el estado del pedido:', error);
          if (active) {
            setPushStatus({
              status: 'unavailable',
              watching: false,
              devices: 0,
              queryError: true,
            });
          }
        });
    };
    loadPushStatus();
    const refreshTimer = window.setInterval(loadPushStatus, 15000);
    window.addEventListener('focus', loadPushStatus);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', loadPushStatus);
    };
  }, [id, isAppOrder, isTestOrder, currentProgress, pushStatusEnabled]);

  const handleSetProgress = useCallback(async (newProgress, isValidated = false, isDeliveryConfirmed = false) => {
    if (!id || !newProgress) return;
    if (newProgress === 'delivered' && !isDeliveryConfirmed) {
      setDeliveryConfirmationOpen(true);
      return false;
    }
    if (!isValidated && requiresStatusRollbackApproval(currentProgress, newProgress)) {
      setStatusPin('');
      setStatusPinError('');
      setStatusApproval({ type: 'progress', progress: newProgress });
      return false;
    }
    await dispatch(updateOrderProgress({ id, progress: newProgress })).unwrap();
    return true;
  }, [dispatch, id, currentProgress]);

  const handlePrepareAndPrint = useCallback(async (isValidated = false) => {
    if (isPreparingAndPrinting) return;
    if (!isValidated && requiresStatusRollbackApproval(currentProgress, 'preparing')) {
      setStatusPin('');
      setStatusPinError('');
      setStatusApproval({ type: 'prepare' });
      return;
    }
    setIsPreparingAndPrinting(true);
    try {
      const progressUpdated = await handleSetProgress('preparing', isValidated);
      if (progressUpdated === false) return;
      const printed = await doPrintRef.current?.();
      if (!printed) {
        setPrintError((current) => current || 'No se pudo imprimir el ticket. Revisá la impresora e intentá nuevamente.');
      }
    } catch (error) {
      console.error('Error al pasar el pedido a preparación e imprimir:', error);
      setPrintError('No se pudo pasar el pedido a preparación o imprimir el ticket.');
    } finally {
      setIsPreparingAndPrinting(false);
    }
  }, [handleSetProgress, isPreparingAndPrinting, currentProgress]);

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
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [deliveryUsersLoading, setDeliveryUsersLoading] = useState(false);
  const [deliveryUsersError, setDeliveryUsersError] = useState('');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(deliveryId || '');
  const [assignedDeliveryName, setAssignedDeliveryName] = useState('');
  const [savingDeliveryAssignment, setSavingDeliveryAssignment] = useState(false);
  const [deliveryCopyError, setDeliveryCopyError] = useState('');
  const [sentAnimationStage, setSentAnimationStage] = useState(null);
  const sentFinalizedRef = useRef(false);
  const sentAnimationCompleteRef = useRef(null);
  const [confirmingReady, setConfirmingReady] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [localPay, setLocalPay] = useState(null);
  const [viewVersion, setViewVersion] = useState(0);
  const viewPago = localPay?.pago ?? pago;
  const viewEf = localPay?.pagoEfectivo ?? Number(pagoEfectivo || 0);
  const viewMp = localPay?.pagoMp ?? Number(pagoMp || 0);
  const viewDb = localPay?.pagoDebito ?? Number(pagoDebito || 0);

  const methodNorm = String(localPay?.method ?? method ?? '').toLowerCase();

  const isAdmin = useSelector((s) => s.actions?.isAdmin);
  const isDev = process.env.NODE_ENV === 'development' || Boolean(isAdmin);

  useEffect(() => {
    if (sentAnimationStage !== 'confirm') return undefined;
    const timer = window.setTimeout(() => setSentAnimationStage('slide'), 850);
    return () => window.clearTimeout(timer);
  }, [sentAnimationStage]);

  const dirNormLower = String(direccion || '')
    .trim()
    .toLowerCase();
  const isLocal =
    dirNormLower.includes('local') ||
    dirNormLower.includes('salon') ||
    dirNormLower.includes('salón') ||
    dirNormLower.includes('comer') ||
    dirNormLower.includes('mesa');
  const isRetiro =
    !isLocal &&
    (dirNormLower === 'retiro' ||
      dirNormLower.includes('take away') ||
      dirNormLower.includes('llevar'));
  const isDelivery = Boolean(dirNormLower) && !isRetiro && !isLocal;
  const isLocalDeliveryOrder = !isAppOrder && isDelivery;

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
  const [copiado, setCopiado] = useState();
  const isCopied = Boolean(copied) || localStorage.getItem(`order-copied-${id}`) === 'true';
  const [isItemListExpanded, setIsItemListExpanded] = useState(false);
  const isOrderSent =
    Boolean(enviado) ||
    ['dispatched', 'ready', 'delivered', 'pickedup'].includes(currentProgress) ||
    (!isAppOrder && isCopied);
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

    const isNonDelivery =
      isRetiro ||
      isLocal ||
      direccion === 'Retiro' ||
      direccion === 'Comer en el local';
    if (!isNonDelivery && !hasEnvio) {
      base.push({ name: 'Envío', quantity: 1, category: 'Envio' });
    }
    return { items: base, hasEnvio1, hasEnvio2, hasEnvio3 };
  }, [items, direccion, isRetiro, isLocal]);
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

  const currentStatusTheme = useMemo(() => {
    if (isAppOrder) {
      const norm =
        currentProgress && ORDER_PROGRESS_CONFIG[currentProgress]
          ? currentProgress
          : 'pending';
      const cfg = ORDER_PROGRESS_CONFIG[norm];
      return {
        bg: cfg.headerBg,
        border: cfg.headerBorder,
        accent: cfg.color,
      };
    }
    if (isDelivery) {
      if (isCopied) {
        return {
          bg: '#f0fdf4',
          border: '#bbf7d0',
          accent: '#15803d',
        };
      }
      return {
        bg: '#fffbeb',
        border: '#fde68a',
        accent: '#b45309',
      };
    }
    return {
      bg: '#f1f5f9',
      border: '#e2e8f0',
      accent: '#64748b',
    };
  }, [isAppOrder, currentProgress, isDelivery, isCopied]);

  const pushNotificationBadge = useMemo(() => {
    if (!pushStatusEnabled || !isAppOrder) return null;
    let label = 'Sin avisos';
    let tooltip = 'Notificaciones desactivadas';
    let color = '#64748b';
    let background = '#f1f5f9';
    let border = '#cbd5e1';
    let Icon = BellOff;

    if (!pushStatus || pushStatus.status === 'loading') {
      label = 'Consultando avisos';
      tooltip = 'Consultando notificaciones';
      Icon = Bell;
    } else if (pushStatus.watching) {
      label = 'Seguimiento abierto';
      tooltip = 'El cliente está siguiendo el pedido';
      color = '#047857';
      background = '#ecfdf5';
      border = '#a7f3d0';
      Icon = Bell;
    } else if (pushStatus.status === 'active') {
      label = 'Avisos activos';
      tooltip = 'Notificaciones activas';
      color = '#047857';
      background = '#ecfdf5';
      border = '#a7f3d0';
      Icon = Bell;
    } else if (pushStatus.status === 'pending') {
      label = 'Avisos sin probar';
      tooltip = 'Notificaciones listas para probar';
      color = '#a16207';
      background = '#fefce8';
      border = '#fde68a';
      Icon = Bell;
    } else if (pushStatus.status === 'error') {
      label = 'Error en avisos';
      tooltip = 'Las notificaciones tienen un error';
      color = '#b91c1c';
      background = '#fef2f2';
      border = '#fecaca';
      Icon = BellOff;
    } else if (pushStatus.queryError) {
      label = 'Estado no disponible';
      tooltip = 'No se pudo consultar las notificaciones';
      color = '#b45309';
      background = '#fffbeb';
      border = '#fde68a';
      Icon = BellOff;
    }

    return (
      <div
        title={tooltip}
        aria-label={label}
        style={{
          width: 23,
          height: 23,
          padding: 0,
          boxSizing: 'border-box',
          borderRadius: 6,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          background,
          border: `1px solid ${border}`,
          flexShrink: 0,
        }}
      >
        <Icon size={11} strokeWidth={2.4} />
      </div>
    );
  }, [isAppOrder, pushStatus, pushStatusEnabled]);

  const renderProgressControl = useCallback((isBaristaView = false) => {
    if (!isAppOrder) return null;

    const normProgress = currentProgress && ORDER_PROGRESS_CONFIG[currentProgress]
      ? currentProgress
      : 'pending';
    const cfg = ORDER_PROGRESS_CONFIG[normProgress];
    const CurrentIcon = cfg.icon;

    const modeLower = String(mode || '').toLowerCase().trim();
    const isDeliveryOrder =
      modeLower === 'delivery'
        ? true
        : modeLower === 'retiro' || modeLower === 'takeaway' || modeLower === 'take away' || modeLower === 'local'
          ? false
          : Boolean(direccion) && !/retiro|take away|llevar|local|salon|salón|comer|mesa/i.test(direccion);
    const isPickupOrder =
      modeLower === 'retiro' ||
      modeLower === 'takeaway' ||
      modeLower === 'take away' ||
      /retiro|take away|llevar/i.test(String(direccion || ''));

    // Acción rápida siguiente según estado y tipo de pedido
    let quickAction = null;
    if (normProgress === 'pending') {
      quickAction = {
        key: 'preparing',
        label: 'Aceptar pedido',
        title: 'Aceptar el pedido, pasarlo a preparación e imprimir ticket',
        bg: '#0284c7',
        icon: Eye,
        printOnAction: true,
      };
    } else if (normProgress === 'received') {
      quickAction = {
        key: 'preparing',
        label: 'Pasar a preparación',
        title: 'Marcar que el pedido se está preparando',
        bg: '#7c3aed',
        icon: ChefHat,
      };
    } else if (normProgress === 'preparing') {
      if (isDeliveryOrder) {
        quickAction = {
          key: 'dispatched',
          label: 'Enviar con repartidor',
          title: 'Marcar que el pedido salió con el repartidor',
          bg: '#4338ca',
          icon: Bike,
        };
      } else {
        quickAction = {
          key: 'ready',
          label: 'Marcar listo para retirar',
          title: 'Avisar que el pedido está listo en mostrador',
          bg: '#059669',
          icon: PackageCheck,
        };
      }
    } else if (normProgress === 'dispatched' || normProgress === 'ready') {
      const finalProgress = normProgress === 'ready' && isPickupOrder ? 'pickedup' : 'delivered';
      quickAction = {
        key: finalProgress,
        label: finalProgress === 'pickedup' ? 'Marcar como retirado' : 'Marcar como entregado',
        title:
          finalProgress === 'pickedup'
            ? 'Finalizar pedido como retirado por el cliente'
            : 'Finalizar pedido como entregado al cliente',
        bg: '#15803d',
        icon: CheckCircle2,
      };
    }

    const QuickIcon = quickAction ? quickAction.icon : null;

    // Estados válidos según si el pedido es Delivery o Retiro/Take Away
    const validSteps = isDeliveryOrder
      ? [
          { key: 'pending', label: 'Pendiente', icon: Clock, color: '#b45309' },
          { key: 'received', label: 'Recibido', icon: Eye, color: '#0284c7' },
          { key: 'preparing', label: 'En preparación', icon: ChefHat, color: '#7c3aed' },
          { key: 'dispatched', label: 'En camino', icon: Bike, color: '#4338ca' },
          { key: 'delivered', label: 'Entregado', icon: CheckCircle2, color: '#15803d' },
        ]
      : [
          { key: 'pending', label: 'Pendiente', icon: Clock, color: '#b45309' },
          { key: 'received', label: 'Recibido', icon: Eye, color: '#0284c7' },
          { key: 'preparing', label: 'En preparación', icon: ChefHat, color: '#7c3aed' },
          { key: 'ready', label: 'Listo para retirar', icon: PackageCheck, color: '#059669' },
          ...(isPickupOrder
            ? [{ key: 'pickedup', label: 'Pedido retirado', icon: CheckCircle2, color: '#15803d' }]
            : [{ key: 'delivered', label: 'Entregado', icon: CheckCircle2, color: '#15803d' }]),
        ];

    // Por seguridad, si el estado actual es inconsistente con el tipo de orden,
    // se incluye para que se visualice seleccionado y pueda corregirse
    if (normProgress && !validSteps.some((s) => s.key === normProgress)) {
      const extra = ORDER_PROGRESS_LIST.find((s) => s.key === normProgress);
      if (extra) validSteps.push(extra);
    }

    const menuElement = (
      <Menu
        anchorEl={progressMenuAnchor}
        open={Boolean(progressMenuAnchor)}
        onClose={() => setProgressMenuAnchor(null)}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
            minWidth: 210,
            py: 0.5,
          },
        }}
      >
        <div
          style={{
            padding: '6px 14px 4px',
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Cambiar estado
        </div>
        {validSteps.map((step) => {
          const isCurrent = step.key === normProgress;
          const StepIcon = step.icon;
          return (
            <MenuItem
              key={step.key}
              selected={isCurrent}
              onClick={(e) => {
                e.stopPropagation();
                setProgressMenuAnchor(null);
                if (step.key === 'preparing') {
                  handlePrepareAndPrint();
                } else {
                  handleSetProgress(step.key);
                }
              }}
              disabled={isPreparingAndPrinting}
              sx={{
                fontSize: '0.82rem',
                fontWeight: isCurrent ? 800 : 600,
                color: isCurrent ? step.color : '#334155',
                py: 0.8,
                gap: 1.2,
              }}
            >
              <StepIcon size={15} color={step.color} strokeWidth={2.2} />
              <span style={{ flex: 1 }}>{step.label}</span>
              {isCurrent && <Check size={14} color={step.color} strokeWidth={2.8} />}
            </MenuItem>
          );
        })}
      </Menu>
    );

    if (isBaristaView) {
      return (
        <>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setProgressMenuAnchor(e.currentTarget);
            }}
            title="Click para cambiar el estado del pedido"
            style={{
              height: 23,
              padding: '0 8px',
              boxSizing: 'border-box',
              borderRadius: 6,
              fontSize: '0.71rem',
              fontWeight: 800,
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              userSelect: 'none',
              flexShrink: 0,
              transition: 'filter 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.96)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          >
            <CurrentIcon size={11} strokeWidth={2.4} />
            {normProgress === 'dispatched' && assignedDeliveryName ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <strong style={{ fontWeight: 900 }}>{assignedDeliveryName}</strong>
                <span style={{ opacity: 0.82 }}>· En camino</span>
              </span>
            ) : (
              <span>{cfg.label}</span>
            )}
            <ChevronDown size={11} strokeWidth={2.4} style={{ opacity: 0.7 }} />
          </span>
          {menuElement}
        </>
      );
    }

    if (!quickAction) return null;

    const showReviewBeforeAccept = normProgress === 'pending' || normProgress === 'received';

    return (
      <div
        style={{
          marginTop: 10,
          width: '100%',
          display: 'flex',
          gap: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {showReviewBeforeAccept && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditItemsOpen(true);
            }}
            title="Revisar o editar productos sin stock antes de aceptar"
            style={{
              padding: '10px 12px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: 10,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <MdEdit size={15} />
            <span>Revisar / Editar</span>
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (quickAction.key === 'preparing') {
              handlePrepareAndPrint();
            } else if (quickAction.key === 'dispatched' && !sentAnimationStage) {
              // Antes de marcar como enviado, los deliveries (incluidos los
              // pedidos de prueba de la app) deben elegir un repartidor.
              setDeliveryCopyError('');
              setDeliveryCopyOpen(true);
            } else {
              handleSetProgress(quickAction.key);
            }
          }}
          disabled={isPreparingAndPrinting || Boolean(sentAnimationStage)}
          title={quickAction.title}
          style={{
            flex: 1,
            width: '100%',
            padding: '10px 14px',
            background: isPreparingAndPrinting ? '#64748b' : quickAction.bg,
            color: '#ffffff',
            border: 'none',
            borderRadius: 10,
            fontSize: '0.86rem',
            fontWeight: 800,
            cursor: isPreparingAndPrinting ? 'wait' : 'pointer',
            opacity: isPreparingAndPrinting ? 0.82 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            fontFamily: 'inherit',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'filter 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isPreparingAndPrinting) e.currentTarget.style.filter = 'brightness(1.08)';
          }}
          onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
        >
          {isPreparingAndPrinting ? (
            <span
              aria-hidden="true"
              style={{
                width: 14,
                height: 14,
                border: '2px solid rgba(255,255,255,0.45)',
                borderTopColor: '#ffffff',
                borderRadius: '50%',
                animation: 'order-ticket-spin 0.8s linear infinite',
              }}
            />
          ) : (
            <QuickIcon size={16} strokeWidth={2.5} />
          )}
          <span>{isPreparingAndPrinting ? 'Imprimiendo ticket' : quickAction.label}</span>
        </button>
        {isPreparingAndPrinting && (
          <style>{`
            @keyframes order-ticket-spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        )}
      </div>
    );
  }, [
    isAppOrder,
    currentProgress,
    mode,
    direccion,
    progressMenuAnchor,
    handleSetProgress,
    handlePrepareAndPrint,
    isPreparingAndPrinting,
    sentAnimationStage,
    assignedDeliveryName,
  ]);

  const removeOrder = (id, reason) => {
    dispatch(removeOrderFromBoth({ id, reason }));
  };

  const savePayment = async ({ method, cash, mp, debit }) => {
    try {
      const tot = Number(total) || 0;
      let payload;

      if (method === 'Transferencia') {
        payload = {
          method: 'transferencia',
          pago: tot,
          pagoEfectivo: 0,
          pagoMp: tot,
          pagoDebito: 0,
          paidAmount: { transferencia: tot },
          cambio: 0,
          pagoDetalle: 'Transferencia',
        };
      } else if (method === 'Débito') {
        payload = {
          method: 'debito',
          pago: tot,
          pagoEfectivo: 0,
          pagoMp: 0,
          pagoDebito: tot,
          paidAmount: { debito: tot },
          cambio: 0,
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
          pagoDebito: 0,
          paidAmount: { efectivo: ef },
          cambio: Math.max(0, ef - tot),
          pagoDetalle: `EF $${ef}`,
        };
      } else {
        const ef = Number(cash) || 0;
        const mpVal = Number(mp) || 0;
        const debitVal = Number(debit) || 0;
        const activeMethods = [ef, mpVal, debitVal].filter((amount) => amount > 0);
        if (activeMethods.length < 2) {
          alert('En Mixto, ingresá montos en al menos dos medios de pago.');
          return;
        }
        const totalPaid = ef + mpVal + debitVal;
        if (totalPaid < tot) {
          alert('En Mixto, la suma de los medios de pago no puede ser menor al total.');
          return;
        }
        const cashChange = Math.max(0, ef - Math.max(0, tot - mpVal - debitVal));
        payload = {
          method: 'mixto',
          pago: totalPaid,
          pagoEfectivo: ef,
          pagoMp: mpVal,
          pagoDebito: debitVal,
          paidAmount: {
            ...(ef > 0 ? { efectivo: ef } : {}),
            ...(mpVal > 0 ? { transferencia: mpVal } : {}),
            ...(debitVal > 0 ? { debito: debitVal } : {}),
          },
          cambio: cashChange,
          pagoDetalle: [
            ...(ef > 0 ? [`EF $${ef}`] : []),
            ...(mpVal > 0 ? [`MP $${mpVal}`] : []),
            ...(debitVal > 0 ? [`Débito $${debitVal}`] : []),
          ].join(' + '),
        };
      }

      setLocalPay(payload);
      setViewVersion((v) => v + 1);

      await dispatch(updateOrderPayment({ id, payload })).unwrap();

      setEditPayOpen(false);
    } catch (e) {
      console.error('Error guardando pago:', e);
      setLocalPay(null);
      alert(
        typeof e === 'string'
          ? e
          : e?.message || 'No se pudo guardar el pago. Revisá la conexión e intentá nuevamente.'
      );
    }
  };

  const copyOrder = () => {
    if (!isDelivery) return;
    const lines = [];

    let emoji = '📍';
    if (isLocal) {
      emoji = '🍽️';
    } else if (isRetiro) {
      emoji = '🛍️';
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
    if (!isDelivery) return;
    setDeliveryCopyError('');
    setDeliveryCopyOpen(true);
  };

  const handleCopyWhatsAppPhone = async () => {
    const rawPhone = String(phone || '').replace(/\D/g, '');
    if (!rawPhone) return;

    const normalizedPhone = rawPhone.startsWith('54')
      ? rawPhone
      : `549${rawPhone.replace(/^0+/, '')}`;

    try {
      await navigator.clipboard.writeText(normalizedPhone);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = normalizedPhone;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }

    setWhatsAppCopied(true);
    window.setTimeout(() => setWhatsAppCopied(false), 1800);
  };

  useEffect(() => {
    if (!deliveryId) {
      setAssignedDeliveryName('');
      return undefined;
    }

    let active = true;
    pb.collection('users')
      .getOne(deliveryId, { fields: 'id,name,email,username' })
      .then((user) => {
        if (active) setAssignedDeliveryName(getDeliveryUserLabel(user));
      })
      .catch(() => {
        if (active) setAssignedDeliveryName('');
      });

    return () => {
      active = false;
    };
  }, [deliveryId]);

  useEffect(() => {
    if (!deliveryCopyOpen) return undefined;
    let active = true;
    setDeliveryUsersLoading(true);
    setDeliveryUsersError('');
    // Un pedido de prueba puede vivir localmente o en `orders_test`.
    // En ambos casos se muestran únicamente los repartidores de prueba activos.
    // Para pedidos reales se excluyen las cuentas de prueba.
    const testMode = isTest || isTestOrdersCollection();
    pb.collection('users')
      .getFullList({
        fields: 'id,name,email,username,deliveryActive,prueba',
        filter: testMode
          ? 'deliveryActive = true && role = "delivery" && prueba = true'
          : 'deliveryActive = true && role = "delivery" && prueba != true',
        sort: 'name',
      })
      .then((users) => {
        if (!active) return;
        setDeliveryUsers(users);
        if (deliveryId && users.some((user) => user.id === deliveryId)) {
          setSelectedDeliveryId(deliveryId);
        }
      })
      .catch((err) => {
        console.error('Error cargando repartidores:', err);
        if (active) setDeliveryUsersError('No se pudieron cargar las cuentas del POS.');
      })
      .finally(() => {
        if (active) setDeliveryUsersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [deliveryCopyOpen, deliveryId, isTest]);

  const deliveryStatusBadge =
    !isAppOrder && isDelivery
      ? isCopied
        ? (
          <span
            onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm('¿Volver a marcar como pendiente?')) {
                localStorage.removeItem(`order-copied-${id}`);
                try {
                  await pb.collection(getOrdersCollectionName()).update(id, { copied: false });
                } catch (err) {}
                dispatch(upsertOrder({ id, copied: false }));
                try {
                  window.dispatchEvent(
                    new CustomEvent('order-copied-changed', { detail: { id, copied: false } })
                  );
                } catch (e) {}
              }
            }}
            title="Click para volver a marcar como pendiente"
            style={{
              height: 23,
              padding: '0 8px',
              boxSizing: 'border-box',
              borderRadius: 6,
              fontSize: '0.71rem',
              fontWeight: 800,
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #86efac',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 13 }} /> Enviado
          </span>
        )
        : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              clickBtnCopy();
            }}
            title="Click para copiar / marcar enviado"
            style={{
              height: 23,
              padding: '0 8px',
              boxSizing: 'border-box',
              borderRadius: 6,
              fontSize: '0.71rem',
              fontWeight: 800,
              background: '#fef3c7',
              color: '#b45309',
              border: '1px solid #fde68a',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <TimerOutlinedIcon sx={{ fontSize: 13 }} /> Pendiente
          </span>
        )
      : null;

  const createdMs = useMemo(() => {
    if (typeof clientCreatedAt === 'number') return clientCreatedAt;
    if (created) return new Date(created).getTime();
    return Date.now();
  }, [clientCreatedAt, created]);

  const rel = useMemo(() => relativeTimeFrom(createdMs), [createdMs]);

  const Ticket58 = React.forwardRef(
    ({ direccion, itemsNorm, total, pago, ef, mp, totalPagado, formatPrice, logo }, ref) => {
      const printableItems = itemsNorm.reduce((acc, item) => {
        if (String(item?.category || '').trim().toLowerCase() !== 'extras') {
          acc.push(item);
          return acc;
        }

        const { name, quantity } = getExtraItemDetails(item);
        const matchingIndex = acc.findIndex(
          (entry) =>
            entry._isGroupedExtra &&
            entry._extraName.toLowerCase() === name.toLowerCase()
        );

        if (matchingIndex >= 0) {
          const totalQuantity = acc[matchingIndex]._extraQuantity + quantity;
          acc[matchingIndex] = {
            ...acc[matchingIndex],
            name: totalQuantity > 1 ? `${totalQuantity} ${name}` : name,
            quantity: totalQuantity > 1 ? '' : 1,
            _extraQuantity: totalQuantity,
          };
        } else {
          acc.push({
            ...item,
            name: quantity > 1 ? `${quantity} ${name}` : name,
            quantity: quantity > 1 ? '' : 1,
            _isGroupedExtra: true,
            _extraName: name,
            _extraQuantity: quantity,
          });
        }

        return acc;
      }, []);

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

            {printableItems.map((it, idx) => {
              const cantidad = Number(it?.quantity ?? it?.qty ?? 1);
              const rawNombre = it?.name || it?.title || it?.label || '';
              const nombre = getFormattedDrinkName(it) || rawNombre;
              const sabores = getTicketFlavors(
                it,
                Array.isArray(it?.sabores) ? it.sabores.filter(Boolean) : [],
                nombre
              );
              const itNL = (nombre || '').toLowerCase();
              const isStandaloneExtra =
                String(it?.category || '').trim().toLowerCase() === 'extras';
              const isSm = itNL.includes('smoothie') || String(it?.category || '').toLowerCase().includes('smoothie');
              const isCk = itNL.includes('cookie') || itNL.includes('galletita') || String(it?.category || '').toLowerCase().includes('cookie');
              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: '1mm',
                    ...(isStandaloneExtra
                      ? {
                          border: '0.3mm solid #000',
                          borderRadius: '2mm',
                          padding: '1mm 1.5mm',
                          color: '#000',
                          fontWeight: 700,
                        }
                      : {}),
                  }}
                >
                  <div style={{ display: 'flex', fontSize: '3.8mm' }}>
                    <span style={{ width: '6mm', flexShrink: 0 }}>
                      {isStandaloneExtra ? '+' : cantidad > 0 ? cantidad : ''}
                    </span>
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
                    const toppingName = String(
                      typeof it?.topping === 'string' ? it.topping : it?.topping?.name || ''
                    ).trim();
                    const printExtras = exList
                      .map((extra) =>
                        String(typeof extra === 'string' ? extra : extra?.name || '')
                          .replace(/\s*\(\+?\$?\d+\)/g, '')
                          .trim()
                      )
                      .filter(Boolean)
                      .filter((extra, index, list) =>
                        list.findIndex((candidate) => candidate.toLowerCase() === extra.toLowerCase()) === index
                      );
                    if (toppingName && !printExtras.some((extra) => extra.toLowerCase() === toppingName.toLowerCase())) {
                      printExtras.unshift(toppingName);
                    }

                    const cleanPrintNote = getCleanItemNote(it);
                    if (!sz && !printExtras.length && !it?.vaso && !cleanPrintNote) return null;

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
                        {printExtras.map((extra, i) => (
                          <span
                            key={i}
                            style={{
                              display: 'inline-block',
                              maxWidth: '100%',
                              border: '0.3mm solid #000',
                              borderRadius: '1.5mm',
                              padding: '0.4mm 1.2mm',
                              margin: '0 1mm 0.8mm 0',
                              fontSize: '3.1mm',
                              lineHeight: 1.2,
                              color: '#000',
                              background: '#fff',
                            }}
                          >
                            {extra}
                          </span>
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '2mm',
                    marginTop: '1mm',
                    padding: '1mm 1.5mm',
                    border: '0.3mm solid #000',
                    borderRadius: '2mm',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ textAlign: 'left', fontWeight: 'bold' }}>Cambio</span>
                  <span style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {formatPrice(totalPagado - total)}
                  </span>
                </div>
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '2mm',
                marginTop: '1mm',
                padding: '1mm 1.5mm',
                border: '0.3mm solid #000',
                borderRadius: '2mm',
                fontWeight: 700,
              }}
            >
              <span style={{ textAlign: 'left', fontWeight: 'bold' }}>Cambio</span>
              <span style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatPrice(totalPagado - Number(total || 0))}
              </span>
            </div>
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
      printCompletionRef.current?.(true);
      printCompletionRef.current = null;
    },
    onPrintError: (location, error) => {
      console.error(`Error de impresión (${location}):`, error);
      if (!isLinux) setIsPrinting(false);
      printCompletionRef.current?.(false);
      printCompletionRef.current = null;
    },
  });

  // En Linux lo anulamos completamente
  const reactToPrintFn = isLinux ? () => {} : _reactToPrint;

  const doPrint = async () => {
    setIsPrinting(true);
    try {
      const el = contentRef.current;
      if (!el) {
        setPrintError('No se encontró el ticket para imprimir. Intentá nuevamente.');
        return false;
      }
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
      } else {
        if (isLinux) {
          throw new Error('La impresión no está habilitada en esta plataforma.');
        }
        const printed = await new Promise((resolve) => {
          printCompletionRef.current = resolve;
          try {
            reactToPrintFn?.();
          } catch (error) {
            printCompletionRef.current = null;
            resolve(false);
          }
        });
        if (!printed) {
          setPrintError('No se pudo imprimir el ticket. Revisá la impresora e intentá nuevamente.');
          return false;
        }
      }
      localStorage.setItem(`order-printed-${id}`, 'true');

      // Si es un pedido de la app web y aún está en pending o received, pasar a 'preparing'
      return true;
    } catch (err) {
      console.error('Error al imprimir:', err);
      setPrintError('No se pudo imprimir el ticket. Revisá la impresora e intentá nuevamente.');
      return false;
    } finally {
      setIsPrinting(false);
    }
  };
  doPrintRef.current = doPrint;

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
      ? (baristaItems.length > 0 ? baristaItems : itemsNorm).filter((item) => !isShippingItem(item))
      : itemsNorm;

    itemsToProcess.forEach((it) => {
      const formattedName = getFormattedDrinkName(it);
      const categoryKey = String(it.category || '').trim().toLowerCase();
      const key = JSON.stringify({
        category: categoryKey,
        name: formattedName,
        flavors: it.sabores || [],
        size: it.size || it.medida || '',
        extras: it.extras || [],
        vaso: it.vaso || '',
        note: it.note || it.notes || it.notas || '',
        almondMilk: Boolean(it.leche_almendras || it.withAlmondMilk),
        withoutCoffee: Boolean(it.sinCafe || it.withoutCoffee || it.isSinCafe),
        extraShot: Boolean(it.extra_shot),
        cinnamon: Boolean(it.canela || it.withCinnamon),
        temperature: it.temperature || '',
        isCold: Boolean(it.isCold),
        selectedOption: it.selectedOption || '',
      });

      if (!map[key]) {
        map[key] = {
          ...it,
          name: formattedName,
          quantity: Number(it.quantity ?? it.qty ?? 1) || 1,
          _isBarista: isBaristaItem(it),
        };
      } else {
        map[key].quantity += Number(it.quantity ?? it.qty ?? 1) || 1;
      }
    });

    return Object.values(map).flatMap((item) => {
      if (!isBarista || !isBaristaDrinkItem(item)) return [item];
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      return Array.from({ length: quantity }, (_, unitIndex) => ({
        ...item,
        quantity: 1,
        _unitNumber: unitIndex + 1,
      }));
    });
  }, [itemsNorm, isBarista]);

  const otherGroupedItems = useMemo(() => {
    if (!isBarista) return [];
    const hasBarista = (itemsNorm || []).some(isBaristaItem);
    // Si la orden no tiene ningún ítem de cafetería/barista, groupedItems ya muestra todos
    if (!hasBarista) return [];

    const nonBarista = (itemsNorm || []).filter(
      (it) => !isBaristaItem(it) && !isShippingItem(it)
    );
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
          _isBarista: isBaristaItem(it),
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
    const dirTrimLower = dirTrim.toLowerCase();
    const isLocal =
      dirTrimLower.includes('local') ||
      dirTrimLower.includes('comer') ||
      dirTrimLower.includes('salon') ||
      dirTrimLower.includes('salón') ||
      dirTrimLower.includes('mesa');
    const isRetiro =
      !isLocal &&
      (dirTrimLower === 'retiro' ||
        dirTrimLower.includes('take away') ||
        dirTrimLower.includes('llevar'));
    const isDelivery = dirTrim && !isRetiro && !isLocal;

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

            {isAppOrder && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#6d28d9',
                  background: '#ede9fe',
                  border: '1px solid #ddd6fe',
                  borderRadius: 6,
                  padding: '2.5px 8px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Pedido realizado desde la Web / App"
              >
                <Smartphone size={12} strokeWidth={2.4} />
                <span>App{appOrderCode ? ` #${appOrderCode}` : ''}</span>
              </span>
            )}

            {renderProgressControl(true)}

            {isTest && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
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

            {isLocal ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#065f46',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 6,
                  padding: '2.5px 8px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Utensils size={12} strokeWidth={2.4} /> Comer en el local
              </span>
            ) : isRetiro ? (
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
                <Coffee size={12} strokeWidth={2.2} /> Take Away
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
            const sabores = formatFlavorPortions(it.sabores);

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
                background: '#f4f4f5',
                border: '1px solid #d4d4d8',
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
                  borderBottom: '1px dashed #d4d4d8',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#52525b',
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
                    background: '#e4e4e7',
                    color: '#52525b',
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
                  const oSabores = formatFlavorPortions(otherIt.sabores);
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
                            color: '#52525b',
                            background: '#f4f4f5',
                            border: '1px solid #d4d4d8',
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
                            color: '#27272a',
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
                              color: '#52525b',
                              background: '#f4f4f5',
                              border: '1px solid #d4d4d8',
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
                                color: '#3f3f46',
                                background: '#e4e4e7',
                                border: '1px solid #d4d4d8',
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
                                color: '#3f3f46',
                                background: '#e4e4e7',
                                border: '1px solid #d4d4d8',
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
                                color: '#3f3f46',
                                background: '#e4e4e7',
                                border: '1px solid #d4d4d8',
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
      style={{
        ...(pending ? { border: '2px dashed orange' } : {}),
        ...(sentAnimationStage
          ? {
              maxHeight: 76,
              minHeight: 76,
              padding: '8px 12px',
              transition:
                sentAnimationStage === 'slide'
                  ? 'transform 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 650ms ease'
                  : 'max-height 650ms ease, min-height 650ms ease, padding 650ms ease',
            }
          : { maxHeight: 1200, transition: 'max-height 650ms ease, padding 650ms ease' }),
        ...(sentAnimationStage === 'slide'
          ? {
              transform: 'translateX(110%)',
              opacity: 0,
            }
          : {}),
      }}
      onTransitionEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.propertyName === 'transform' &&
          sentAnimationStage === 'slide' &&
          !sentFinalizedRef.current
        ) {
          sentFinalizedRef.current = true;
          const completeAnimation = sentAnimationCompleteRef.current;
          sentAnimationCompleteRef.current = null;
          if (completeAnimation) {
            Promise.resolve(completeAnimation()).catch((error) => {
              console.error('Error al completar el envío del pedido:', error);
            });
          }
          setSentAnimationStage(null);
        }
      }}
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
      {sentAnimationStage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'rgba(134, 239, 172, 0.97)',
              color: '#14532d',
              fontSize: '1.65rem',
              fontWeight: 900,
            }}
          >
            <CheckCircle2 size={38} strokeWidth={2.8} />
            <span>Pedido enviado</span>
          </div>
      )}
      {/* Indicador superior de estado del pedido */}
      <div
        style={{
          height: 4,
          width: 'calc(100% + 32px)',
          margin: '-16px -16px 12px -16px',
          background: currentStatusTheme.accent,
          flexShrink: 0,
          transition: 'background-color 0.25s ease',
        }}
      />

      <TitleCard>
        {/* Fila 1: número y estado a la izquierda; hora y acciones a la derecha */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              #{numeracion}
            </span>
            {scheduledStart && <div style={{ padding: '8px 12px', borderRadius: 9, background: '#eef2ff', color: '#4338ca', fontSize: 13, fontWeight: 700 }}>Programado · {scheduleLabel({ scheduledStart, scheduledEnd })}</div>}
            {isAppOrder && renderProgressControl(true)}
            {deliveryStatusBadge}
            {pushNotificationBadge}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Hora
              title="Hora del pedido"
              style={{
                height: 32,
                padding: '0 10px',
                gap: 5,
                fontSize: '0.9rem',
                borderRadius: 8,
              }}
            >
              <ScheduleIcon sx={{ fontSize: 15 }} />
              {hora}
            </Hora>

            {!isBarista && !isOrderSent && (
              <ContentButtonsTitle>
                <IconButton
                  size="small"
                  aria-label="Más acciones del pedido"
                  aria-haspopup="true"
                  aria-controls={actionsMenuAnchor ? `order-actions-${id}` : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionsMenuAnchor(e.currentTarget);
                  }}
                  sx={{
                    width: 30,
                    height: 30,
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    borderRadius: '7px',
                    backgroundColor: '#fff',
                  }}
                >
                  <MoreVertical size={17} />
                </IconButton>
                <Menu
                  id={`order-actions-${id}`}
                  anchorEl={actionsMenuAnchor}
                  open={Boolean(actionsMenuAnchor)}
                  onClose={() => setActionsMenuAnchor(null)}
                  onClick={(e) => e.stopPropagation()}
                  PaperProps={{
                    sx: {
                      minWidth: 180,
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.16)',
                    },
                  }}
                >
                  <MenuItem
                    disabled={isPrinting}
                    onClick={() => {
                      setActionsMenuAnchor(null);
                      handlePrint();
                    }}
                    sx={{ gap: 1, fontSize: '0.84rem' }}
                  >
                    <PrintIcon sx={{ fontSize: 17 }} />
                    Imprimir comanda
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setActionsMenuAnchor(null);
                      setEditPayOpen(true);
                    }}
                    sx={{ gap: 1, fontSize: '0.84rem' }}
                  >
                    <MdEdit size={17} />
                    Editar pago
                  </MenuItem>
                  {isAppOrTestOrder && (
                    <MenuItem
                      disabled={!String(phone || '').replace(/\D/g, '')}
                      onClick={async () => {
                        setActionsMenuAnchor(null);
                        await handleCopyWhatsAppPhone();
                      }}
                      sx={{ gap: 1, fontSize: '0.84rem' }}
                    >
                      {whatsAppCopied ? <Check size={17} color="#16a34a" /> : <Copy size={17} />}
                      {whatsAppCopied ? 'WhatsApp copiado' : phone ? 'Copiar WhatsApp' : 'Sin WhatsApp registrado'}
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => {
                      setActionsMenuAnchor(null);
                      setConfirmOpen(true);
                    }}
                    sx={{ gap: 1, fontSize: '0.84rem', color: '#dc2626' }}
                  >
                    <FaXmark size={17} />
                    Borrar pedido
                  </MenuItem>
                </Menu>
              </ContentButtonsTitle>
            )}
          </div>
        </div>

        {/* Fila 2: Badges de origen y prueba */}
        {(isAppOrder || isDelivery || isTest) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            {/* Badge App */}
            {isAppOrder && (
              <span
                style={{
                  height: 23,
                  padding: '0 8px',
                  boxSizing: 'border-box',
                  borderRadius: 6,
                  fontSize: '0.71rem',
                  fontWeight: 800,
                  background: '#ede9fe',
                  color: '#6d28d9',
                  border: '1px solid #ddd6fe',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontVariantNumeric: 'tabular-nums',
                }}
                title="Pedido realizado desde la Web / App"
              >
                <Smartphone size={11} strokeWidth={2.4} />
                <span>App{appOrderCode ? ` #${appOrderCode}` : ''}</span>
              </span>
            )}

            {isAppOrder && String(name || '').trim() && (
              <span
                style={{
                  height: 23,
                  maxWidth: 'min(240px, 100%)',
                  padding: '0 8px',
                  boxSizing: 'border-box',
                  borderRadius: 6,
                  fontSize: '0.71rem',
                  fontWeight: 700,
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  minWidth: 0,
                }}
                title={String(name).trim()}
              >
                <UserRound size={11} strokeWidth={2.4} />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {String(name).trim()}
                </span>
              </span>
            )}

          </div>
        )}
        <Dialog
          open={confirmPrintOpen}
          onClose={() => setConfirmPrintOpen(false)}
          PaperProps={{
            sx: {
              fontFamily: 'Poppins, Inter, sans-serif',
              borderRadius: '20px',
              boxShadow: '0 18px 44px rgba(15, 23, 42, 0.2)',
              width: 'min(410px, calc(100vw - 32px))',
              margin: 2,
              overflow: 'hidden',
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              fontWeight: 800,
              fontSize: '1.05rem',
              px: 2.5,
              pt: 2.25,
              pb: 1,
              color: '#0f172a',
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
          open={Boolean(printError)}
          onClose={() => setPrintError('')}
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
              color: '#b91c1c',
            }}
          >
            <PrintIcon sx={{ fontSize: 22 }} /> Error de impresión
          </DialogTitle>
          <DialogContent sx={{ fontSize: '0.95rem', color: '#334155', fontWeight: 600, paddingTop: 1 }}>
            {printError}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button
              onClick={() => setPrintError('')}
              variant="contained"
              sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 700 }}
              autoFocus
            >
              Entendido
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={Boolean(statusApproval)}
          onClose={() => setStatusApproval(null)}
          PaperProps={{
            sx: {
              fontFamily: 'Inter, sans-serif',
              borderRadius: '16px',
              width: 310,
              m: 1.5,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              boxShadow: '0 16px 38px rgba(15, 23, 42, 0.18)',
            },
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const typedPin = String(statusPin || '').replace(/\s/g, '');
              if (typedPin !== getCachedPosPassword()) {
                setStatusPinError('Clave de configuración incorrecta.');
                return;
              }

              const approval = statusApproval;
              setStatusApproval(null);
              setStatusPin('');
              setStatusPinError('');
              if (approval?.type === 'prepare') {
                handlePrepareAndPrint(true);
              } else if (approval?.progress) {
                handleSetProgress(approval.progress, true);
              }
            }}
          >
            <DialogTitle
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)',
                borderBottom: '1px solid #e0e7ff',
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#4f46e5',
                  color: '#fff',
                  boxShadow: '0 3px 8px rgba(79, 70, 229, 0.25)',
                  flexShrink: 0,
                }}
              >
                <RotateCcw size={16} strokeWidth={2.6} />
              </span>
              <span style={{ display: 'grid', gap: 1 }}>
                <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#1e1b4b', lineHeight: 1.2 }}>
                  Cambiar de estado
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6366f1', letterSpacing: '0.02em' }}>
                  REQUIERE AUTORIZACIÓN
                </span>
              </span>
            </DialogTitle>
            <DialogContent
              sx={{
                display: 'grid',
                rowGap: 0.75,
                px: 2,
                pt: '10px !important',
                pb: '10px !important',
              }}
            >
              <span style={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.4 }}>
                Ingresá la clave de configuración para confirmar el retroceso.
              </span>
              <input
                type="password"
                value={statusPin}
                onChange={(event) => {
                  setStatusPin(event.target.value);
                  setStatusPinError('');
                }}
                placeholder="Ingresar clave"
                autoFocus
                style={{
                  minHeight: 40,
                  padding: '0 10px',
                  borderRadius: 9,
                  background: '#f8fafc',
                  border: `1.5px solid ${statusPinError ? '#ef4444' : '#cbd5e1'}`,
                  font: 'inherit',
                  outline: 'none',
                  margin: 0,
                }}
              />
              {statusPinError && (
                <span role="alert" style={{ color: '#b91c1c', fontSize: '0.75rem', fontWeight: 700 }}>
                  {statusPinError}
                </span>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 2, py: 1.25, gap: 0.75, background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
              <Button
                type="button"
                onClick={() => setStatusApproval(null)}
                variant="outlined"
                size="small"
                sx={{
                  minHeight: 34,
                  px: 1.5,
                  borderRadius: 9,
                  textTransform: 'none',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#475569',
                  borderColor: '#cbd5e1',
                  background: '#fff',
                  '&:hover': { background: '#f1f5f9', borderColor: '#94a3b8' },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="small"
                sx={{
                  minHeight: 34,
                  px: 1.75,
                  borderRadius: 9,
                  textTransform: 'none',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  boxShadow: '0 3px 8px rgba(79, 70, 229, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)',
                    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.32)',
                  },
                }}
              >
                Volver estado
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Dialog
          open={deliveryConfirmationOpen}
          onClose={() => setDeliveryConfirmationOpen(false)}
          PaperProps={{
            sx: {
              width: 300,
              m: 1.5,
              borderRadius: '14px',
              overflow: 'hidden',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 14px 32px rgba(15, 23, 42, 0.2)',
            },
          }}
        >
          <DialogContent sx={{ px: 2, pt: '18px !important', pb: '10px !important', textAlign: 'center' }}>
            <span
              style={{
                width: 38,
                height: 38,
                margin: '0 auto 9px',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803d',
                background: '#dcfce7',
              }}
            >
              <CheckCircle2 size={21} strokeWidth={2.7} />
            </span>
            <div style={{ color: '#0f172a', fontFamily: "'Poppins', sans-serif", fontSize: '0.94rem', fontWeight: 800 }}>
              ¿Marcar como entregado?
            </div>
            <div style={{ marginTop: 5, color: '#64748b', fontSize: '0.78rem', lineHeight: 1.4 }}>
              Confirmá que el pedido fue entregado al cliente.
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 1.5, pt: 0.75, justifyContent: 'center', gap: 0.75 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setDeliveryConfirmationOpen(false)}
              sx={{
                borderRadius: 9,
                textTransform: 'none',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#475569',
                borderColor: '#cbd5e1',
              }}
            >
              Cancelar
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setDeliveryConfirmationOpen(false);
                handleSetProgress('delivered', false, true);
              }}
              sx={{
                borderRadius: 9,
                textTransform: 'none',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.72rem',
                fontWeight: 800,
                background: '#16a34a',
                boxShadow: 'none',
                '&:hover': { background: '#15803d', boxShadow: 'none' },
              }}
            >
              Sí, entregar
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
            <span style={{ width: 34, height: 34, borderRadius: 11, display: 'grid', placeItems: 'center', background: '#eef2ff', color: '#4338ca' }}>
              <Bike size={18} strokeWidth={2.5} />
            </span>
            {isAppOrder ? 'Enviar pedido' : 'Asignar repartidor'}
          </DialogTitle>
          <div
            style={{
              margin: '0 20px 12px',
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              border: '1px solid #e2e8f0',
            }}
          >
            {direccion === 'Retiro' ? <BiHomeAlt2 size={16} color="#64748b" /> : <MapPin size={16} color="#64748b" />}
            <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{direccion}</span>
          </div>
          <DialogContent
            sx={{
              px: 2.5,
              pt: 0.5,
              pb: 1,
              color: '#475569',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            ¿Querés marcar este pedido como enviado al delivery?
            <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
              Elegí quién lleva este pedido.
            </p>
            {deliveryUsersLoading ? (
              <div style={{ padding: '17px 12px', borderRadius: 14, background: '#f8fafc', color: '#64748b', fontSize: '0.82rem', textAlign: 'center' }}>
                Buscando repartidores activos…
              </div>
            ) : deliveryUsers.length === 0 ? (
              <div style={{ padding: '17px 12px', borderRadius: 14, background: '#fff7ed', color: '#c2410c', fontSize: '0.82rem', fontWeight: 600, textAlign: 'center' }}>
                No hay repartidores activos disponibles.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {deliveryUsers.map((user) => {
                  const selected = selectedDeliveryId === user.id;
                  const label = getDeliveryUserLabel(user);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => { setSelectedDeliveryId(user.id); setDeliveryCopyError(''); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 13, cursor: 'pointer', textAlign: 'left',
                        border: `1.5px solid ${selected ? '#6366f1' : '#e2e8f0'}`,
                        background: selected ? '#eef2ff' : '#fff', color: '#0f172a',
                        fontFamily: 'inherit', transition: 'all .16s ease',
                      }}
                    >
                      <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, background: selected ? '#6366f1' : '#f1f5f9', color: selected ? '#fff' : '#64748b', fontWeight: 800, fontSize: '0.76rem' }}>
                        {label.charAt(0).toUpperCase()}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, fontSize: '0.87rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                      <span style={{ width: 19, height: 19, borderRadius: '50%', display: 'grid', placeItems: 'center', border: `1.5px solid ${selected ? '#6366f1' : '#cbd5e1'}`, background: selected ? '#6366f1' : '#fff', color: '#fff' }}>
                        {selected && <Check size={13} strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {deliveryUsersError && (
              <p role="alert" style={{ color: '#b91c1c', margin: '10px 0 0', fontSize: '0.82rem' }}>
                {deliveryUsersError}
              </p>
            )}
            {deliveryCopyError && (
              <p role="alert" style={{ color: '#b91c1c', margin: '10px 0 0', fontSize: '0.82rem' }}>
                {deliveryCopyError}
              </p>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 2.5, pb: 2.25, pt: 1.5, gap: 0.75 }}>
            <Button
              onClick={() => {
                setDeliveryCopyOpen(false);
              }}
              variant="text"
              sx={{
                borderRadius: 10,
                textTransform: 'none',
                fontWeight: 700,
                fontFamily: 'Poppins, Inter, sans-serif',
                color: '#64748b',
                px: 1.25,
              }}
            >
              Cancelar
            </Button>
            {!isAppOrder && (
              <Button
                onClick={() => {
                  setDeliveryCopyOpen(false);
                  copyOrder();
                  setCopiado(true);
                  setTimeout(() => setCopiado(false), 1800);
                }}
                variant="outlined"
                sx={{ borderRadius: 10, textTransform: 'none', fontWeight: 700, fontFamily: 'Poppins, Inter, sans-serif', color: '#475569', borderColor: '#cbd5e1' }}
              >
                Solo copiar
              </Button>
            )}
            <Button
              onClick={async () => {
                const selectedDelivery = deliveryUsers.find((user) => user.id === selectedDeliveryId);
                if (!selectedDeliveryId || !selectedDelivery) {
                  setDeliveryCopyError('Elegí una cuenta de repartidor para continuar.');
                  return;
                }
                if (!isTest) {
                  setSavingDeliveryAssignment(true);
                  setDeliveryCopyError('');
                  try {
                    const sentAt = new Date().toISOString();
                    await pb.collection(getOrdersCollectionName()).update(id, {
                      copied: true,
                      deliveryId: selectedDelivery.id,
                      ...(!isAppOrder ? { enviado: sentAt } : {}),
                    });
                  } catch (err) {
                    console.error('Error asignando pedido al repartidor:', err);
                    setDeliveryCopyError('No se pudo asignar el pedido. Intentá nuevamente.');
                    setSavingDeliveryAssignment(false);
                    return;
                  }
                  setSavingDeliveryAssignment(false);
                }
                const sentAt = new Date().toISOString();
                setDeliveryCopyOpen(false);
                copyOrder();
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1800);
                sentFinalizedRef.current = false;
                sentAnimationCompleteRef.current = () => {
                  dispatch(
                    upsertOrder({
                      id,
                      copied: true,
                      deliveryId: selectedDelivery.id,
                      ...(!isAppOrder ? { enviado: sentAt } : {}),
                    })
                  );
                  if (isAppOrder) {
                    handleSetProgress('dispatched');
                  }
                  window.dispatchEvent(
                    new CustomEvent('order-copied-changed', { detail: { id, copied: true } })
                  );
                };
                setSentAnimationStage('confirm');
                localStorage.setItem(`order-copied-${id}`, 'true');
              }}
              disabled={
                sentAnimationStage !== null ||
                deliveryUsersLoading ||
                savingDeliveryAssignment ||
                deliveryUsers.length === 0 ||
                !selectedDeliveryId
              }
              variant="contained"
              sx={{
                borderRadius: 10,
                textTransform: 'none',
                fontWeight: 800,
                fontFamily: 'Poppins, Inter, sans-serif',
                backgroundColor: '#4f46e5',
                boxShadow: '0 6px 14px rgba(79, 70, 229, .22)',
                '&:hover': { backgroundColor: '#4338ca', boxShadow: '0 8px 18px rgba(79, 70, 229, .28)' },
              }}
              autoFocus
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Bike size={15} />
                {isLocalDeliveryOrder ? 'Enviar pedido' : 'Copiar y marcar enviado'}
              </span>
            </Button>
          </DialogActions>
        </Dialog>
      </TitleCard>
      <DirCard
        onClick={isDelivery ? clickBtnCopy : undefined}
        style={{
          cursor: isDelivery ? 'copy' : 'default',
          padding: '10px 12px',
          borderRadius: 12,
          background: isLocal
            ? '#ecfdf5'
            : isRetiro
              ? '#eff6ff'
              : isCopied
                ? '#f0fdf4'
                : '#fff1f2',
          border: `1px solid ${
            isLocal ? '#a7f3d0' : isRetiro ? '#bfdbfe' : isCopied ? '#bbf7d0' : '#fecdd3'
          }`,
          boxShadow: `0 1px 2px ${
            isLocal
              ? 'rgba(5, 150, 105, 0.06)'
              : isRetiro
                ? 'rgba(37, 99, 235, 0.06)'
                : isCopied
                  ? 'rgba(21, 128, 61, 0.08)'
                  : 'rgba(225, 29, 72, 0.06)'
          }`,
          transition: 'background 0.18s ease, border-color 0.18s ease',
        }}
        title={
          isDelivery
            ? isLocalDeliveryOrder
              ? 'Asignar repartidor y enviar pedido'
              : 'Copiar datos del pedido para delivery'
            : undefined
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: isLocal
                ? '#047857'
                : isRetiro
                  ? '#1d4ed8'
                  : isCopied
                    ? '#15803d'
                    : '#be123c',
              background: isLocal
                ? '#d1fae5'
                : isRetiro
                  ? '#dbeafe'
                  : isCopied
                    ? '#dcfce7'
                    : '#ffe4e6',
            }}
          >
            {isLocal ? (
              <Store size={18} strokeWidth={2.2} />
            ) : isRetiro ? (
              <ShoppingBag size={18} strokeWidth={2.2} />
            ) : (
              <Bike size={18} strokeWidth={2.2} />
            )}
          </span>
          <div
            style={{
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
              textAlign: 'left',
            }}
          >
            <span
              style={{
                color: isLocal
                  ? '#047857'
                  : isRetiro
                    ? '#1d4ed8'
                    : isCopied
                      ? '#15803d'
                      : '#be123c',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.76rem',
                lineHeight: 1.2,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                textAlign: 'left',
              }}
            >
              {isLocal ? 'Comer en el local' : isRetiro ? 'Take Away / Retiro' : 'Delivery'}
            </span>
            {!isLocal && (
              <Direccion
                style={{
                  color: '#1e293b',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textAlign: 'left',
                  alignSelf: 'flex-start',
                }}
              >
                {isRetiro
                  ? direccion === 'Retiro'
                    ? 'Retiro en mostrador'
                    : direccion
                  : direccion}
              </Direccion>
            )}
          </div>
        </div>
      </DirCard>
      {isLocalDeliveryOrder && !isCopied && (
        <button
          type="button"
          onClick={clickBtnCopy}
          style={{
            width: '100%',
            marginTop: 8,
            marginBottom: 10,
            minHeight: 40,
            border: '1px solid #16a34a',
            borderRadius: 10,
            background: '#16a34a',
            color: '#fff',
            font: "700 0.86rem 'Inter', sans-serif",
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
          }}
        >
          <Bike size={16} strokeWidth={2.6} /> Enviar pedido
        </button>
      )}
      <div
        style={{
          marginBottom: 14,
          filter: 'drop-shadow(0 5px 12px rgba(15, 23, 42, 0.06))',
        }}
      >
        {/* Productos: integrado tipo footer */}
          <div
            style={{
              margin: 0,
            }}
          >
            <div
              style={{
                position: 'relative',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderBottom: 'none',
                borderRadius: '18px 18px 0 0',
                padding: '18px 18px 14px',
                fontFamily: "'Inter', sans-serif",
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  fontSize: 12.5,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#172033',
                  marginBottom: 14,
                }}
              >
                <span style={{ marginRight: 'auto' }}>Resumen del pedido</span>
                {!isBarista && !isOrderSent && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditItemsOpen(true);
                    }}
                    title="Revisar o editar productos y sabores del pedido"
                    style={{
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#334155',
                      borderRadius: 5,
                      padding: '1px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <MdEdit size={11} /> Editar
                  </button>
                )}
              </div>

              {/* Lista */}
              <div style={{ display: 'grid', gap: 10, fontSize: '0.90rem' }}>
                  {groupedItems.map((it, idx) => {
                    const cantidad = it.quantity;
                    const nombre = it.name;
                    // si en tus items existe price, total, subtotal, etc, lo tomamos
                    const unitPrice = Number(it?.price ?? it?.unitPrice ?? it?.precio ?? 0) || 0;

                    const lineTotal =
                      Number(it?.total ?? it?.subtotal ?? 0) ||
                      (unitPrice ? unitPrice * cantidad : 0);
                    const sabores = formatFlavorPortions(it?.sabores);
                    const lowerName = String(nombre || '').toLowerCase();
                    const lowerCategory = String(it?.category || '').toLowerCase();
                    const isShippingLine =
                      lowerName.includes('envío') ||
                      lowerName.includes('envio') ||
                      lowerCategory.includes('envio');
                    const isSmoothie =
                      lowerName.includes('smoothie') || lowerCategory.includes('smoothie');
                    const sizeLabel = isSmoothie
                      ? '12oz'
                      : getCleanSizeLabel(it.size || it.medida || '');
                    const sizeBadgeInfo = sizeLabel ? getSizeBadgeInfo(sizeLabel) : null;
                    const isItemBaristaDone = Boolean(
                      baristaDone && (it._isBarista ?? isBaristaItem(it))
                    );

                    if (lowerCategory === 'extras') {
                      const { name: extraName, quantity: extraQuantity } =
                        getExtraItemDetails(it);

                      return (
                        <div
                          key={idx}
                          style={{
                            display: idx > 1 && !isItemListExpanded ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '2px 0 10px',
                            borderBottom: idx === groupedItems.length - 1 ? 'none' : '1px dashed #e2e8f0',
                          }}
                        >
                          <span
                            title={`Extra: ${extraName}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              maxWidth: '100%',
                              padding: '3px 8px',
                              borderRadius: 7,
                              border: '1px solid #fed7aa',
                              background: '#fff7ed',
                              color: '#9a3412',
                              fontSize: 11.5,
                              fontWeight: 700,
                              lineHeight: 1.35,
                            }}
                          >
                            <Plus size={12} strokeWidth={2.5} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {extraQuantity} {extraName}
                            </span>
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#64748b',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {lineTotal ? formatPrice(lineTotal) : '—'}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        style={{
                          display: idx > 1 && !isItemListExpanded ? 'none' : 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          paddingBottom: idx === groupedItems.length - 1 ? 0 : 12,
                          position: idx === 1 && !isItemListExpanded ? 'relative' : undefined,
                          maxHeight: idx === 1 && !isItemListExpanded ? 48 : undefined,
                          overflow: idx === 1 && !isItemListExpanded ? 'hidden' : undefined,
                          filter: idx === 1 && !isItemListExpanded ? 'blur(1.2px)' : undefined,
                          opacity: idx === 1 && !isItemListExpanded ? 0.72 : undefined,
                          borderBottom:
                            idx === groupedItems.length - 1
                              ? 'none'
                              : '1px dashed #d8dee8',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            gap: 12,
                          }}
                        >
                          {/* Producto */}
                          <div
                            style={{
                              minWidth: 0,
                              fontSize: 14.5,
                              fontWeight: 700,
                              lineHeight: 1.3,
                              color: '#172033',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              flexWrap: 'wrap',
                            }}
                          >
                            <span>{nombre}</span>
                            {sizeLabel && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  padding: '1px 6px',
                                  borderRadius: 5,
                                  border: '1px solid #e2e8f0',
                                  background: '#f8fafc',
                                  color: '#64748b',
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  lineHeight: 1.35,
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}
                              >
                                <CupSoda size={10} strokeWidth={2} />
                                {sizeBadgeInfo ? sizeBadgeInfo.label : sizeLabel}
                              </span>
                            )}
                            {isItemBaristaDone && (
                              <span
                                title="Preparado por barista"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 16,
                                  height: 16,
                                  borderRadius: 5,
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  border: '1px solid #86efac',
                                  flexShrink: 0,
                                }}
                              >
                                <Check size={10} strokeWidth={3} />
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 6,
                              flexShrink: 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#475569',
                              }}
                            >
                              {isShippingLine ? '' : `${cantidad}x`}
                            </span>
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: '#172033',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {isShippingLine ? '' : lineTotal ? formatPrice(lineTotal) : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Sabores abajo, como subticket (helados, etc., excepto smoothies y cookies) */}
                        {(() => {
                          const itNL = lowerName;
                          const isSm = itNL.includes('smoothie') || String(it?.category || '').toLowerCase().includes('smoothie');
                          const isCk = itNL.includes('cookie') || itNL.includes('galletita') || String(it?.category || '').toLowerCase().includes('cookie');
                          const visibleSabores = sabores.filter(
                            (s) => !itNL.includes(String(s || '').trim().toLowerCase())
                          );
                          if (isSm || isCk || !visibleSabores.length) return null;
                          return (
                            <div
                              style={{
                                marginLeft: 0,
                                paddingLeft: 2,
                                borderLeft: '2px solid rgba(0,0,0,0.08)',
                                color: '#64748b',
                                fontSize: 12,
                                textAlign: 'left',
                                lineHeight: 1.45,
                                marginTop: 2,
                              }}
                            >
                              {visibleSabores.join(', ')}
                            </div>
                          );
                        })()}

                        {/* Detalles (Cafetería, medida, extras, smoothie, notas) */}
                        {(() => {
                          const rawExtras = Array.isArray(it.extras) ? it.extras.filter(Boolean) : [];
                          const extraName = (extra) =>
                            String(typeof extra === 'string' ? extra : extra?.name || '')
                              .replace(/\s*\(\+?\$?\d+\)/g, '')
                              .trim();
                          const isTopping = (extra) =>
                            /topping|frambuesa|salsa/i.test(extraName(extra));
                          const linkedTopping = it.topping || rawExtras.find(isTopping);
                          const toppingName = extraName(linkedTopping);
                          const exList = rawExtras
                            .filter((extra) => extra !== linkedTopping && !isTopping(extra))
                            .map(extraName)
                            .filter(Boolean);
                          if ((it.canela || it.withCinnamon) && !exList.some((e) => /canela/i.test(e))) exList.push('Canela');
                          if (it.leche_almendras && !exList.some((e) => /almendra/i.test(e))) exList.push('Leche Almendras');
                          if (it.extra_shot && !exList.some((e) => /shot/i.test(e))) exList.push('Extra Shot');

                          const cleanDetailNote = getCleanItemNote(it);

                          const extraBadges = [toppingName, ...exList].filter(Boolean);
                          if (!extraBadges.length && !it.vaso && !cleanDetailNote) return null;

                          return (
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: 5,
                                textAlign: 'left',
                                paddingLeft: 2,
                                marginTop: 3,
                              }}
                            >
                              {extraBadges.map((extra, extraIdx) => (
                                <span
                                  key={`${extra}-${extraIdx}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    maxWidth: '100%',
                                    padding: '2px 7px',
                                    borderRadius: 6,
                                    border: '1px solid #fed7aa',
                                    background: '#fff7ed',
                                    color: '#9a3412',
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  <Plus size={10} strokeWidth={2.5} />
                                  {extra}
                                </span>
                              ))}
                              {it.vaso && (
                                <span
                                  title={`Nombre en el vaso: ${it.vaso}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    maxWidth: '100%',
                                    padding: '2px 7px',
                                    borderRadius: 6,
                                    border: '1px solid #bfdbfe',
                                    background: '#eff6ff',
                                    color: '#1e40af',
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  <CupSoda size={10} strokeWidth={2.2} />
                                  <span style={{ opacity: 0.75 }}>Vaso:</span>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {it.vaso}
                                  </span>
                                </span>
                              )}

                              {cleanDetailNote && (
                                <span
                                  style={{
                                    fontSize: 11.5,
                                    fontStyle: 'italic',
                                    color: '#64748b',
                                  }}
                                >
                                  "{cleanDetailNote}"
                                </span>
                              )}
                            </div>
                          );
                        })()}
                        {idx === 1 && !isItemListExpanded && (
                          <div
                            aria-hidden="true"
                            style={{
                              position: 'absolute',
                              inset: '12px 0 0',
                              background:
                                'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 100%)',
                              pointerEvents: 'none',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                  {groupedItems.length > 1 && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsItemListExpanded((expanded) => !expanded);
                      }}
                      aria-expanded={isItemListExpanded}
                      style={{
                        justifySelf: 'center',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 999,
                        background: '#f8fafc',
                        color: '#475569',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {isItemListExpanded
                        ? 'Ver menos'
                        : `Ver ${groupedItems.length - 1} producto${groupedItems.length === 2 ? '' : 's'} más`}
                      <ChevronDown
                        size={14}
                        style={{
                          transform: isItemListExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </button>
                  )}
                </div>
              </div>
              <div
                aria-hidden="true"
                style={{
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  background: '#ffffff',
                  borderLeft: '1px solid #e2e8f0',
                  borderRight: '1px solid #e2e8f0',
                }}
              >
                <span
                  style={{
                    width: 13,
                    height: 13,
                    flexShrink: 0,
                    marginLeft: -7,
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <span style={{ flex: 1, borderTop: '1px dashed #cbd5e1' }} />
                <span
                  style={{
                    width: 13,
                    height: 13,
                    flexShrink: 0,
                    marginRight: -7,
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                  }}
                />
              </div>
            </div>

      <FooterCard
        style={{
          marginTop: -1,
          padding: '0 0 10px',
          background: '#ffffff',
          borderTop: 'none',
          borderLeft: '1px solid #e2e8f0',
          borderRight: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          borderRadius: '0 0 18px 18px',
        }}
      >
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
              {(isRetiro || isLocal) ? 'Pagó' : 'Paga'}
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
                      {(isRetiro || isLocal) ? 'Efectivo' : formatPrice(paid)}
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
      </div>

      {/* Botón táctil principal de estado estilo PedidosYa / Rappi (Idea 1) */}
      {scheduledStart && <div style={{ padding: '8px 12px', borderRadius: 9, background: '#eef2ff', color: '#4338ca', fontSize: 13, fontWeight: 700 }}>Programado · {scheduleLabel({ scheduledStart, scheduledEnd })}</div>}
      {isAppOrder && renderProgressControl(false)}

      <OrderItemsEditorModal
        open={editItemsOpen && !isOrderSent}
        onClose={() => setEditItemsOpen(false)}
        orderId={id}
        numeracion={numeracion}
        appOrderCode={isAppOrder ? appOrderCode : ''}
        customerName={name}
        customerPhone={phone}
        isAppOrder={isAppOrder}
        initialItems={items}
        initialTotal={total}
        implicitEnvio={implicitEnvio}
        allProducts={allProducts}
        canAcceptAndPrint={
          Boolean(isAppOrder && (!currentProgress || currentProgress === 'pending' || currentProgress === 'received'))
        }
        onSave={async ({ items: nextItems, total: nextTotal, acceptAndPrint }) => {
          await dispatch(
            updateOrderItems({
              id,
              items: nextItems,
              total: nextTotal,
              progress: acceptAndPrint ? 'preparing' : undefined,
            })
          ).unwrap();
          if (acceptAndPrint) {
            setTimeout(() => {
              doPrintRef.current?.();
            }, 100);
          }
        }}
      />

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
          db: Number(viewDb || 0),
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

    </ContainerCard>
  );
});

export default CardOrders;
