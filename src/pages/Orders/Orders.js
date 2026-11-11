import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowUp,
  BellRing,
  Bike,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Clock,
  Coffee,
  Eye,
  FlaskConical,
  LoaderCircle,
  PackageCheck,
  Search,
  Smartphone,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Menu, MenuItem } from '@mui/material';
import { FaXmark } from 'react-icons/fa6';
import PrintIcon from '@mui/icons-material/Print';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';

import logoPixel from '../../assets/logoprint.png';
import { pb } from '../../lib/pb';
import { isScheduledOpen, isWaitingSchedule } from '../../utils/scheduledOrders';
import { getOrdersCollectionName } from '../../lib/ordersCollection';
import {
  addTestOrder,
  clearTestOrders,
  deleteTestOrder,
  fetchMoreOrders,
  fetchTodayPendingOrders,
  hydrateAllTodayOrders,
  hydrateOrdersFromPocket,
  setOrderBaristaStatus,
  subscribeOrdersRealtime,
  syncPendingOrders,
  upsertOrder,
} from '../../redux/orders/ordersSlice';
import { computeBusinessDate } from '../../utils/stats';
import { isBaristaOrder } from '../../utils/cafeStockSync';
import { useLanSync } from '../../utils/lanSyncClient';
import {
  isBaristaSoundEnabled,
  playBaristaNotificationSound,
  setBaristaScreenActive,
} from '../../utils/soundNotifications';
import { notifyWindowsOfAppOrder } from '../../utils/windowsNotifications';

import {
  ContainerOrders,
  GlobalOrders,
  LoadMoreButton,
} from './OrdersStyles';

import CardOrders from '../../components/Orders/CardOrders';
import BaristaRecipeModal from '../../components/Orders/BaristaRecipeModal';
import { getBaristaRecipe } from '../../components/Orders/baristaRecipesData';
import { MOCK_BARISTA_ORDERS } from '../../components/Orders/mockBaristaOrders';
import { isAndroid } from '../../utils/printBluetooth';

const MOCK_PENDING_DELIVERY_ORDER = {
  id: 'mock-pending-delivery-dev',
  numeracion: 99,
  name: 'Simulación Dev',
  direccion: 'Av. Corrientes 1234',
  total: 12500,
  pago: 'Transferencia',
  method: 'transferencia',
  clientCreatedAt: Date.now(),
  created: new Date().toISOString(),
  copied: false,
  pending: false,
  items: [
    { name: '1 Kg Helado', quantity: 1, price: 12500, category: 'Helados' },
  ],
};

const SHOW_TOP_PENDING_BANNER = false; // Deshabilitado temporalmente por solicitud del usuario

const SIMULATE_APP_OPTIONS = [
  { progress: 'pending', type: 'delivery', label: 'Pendiente (Delivery)', icon: Clock, color: '#b45309' },
  { progress: 'pending', type: 'take_away', label: 'Pendiente (Take Away)', icon: Clock, color: '#b45309' },
  { progress: 'received', type: 'delivery', label: 'Recibido', icon: Eye, color: '#0284c7' },
  { progress: 'preparing', type: 'delivery', label: 'En preparación', icon: ChefHat, color: '#7c3aed' },
  { progress: 'dispatched', type: 'delivery', label: 'Despachado (Delivery)', icon: Bike, color: '#4338ca' },
  { progress: 'ready', type: 'take_away', label: 'Listo para retirar (Take Away)', icon: PackageCheck, color: '#059669' },
  { progress: 'delivered', type: 'delivery', label: 'Entregado', icon: CheckCircle2, color: '#15803d' },
  { progress: 'pickedup', type: 'take_away', label: 'Entregado (Take Away)', icon: CheckCircle2, color: '#15803d' },
];

export default function Orders({ isBarista = false, isTestOrders = false }) {
  const dispatch = useDispatch();
  const unsubRef = useRef(null);
  const { orders, testOrders = [], pagination, status } = useSelector((s) => s.orders);
  const isAdmin = useSelector((s) => s.actions?.isAdmin);
  const isTestMode = useSelector((s) => s.actions?.isTestMode);
  const [scheduledRecords, setScheduledRecords] = useState([]);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleNow, setScheduleNow] = useState(Date.now());
  useEffect(() => {
    let active = true;
    let refreshingSchedule = false;
    const collection = isTestOrders || isTestMode ? 'orders_test' : getOrdersCollectionName();
    setScheduledRecords([]);
    const refresh = async () => {
      if (!active || refreshingSchedule || document.visibilityState !== 'visible') return;
      refreshingSchedule = true;
      try {
        const records = await pb.collection(collection).getFullList({
          filter: 'scheduledStart != "" && progress != "delivered" && progress != "pickedup" && entregado = ""',
          sort: 'scheduledStart', requestKey: null,
        });
        if (active) {
          records.forEach((record) => dispatch(upsertOrder(record)));
          setScheduledRecords(records); setScheduleError(''); setScheduleNow(Date.now());
        }
      } catch (error) { if (active) setScheduleError('No se pudieron actualizar los pedidos programados.'); }
      finally { refreshingSchedule = false; }
    };
    refresh();
    const clock = setInterval(() => setScheduleNow(Date.now()), 30000);
    const interval = setInterval(refresh, 300000);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    let stop;
    pb.collection(collection).subscribe('*', ({ action, record }) => {
      if (!active || !record) return;
      const openSchedule = record.scheduledStart && !['delivered', 'pickedup'].includes(record.progress) && !record.entregado;
      if (openSchedule && action !== 'delete') dispatch(upsertOrder(record));
      setScheduledRecords((current) => {
        const rest = current.filter((item) => item.id !== record.id);
        if (!openSchedule || action === 'delete') return rest.length === current.length ? current : rest;
        return [...rest, record].sort((a, b) => String(a.scheduledStart).localeCompare(String(b.scheduledStart)));
      });
    }).then((unsubscribe) => {
      if (active) stop = unsubscribe; else unsubscribe();
    }).catch(() => {});
    return () => { active = false; clearInterval(clock); clearInterval(interval); stop?.(); document.removeEventListener('visibilitychange', onVisible); };
  }, [dispatch, isTestOrders, isTestMode]);
  const simulatedPendingOrder = useSelector((s) => s.actions?.simulatedPendingOrder);
  const [addressQuery, setAddressQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('pending');
  const [visibleOrderLimit, setVisibleOrderLimit] = useState(10);
  const { isConnected: isLanConnected, isServer: isLanServer } = useLanSync();
  const [simMenuAnchor, setSimMenuAnchor] = useState(null);

  const handleSimulateAppOrder = useCallback(
    (targetProgress = 'pending', type = 'delivery') => {
      const testId = `local-test-app-${Date.now()}`;
      const now = new Date();
      const horaStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      const isDeliv = type === 'delivery';

      const mockAppOrder = {
        id: testId,
        number: Math.floor(100 + Math.random() * 900),
        numeracion: Math.floor(100 + Math.random() * 900),
        source: 'app',
        mode: isDeliv ? 'delivery' : 'retiro',
        progress: targetProgress,
        name: 'Cliente App Web (Prueba)',
        phone: '11 4567-8901',
        direccion: isDeliv ? 'Av. Corrientes 2450, 5° A' : 'Retiro',
        total: 9200,
        pago: 'Mercado Pago (App)',
        method: 'transferencia',
        pagoMp: 9200,
        pagoEfectivo: 0,
        pagoDebito: 0,
        cambio: 0,
        check: false,
        copied: targetProgress === 'dispatched',
        baristaDone:
          targetProgress === 'ready' ||
          targetProgress === 'dispatched' ||
          targetProgress === 'delivered' ||
          targetProgress === 'pickedup',
        isTestOrder: true,
        clientCreatedAt: Date.now(),
        created: now.toISOString(),
        hora: horaStr,
        items: [
          {
            name: 'Latte Vainilla',
            quantity: 1,
            price: 4200,
            category: 'Cafeteria',
            size: '12oz',
            extras: ['Leche de Almendras'],
          },
          {
            name: '1/2 Kg Helado',
            quantity: 1,
            price: 5000,
            category: 'Helados',
            sabores: ['Dulce de Leche Pixel', 'Chocolate Especial'],
          },
        ],
      };

      dispatch(addTestOrder(mockAppOrder));

      if (isBarista && isBaristaSoundEnabled()) {
        try {
          playBaristaNotificationSound(testId);
        } catch {}
      }
    },
    [dispatch, isBarista]
  );

  const handleTestWindowsNotification = useCallback(() => {
    notifyWindowsOfAppOrder({
      id: 'app-test-4f8a2c',
      direccion: 'Av. Corrientes 2450, 5° A',
      total: 9200,
    });
  }, []);

  const renderSimulateButton = (compact = false) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => handleSimulateAppOrder('pending', 'delivery')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#6d28d9',
          color: '#fff',
          border: 'none',
          borderRadius: '8px 0 0 8px',
          padding: compact ? '5px 8px' : '7px 12px',
          fontSize: compact ? '0.74rem' : '0.8rem',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(109, 40, 217, 0.3)',
          transition: 'filter 0.15s ease',
          fontFamily: "'Inter', sans-serif",
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.12)')}
        onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
        title="Crear pedido de prueba de la App Web (Pendiente)"
      >
        <Smartphone size={compact ? 12 : 14} />
        {compact ? 'Simular App' : 'Simular pedido App'}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setSimMenuAnchor(e.currentTarget);
        }}
        style={{
          background: '#5b21b6',
          color: '#fff',
          border: 'none',
          borderLeft: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '0 8px 8px 0',
          padding: compact ? '5px 6px' : '7px 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(109, 40, 217, 0.3)',
          transition: 'filter 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
        title="Elegir estado específico para simular"
      >
        <ChevronDown size={compact ? 12 : 14} />
      </button>

      <Menu
        anchorEl={simMenuAnchor}
        open={Boolean(simMenuAnchor)}
        onClose={() => setSimMenuAnchor(null)}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
            minWidth: 235,
            py: 0.5,
          },
        }}
      >
        <div style={{ padding: '6px 14px 4px', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
          Simular pedido en estado:
        </div>
        {SIMULATE_APP_OPTIONS.map((opt, i) => {
          const OptIcon = opt.icon;
          return (
            <MenuItem
              key={i}
              onClick={() => {
                setSimMenuAnchor(null);
                handleSimulateAppOrder(opt.progress, opt.type);
              }}
              sx={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: opt.color,
                py: 0.8,
                gap: 1.2,
                '&:hover': {
                  backgroundColor: `${opt.color}14`,
                },
              }}
            >
              <OptIcon size={15} color={opt.color} strokeWidth={2.4} />
              <span style={{ flex: 1 }}>{opt.label}</span>
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );

  useEffect(() => {
    if (isBarista) {
      setBaristaScreenActive(true);
      return () => setBaristaScreenActive(false);
    }
  }, [isBarista]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Estado para guardar localmente qué pedidos ya preparó el barista
  const [preparedOrders, setPreparedOrders] = useState(() => {
    const map = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('barista-prepared-')) {
        map[key.replace('barista-prepared-', '')] = true;
      }
    }
    return map;
  });

  const isOrderPrepared = useCallback(
    (o) => {
      if (!o) return false;
      // Para órdenes sincronizadas en PocketBase / Redux, manda el boolean del servidor
      if (typeof o.baristaDone === 'boolean') {
        return o.baristaDone;
      }
      return Boolean(preparedOrders[o.id]);
    },
    [preparedOrders]
  );

  const handleMarkPrepared = useCallback(
    (orderId) => {
      localStorage.setItem(`barista-prepared-${orderId}`, 'true');
      setPreparedOrders((prev) => ({ ...prev, [orderId]: true }));
      dispatch(setOrderBaristaStatus({ id: orderId, baristaDone: true }));
    },
    [dispatch]
  );

  const handleUnmarkPrepared = useCallback(
    (orderId) => {
      localStorage.removeItem(`barista-prepared-${orderId}`);
      setPreparedOrders((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      dispatch(setOrderBaristaStatus({ id: orderId, baristaDone: false }));
    },
    [dispatch]
  );

  const handleDeleteTestOrder = useCallback(
    (orderId) => {
      dispatch(deleteTestOrder(orderId));
      localStorage.removeItem(`barista-prepared-${orderId}`);
      setPreparedOrders((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    },
    [dispatch]
  );

  const [showCompletedBarista, setShowCompletedBarista] = useState(false);
  const [baristaTab, setBaristaTab] = useState('pending'); // 'pending' | 'completed'
  const [showMockOrders, setShowMockOrders] = useState(false);

  const [cafeteriaProducts, setCafeteriaProducts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pb_cafeteria_products_v1') || '[]');
    } catch {
      return [];
    }
  });

  const [recipeModalData, setRecipeModalData] = useState(null);

  useEffect(() => {
    if (!isBarista) return;
    let cancelled = false;
    pb.collection('products_cafeteria')
      .getFullList({ sort: 'name' })
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          setCafeteriaProducts(list);
          try {
            localStorage.setItem('pb_cafeteria_products_v1', JSON.stringify(list));
          } catch {}
        }
      })
      .catch((err) => console.log('PB cafeteria products load:', err));

    const coll = pb.collection('products_cafeteria');
    const handler = () => {
      pb.collection('products_cafeteria')
        .getFullList({ sort: 'name' })
        .then((list) => {
          if (!cancelled && Array.isArray(list)) {
            setCafeteriaProducts(list);
            try {
              localStorage.setItem('pb_cafeteria_products_v1', JSON.stringify(list));
            } catch {}
          }
        })
        .catch(console.error);
    };
    coll.subscribe('*', handler).catch(() => {});

    return () => {
      cancelled = true;
      coll.unsubscribe('*').catch(() => {});
    };
  }, [isBarista]);

  const handleOpenRecipe = useCallback((item) => {
    const recipeData = getBaristaRecipe(item, cafeteriaProducts);
    setRecipeModalData(recipeData);
  }, [cafeteriaProducts]);

  const handleToggleMockOrders = () => {
    setShowMockOrders((prev) => {
      const next = !prev;
      if (next) {
        setPreparedOrders((old) => {
          const updated = { ...old };
          MOCK_BARISTA_ORDERS.forEach((m) => {
            delete updated[m.id];
            localStorage.removeItem(`barista-prepared-${m.id}`);
          });
          return updated;
        });
      }
      return next;
    });
  };

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
    const hasMoreLoadedMatches = filteredTodayOrders.length > visibleOrderLimit;
    setVisibleOrderLimit((limit) => limit + 10);
    if (!hasMoreLoadedMatches) {
      dispatch(fetchMoreOrders());
    }
  };

  useEffect(() => {
    if (isTestOrders) {
      setIsInitialLoading(false);
      return;
    }
    if (isBarista) {
      dispatch(hydrateAllTodayOrders()).finally(() => setIsInitialLoading(false));
      return;
    }
    dispatch(hydrateOrdersFromPocket({ page: 1, perPage: 10 })).finally(() =>
      setIsInitialLoading(false)
    );
    dispatch(fetchTodayPendingOrders());
    // isTestMode: al cambiar de modo se recarga desde `orders` u `orders_test`
  }, [dispatch, isTestOrders, isBarista, isTestMode]);

  useEffect(() => {
    if (isTestOrders) return;
    let cancelled = false;
    unsubRef.current = null;
    dispatch(subscribeOrdersRealtime())
      .then((action) => {
        const unsub = action?.payload;
        if (typeof unsub !== 'function') return;
        if (cancelled) unsub();
        else unsubRef.current = unsub;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (typeof unsubRef.current === 'function') unsubRef.current();
      unsubRef.current = null;
    };
  }, [dispatch, isTestOrders, isTestMode]);

  useEffect(() => {
    if (isTestOrders) return;
    const handleOnline = () => {
      dispatch(syncPendingOrders());
      if (navigator.onLine) {
        dispatch(hydrateOrdersFromPocket({ page: 1, perPage: 10 }));
        dispatch(fetchTodayPendingOrders());
      }
    };
    window.addEventListener('online', handleOnline);
    if (navigator.onLine) dispatch(syncPendingOrders());
    return () => window.removeEventListener('online', handleOnline);
  }, [dispatch, isTestOrders]);

  // Refrescar periódicamente los pedidos pendientes del día en segundo plano
  useEffect(() => {
    if (isTestOrders) return;
    const timer = setInterval(() => {
      if (navigator.onLine && !isBarista && document.visibilityState === 'visible') {
        dispatch(fetchTodayPendingOrders());
      }
    }, 120000);
    return () => clearInterval(timer);
  }, [dispatch, isBarista, isTestOrders]);

  // Listener para sincronizar testOrders entre pestañas o al reenfocar
  const [storageTick, setStorageTick] = useState(0);
  useEffect(() => {
    const handleStorage = (e) => {
      if (!e || e.key === 'pixel_pos_test_orders_v1' || !e.key) {
        setStorageTick((t) => t + 1);
      }
    };
    window.addEventListener('storage', handleStorage);
    const handleFocus = () => setStorageTick((t) => t + 1);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const effectiveOrders = useMemo(() => {
    void storageTick;
    let storedTest = [];
    try {
      storedTest = JSON.parse(localStorage.getItem('pixel_pos_test_orders_v1') || '[]');
    } catch {}

    if (isTestOrders) {
      const combined = [...(testOrders || [])];
      storedTest.forEach((st) => {
        if (st && st.id && !combined.some((x) => x.id === st.id)) {
          combined.push(st);
        }
      });
      const seen = new Set(combined.map((o) => o.id));
      (orders || []).forEach((o) => {
        if ((o?.isTestOrder || (o?.id && String(o.id).startsWith('local-test-'))) && !seen.has(o.id)) {
          combined.push(o);
          seen.add(o.id);
        }
      });
      return combined;
    }

    if (isBarista) {
      // En la vista Barista se visualizan tanto los pedidos reales como los pedidos de prueba
      const normalOrders = (orders || []).filter(
        (o) => !o?.isTestOrder && !String(o?.id || '').startsWith('local-test-')
      );
      const combined = [...normalOrders];
      const seen = new Set(combined.map((o) => o.id));

      const allTest = [...(testOrders || [])];
      storedTest.forEach((st) => {
        if (st && st.id && !allTest.some((x) => x.id === st.id)) {
          allTest.push(st);
        }
      });

      (orders || []).forEach((o) => {
        if (o?.isTestOrder || (o?.id && String(o.id).startsWith('local-test-'))) {
          allTest.push(o);
        }
      });

      allTest.forEach((to) => {
        if (to && to.id && !seen.has(to.id)) {
          combined.push(to);
          seen.add(to.id);
        }
      });

      return combined;
    }

    if (isTestMode) {
      // En modo prueba activo, mostramos pedidos normales + pedidos de prueba
      const normalOrders = (orders || []).filter(
        (o) => !o?.isTestOrder && !String(o?.id || '').startsWith('local-test-')
      );
      const combined = [...normalOrders];
      const seen = new Set(combined.map((o) => o.id));

      const allTest = [...(testOrders || [])];
      storedTest.forEach((st) => {
        if (st && st.id && !allTest.some((x) => x.id === st.id)) {
          allTest.push(st);
        }
      });

      (orders || []).forEach((o) => {
        if (o?.isTestOrder || (o?.id && String(o.id).startsWith('local-test-'))) {
          allTest.push(o);
        }
      });

      allTest.forEach((to) => {
        if (to && to.id && !seen.has(to.id)) {
          combined.push(to);
          seen.add(to.id);
        }
      });

      return combined;
    }

    return (orders || []).filter(
      (o) => !o?.isTestOrder && !String(o?.id || '').startsWith('local-test-')
    );
  }, [isTestOrders, isBarista, isTestMode, testOrders, orders, storageTick]);

  const todayBusinessDate = computeBusinessDate(new Date(), 3);
  const todayOrders = useMemo(() => {
    if (isTestOrders) {
      return effectiveOrders;
    }
    return effectiveOrders.filter((order) => {
      // Pedidos de prueba SIEMPRE se incluyen en la vista sin filtrarse por fecha
      if (order?.isTestOrder || String(order?.id || '').startsWith('local-test-')) {
        return true;
      }
      const bDate = order.businessDate || order.day;
      return isScheduledOpen(order) || !bDate || bDate === todayBusinessDate;
    });
  }, [effectiveOrders, isTestOrders, todayBusinessDate]);

  const sortedTodayOrders = useMemo(() => {
    const list = [...todayOrders];
    if (simulatedPendingOrder && !isBarista && !isTestOrders) {
      list.unshift(MOCK_PENDING_DELIVERY_ORDER);
    }
    return list.sort((a, b) => {
      const ta = Number(a.clientCreatedAt) || new Date(a.created ?? 0).getTime();
      const tb = Number(b.clientCreatedAt) || new Date(b.created ?? 0).getTime();
      return tb - ta;
    });
  }, [todayOrders, simulatedPendingOrder, isBarista, isTestOrders]);

  const isDevelopmentBuild = process.env.NODE_ENV === 'development';
  const isDev = isDevelopmentBuild || Boolean(isAdmin);
  const isAndroidApp = isAndroid();
  const [showDevTicketPreview, setShowDevTicketPreview] = useState(false);

  const allOrdersList = useMemo(() => {
    if (isBarista && showMockOrders && !isAndroidApp) {
      return [...MOCK_BARISTA_ORDERS, ...sortedTodayOrders];
    }
    const merged = new Map(sortedTodayOrders.map((order) => [order.id, order]));
    scheduledRecords.forEach((order) => merged.set(order.id, order));
    return [...merged.values()];
  }, [sortedTodayOrders, scheduledRecords, isBarista, showMockOrders, isAndroidApp]);

  const [localChangeTick, setLocalChangeTick] = useState(0);

  useEffect(() => {
    const handler = () => setLocalChangeTick((t) => t + 1);
    window.addEventListener('order-copied-changed', handler);
    return () => {
      window.removeEventListener('order-copied-changed', handler);
    };
  }, []);

  const copiedIdsSet = useMemo(() => {
    void localChangeTick;
    void allOrdersList;
    const set = new Set();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('order-copied-') && localStorage.getItem(k) === 'true') {
          set.add(k.replace('order-copied-', ''));
        }
      }
    } catch (e) {}
    return set;
  }, [allOrdersList, localChangeTick]);

  const { rankById } = useMemo(() => {
    const pendingCount = sortedTodayOrders.filter((o) => o?.pending).length;

    const serverCount =
      !isTestOrders &&
      typeof pagination?.totalItems === 'number' &&
      Number.isFinite(pagination.totalItems)
        ? pagination.totalItems
        : sortedTodayOrders.filter((o) => !o?.pending).length;

    const total = serverCount + pendingCount;

    const map = new Map();
    sortedTodayOrders.forEach((o, idx) => {
      map.set(o.id, total - idx);
    });

    return { rankById: map };
  }, [sortedTodayOrders, pagination?.totalItems, isTestOrders]);

  const totalPendingCount = useMemo(
    () =>
      sortedTodayOrders.filter((o) => {
        if (isWaitingSchedule(o, scheduleNow)) return false;
        const dir = String(o?.direccion ?? '').trim().toLowerCase();
        const isLocal =
          dir.includes('local') ||
          dir.includes('salon') ||
          dir.includes('salón') ||
          dir.includes('comer') ||
          dir.includes('mesa');
        const isRetiro =
          !isLocal &&
          (dir === 'retiro' ||
            dir.includes('take away') ||
            dir.includes('llevar'));
        // Los pedidos para comer en el local se muestran en Take Away, no en
        // Pendientes. Los retiros hechos directamente en mostrador tampoco.
        const isCounterPickup =
          isLocal ||
          (isRetiro && String(o?.source || '').trim().toLowerCase() !== 'app');
        const isPreparing = String(o?.progress || '').trim().toLowerCase() === 'preparing';
        const isSent =
          Boolean(o?.copied) ||
          copiedIdsSet.has(o?.id) ||
          ['dispatched', 'delivered', 'pickedup'].includes(
            String(o?.progress || '').trim().toLowerCase()
          );
        return !isCounterPickup && (!isSent || isPreparing);
      }).length,
    [sortedTodayOrders, copiedIdsSet, scheduleNow]
  );

  const completedCount = useMemo(() => {
    if (!isBarista) return 0;
    return allOrdersList.filter((o) => {
      return isBaristaOrder(o) && isOrderPrepared(o);
    }).length;
  }, [isBarista, allOrdersList, isOrderPrepared]);

  const pendingBaristaCount = useMemo(() => {
    if (!isBarista) return 0;
    return allOrdersList.filter((o) => {
      return isBaristaOrder(o) && !isOrderPrepared(o);
    }).length;
  }, [isBarista, allOrdersList, isOrderPrepared]);

  const filteredTodayOrders = useMemo(() => {
    const q = addressQuery.trim().toLowerCase();

    const filtered = allOrdersList.filter((o) => {
      if (isWaitingSchedule(o, scheduleNow)) return false;
      // Filtros del Barista
      if (isBarista) {
        // Solo mostrar si es orden de barista (contiene cafetería o es pedido de prueba)
        if (!isBaristaOrder(o)) return false;

        const isPrepared = isOrderPrepared(o);
        if (showCompletedBarista) {
          if (!isPrepared) return false;
        } else {
          if (isPrepared) return false;
        }
      }

      const dirRaw = String(o?.direccion ?? '');
      const dir = dirRaw.toLowerCase();

      const isLocal =
        dir.includes('local') ||
        dir.includes('salon') ||
        dir.includes('salón') ||
        dir.includes('comer') ||
        dir.includes('mesa');
      const isRetiro =
        !isLocal &&
        (dir.trim() === 'retiro' ||
          dir.includes('take away') ||
          dir.includes('llevar'));
      const isDelivery = Boolean(dir.trim()) && !isRetiro && !isLocal;

      // filtro por tipo
      if (
        orderTypeFilter === 'app' &&
        String(o?.source || '').trim().toLowerCase() !== 'app'
      ) {
        return false;
      }
      if (orderTypeFilter === 'take_away' && !isRetiro && !isLocal) return false;
      if (orderTypeFilter === 'delivery' && !isDelivery) return false;
      if (orderTypeFilter === 'pending') {
        const isCounterPickup =
          isLocal ||
          (isRetiro && String(o?.source || '').trim().toLowerCase() !== 'app');
        const isPreparing = String(o?.progress || '').trim().toLowerCase() === 'preparing';
        const isSent =
          Boolean(o?.copied) ||
          copiedIdsSet.has(o?.id) ||
          ['dispatched', 'delivered', 'pickedup'].includes(
            String(o?.progress || '').trim().toLowerCase()
          );
        if (isCounterPickup || (isSent && !isPreparing)) return false;
      }

      // filtro por búsqueda (dirección, #número, nombre, teléfono, productos)
      if (!q) return true;

      const dispNum = String(
        isBarista
          ? (o?.numeracion ?? rankById?.get(o?.id) ?? o?.number ?? '')
          : (rankById?.get(o?.id) ?? o?.numeracion ?? o?.number ?? '')
      ).toLowerCase();
      const oNum = String(o?.numeracion ?? '').toLowerCase();
      const oNumber = String(o?.number ?? '').toLowerCase();
      const oId = String(o?.id ?? '').toLowerCase();

      // Si el usuario escribe '#' o '#1' o '#563' -> coincidencia EXACTA del número de orden (100%)
      if (q.startsWith('#')) {
        const cleanNum = q.replace(/^#\s*/, '').trim();
        if (!cleanNum) return true; // Si solo escribe '#', no filtra nada

        const isNumeric = /^\d+$/.test(cleanNum);
        const targetNumber = isNumeric ? Number(cleanNum) : null;

        const checkExact = (val) => {
          if (val === undefined || val === null || val === '') return false;
          const s = String(val).trim().replace(/^#/, '');
          if (s.toLowerCase() === cleanNum) return true;
          if (isNumeric && /^\d+$/.test(s) && Number(s) === targetNumber) return true;
          return false;
        };

        const rawDisp = isBarista
          ? (o?.numeracion ?? rankById?.get(o?.id) ?? o?.number)
          : (rankById?.get(o?.id) ?? o?.numeracion ?? o?.number);

        return (
          checkExact(rawDisp) ||
          checkExact(o?.numeracion) ||
          checkExact(o?.number) ||
          (o?.id && String(o.id).toLowerCase() === cleanNum) ||
          (o?.id && String(o.id).slice(-6).toLowerCase() === cleanNum)
        );
      }

      // Búsqueda general
      const name = String(o?.name ?? '').toLowerCase();
      const phone = String(o?.phone ?? '').toLowerCase();
      const itemsMatch = (o?.items || []).some((it) =>
        String(it?.name || '').toLowerCase().includes(q)
      );

      return (
        dir.includes(q) ||
        dispNum.includes(q) ||
        oNum.includes(q) ||
        oNumber.includes(q) ||
        name.includes(q) ||
        phone.includes(q) ||
        oId.includes(q) ||
        itemsMatch
      );
    });

    const getTime = (o) => Number(o.clientCreatedAt) || new Date(o.created ?? 0).getTime();
    return [...filtered].sort((a, b) => getTime(b) - getTime(a));
  }, [
    allOrdersList,
    scheduleNow,
    addressQuery,
    orderTypeFilter,
    isBarista,
    isOrderPrepared,
    showCompletedBarista,
    copiedIdsSet,
    rankById,
  ]);

  const loadedServerCount = useMemo(
    () =>
      sortedTodayOrders.filter(
        (order) =>
          !order?.pending &&
          !order?.isTestOrder &&
          !String(order?.id || '').startsWith('local-test-') &&
          !String(order?.id || '').startsWith('mock-')
      ).length,
    [sortedTodayOrders]
  );
  const hasMoreServerOrders =
    Boolean(pagination?.hasMore) &&
    Number(pagination?.totalItems) > loadedServerCount;

  useEffect(() => {
    setVisibleOrderLimit(10);
  }, [orderTypeFilter, addressQuery]);

  useEffect(() => {
    if (
      isTestOrders ||
      isBarista ||
      isInitialLoading ||
      isLoadingMore ||
      !pagination?.hasMore ||
      filteredTodayOrders.length >= visibleOrderLimit
    ) {
      return;
    }

    if (hasMoreServerOrders) {
      dispatch(fetchMoreOrders());
    }
  }, [
    dispatch,
    isTestOrders,
    isBarista,
    isInitialLoading,
    isLoadingMore,
    pagination?.hasMore,
    pagination?.page,
    hasMoreServerOrders,
    filteredTodayOrders.length,
    visibleOrderLimit,
  ]);

  const visibleTodayOrders = useMemo(
    () =>
      isBarista || isTestOrders
        ? filteredTodayOrders
        : filteredTodayOrders.slice(0, visibleOrderLimit),
    [filteredTodayOrders, isBarista, isTestOrders, visibleOrderLimit]
  );

  const canLoadMore = useMemo(() => {
    // 1. En pedidos de prueba nunca se pagina (todos están en memoria)
    if (isTestOrders) return false;

    // 2. En barista siempre se cargan todos los pedidos del día y no se pagina la comanda
    if (isBarista) return false;

    // 3. Mientras carga inicialmente
    if (isInitialLoading) return false;

    // Ocultar mientras se buscan coincidencias para completar la página visible.
    if (isLoadingMore || filteredTodayOrders.length < visibleOrderLimit) return false;

    // Si la paginación indica que no hay más y no quedan coincidencias en memoria
    if (filteredTodayOrders.length > visibleOrderLimit) return true;
    if (!pagination?.hasMore) return false;

    return hasMoreServerOrders;
  }, [
    isTestOrders,
    isBarista,
    isInitialLoading,
    isLoadingMore,
    pagination?.hasMore,
    hasMoreServerOrders,
    filteredTodayOrders.length,
    visibleOrderLimit,
  ]);

  const emptyOrdersState = useMemo(() => {
    if (
      !isBarista &&
      !isTestOrders &&
      filteredTodayOrders.length === 0 &&
      hasMoreServerOrders &&
      !isInitialLoading
    ) {
      return {
        Icon: LoaderCircle,
        title: 'Buscando pedidos',
        description: 'Cargando los pedidos más recientes de esta categoría.',
        color: '#2563eb',
        background: '#dbeafe',
        loading: true,
      };
    }

    if (addressQuery.trim()) {
      return {
        Icon: Search,
        title: 'No encontramos pedidos',
        description: `No hay resultados para “${addressQuery.trim()}”. Probá con otro número, dirección o producto.`,
        color: '#64748b',
        background: '#f1f5f9',
      };
    }

    const states = {
      pending: {
        Icon: Clock,
        title: 'No hay pedidos pendientes',
        description: 'Los nuevos pedidos pendientes aparecerán acá automáticamente.',
        color: '#b45309',
        background: '#fef3c7',
      },
      take_away: {
        Icon: PackageCheck,
        title: 'No hay pedidos para retirar',
        description: 'Cuando haya pedidos de Take Away o retiro, los vas a encontrar acá.',
        color: '#2563eb',
        background: '#dbeafe',
      },
      delivery: {
        Icon: Bike,
        title: 'No hay pedidos de Delivery',
        description: 'Los pedidos con entrega a domicilio aparecerán en esta categoría.',
        color: '#7c3aed',
        background: '#ede9fe',
      },
      app: {
        Icon: Smartphone,
        title: 'No hay pedidos de la App',
        description: 'Los pedidos realizados desde la App aparecerán acá al ingresar.',
        color: '#6d28d9',
        background: '#ede9fe',
      },
      all: {
        Icon: PackageCheck,
        title: 'No hay pedidos para mostrar',
        description: 'Los nuevos pedidos aparecerán acá automáticamente.',
        color: '#475569',
        background: '#f1f5f9',
      },
    };

    return states[orderTypeFilter] || states.all;
  }, [
    addressQuery,
    orderTypeFilter,
    isBarista,
    isTestOrders,
    filteredTodayOrders.length,
    hasMoreServerOrders,
    isInitialLoading,
  ]);

  return (
    <GlobalOrders>
      <ContainerOrders ref={scrollRef} style={{ overflowY: 'auto' }}>
        {isInitialLoading ? (
          <>
            <style>{`
              @keyframes ordersSpin { to { transform: rotate(360deg) } }
              .orders-center {
                position: absolute;
                inset: 0;
                display: grid;
                place-items: center;
              }
              .orders-spinner {
                width: 64px; height: 64px; border-radius: 50%;
                border: 6px solid #e5e7eb; border-top-color: #111;
                animation: ordersSpin .9s linear infinite;
              }
            `}</style>
            <div className="orders-center">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  transform: 'translateY(-10%)',
                }}
              >
                <div className="orders-spinner" />
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    color: '#111',
                    textAlign: 'center',
                  }}
                >
                  Cargando pedidos…
                </div>
              </div>
            </div>
          </>
        ) : !isBarista && todayOrders.length === 0 && !simulatedPendingOrder ? (
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
              {isTestOrders ? 'No hay pedidos de prueba' : 'No hay pedidos para hoy'}
            </h2>
            <p style={{ fontSize: '1rem', opacity: 0.8 }}>
              {isTestOrders
                ? 'Los pedidos que realices con el Modo Prueba activo aparecerán acá.'
                : 'Cuando lleguen, aparecerán acá automáticamente.'}
            </p>
            {(isTestOrders || isTestMode) && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8 }}>
                {renderSimulateButton()}
                {isDevelopmentBuild && isTestMode && !isAndroidApp && (
                  <button
                    type="button"
                    onClick={handleTestWindowsNotification}
                    title="Mostrar una notificación nativa de Windows de prueba"
                    style={{
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      borderRadius: 8,
                      padding: '7px 10px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      fontFamily: "'Inter', sans-serif",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <BellRing size={15} />
                    Probar aviso Windows
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <style>{`
              @keyframes baristaCardIn {
                from {
                  opacity: 0;
                  transform: translateY(12px) scale(0.97);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              @keyframes baristaSlideOutRight {
                0% {
                  opacity: 1;
                  transform: translateX(0) scale(1);
                }
                40% {
                  opacity: 1;
                  transform: translateX(0) scale(1.015);
                }
                65% {
                  opacity: 0.95;
                  transform: translateX(20px) scale(1.01);
                }
                100% {
                  opacity: 0;
                  transform: translateX(120%) scale(0.9);
                }
              }
              @keyframes baristaCheckPop {
                0% {
                  opacity: 0;
                  transform: scale(0.3) rotate(-15deg);
                }
                60% {
                  opacity: 1;
                  transform: scale(1.15) rotate(0deg);
                }
                100% {
                  opacity: 1;
                  transform: scale(1) rotate(0deg);
                }
              }
              @keyframes baristaFadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              @keyframes baristaBtnIn {
                from {
                  opacity: 0;
                  transform: scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              @keyframes pulsePendingAlert {
                0% {
                  transform: scale(1);
                  opacity: 1;
                }
                50% {
                  transform: scale(1.22);
                  opacity: 0.8;
                }
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            `}</style>
            {!isBarista ? (
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
                {/* Banner de Pedidos de Prueba */}
                {(isTestOrders || isTestMode) && (
                  <div style={{ padding: '6px 10px 4px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        background: '#fffbeb',
                        border: '1.5px solid #fcd34d',
                        borderRadius: 14,
                        padding: '10px 14px',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: '#f59e0b',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FlaskConical size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#92400e' }}>
                            {isTestOrders ? 'Pedidos de Prueba' : 'Modo Prueba Activo'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>
                            {visibleTodayOrders.length === 1
                              ? '1 pedido registrado localmente'
                              : `${visibleTodayOrders.length} pedidos registrados localmente`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {renderSimulateButton()}

                        {todayOrders.some((o) => o?.isTestOrder || String(o?.id || '').startsWith('local-test-')) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('¿Deseas vaciar todos los pedidos de prueba?')) {
                                dispatch(clearTestOrders());
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              background: '#fff',
                              border: '1px solid #fde68a',
                              color: '#b45309',
                              borderRadius: 8,
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            }}
                            title="Eliminar todos los pedidos de prueba"
                          >
                            <Trash2 size={14} />
                            Limpiar pruebas
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner de pedidos pendientes (temporalmente deshabilitado) */}
                {SHOW_TOP_PENDING_BANNER && totalPendingCount > 0 && (
                  <div style={{ padding: '6px 10px 4px' }}>
                    <div
                      onClick={() =>
                        setOrderTypeFilter((prev) => (prev === 'pending' ? 'all' : 'pending'))
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        background: '#fff7ed',
                        border: '1px solid #fdba74',
                        borderRadius: 12,
                        padding: '8px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TimerOutlinedIcon sx={{ fontSize: 20, color: '#ea580c' }} />
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#9a3412' }}>
                          {totalPendingCount} {totalPendingCount === 1 ? 'pedido pendiente' : 'pedidos pendientes'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrderTypeFilter((prev) => (prev === 'pending' ? 'all' : 'pending'));
                        }}
                        style={{
                          border: 'none',
                          background: orderTypeFilter === 'pending' ? '#ea580c' : '#fed7aa',
                          color: orderTypeFilter === 'pending' ? '#fff' : '#9a3412',
                          borderRadius: 8,
                          padding: '5px 12px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {orderTypeFilter === 'pending' ? 'Ver todos' : 'Ver'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Barra de búsqueda */}
                <div style={{ padding: '6px 10px 4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '6px 12px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: addressQuery.trim().startsWith('#') ? '#6d28d9' : '#64748b',
                        flexShrink: 0,
                      }}
                    >
                      <Search size={15} strokeWidth={2.4} />
                    </span>

                    <input
                      value={addressQuery}
                      onChange={(e) => setAddressQuery(e.target.value)}
                      placeholder="Buscar por # orden, dirección o cliente..."
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.86rem',
                        background: 'transparent',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        color: '#0f172a',
                      }}
                    />

                    {addressQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => setAddressQuery('')}
                        style={{
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          color: '#64748b',
                          borderRadius: 6,
                          width: 22,
                          height: 22,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f1f5f9';
                          e.currentTarget.style.color = '#0f172a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.color = '#64748b';
                        }}
                        title="Limpiar búsqueda"
                      >
                        <FaXmark size={11} />
                      </button>
                    )}

                    {isDev && !isAndroidApp && (
                      <button
                        type="button"
                        onClick={() => setShowDevTicketPreview((v) => !v)}
                        style={{
                          border: `1px solid ${showDevTicketPreview ? '#86efac' : '#e2e8f0'}`,
                          background: showDevTicketPreview ? '#dcfce7' : '#f8fafc',
                          color: showDevTicketPreview ? '#15803d' : '#475569',
                          borderRadius: 6,
                          padding: '3px 8px',
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                        title="Mostrar/ocultar vista ticket"
                      >
                        <PrintIcon sx={{ fontSize: 14 }} />
                        {showDevTicketPreview ? 'Ticket' : 'Normal'}
                      </button>
                    )}
                  </div>

                  {!!addressQuery.trim() && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 5,
                        padding: '0 2px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#64748b',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          padding: '2px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        {addressQuery.trim().startsWith('#') && (
                          <span
                            style={{
                              background: '#ede9fe',
                              color: '#6d28d9',
                              border: '1px solid #ddd6fe',
                              borderRadius: 4,
                              padding: '0.5px 5px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                            }}
                          >
                            # Orden
                          </span>
                        )}
                        Mostrando {visibleTodayOrders.length} pedidos
                      </span>
                    </div>
                  )}
                </div>

                {/* Filtros de Categorías y Ordenamiento */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px 0',
                    gap: 8,
                  }}
                >
                  {/* Selector de categorías / Segmented chips */}
                  <div
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: 3,
                      display: 'flex',
                      gap: 4,
                      flex: 1,
                      overflowX: 'auto',
                    }}
                  >
                    {[
                      ['pending', 'Pendientes'],
                      ['take_away', 'Take Away'],
                      ['delivery', 'Delivery'],
                      ['app', 'App'],
                    ].map(([key, label]) => {
                      const active = orderTypeFilter === key;
                      const isPendingKey = key === 'pending';
                      const isAppKey = key === 'app';
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setOrderTypeFilter((currentFilter) =>
                              currentFilter === key ? 'all' : key
                            )
                          }
                          style={{
                            flex: 1,
                            border: active
                              ? isPendingKey
                                ? '1px solid #fde68a'
                                : isAppKey
                                  ? '1px solid #ddd6fe'
                                : '1px solid #cbd5e1'
                              : '1px solid transparent',
                            cursor: 'pointer',
                            borderRadius: 6,
                            padding: '5px 10px',
                            fontWeight: active ? 800 : 600,
                            fontSize: '0.78rem',
                            background: active
                              ? isPendingKey
                                ? '#fef3c7'
                                : isAppKey
                                  ? '#ede9fe'
                                : '#ffffff'
                              : 'transparent',
                            color: active
                              ? isPendingKey
                                ? '#b45309'
                                : isAppKey
                                  ? '#6d28d9'
                                : '#0f172a'
                              : isPendingKey
                                ? '#b45309'
                                : isAppKey
                                  ? '#6d28d9'
                                  : '#64748b',
                            boxShadow: active
                              ? isPendingKey
                                ? '0 1px 2px rgba(180, 83, 9, 0.12)'
                                : isAppKey
                                  ? '0 1px 2px rgba(109, 40, 217, 0.12)'
                                : '0 1px 2px rgba(0, 0, 0, 0.05)'
                              : 'none',
                            transition: 'all 0.15s ease',
                            fontFamily: "'Inter', sans-serif",
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                          }}
                          onMouseEnter={(e) => {
                            if (!active) {
                              e.currentTarget.style.color = isAppKey ? '#6d28d9' : '#0f172a';
                              e.currentTarget.style.background = isAppKey
                                ? 'rgba(237, 233, 254, 0.65)'
                                : 'rgba(255,255,255,0.6)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!active) {
                              e.currentTarget.style.color = isPendingKey
                                ? '#b45309'
                                : isAppKey
                                  ? '#6d28d9'
                                  : '#64748b';
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <span>{label}</span>
                          {isPendingKey && totalPendingCount > 0 && (
                            <span
                              style={{
                                padding: '1px 5px',
                                borderRadius: 999,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                background: active ? '#b45309' : '#fde68a',
                                color: active ? '#ffffff' : '#92400e',
                                lineHeight: 1.2,
                              }}
                            >
                              {totalPendingCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  position: 'sticky',
                  top: -10,
                  zIndex: 20,
                  background: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  borderBottom: '1px solid #e4e4e7',
                  marginBottom: 14,
                }}
              >
                {/* Branding & Live Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#09090b',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      flexShrink: 0,
                    }}
                  >
                    <Coffee size={17} strokeWidth={2.2} />
                  </div>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: '#09090b',
                      letterSpacing: '-0.02em',
                      fontFamily: "'Inter', sans-serif",
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Barista KDS
                  </span>
                  {!isBarista && (
                    <div
                      title={
                        isLanServer
                          ? 'Servidor LAN activo en esta PC'
                          : isLanConnected
                            ? 'Sincronizado por Red Local (LAN)'
                            : navigator.onLine
                              ? 'Conectado a la Nube (PocketBase)'
                              : 'Sin conexión (Revisa el Wi-Fi o la IP de caja)'
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background:
                          isLanConnected || isLanServer
                            ? 'rgba(16, 185, 129, 0.12)'
                            : navigator.onLine
                              ? 'rgba(59, 130, 246, 0.12)'
                              : 'rgba(239, 68, 68, 0.12)',
                        color:
                          isLanConnected || isLanServer
                            ? '#059669'
                            : navigator.onLine
                              ? '#2563eb'
                              : '#dc2626',
                        border: `1px solid ${
                          isLanConnected || isLanServer
                            ? 'rgba(16, 185, 129, 0.3)'
                            : navigator.onLine
                              ? 'rgba(59, 130, 246, 0.3)'
                              : 'rgba(239, 68, 68, 0.3)'
                        }`,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor:
                            isLanConnected || isLanServer
                              ? '#10b981'
                              : navigator.onLine
                                ? '#3b82f6'
                                : '#ef4444',
                        }}
                      />
                      {isLanServer ? 'LAN Servidor' : isLanConnected ? 'LAN' : navigator.onLine ? 'Nube' : 'Offline'}
                    </div>
                  )}
                </div>

                {/* Segmented Control & Dev Tools */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#f4f4f5',
                      padding: 2.5,
                      borderRadius: 9,
                      border: '1px solid #e4e4e7',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setBaristaTab('pending');
                        setShowCompletedBarista(false);
                      }}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px 10px',
                        borderRadius: 7,
                        fontSize: '0.78rem',
                        fontWeight: baristaTab === 'pending' ? 700 : 500,
                        background: baristaTab === 'pending' ? '#ffffff' : 'transparent',
                        color: baristaTab === 'pending' ? '#09090b' : '#71717a',
                        boxShadow: baristaTab === 'pending' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <span>Pendientes</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: 5,
                          background: baristaTab === 'pending' ? '#09090b' : '#e4e4e7',
                          color: baristaTab === 'pending' ? '#ffffff' : '#52525b',
                        }}
                      >
                        {pendingBaristaCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBaristaTab('completed');
                        setShowCompletedBarista(true);
                      }}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px 10px',
                        borderRadius: 7,
                        fontSize: '0.78rem',
                        fontWeight: baristaTab === 'completed' ? 700 : 500,
                        background: baristaTab === 'completed' ? '#ffffff' : 'transparent',
                        color: baristaTab === 'completed' ? '#09090b' : '#71717a',
                        boxShadow: baristaTab === 'completed' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <span>Listos</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: 5,
                          background: baristaTab === 'completed' ? '#15803d' : '#e4e4e7',
                          color: baristaTab === 'completed' ? '#ffffff' : '#52525b',
                        }}
                      >
                        {completedCount}
                      </span>
                    </button>
                  </div>

                  {/* Botón Simular pedidos (Modo Dev / Test) */}
                  {(isDev || isTestMode) && !isAndroidApp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {!isBarista && renderSimulateButton(true)}
                      {isDevelopmentBuild && isTestMode && !isBarista && (
                        <button
                          type="button"
                          onClick={handleTestWindowsNotification}
                          title="Mostrar una notificación nativa de Windows de prueba"
                          style={{
                            border: '1px solid #bfdbfe',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            borderRadius: 7,
                            padding: '5px 8px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            fontFamily: "'Inter', sans-serif",
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <BellRing size={14} />
                          Probar aviso Windows
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleToggleMockOrders}
                        aria-label={showMockOrders ? 'Quitar pedidos simulados' : 'Mostrar pedidos simulados'}
                        style={{
                          border: showMockOrders ? '1px solid #fecdd3' : '1px solid #e4e4e7',
                          background: showMockOrders ? '#fff1f2' : '#ffffff',
                          color: showMockOrders ? '#e11d48' : '#71717a',
                          borderRadius: 7,
                          padding: isBarista ? '6px' : '5px 8px',
                          width: isBarista ? 30 : undefined,
                          height: isBarista ? 30 : undefined,
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.74rem',
                          fontFamily: "'Inter', sans-serif",
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                        }}
                        title="Alternar pedidos simulados para prueba en vivo"
                      >
                        <Sparkles size={14} />
                        {!isBarista && (showMockOrders ? 'Quitar mocks' : 'Mocks')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isBarista && visibleTodayOrders.length === 0 && (
              <div
                style={{
                  width: '100%',
                  minHeight: 'calc(100vh - 300px)',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  padding: '32px 20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                    background: '#e4e4e7',
                    color: '#71717a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Coffee size={26} strokeWidth={1.8} />
                </div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#09090b',
                    letterSpacing: '-0.01em',
                    marginBottom: 4,
                  }}
                >
                  {showCompletedBarista
                    ? 'No hay pedidos completados hoy'
                    : 'Barra al día'}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#71717a', maxWidth: 360, lineHeight: 1.45 }}>
                  {showCompletedBarista
                    ? 'Los pedidos que marques como listos se archivarán en esta pestaña.'
                    : 'No hay cafés pendientes por preparar. Los nuevos pedidos aparecerán acá automáticamente.'}
                </div>
              </div>
            )}

            {!isBarista && visibleTodayOrders.length === 0 && !allOrdersList.some((order) => isWaitingSchedule(order, scheduleNow)) && (
              <div
                style={{
                  width: '100%',
                  minHeight: 'calc(100vh - 300px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  padding: '32px 20px',
                  textAlign: 'center',
                  background:
                    'radial-gradient(circle at 50% 35%, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%)',
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: 18,
                    borderRadius: 24,
                    color: emptyOrdersState.color,
                    background: emptyOrdersState.background,
                    boxShadow: '0 8px 22px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <emptyOrdersState.Icon
                    size={34}
                    strokeWidth={1.8}
                    style={emptyOrdersState.loading ? { animation: 'ordersSpin 0.9s linear infinite' } : undefined}
                  />
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.025em',
                    marginBottom: 7,
                  }}
                >
                  {emptyOrdersState.title}
                </div>
                <div
                  style={{
                    maxWidth: 360,
                    fontSize: '0.88rem',
                    lineHeight: 1.55,
                    color: '#64748b',
                  }}
                >
                  {emptyOrdersState.description}
                </div>
                {(addressQuery.trim() || orderTypeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      if (addressQuery.trim()) {
                        setAddressQuery('');
                      } else {
                        setOrderTypeFilter('all');
                      }
                    }}
                    style={{
                      marginTop: 18,
                      padding: '9px 16px',
                      background: '#0f172a',
                      color: '#fff',
                      borderRadius: 9,
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)',
                    }}
                  >
                    {addressQuery.trim() ? 'Limpiar búsqueda' : 'Ver todos los pedidos'}
                  </button>
                )}
              </div>
            )}

            <div
              style={
                isBarista
                  ? {
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: 16,
                      padding: '4px 14px 30px',
                      alignItems: 'start',
                    }
                  : undefined
              }
            >
              {scheduleError && <p role="alert" style={{ padding: 12, color: '#b45309' }}>{scheduleError}</p>}
              {!isBarista && allOrdersList.some((order) => isWaitingSchedule(order, scheduleNow)) && (
                <section style={{ margin: '12px 0 24px', padding: 14, border: '1px solid #cbd5e1', borderRadius: 16, background: '#f8fafc' }}>
                  <h2 style={{ fontSize: 18, margin: '0 0 12px', color: '#334155' }}>Programados</h2>
                  {[...allOrdersList].filter((order) => isWaitingSchedule(order, scheduleNow)).sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart)).map((order) => (
                    <CardOrders
                      key={`scheduled-${order.id}`}
                      {...order}
                      numeracion={order.numeracion || order.number || String(order.id).slice(-6)}
                      isBarista={false}
                      isTestOrder={Boolean(isTestOrders || isTestMode || order?.isTestOrder)}
                    />
                  ))}
                </section>
              )}
              {!isBarista && scheduledRecords.some((order) => !isWaitingSchedule(order, scheduleNow)) && <h2 style={{ fontSize: 18, margin: '12px 0' }}>Para preparar / en curso</h2>}
              {visibleTodayOrders.map((o) => {
                const displayNum = isBarista ? (o.numeracion ?? rankById.get(o.id) ?? '') : (rankById.get(o.id) ?? o.numeracion ?? '');

                return (
                  <CardOrders
                    key={o.id}
                    numeracion={displayNum}
                    {...o}
                    isBarista={isBarista}
                    isTestOrder={Boolean(
                      isTestOrders ||
                      isTestMode ||
                      o?.isTestOrder ||
                      String(o?.id || '').startsWith('local-test-')
                    )}
                    isPrepared={isOrderPrepared(o)}
                    baristaDone={Boolean(o?.baristaDone)}
                    onMarkPrepared={handleMarkPrepared}
                    onUnmarkPrepared={handleUnmarkPrepared}
                    onOpenRecipe={handleOpenRecipe}
                    onDeleteTestOrder={handleDeleteTestOrder}
                    showDevTicketPreview={!isBarista && !isAndroidApp && showDevTicketPreview}
                  />
                );
              })}
            </div>

            {canLoadMore && (
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

      {/* Modal flotante de receta para el Barista */}
      <BaristaRecipeModal
        recipeModalData={recipeModalData}
        onClose={() => setRecipeModalData(null)}
        onSelectSize={(size) => setRecipeModalData((prev) => ({ ...prev, activeSize: size }))}
        cafeteriaProducts={cafeteriaProducts}
      />
    </GlobalOrders>
  );
}
