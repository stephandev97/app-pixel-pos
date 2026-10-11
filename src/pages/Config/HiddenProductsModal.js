import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useDispatch, useSelector } from 'react-redux';
import {
  Coffee,
  Eye,
  EyeOff,
  IceCream,
  RotateCcw,
  Search,
  X,
  Layers,
} from 'lucide-react';

import { pb } from '../../lib/pb';
import {
  setHiddenProducts,
  toggleHideProduct,
  restoreAllHiddenProducts,
} from '../../redux/actions/actionsSlice';
import { syncCafeStockToPb } from '../../utils/cafeStockSync';
import { formatPrice } from '../../utils/formatPrice';

export default function HiddenProductsModal({ open, onClose }) {
  const dispatch = useDispatch();
  const hiddenProducts = useSelector((s) => s.actions?.hiddenProducts || {});

  const [products, setProducts] = useState([]);
  const [cafeteriaProducts, setCafeteriaProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'helados' | 'cafeteria'
  const [filterOnlyHidden, setFilterOnlyHidden] = useState(false);

  // Cargar productos desde caché y PocketBase
  useEffect(() => {
    if (!open) return;

    // 1. Cargar caché inmediatamente para cero latencia
    try {
      const cachedHelados = JSON.parse(localStorage.getItem('cached_products') || '[]');
      const cachedCaf = JSON.parse(localStorage.getItem('cached_cafeteria_products') || '[]');
      if (cachedHelados.length > 0) setProducts(cachedHelados);
      if (cachedCaf.length > 0) setCafeteriaProducts(cachedCaf);
    } catch (_) {}

    // 2. Traer lista fresca de PocketBase
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [listHelados, listCaf] = await Promise.all([
          pb.collection('products').getFullList({ sort: 'name' }).catch(() => []),
          pb.collection('products_cafeteria').getFullList({ sort: 'name' }).catch(() => []),
        ]);
        if (!alive) return;
        if (listHelados.length > 0) setProducts(listHelados);
        if (listCaf.length > 0) setCafeteriaProducts(listCaf);
      } catch (err) {
        console.warn('Error cargando productos para modal de ocultos:', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open]);

  // Unificar catálogo
  const allItems = useMemo(() => {
    const heladosItems = products.map((p) => ({
      ...p,
      isCafeteria: false,
      catalogType: 'helados',
    }));
    const cafItems = cafeteriaProducts
      .filter((p) => p.category !== 'extra')
      .map((p) => ({
        ...p,
        isCafeteria: true,
        catalogType: 'cafeteria',
      }));
    return [...heladosItems, ...cafItems];
  }, [products, cafeteriaProducts]);

  // Contar ocultos totales
  const totalHiddenCount = useMemo(() => {
    return allItems.filter((it) => Boolean(hiddenProducts[it.id] || hiddenProducts[it.name])).length;
  }, [allItems, hiddenProducts]);

  // Filtrar lista por búsqueda, pestaña y estado
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((item) => {
      // Filtro pestaña
      if (activeTab === 'helados' && item.isCafeteria) return false;
      if (activeTab === 'cafeteria' && !item.isCafeteria) return false;

      const isHidden = Boolean(hiddenProducts[item.id] || hiddenProducts[item.name]);

      // Filtro sólo ocultos
      if (filterOnlyHidden && !isHidden) return false;

      // Filtro texto
      if (q) {
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const catMatch = (item.category || '').toLowerCase().includes(q);
        if (!nameMatch && !catMatch) return false;
      }

      return true;
    });
  }, [allItems, activeTab, filterOnlyHidden, search, hiddenProducts]);

  // Manejar alternar visibilidad de un producto
  const handleToggle = async (item) => {
    const id = item.id;
    if (!id) return;
    const isCurrentlyHidden = Boolean(hiddenProducts[id] || hiddenProducts[item.name]);
    const nextMap = { ...hiddenProducts };

    if (isCurrentlyHidden) {
      delete nextMap[id];
      if (item.name) delete nextMap[item.name];
    } else {
      nextMap[id] = true;
    }

    // 1. Actualización optimista inmediata en Redux y localStorage
    dispatch(toggleHideProduct(id));

    // 2. Sincronización asíncrona con PocketBase
    try {
      await syncCafeStockToPb({ hiddenProducts: nextMap });
    } catch (err) {
      console.warn('Error sincronizando hiddenProducts a PocketBase:', err);
    }
  };

  // Restaurar todos a visible
  const handleRestoreAll = async () => {
    if (totalHiddenCount === 0) return;
    const confirmed = window.confirm(
      '¿Deseas restaurar todos los productos para que vuelvan a estar visibles en el catálogo?'
    );
    if (!confirmed) return;

    dispatch(restoreAllHiddenProducts());
    try {
      await syncCafeStockToPb({ hiddenProducts: {} });
    } catch (err) {
      console.warn('Error restaurando hiddenProducts en PocketBase:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: '#141624',
          color: '#ffffff',
          width: 620,
          maxWidth: '96%',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Cabecera modal */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EyeOff size={18} style={{ color: '#f43f5e' }} />
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#fff' }}>
                Ocultar Productos en Catálogo
              </h2>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Ocultá temporalmente productos del inicio/POS para que los cajeros no los vendan.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              all: 'unset',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de herramientas: Búsqueda y Pestañas */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'rgba(0, 0, 0, 0.15)',
            flexShrink: 0,
          }}
        >
          {/* Buscador */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
              padding: '7px 12px',
            }}
          >
            <Search size={15} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto por nombre o categoría..."
              style={{
                all: 'unset',
                width: '100%',
                fontSize: 13,
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtros: Tabs + Toggle sólo ocultos */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'all', label: 'Todos', icon: Layers },
                { id: 'helados', label: 'Heladería', icon: IceCream },
                { id: 'cafeteria', label: 'Cafetería', icon: Coffee },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      padding: '5px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: active ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: active ? '#fff' : '#94a3b8',
                      border: `1px solid ${active ? 'rgba(255, 255, 255, 0.25)' : 'transparent'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComponent size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Chip sólo ocultos */}
              <button
                type="button"
                onClick={() => setFilterOnlyHidden((prev) => !prev)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: filterOnlyHidden
                    ? 'rgba(244, 63, 94, 0.2)'
                    : 'rgba(255, 255, 255, 0.04)',
                  color: filterOnlyHidden ? '#f43f5e' : '#94a3b8',
                  border: `1px solid ${
                    filterOnlyHidden ? 'rgba(244, 63, 94, 0.4)' : 'rgba(255, 255, 255, 0.06)'
                  }`,
                  transition: 'all 0.15s ease',
                }}
              >
                <EyeOff size={13} />
                <span>Ocultos ({totalHiddenCount})</span>
              </button>

              {totalHiddenCount > 0 && (
                <button
                  type="button"
                  onClick={handleRestoreAll}
                  title="Restaurar todos los productos a visibles"
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    padding: '5px 8px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Mostrar todos</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#64748b',
                fontSize: 13,
                fontStyle: 'italic',
              }}
            >
              {search
                ? `No se encontraron productos con "${search}".`
                : filterOnlyHidden
                  ? 'No hay productos ocultos actualmente.'
                  : 'No hay productos para mostrar.'}
            </div>
          ) : (
            filteredItems.map((item) => {
              const isHidden = Boolean(hiddenProducts[item.id] || hiddenProducts[item.name]);
              const priceDisplay =
                item.price || item.price_8oz || item.price_12oz || item.price_16oz || 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isHidden ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${
                      isHidden ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.06)'
                    }`,
                    transition: 'all 0.15s ease',
                    opacity: isHidden ? 0.75 : 1,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: isHidden ? '#fda4af' : '#fff',
                          textDecoration: isHidden ? 'line-through' : 'none',
                        }}
                      >
                        {item.name}
                      </span>
                      {item.isCafeteria && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: 'rgba(180, 83, 9, 0.2)',
                            color: '#fbbf24',
                            border: '1px solid rgba(251, 191, 36, 0.25)',
                          }}
                        >
                          Cafetería
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94a3b8' }}>
                      <span style={{ textTransform: 'capitalize' }}>{item.category || 'General'}</span>
                      {priceDisplay > 0 && <span>• {formatPrice(priceDisplay)}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {/* Badge de estado */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: isHidden ? '#f43f5e' : 'rgba(16, 185, 129, 0.15)',
                        color: isHidden ? '#fff' : '#34d399',
                        border: `1px solid ${isHidden ? '#f43f5e' : 'rgba(16, 185, 129, 0.3)'}`,
                      }}
                    >
                      {isHidden ? (
                        <>
                          <EyeOff size={11} strokeWidth={2.6} />
                          Oculto
                        </>
                      ) : (
                        <>
                          <Eye size={11} strokeWidth={2.6} />
                          Visible
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {totalHiddenCount === 0 ? (
              <span>Todos los productos están visibles en el POS.</span>
            ) : (
              <span>
                <strong style={{ color: '#f43f5e' }}>{totalHiddenCount}</strong>{' '}
                {totalHiddenCount === 1 ? 'producto oculto' : 'productos ocultos'} en el catálogo.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              all: 'unset',
              cursor: 'pointer',
              padding: '7px 18px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              background: '#4ccd99',
              color: '#0b0c16',
              transition: 'all 0.15s ease',
            }}
          >
            Listo
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
