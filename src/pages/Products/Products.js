import { QrCode } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import CardProduct from '../../components/Products/CardProduct';
import { pb } from '../../lib/pb';
import { addToCart } from '../../redux/cart/cartSlice';
import { pointsApiClient } from '../../utils/pointsApiClient';
import {
  CategoryHeader,
  CategoryPill,
  CategoryTitle,
  CategoryUnderline,
  CategoryWrap,
  ContainerCategory,
  ContainerProducts,
  GlobalProducts,
  GridProducts,
  TitleCategory,
} from './ProductsStyled';

const ipc = window.electron?.ipcRenderer;

// ===== Config =====
const CACHE_KEY = 'pb_products_v1';
const SKELETON_COUNT = 12;
const CATEGORIES_ORDER = [
  'Delivery',
  'Helado',
  'Paletas',
  'Varios',
  'Consumir en el local',
  'Extras',
  'Otros',
];

// ===== Skeleton UI =====
function SkeletonStyles() {
  return (
    <style>{`
      @keyframes shimmer { 0%{ background-position: -200% 0 } 100%{ background-position: 200% 0 } }
      .sk-card{ display:flex; flex-direction:column; gap:.6rem; padding:14px; border-radius:16px; min-height:140px; background: rgba(255,255,255,0.06); backdrop-filter: blur(6px); border:1px solid rgba(255,255,255,.08); }
      .sk, .sk-line, .sk-chip{ position:relative; overflow:hidden; border-radius:10px; background: linear-gradient(90deg, rgba(255,255,255,.08) 25%, rgba(255,255,255,.16) 37%, rgba(255,255,255,.08) 63%); background-size: 400% 100%; animation: shimmer 1.4s ease-in-out infinite; }
      .sk-photo{ height:90px; border-radius:12px; }
      .sk-line{ height:14px; }
      .sk-line.sm{ height:10px; width:60%; }
      .sk-row{ display:flex; gap:.5rem; align-items:center; }
      .sk-chip{ height:28px; width:84px; border-radius:999px; }
      .sk-price{ height:18px; width:40%; }
    `}</style>
  );
}

function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk sk-photo" />
      <div className="sk sk-line" />
      <div className="sk sk-line sm" />
      <div className="sk-row">
        <div className="sk sk-chip" />
        <div className="sk sk-price" />
      </div>
    </div>
  );
}

// ===== SearchBar =====
function SearchBar({ q, setQ, onQuickAdd }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrClaim, setQrClaim] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrMsg, setQrMsg] = useState('');
  const [qrError, setQrError] = useState('');
  const [pointsConnectionStatus, setPointsConnectionStatus] = useState('checking');

  const submit = () => {
    onQuickAdd?.({ name: name.trim(), price });
    setName('');
    setPrice('');
    setOpen(false);
  };

  const resetQr = () => {
    setQrOpen(false);
    setQrCode('');
    setQrClaim(null);
    setQrMsg('');
    setQrError('');
  };

  const lookupClaim = async () => {
    const codeVal = qrCode.trim();
    if (!codeVal) {
      setQrError('Ingresá un código válido');
      return;
    }

    try {
      setQrLoading(true);
      setQrError('');
      setQrMsg('');
      const result = await pointsApiClient.findQRCode(codeVal);
      if (result.found) {
        setQrClaim({
          id: result.data.id,
          code: codeVal,
          type: result.type,
          data: result.data,
          pointsCost: result.pointsCost || 0,
          rewardTitle: result.title || result.data.title,
          clientName: result.clientName || result.data.name,
          clientDni: result.clientDni,
          message: result.message,
          pointsBalance: result.pointsBalance || 0,
        });
        setQrMsg(result.message);
      } else {
        setQrError(result.message);
        setQrClaim(null);
      }
    } catch (err) {
      setQrClaim(null);
      const reason = err?.data?.message || err?.message || '';
      setQrError(`Error en búsqueda: ${reason}`);
    } finally {
      setQrLoading(false);
    }
  };

  const redeemClaim = async () => {
    if (!qrClaim) {
      setQrError('Validá un cupón primero.');
      return;
    }
    try {
      setQrLoading(true);
      setQrError('');
      if (qrClaim.type === 'claim') {
        // Canjear cupón en sistema de puntos
        console.log('🎫 Canjeando cupón en sistema de puntos...');
        console.log('📋 Claim ID a canjear:', qrClaim.data.id);
        console.log('📋 Claim completo:', qrClaim.data);

        if (!qrClaim.data.id) {
          setQrError('❌ Error: ID de cupón no encontrado');
          return;
        }

        const result = await pointsApiClient.redeemRewardFromPos(
          qrClaim.data.id, // claim id
          'pos_operator_001'
        );

        if (result.success) {
          setQrMsg(result.message);
          setQrClaim(null);
          setQrCode('');
          setQrOpen(false);
        } else {
          setQrError(result.message);
        }
      } else if (qrClaim.type === 'reward') {
        // Canjear premio directo en sistema de puntos
        console.log('🎁 Canjeando premio directo en sistema de puntos...');
        console.log('📋 Reward ID a canjear:', qrClaim.rewardId);

        if (!qrClaim.data.id) {
          setQrError('❌ Error: ID de premio no encontrado');
          return;
        }

        const result = await pointsApiClient.redeemRewardFromPos(
          qrClaim.data.id, // usar el ID del reward data
          'pos_operator_001'
        );

        if (result.success) {
          setQrMsg(result.message);
          setQrClaim(null);
          setQrCode('');
          setQrOpen(false);
        } else {
          setQrError(result.message);
        }
      } else if (qrClaim.type === 'client') {
        // Mostrar info del cliente y agregar puntos
        setQrMsg(`👤 Cliente: ${qrClaim.clientName} - Puntos: ${qrClaim.pointsBalance}`);
        // Aquí podrías agregar botones para sumar puntos
      }
    } catch (err) {
      const reason = err?.data?.message || err?.message || '';
      setQrError(`No se pudo canjear: ${reason}`);
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <>
      <style>{`#product-search::placeholder{ color: rgba(0,0,0,.45) }`}</style>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          gap: 8,
          padding: '10px 14px',
          alignItems: 'center',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
        }}
      >
        {/* Lupa */}
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          style={{
            position: 'absolute',
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666',
          }}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7"></circle>
          <line x1="16" y1="16" x2="21" y2="21"></line>
        </svg>

        {/* Input */}
        <input
          id="product-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar productos (Ctrl+K)…"
          autoComplete="off"
          style={{
            flex: 1,
            padding: '12px 14px 12px 44px',
            borderRadius: 16,
            border: 'none',
            background: '#fff',
            color: '#111',
            outline: 'none',
            boxShadow: '0 2px 10px rgba(0,0,0,.06)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
          }}
        />

        {/* Botón + (temporal directo al carrito) */}
        <button
          onClick={() => setOpen((v) => !v)}
          title="Agregar producto temporal al carrito"
          aria-label="Agregar producto temporal al carrito"
          style={{
            width: 38,
            height: 38,
            minWidth: 38,
            minHeight: 38,
            borderRadius: 12,
            border: 'none',
            background: '#fff',
            color: '#111',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            lineHeight: 1,
            boxShadow: '0 2px 10px rgba(0,0,0,.06)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        {/* Botón QR con menú desplegable */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setQrOpen(true)}
            title="QR"
            aria-label="QR"
            style={{
              width: 38,
              height: 38,
              minWidth: 38,
              minHeight: 38,
              borderRadius: 12,
              border: 'none',
              background: '#780000',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              lineHeight: 1,
              boxShadow: '0 2px 10px rgba(0,0,0,.06)',
            }}
          >
            <QrCode size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Limpiar */}
        {q && (
          <button
            onClick={() => setQ('')}
            aria-label="Limpiar"
            style={{
              borderRadius: 12,
              border: 'none',
              background: '#fff',
              color: '#111',
              cursor: 'pointer',
              padding: '10px 12px',
              lineHeight: 1,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Limpiar
          </button>
        )}

        {qrOpen && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) resetQr();
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1500,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <div
              style={{
                width: '95vw',
                maxWidth: 520,
                background: '#fff',
                borderRadius: 18,
                padding: 20,
                boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                display: 'grid',
                gap: 12,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                  Canjear cupón (Sistema de Puntos)
                </div>
                <button
                  onClick={resetQr}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              <label style={{ display: 'grid', gap: 6, fontSize: '.95rem', color: '#444' }}>
                Código (alfanumérico)
                <input
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Ej: ABC123"
                  autoFocus
                  maxLength={10}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid #ccc',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                  }}
                />
              </label>

              {qrClaim && (
                <div
                  style={{
                    background: '#e3f2fd',
                    border: '1px solid #90caf9',
                    borderRadius: 12,
                    padding: 12,
                    display: 'grid',
                    gap: 6,
                  }}
                >
                  {qrClaim.type === 'reward' && (
                    <>
                      <div>
                        🎁 Premio: <strong>{qrClaim.rewardTitle}</strong>
                      </div>
                      {qrClaim.pointsCost && (
                        <div>
                          💰 Costo: <strong>{qrClaim.pointsCost} pts</strong>
                        </div>
                      )}
                    </>
                  )}

                  {qrClaim.type === 'client' && (
                    <>
                      <div>
                        👤 Cliente: <strong>{qrClaim.clientName}</strong>
                      </div>
                      <div>
                        💳 Puntos: <strong>{qrClaim.pointsBalance}</strong>
                      </div>
                    </>
                  )}

                  {qrClaim.type === 'claim' && (
                    <>
                      <div>
                        🎫 Cupón: <strong>{qrClaim.rewardTitle}</strong>
                      </div>
                      {qrClaim.pointsCost && (
                        <div>
                          💰 Costo: <strong>{qrClaim.pointsCost} pts</strong>
                        </div>
                      )}
                      {qrClaim.clientName && (
                        <div>
                          👤 Cliente: <strong>{qrClaim.clientName}</strong>
                          {qrClaim.clientDni && (
                            <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#666' }}>
                              (DNI: {qrClaim.clientDni})
                            </span>
                          )}
                        </div>
                      )}
                      {qrClaim.status && (
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          Estado: <strong>{qrClaim.status}</strong>
                        </div>
                      )}
                    </>
                  )}

                  {qrClaim.type === 'error' && (
                    <div style={{ fontSize: '0.85rem', color: '#dc3545' }}>
                      🔧 Error técnico: {qrClaim.error || 'Error desconocido'}
                    </div>
                  )}

                  {qrClaim.type === 'auth_error' && (
                    <div style={{ fontSize: '0.85rem', color: '#dc3545' }}>
                      🔐 Error de autenticación: {qrClaim.message}
                    </div>
                  )}

                  {qrClaim.searchedCode && (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 4 }}>
                      Código buscado: <code>{qrClaim.searchedCode}</code>
                    </div>
                  )}

                  {qrClaim.expiresAt && (
                    <div style={{ fontSize: '0.95rem', color: '#666' }}>
                      ⏰ Vence: {new Date(qrClaim.expiresAt).toLocaleString()}
                    </div>
                  )}

                  {/* Mensaje del sistema */}
                  {qrClaim.message && (
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: '#1565c0',
                        fontStyle: 'italic',
                        padding: '4px 8px',
                        background: '#f3f9ff',
                        borderRadius: 4,
                      }}
                    >
                      {qrClaim.message}
                    </div>
                  )}
                </div>
              )}

              {qrError && (
                <div
                  style={{
                    color: '#b91c1c',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: 10,
                    padding: 10,
                    fontSize: '.95rem',
                  }}
                >
                  {qrError}
                </div>
              )}
              {qrMsg && (
                <div
                  style={{
                    color: '#166534',
                    background: '#ecfdf3',
                    border: '1px solid #bbf7d0',
                    borderRadius: 10,
                    padding: 10,
                    fontSize: '.95rem',
                  }}
                >
                  {qrMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  onClick={resetQr}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #ddd',
                    background: '#f7f7f7',
                    cursor: 'pointer',
                    minWidth: 100,
                  }}
                >
                  Cerrar
                </button>
                <button
                  onClick={lookupClaim}
                  disabled={qrLoading}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #111',
                    background: '#fff',
                    color: '#111',
                    cursor: 'pointer',
                    minWidth: 120,
                    opacity: qrLoading ? 0.6 : 1,
                  }}
                >
                  {qrLoading ? 'Buscando...' : 'Validar'}
                </button>
                <button
                  onClick={redeemClaim}
                  disabled={qrLoading || !qrClaim}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#111',
                    color: '#fff',
                    cursor: qrClaim ? 'pointer' : 'not-allowed',
                    minWidth: 120,
                    opacity: qrLoading || !qrClaim ? 0.6 : 1,
                  }}
                >
                  {qrLoading ? 'Procesando...' : 'Canjear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popover para nombre/precio */}
        {open && (
          <div
            style={{
              position: 'absolute',
              right: 14,
              top: '100%',
              marginTop: 6,
              zIndex: 5,
              display: 'grid',
              gap: 8,
              padding: 12,
              width: 260,
              background: '#fff',
              border: '1.5px solid #111',
              borderRadius: 14,
              boxShadow: '0 8px 24px rgba(0,0,0,.15)',
            }}
          >
            <div style={{ fontWeight: 800 }}>Producto temporal</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              autoFocus
              onKeyDown={(e) =>
                e.key === 'Enter' ? document.getElementById('temp-price')?.focus() : null
              }
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #111',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
              }}
            />
            <input
              id="temp-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Precio (ARS)"
              inputMode="numeric"
              onKeyDown={(e) => (e.key === 'Enter' ? submit() : null)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #111',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setOpen(false);
                  setName('');
                  setPrice('');
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1px solid #111',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                style={{
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1px solid #111',
                  background: '#111',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ===== Helpers =====
// Normaliza texto (case-insensible)
function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .trim();
}
// Filtra productos por query (por nombre, categoría, descripción)
function filterProducts(arr, q) {
  const t = normalizeText(q);
  if (!t) return arr;
  const tokens = t.split(/\s+/).filter(Boolean);
  return arr.filter((p) => {
    const hay = normalizeText(
      `${p?.name || p?.title || p?.label || ''} ${p?.category || ''} ${p?.description || ''}`
    );
    return tokens.every((tok) => hay.includes(tok));
  });
}
function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
  } catch {
    return [];
  }
}
function writeCache(arr) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(arr));
  } catch {
    // manejo futuro
  }
}
function groupByCategory(products) {
  const map = new Map(CATEGORIES_ORDER.map((c) => [c, []]));
  for (const p of products) {
    const key = map.has(p?.category) ? p.category : 'Otros';
    map.get(key).push(p);
  }
  return Array.from(map.entries()).filter(([, items]) => items.length > 0);
}
// Aplica cambios en vivo de PocketBase (create/update/delete)
function applyRealtimeChange(prev, e) {
  const safePrev = Array.isArray(prev) ? prev : []; // <<-- Agrega esta línea
  const rec = e?.record;
  if (!rec) return safePrev; // <<-- Usa safePrev aquí

  if (e.action === 'delete') return safePrev.filter((p) => p.id !== rec.id);

  const idx = safePrev.findIndex((p) => p.id === rec.id);
  if (idx >= 0) {
    const next = safePrev.slice();
    next[idx] = { ...safePrev[idx], ...rec };
    return next;
  }
  return [rec, ...safePrev.filter((p) => p.id !== rec.id)];
}

export default function Products() {
  const [downloadProgress, setDownloadProgress] = useState(null);
  const cached = useMemo(readCache, []);
  const [products, setProducts] = useState(cached);
  const [loading, setLoading] = useState(cached.length === 0);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [q, setQ] = useState('');
  const [, setPointsConnectionStatus] = useState('checking');

  // Verificar conexión con sistema de puntos al montar
  useEffect(() => {
    const checkPointsConnection = async () => {
      try {
        const test = await pointsApiClient.testConnection();
        setPointsConnectionStatus(test.success ? 'connected' : 'error');
        console.log('🔗 Conexión con app de puntos:', test.message);
      } catch (error) {
        setPointsConnectionStatus('error');
        console.error('❌ Error de conexión con app de puntos:', error);
      }
    };

    checkPointsConnection();
    // Verificar cada 30 segundos
    const interval = setInterval(checkPointsConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => filterProducts(products, q), [products, q]);
  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  const dispatch = useDispatch();

  function handleQuickAdd({ name, price }) {
    if (!name) return;

    const temp = {
      id: `temp-${Date.now()}`, // único por sesión
      name,
      price: Number(price) || 0,
      category: 'Otros',
      isTemp: true,
      // TIP: si en el futuro querés “combinar” cantidades de este mismo temp,
      // usá un id estable (ej: temp-<nombre>-<precio>) o agregá 'sabores' para matchear.
    };

    dispatch(addToCart(temp)); // 👉 entra directo al carrito con quantity: 1
  }

  useEffect(() => {
    const ipc = window.electron?.ipcRenderer;
    if (!ipc) return;

    const handler = (_e, percent) => {
      setDownloadProgress(percent);
    };

    ipc.on('update-download-progress', handler);

    return () => {
      ipc.removeListener('update-download-progress', handler);
    };
  }, []);

  // Fetch inicial
  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setError(null);
        if (cached.length === 0) setLoading(true);
        const list = await pb.collection('products').getFullList({ sort: 'name' });
        if (cancelled) return;
        setProducts(list);
        writeCache(list);
      } catch (e) {
        if (cancelled) return;
        if (cached.length === 0) setError(e?.data || e?.message || 'Error al cargar productos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suscripción en vivo
  useEffect(() => {
    const coll = pb.collection('products');
    const handler = (e) => {
      setProducts((prev) => {
        const next = applyRealtimeChange(prev, e);
        writeCache(next);
        return next;
      });
    };
    coll.subscribe('*', handler).catch(console.error);
    return () => coll.unsubscribe('*');
  }, []);

  // Online/Offline + atajo Ctrl/⌘+K
  useEffect(() => {
    const goOnline = () => {
      setOffline(false);
    };
    const goOffline = () => {
      setOffline(true);
    };
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('product-search')?.focus();
      }
    };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    const onAdd = (e) => {
      const item = e.detail;
      if (!item) return;
      // dispatch(addToCart(item))  o  cart.add(item)
    };
    window.addEventListener('cart:add', onAdd);
    return () => window.removeEventListener('cart:add', onAdd);
  }, []);

  // ===== Render =====
  return (
    <GlobalProducts>
      {downloadProgress !== null && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            background: '#eee',
            height: 6,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: `${downloadProgress}%`,
              height: '100%',
              background: '#111',
              transition: 'width .3s ease',
            }}
          />
        </div>
      )}

      {/* indicador de conexión ocultado */}

      {offline && (
        <div style={{ padding: '8px 14px', fontSize: 12, opacity: 0.8 }}>
          Modo offline: mostrando productos guardados.
        </div>
      )}

      {/* Barra de búsqueda SIEMPRE visible */}
      <SearchBar q={q} setQ={setQ} onQuickAdd={handleQuickAdd} />

      {loading ? (
        <>
          <SkeletonStyles />
          <ContainerProducts>
            <ContainerCategory>
              <TitleCategory>Productos</TitleCategory>
              <GridProducts>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </GridProducts>
            </ContainerCategory>
          </ContainerProducts>
        </>
      ) : (
        <ContainerProducts>
          {grouped.length === 0 && q && (
            <div style={{ padding: '8px 14px', opacity: 0.7 }}>Sin resultados para “{q}”.</div>
          )}
          {grouped.map(([cat, items]) => {
            if (cat === 'Delivery') return null;
            // 👉 ordena por precio de menor a mayor
            const sorted = [...items].sort((a, b) => (a.price || 0) - (b.price || 0));

            return (
              <ContainerCategory as={CategoryWrap} key={cat} id={`cat-${cat}`}>
                <CategoryHeader>
                  <CategoryTitle>
                    {cat}
                    <CategoryPill>{sorted.length}</CategoryPill>
                  </CategoryTitle>
                  <CategoryUnderline />
                </CategoryHeader>

                <GridProducts>
                  {sorted.map((item) => (
                    <CardProduct key={item.id} {...item} />
                  ))}
                </GridProducts>
              </ContainerCategory>
            );
          })}
        </ContainerProducts>
      )}
    </GlobalProducts>
  );
}
