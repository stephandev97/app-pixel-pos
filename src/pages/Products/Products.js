import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import CardProduct from '../../components/Products/CardProduct';
import { pb } from '../../lib/pb';
import { addToCart } from '../../redux/cart/cartSlice';
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

/**
 * Products.js — versión completa con:
 * - Skeleton shimmer (sin salto de layout)
 * - Cache offline (localStorage)
 * - Suscripción en vivo (create/update/delete)
 * - Online/offline banner
 * - Barra de búsqueda con Satoshi + icono de lupa (Ctrl/⌘+K)
 */

// ===== Config =====
const CACHE_KEY = 'pb_products_v1';
const SKELETON_COUNT = 12;
const CATEGORIES_ORDER = ['Helado', 'Paletas', 'Varios', 'Consumir en el local', 'Extras', 'Otros'];

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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const submit = () => {
    onQuickAdd?.({ name: name.trim(), price });
    setName('');
    setPrice('');
    setOpen(false);
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
          fontFamily: "'Satoshi', sans-serif",
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
            border: '1.5px solid #111',
            background: '#fff',
            color: '#111',
            outline: 'none',
            boxShadow: '0 2px 10px rgba(0,0,0,.06)',
            fontFamily: "'Satoshi', sans-serif",
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
            border: '1.5px solid #111',
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

        {/* Limpiar */}
        {q && (
          <button
            onClick={() => setQ('')}
            aria-label="Limpiar"
            style={{
              borderRadius: 12,
              border: '1.5px solid #111',
              background: '#fff',
              color: '#111',
              cursor: 'pointer',
              padding: '10px 12px',
              lineHeight: 1,
              fontFamily: "'Satoshi', sans-serif",
            }}
          >
            Limpiar
          </button>
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
                fontFamily: "'Satoshi', sans-serif",
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
                fontFamily: "'Satoshi', sans-serif",
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
  const rec = e?.record;
  if (!rec) return prev;
  if (e.action === 'delete') return prev.filter((p) => p.id !== rec.id);
  const idx = prev.findIndex((p) => p.id === rec.id);
  if (idx >= 0) {
    const next = prev.slice();
    next[idx] = { ...prev[idx], ...rec };
    return next;
  }
  return [rec, ...prev.filter((p) => p.id !== rec.id)];
}

export default function Products() {
  const cached = useMemo(readCache, []);
  const [products, setProducts] = useState(cached);
  const [loading, setLoading] = useState(cached.length === 0);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [q, setQ] = useState('');

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
