import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUp, Coffee, FlaskConical, Search, Sparkles, Trash2 } from 'lucide-react';
import { FaXmark } from 'react-icons/fa6';
import { MdSort } from 'react-icons/md';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';

import logoPixel from '../../assets/logoprint.png';
import { pb } from '../../lib/pb';
import {
  clearTestOrders,
  deleteTestOrder,
  fetchMoreOrders,
  fetchTodayPendingOrders,
  hydrateAllTodayOrders,
  hydrateOrdersFromPocket,
  subscribeOrdersRealtime,
  syncPendingOrders,
} from '../../redux/orders/ordersSlice';
import { computeBusinessDate } from '../../utils/stats';
import { isBaristaOrder } from '../../utils/cafeStockSync';

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

export default function Orders({ isBarista = false, isTestOrders = false }) {
  const dispatch = useDispatch();
  const unsubRef = useRef(null);
  const { orders, testOrders = [], pagination, status } = useSelector((s) => s.orders);
  const isAdmin = useSelector((s) => s.actions?.isAdmin);
  const simulatedPendingOrder = useSelector((s) => s.actions?.simulatedPendingOrder);

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

  const handleMarkPrepared = (orderId) => {
    localStorage.setItem(`barista-prepared-${orderId}`, 'true');
    setPreparedOrders((prev) => ({ ...prev, [orderId]: true }));
  };

  const handleUnmarkPrepared = (orderId) => {
    localStorage.removeItem(`barista-prepared-${orderId}`);
    setPreparedOrders((prev) => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });
  };

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
    dispatch(fetchMoreOrders());
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
  }, [dispatch, isTestOrders, isBarista]);

  useEffect(() => {
    if (isTestOrders) return;
    unsubRef.current = dispatch(subscribeOrdersRealtime());
    return () => {
      if (typeof unsubRef.current === 'function') unsubRef.current();
    };
  }, [dispatch, isTestOrders]);

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
      if (navigator.onLine && !isBarista) {
        dispatch(fetchTodayPendingOrders());
      }
    }, 30000);
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

    return (orders || []).filter(
      (o) => !o?.isTestOrder && !String(o?.id || '').startsWith('local-test-')
    );
  }, [isTestOrders, isBarista, testOrders, orders, storageTick]);

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
      return !bDate || bDate === todayBusinessDate;
    });
  }, [effectiveOrders, isTestOrders, todayBusinessDate]);

  const sortedTodayOrders = useMemo(() => {
    const list = [...todayOrders];
    if (simulatedPendingOrder && !isBarista && !isTestOrders) {
      list.unshift(MOCK_PENDING_DELIVERY_ORDER);
    }
    return list.sort((a, b) => {
      const ta = a.clientCreatedAt ?? new Date(a.created ?? 0).getTime();
      const tb = b.clientCreatedAt ?? new Date(b.created ?? 0).getTime();
      return tb - ta;
    });
  }, [todayOrders, simulatedPendingOrder, isBarista, isTestOrders]);

  const [addressQuery, setAddressQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all'); // 'all' | 'retiro' | 'delivery'
  const [orderSort, setOrderSort] = useState(() => {
    return localStorage.getItem('pixel_orders_sort') || 'recent';
  }); // 'recent' | 'pending'
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  useEffect(() => {
    if (!sortDropdownOpen) return;
    const handler = () => setSortDropdownOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [sortDropdownOpen]);

  const isDev = process.env.NODE_ENV === 'development' || Boolean(isAdmin);
  const isAndroidApp = isAndroid();
  const [showDevTicketPreview, setShowDevTicketPreview] = useState(false);

  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    if (isTestOrders) return;
    if (addressQuery.trim() && !allLoaded) {
      dispatch(hydrateAllTodayOrders()).then(() => setAllLoaded(true));
    } else if (!addressQuery.trim() && allLoaded) {
      setAllLoaded(false);
      dispatch(hydrateOrdersFromPocket({ page: 1, perPage: 10 }));
    }
  }, [addressQuery, allLoaded, dispatch, isTestOrders]);

  const allOrdersList = useMemo(() => {
    if (isBarista && showMockOrders && !isAndroidApp) {
      return [...MOCK_BARISTA_ORDERS, ...sortedTodayOrders];
    }
    return sortedTodayOrders;
  }, [sortedTodayOrders, isBarista, showMockOrders, isAndroidApp]);

  const [localChangeTick, setLocalChangeTick] = useState(0);

  useEffect(() => {
    const handler = () => setLocalChangeTick((t) => t + 1);
    window.addEventListener('order-hidden-changed', handler);
    window.addEventListener('order-copied-changed', handler);
    return () => {
      window.removeEventListener('order-hidden-changed', handler);
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

  const hiddenIdsSet = useMemo(() => {
    void localChangeTick;
    void allOrdersList;
    const set = new Set();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('order-hidden-') && localStorage.getItem(k) === 'true') {
          set.add(k.replace('order-hidden-', ''));
        }
      }
    } catch (e) {}
    return set;
  }, [allOrdersList, localChangeTick]);

  const pendingDeliveryCount = useMemo(() => {
    let delCount = 0;

    for (let i = 0; i < sortedTodayOrders.length; i++) {
      const o = sortedTodayOrders[i];
      const dirTrim = String(o?.direccion ?? '').trim().toLowerCase();
      const isRetiro = dirTrim === 'retiro';
      if (isRetiro) continue; // Los pedidos de retiro no entran ni cuentan para pendientes

      const isCopied = Boolean(o?.copied) || copiedIdsSet.has(o?.id);
      const isHidden = hiddenIdsSet.has(o?.id);

      if (o?.pending) {
        delCount++;
      } else if (!isCopied && !isHidden) {
        delCount++;
      }
    }

    return delCount;
  }, [sortedTodayOrders, copiedIdsSet, hiddenIdsSet]);

  const totalPendingCount = pendingDeliveryCount;

  useEffect(() => {
    if (orderTypeFilter === 'pending' && totalPendingCount === 0) {
      setOrderTypeFilter('all');
    }
  }, [orderTypeFilter, totalPendingCount]);

  const completedCount = useMemo(() => {
    if (!isBarista) return 0;
    return allOrdersList.filter((o) => {
      return isBaristaOrder(o) && Boolean(preparedOrders[o.id]);
    }).length;
  }, [isBarista, allOrdersList, preparedOrders]);

  const pendingBaristaCount = useMemo(() => {
    if (!isBarista) return 0;
    return allOrdersList.filter((o) => {
      return isBaristaOrder(o) && !preparedOrders[o.id];
    }).length;
  }, [isBarista, allOrdersList, preparedOrders]);

  const filteredTodayOrders = useMemo(() => {
    const q = addressQuery.trim().toLowerCase();

    const filtered = allOrdersList.filter((o) => {
      // Filtros del Barista
      if (isBarista) {
        // Solo mostrar si es orden de barista (contiene cafetería o es pedido de prueba)
        if (!isBaristaOrder(o)) return false;

        const isPrepared = Boolean(preparedOrders[o.id]);
        if (showCompletedBarista) {
          if (!isPrepared) return false;
        } else {
          if (isPrepared) return false;
        }
      }

      const dirRaw = String(o?.direccion ?? '');
      const dir = dirRaw.toLowerCase();

      const isRetiro = dir.trim() === 'retiro';
      const isDelivery = !isRetiro;

      // filtro por tipo
      if (orderTypeFilter === 'retiro' && !isRetiro) return false;
      if (orderTypeFilter === 'delivery' && !isDelivery) return false;
      if (orderTypeFilter === 'pending') {
        if (isRetiro) return false; // Los pedidos de retiro no entran ni cuentan para pendientes
        const isCopied = Boolean(o?.copied) || copiedIdsSet.has(o?.id);
        const isHidden = hiddenIdsSet.has(o?.id);
        let isPend = false;
        if (o?.pending) {
          isPend = true;
        } else if (isBarista) {
          isPend = !preparedOrders[o?.id];
        } else {
          isPend = !isCopied && !isHidden;
        }
        if (!isPend) return false;
      }

      // filtro por búsqueda (dirección, #número o nombre)
      if (!q) return true;
      const cleanQ = q.replace(/^#/, '').trim();
      const numMatch = cleanQ && String(o?.numeracion ?? o?.number ?? '').toLowerCase().includes(cleanQ);
      const nameMatch = String(o?.name ?? '').toLowerCase().includes(q);
      return dir.includes(q) || Boolean(numMatch) || Boolean(nameMatch);
    });

    const getTime = (o) => o.clientCreatedAt ?? (o._t || (o._t = new Date(o.created ?? 0).getTime()));

    if (orderSort === 'pending') {
      const pendingList = [];
      const completedList = [];

      for (let i = 0; i < filtered.length; i++) {
        const o = filtered[i];
        const isRetiro = String(o?.direccion ?? '').trim().toLowerCase() === 'retiro';
        const isCopied = Boolean(o?.copied) || copiedIdsSet.has(o?.id);
        const isHidden = hiddenIdsSet.has(o?.id);

        let isPend = false;
        if (isRetiro) {
          isPend = false; // Los pedidos de retiro no entran ni cuentan para pendientes
        } else if (o?.pending) {
          isPend = true;
        } else if (isBarista) {
          isPend = !preparedOrders[o?.id];
        } else {
          isPend = !isCopied && !isHidden;
        }

        if (isPend) {
          pendingList.push(o);
        } else {
          completedList.push(o);
        }
      }

      pendingList.sort((a, b) => getTime(b) - getTime(a));
      completedList.sort((a, b) => getTime(b) - getTime(a));

      return [...pendingList, ...completedList];
    }

    return [...filtered].sort((a, b) => getTime(b) - getTime(a));
  }, [
    allOrdersList,
    addressQuery,
    orderTypeFilter,
    orderSort,
    isBarista,
    preparedOrders,
    showCompletedBarista,
    copiedIdsSet,
    hiddenIdsSet,
  ]);

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

  const canLoadMore = useMemo(() => {
    // 1. En pedidos de prueba nunca se pagina (todos están en memoria)
    if (isTestOrders) return false;

    // 2. En barista siempre se cargan todos los pedidos del día y no se pagina la comanda
    if (isBarista) return false;

    // 3. Mientras carga inicialmente o si no hay pedidos mostrados
    if (isInitialLoading || filteredTodayOrders.length === 0) return false;

    // 4. Si se cargaron todos los pedidos para búsqueda o filtro
    if (allLoaded) return false;

    // 5. Si la paginación indica que no hay más
    if (!pagination?.hasMore) return false;

    // 6. Conteo de pedidos del servidor en la base de datos hoy
    const totalServerItems =
      typeof pagination?.totalItems === 'number' && Number.isFinite(pagination.totalItems)
        ? pagination.totalItems
        : 0;

    // Cantidad de pedidos del servidor cargados en memoria
    const loadedServerCount = sortedTodayOrders.filter(
      (o) => !o?.pending && !o?.isTestOrder && !String(o?.id || '').startsWith('local-test-')
    ).length;

    // Si ya cargamos todos los pedidos del servidor en memoria, no hay más para pedir
    if (totalServerItems <= loadedServerCount) return false;

    // Únicamente si el total disponible es mayor a los mostrados en pantalla
    return totalServerItems > filteredTodayOrders.length;
  }, [
    isTestOrders,
    isBarista,
    isInitialLoading,
    filteredTodayOrders.length,
    allLoaded,
    pagination?.hasMore,
    pagination?.totalItems,
    sortedTodayOrders,
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
                {isTestOrders && (
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
                            Pedidos de Prueba
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>
                            {filteredTodayOrders.length === 1
                              ? '1 pedido registrado localmente'
                              : `${filteredTodayOrders.length} pedidos registrados localmente`}
                          </div>
                        </div>
                      </div>

                      {todayOrders.length > 0 && (
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
                <div style={{ background: '#f6f6f6', padding: '6px 10px 4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      background: '#fff',
                      border: '1px solid #e5e5e5',
                      borderRadius: 12,
                      padding: '6px 10px',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                    }}
                  >
                    <span
                      style={{ fontSize: 16, opacity: 0.75, display: 'flex', alignItems: 'center' }}
                    >
                      <Search size={18} />
                    </span>

                    <input
                      value={addressQuery}
                      onChange={(e) => setAddressQuery(e.target.value)}
                      placeholder="Buscar por dirección"
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.9rem',
                        background: 'transparent',
                        fontFamily: "'Inter', sans-serif",
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
                          borderRadius: 8,
                          padding: '4px 6px',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                        title="Limpiar"
                      >
                        <FaXmark size={12} />
                      </button>
                    )}

                    {isDev && !isAndroidApp && (
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
                        title="Mostrar/ocultar vista ticket"
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

                {/* Filtros y Ordenamiento (En la misma línea) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 10px 0',
                    gap: 8,
                  }}
                >
                  {/* Filtros */}
                  <div
                    style={{
                      background: '#e9edf5',
                      borderRadius: 999,
                      padding: 4,
                      display: 'flex',
                      gap: 6,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                      flex: 1,
                    }}
                  >
                    {[
                      ['all', 'Todo'],
                      ['retiro', 'Retiro'],
                      ['delivery', 'Delivery'],
                      ...(totalPendingCount > 0
                        ? [['pending', `Pendientes (${totalPendingCount})`]]
                        : []),
                    ].map(([key, label]) => {
                      const active = orderTypeFilter === key;
                      const isPendingKey = key === 'pending';
                      return (
                        <button
                          key={key}
                          onClick={() => setOrderTypeFilter(key)}
                          style={{
                            flex: 1,
                            border: active
                              ? isPendingKey
                                ? '2px solid #ea580c'
                                : '2px solid black'
                              : 'transparent',
                            cursor: 'pointer',
                            borderRadius: 999,
                            padding: totalPendingCount > 0 ? '6px 8px' : '6px 12px',
                            fontWeight: 800,
                            fontSize: totalPendingCount > 0 ? 13 : 14,
                            background: active
                              ? isPendingKey
                                ? '#ea580c'
                                : 'white'
                              : 'transparent',
                            color: active
                              ? isPendingKey
                                ? '#fff'
                                : 'black'
                              : isPendingKey && totalPendingCount > 0
                                ? '#c2410c'
                                : '#111',
                            boxShadow: active ? '0 6px 16px rgba(0,0,0,0.18)' : 'none',
                            transition: 'all 150ms ease',
                            fontFamily: "'Inter'",
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Ordenamiento */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortDropdownOpen(!sortDropdownOpen);
                        }}
                        title={orderSort === 'pending' ? 'Ordenando por Pendientes primero' : 'Ordenar pedidos'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          border: orderSort === 'pending' ? '1.5px solid #6528f7' : '1px solid #e1e4e8',
                          background: orderSort === 'pending' ? '#f0f4ff' : '#fff',
                          color: orderSort === 'pending' ? '#6528f7' : '#111',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          transition: 'all 150ms ease',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = orderSort === 'pending' ? '#e5edff' : '#f3f4f6')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = orderSort === 'pending' ? '#f0f4ff' : '#fff')}
                      >
                        <MdSort size={18} />
                      </button>
                      {sortDropdownOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 4,
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 10,
                            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                            overflow: 'hidden',
                            zIndex: 100,
                            minWidth: 140,
                          }}
                        >
                          {[
                            ['recent', 'Más reciente'],
                            ['pending', 'Pendientes'],
                          ].map(([key, label]) => (
                            <button
                              key={key}
                              onClick={() => {
                                setOrderSort(key);
                                localStorage.setItem('pixel_orders_sort', key);
                                setSortDropdownOpen(false);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                background: orderSort === key ? '#f0f4ff' : 'transparent',
                                color: '#111',
                                fontSize: 12,
                                fontWeight: orderSort === key ? 700 : 500,
                                fontFamily: "'Inter', sans-serif",
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={(e) => {
                                if (orderSort !== key) e.target.style.background = '#f6f8fa';
                              }}
                              onMouseLeave={(e) => {
                                if (orderSort !== key) e.target.style.background = 'transparent';
                              }}
                            >
                              {orderSort === key && (
                                <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#6528f7' }} />
                              )}
                              {orderSort !== key && <div style={{ width: 14 }} />}
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                      onClick={() => setShowCompletedBarista(false)}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px 10px',
                        borderRadius: 7,
                        fontSize: '0.78rem',
                        fontWeight: !showCompletedBarista ? 700 : 500,
                        background: !showCompletedBarista ? '#ffffff' : 'transparent',
                        color: !showCompletedBarista ? '#09090b' : '#71717a',
                        boxShadow: !showCompletedBarista ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
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
                          background: !showCompletedBarista ? '#09090b' : '#e4e4e7',
                          color: !showCompletedBarista ? '#ffffff' : '#52525b',
                        }}
                      >
                        {pendingBaristaCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCompletedBarista(true)}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px 10px',
                        borderRadius: 7,
                        fontSize: '0.78rem',
                        fontWeight: showCompletedBarista ? 700 : 500,
                        background: showCompletedBarista ? '#ffffff' : 'transparent',
                        color: showCompletedBarista ? '#09090b' : '#71717a',
                        boxShadow: showCompletedBarista ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
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
                          background: showCompletedBarista ? '#15803d' : '#e4e4e7',
                          color: showCompletedBarista ? '#ffffff' : '#52525b',
                        }}
                      >
                        {completedCount}
                      </span>
                    </button>
                  </div>

                  {/* Botón Simular pedidos (Modo Dev) */}
                  {isDev && !isAndroidApp && (
                    <button
                      type="button"
                      onClick={handleToggleMockOrders}
                      style={{
                        border: showMockOrders ? '1px solid #fecdd3' : '1px solid #e4e4e7',
                        background: showMockOrders ? '#fff1f2' : '#ffffff',
                        color: showMockOrders ? '#e11d48' : '#71717a',
                        borderRadius: 7,
                        padding: '5px 8px',
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
                      <Sparkles size={11} />
                      {showMockOrders ? 'Quitar mocks' : 'Mocks'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {isBarista && filteredTodayOrders.length === 0 && (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '70px 20px',
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

            {!isBarista && filteredTodayOrders.length === 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '50px 20px',
                  textAlign: 'center',
                  color: '#71717a',
                }}
              >
                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#333',
                    marginBottom: 4,
                  }}
                >
                  {orderTypeFilter === 'pending'
                    ? 'No hay pedidos pendientes'
                    : addressQuery.trim()
                      ? `No se encontraron pedidos con "${addressQuery}"`
                      : 'No hay pedidos'}
                </div>
                {orderTypeFilter !== 'all' && (
                  <button
                    onClick={() => setOrderTypeFilter('all')}
                    style={{
                      marginTop: 12,
                      padding: '6px 14px',
                      background: '#111',
                      color: '#fff',
                      borderRadius: 999,
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Ver todos
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
              {filteredTodayOrders.map((o) => {
                const displayNum = isBarista ? (o.numeracion ?? rankById.get(o.id) ?? '') : (rankById.get(o.id) ?? o.numeracion ?? '');

                return (
                  <CardOrders
                    key={o.id}
                    numeracion={displayNum}
                    {...o}
                    isBarista={isBarista}
                    isTestOrder={Boolean(o?.isTestOrder || String(o?.id || '').startsWith('local-test-'))}
                    isPrepared={Boolean(preparedOrders[o.id])}
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
      />
    </GlobalOrders>
  );
}
