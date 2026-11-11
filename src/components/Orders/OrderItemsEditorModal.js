// src/components/Orders/OrderItemsEditorModal.js
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@mui/material';
import {
  Check,
  MessageCircle,
  Minus,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { pb } from '../../lib/pb';
import { formatPrice } from '../../utils/formatPrice';
import { explodeOptionsFromRecords } from '../../utils/productUtils';
import {
  clasica,
  dubai,
  PRODUCT_OPTIONS,
} from '../Products/productOptionsConstants';

const WHATSAPP_BROWSER_PREFERENCE_KEY = 'pixel-pos-whatsapp-browser';

function parseUnitPrice(item) {
  if (!item) return 0;
  const raw = item.price ?? item.unitPrice ?? item.precio ?? 0;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const num = Number(String(raw).replace(/[^\d.-]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

function normalizeStr(s = '') {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Determina si un producto es un pote de helado por peso (1/4 kg, 1/2 kg, 1 kg)
 */
function isHeladoByWeight(item) {
  const n = normalizeStr(item?.name || '');
  if (!n) return false;
  return (
    n.includes('1/4') ||
    n.includes('cuarto') ||
    n.includes('1/2') ||
    n.includes('medio') ||
    /\b1\s*(kg|kilo)\b/.test(n) ||
    n === '1kg' ||
    n === '1 kg' ||
    n === '1 kilo'
  );
}

function getMaxHeladoFlavors(item) {
  const n = normalizeStr(item?.name || '');
  if (/\b1\s*(kg|kilo)\b/.test(n) || n.includes('1kg')) return 4;
  return 3; // 1/2 kg y 1/4 kg
}

/**
 * Parsea el field `options` de un registro de PocketBase (array de strings/objetos, JSON string, etc.)
 */
function parseOptionsField(raw) {
  if (!raw) return [];
  let data = raw;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed || trimmed === '[]' || trimmed === '{}') return [];
    try {
      data = JSON.parse(trimmed);
    } catch {
      return trimmed
        .split(/[\n,;]+/)
        .map((s) => s.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter(Boolean);
    }
  }
  if (Array.isArray(data)) {
    return data
      .map((entry) => {
        if (!entry) return null;
        if (typeof entry === 'string') return entry.trim();
        if (typeof entry === 'object') {
          const val =
            entry.nombre ??
            entry.name ??
            entry.label ??
            entry.value ??
            entry.sabor ??
            entry.variedad ??
            entry.titulo ??
            '';
          return String(val).trim();
        }
        return String(entry).trim();
      })
      .filter(Boolean);
  }
  if (typeof data === 'object' && data !== null) {
    const list =
      data.options ?? data.opciones ?? data.variedades ?? data.items ?? Object.values(data);
    if (Array.isArray(list)) return parseOptionsField(list);
  }
  return [];
}

/**
 * Obtiene las variantes desde el field `options` del producto en PocketBase (o constantes de respaldo)
 * para productos que no son helado por peso (ej. Pote Gio, Paletas, Mini Torta, Cookies, etc.)
 */
function resolveItemOptionsConfig(item, allProducts = [], cafeteriaCatalog = []) {
  if (!item || isHeladoByWeight(item)) {
    return { hasOptions: false, options: [], detectedOption: null };
  }

  const combinedCatalog = [...(allProducts || []), ...(cafeteriaCatalog || [])];
  const itemNameNorm = normalizeStr(item.name);
  const itemCatNorm = normalizeStr(item.category);

  // 1. Si el propio item ya trae `options`
  let optionsList = parseOptionsField(item.options ?? item.opciones ?? item.variedades);

  // 2. Buscar por ID exacto en el catálogo de PocketBase
  let matchedProduct = null;
  if (optionsList.length === 0 && item.id) {
    matchedProduct = combinedCatalog.find((p) => String(p.id) === String(item.id));
    if (matchedProduct) {
      optionsList = parseOptionsField(
        matchedProduct.options ?? matchedProduct.opciones ?? matchedProduct.variedades
      );
    }
  }

  // 3. Buscar por coincidencia de nombre base en el catálogo de PocketBase
  if (optionsList.length === 0) {
    matchedProduct = combinedCatalog.find((p) => {
      const pName = normalizeStr(p.name);
      if (!pName) return false;
      const pOpts = parseOptionsField(p.options ?? p.opciones ?? p.variedades);
      if (pOpts.length === 0) return false;

      if (itemNameNorm === pName || itemNameNorm.startsWith(pName + ' ') || itemNameNorm.startsWith(pName + ' -')) {
        return true;
      }
      // Si es una paleta cuyo nombre tiene la variante integrada (ej: "Paleta Pistacho" -> producto "Paleta Clásica" con option "Pistacho")
      if (
        (itemNameNorm.includes('paleta') || itemCatNorm.includes('paleta')) &&
        pName.includes('paleta')
      ) {
        return pOpts.some((opt) => itemNameNorm.includes(normalizeStr(opt)));
      }
      return false;
    });

    if (matchedProduct) {
      optionsList = parseOptionsField(
        matchedProduct.options ?? matchedProduct.opciones ?? matchedProduct.variedades
      );
    }
  }

  // 4. Fallback a las opciones predefinidas si el registro aún no las tenía cargadas
  if (optionsList.length === 0) {
    if (itemNameNorm.includes('pote gio') || itemNameNorm === 'gio') {
      optionsList = [...(PRODUCT_OPTIONS['pote gio'] || [])];
    } else if (itemNameNorm.includes('paleta') && itemNameNorm.includes('dubai')) {
      optionsList = [...dubai];
    } else if (
      (itemNameNorm.includes('paleta') || itemCatNorm.includes('paleta')) &&
      !itemNameNorm.includes('mundial')
    ) {
      optionsList = [...clasica];
    } else if (itemNameNorm.includes('mini torta') || itemNameNorm.includes('minitorta')) {
      optionsList = [...(PRODUCT_OPTIONS['mini torta'] || [])];
    } else if (itemNameNorm.includes('alfajor helado')) {
      optionsList = [...(PRODUCT_OPTIONS['alfajor helado'] || [])];
    } else if (itemNameNorm.includes('cookie rellena')) {
      optionsList = [...(PRODUCT_OPTIONS['cookie rellena'] || [])];
    } else if (itemNameNorm.includes('cookie')) {
      optionsList = [...(PRODUCT_OPTIONS['cookie'] || [])];
    } else if (itemNameNorm.includes('smoothie')) {
      optionsList = [...(PRODUCT_OPTIONS['smoothie'] || [])];
    }
  }

  if (optionsList.length === 0) {
    return { hasOptions: false, options: [], detectedOption: null };
  }

  // Detectar cuál es la opción actualmente seleccionada en el item
  let detectedOption =
    Array.isArray(item.sabores) && item.sabores.length > 0 ? item.sabores[0] : null;

  if (!detectedOption) {
    const foundInName = optionsList.find((opt) =>
      itemNameNorm.includes(normalizeStr(opt))
    );
    if (foundInName) detectedOption = foundInName;
  }

  return {
    hasOptions: true,
    options: optionsList,
    detectedOption,
    baseProductName: matchedProduct?.name || null,
  };
}

/**
 * Actualiza el nombre del item al cambiar su opción (para mantener consistencia con el formato de la App y Ticket)
 */
function buildUpdatedItemNameWithOption(currentName = '', oldOption = '', newOption = '', baseProductName = null) {
  const raw = String(currentName || '').trim();
  const norm = normalizeStr(raw);
  const cleanOpt = String(newOption || '').trim();
  if (!cleanOpt) return raw;

  if (norm.includes('pote gio')) {
    return `Pote Gio - ${cleanOpt}`;
  }
  if (norm.includes('paleta')) {
    const normOpt = normalizeStr(cleanOpt);
    if (norm.includes('dubai') || normOpt.includes('dubai')) {
      return normOpt.startsWith('dubai') ? `Paleta ${cleanOpt}` : `Paleta Dubai ${cleanOpt}`;
    }
    return normOpt.startsWith('paleta') ? cleanOpt : `Paleta ${cleanOpt}`;
  }

  if (oldOption) {
    const escaped = String(oldOption).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    if (regex.test(raw)) {
      return raw.replace(regex, cleanOpt);
    }
  }

  if (raw.includes(' - ')) {
    const [prefix] = raw.split(' - ');
    return `${prefix.trim()} - ${cleanOpt}`;
  }

  return baseProductName ? `${baseProductName} - ${cleanOpt}` : `${raw} - ${cleanOpt}`;
}

export default function OrderItemsEditorModal({
  open,
  onClose,
  orderId,
  numeracion,
  appOrderCode,
  customerName,
  customerPhone,
  isAppOrder = false,
  initialItems = [],
  initialTotal = 0,
  implicitEnvio = 0,
  allProducts = [],
  canAcceptAndPrint = false,
  onSave,
}) {
  const [editedItems, setEditedItems] = useState([]);
  const [envioCost, setEnvioCost] = useState(0);
  const [outOfStockMap, setOutOfStockMap] = useState({});

  // Sabores disponibles para helados (1/4, 1/2, 1kg)
  const [availableFlavors, setAvailableFlavors] = useState([]);
  const [activePickerIdx, setActivePickerIdx] = useState(null);
  const [flavorSearch, setFlavorSearch] = useState('');

  // Buscador para agregar producto de reemplazo
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [cafeteriaCatalog, setCafeteriaCatalog] = useState([]);
  const [saving, setSaving] = useState(false);
  const [browserPickerOpen, setBrowserPickerOpen] = useState(false);
  const [externalBrowsers, setExternalBrowsers] = useState([]);
  const [pendingWhatsAppUrl, setPendingWhatsAppUrl] = useState('');

  // Inicializar estado al abrir
  useEffect(() => {
    if (!open) return;

    const cleanItems = (initialItems || [])
      .filter((it) => !/^\s*env[ií]o\s*\d*/i.test(String(it?.name || '')))
      .map((it, idx) => ({
        ...it,
        _uid: `${it.id || idx}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: String(it.name || 'Producto'),
        quantity: Math.max(1, Number(it.quantity || 1)),
        price: parseUnitPrice(it),
        sabores: Array.isArray(it.sabores) ? [...it.sabores.filter(Boolean)] : [],
        notes: String(it.notes || it.nota || it.notas || ''),
      }));

    setEditedItems(cleanItems);
    setEnvioCost(Math.max(0, Number(implicitEnvio || 0)));
    setActivePickerIdx(null);
    setFlavorSearch('');
    setShowAddProduct(false);
    setProductSearch('');
  }, [open, initialItems, implicitEnvio]);

  // Cargar stock_agotados, sabores y cafetería al abrir el modal
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    pb.collection('stock_agotados')
      .getFullList({ filter: 'isOutOfStock = true', requestKey: null })
      .then((records) => {
        if (cancelled) return;
        const map = {};
        records.forEach((r) => {
          if (r.type?.startsWith('catalog-badge|')) return;
          if (r.name && r.isOutOfStock) {
            const k = String(r.name).trim().toLowerCase();
            map[k] = true;
            if (r.type) map[`${r.type}:${k}`] = true;
          }
        });
        setOutOfStockMap(map);
      })
      .catch(() => {});

    pb.collection('sabores')
      .getFullList({ batch: 200, sort: 'label', requestKey: null })
      .then((records) => {
        if (cancelled) return;
        const { flat } = explodeOptionsFromRecords(records);
        setAvailableFlavors(flat.map((flavor) => ({ name: flavor.label })));
      })
      .catch((err) => {
        console.error('Error cargando sabores para editar el pedido:', err);
      });

    pb.collection('products_cafeteria')
      .getFullList({ sort: 'name', requestKey: null })
      .then((records) => {
        if (cancelled) return;
        if (Array.isArray(records)) {
          setCafeteriaCatalog(records);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Catálogo unificado de productos para agregar en reemplazo
  const replacementCatalog = useMemo(() => {
    const list = [];
    const seen = new Set();

    (allProducts || []).forEach((p) => {
      if (!p?.name) return;
      const cat = String(p.category || '').toLowerCase();
      if (cat.includes('envio') || cat.includes('delivery')) return;
      const price = Number(p.price ?? p.precio ?? 0) || 0;
      const key = `${p.name.toLowerCase()}_${price}`;
      if (seen.has(key)) return;
      seen.add(key);
      list.push({
        id: p.id,
        name: p.name,
        category: p.category || 'General',
        price,
        options: p.options ?? p.opciones ?? null,
      });
    });

    (cafeteriaCatalog || []).forEach((c) => {
      if (!c?.name) return;
      const basePrice = Number(c.price || c.price_12oz || c.price_8oz || c.price_16oz || 0);
      const key = `${c.name.toLowerCase()}_${basePrice}`;
      if (seen.has(key)) return;
      seen.add(key);
      list.push({
        id: c.id,
        name: c.name,
        category: c.category || 'Cafetería',
        price: basePrice,
        options: c.options ?? c.opciones ?? null,
      });
    });

    return list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [allProducts, cafeteriaCatalog]);

  const filteredReplacementProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const availableProducts = replacementCatalog.filter((product) => {
      const nameKey = String(product.name || '').trim().toLowerCase();
      return !outOfStockMap[nameKey] && !outOfStockMap[`product:${nameKey}`];
    });
    if (!q) return availableProducts.slice(0, 30);
    return availableProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.category || '').toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [replacementCatalog, productSearch, outOfStockMap]);

  const filteredFlavors = useMemo(() => {
    const q = flavorSearch.trim().toLowerCase();
    const inStockFlavors = availableFlavors.filter((flavor) => {
      const nameKey = String(flavor.name || '').trim().toLowerCase();
      return !outOfStockMap[nameKey] && !outOfStockMap[`flavor:${nameKey}`];
    });
    if (!q) return inStockFlavors.slice(0, 40);
    return inStockFlavors
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          String(f.category || '').toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [availableFlavors, flavorSearch, outOfStockMap]);

  // Operaciones sobre los ítems del pedido
  const handleQuantityChange = (idx, delta) => {
    setEditedItems((prev) =>
      prev
        .map((it, i) => {
          if (i !== idx) return it;
          const nextQ = (Number(it.quantity) || 1) + delta;
          return nextQ > 0 ? { ...it, quantity: nextQ } : null;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (idx) => {
    setEditedItems((prev) => prev.filter((_, i) => i !== idx));
    if (activePickerIdx === idx) setActivePickerIdx(null);
  };

  const handleUnitPriceChange = (idx, val) => {
    const num = Number(String(val).replace(/[^\d]/g, '')) || 0;
    setEditedItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, price: num } : it))
    );
  };

  const handleNoteChange = (idx, text) => {
    setEditedItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, notes: text } : it))
    );
  };

  const handleRemoveFlavor = (itemIdx, flavorIdx) => {
    setEditedItems((prev) =>
      prev.map((it, i) => {
        if (i !== itemIdx) return it;
        const nextSabores = (it.sabores || []).filter((_, fi) => fi !== flavorIdx);
        return { ...it, sabores: nextSabores };
      })
    );
  };

  const handleAddFlavorToItem = (itemIdx, flavorName) => {
    const clean = String(flavorName || '').trim();
    if (!clean) return;
    setEditedItems((prev) =>
      prev.map((it, i) => {
        if (i !== itemIdx) return it;
        const maxAllowed = getMaxHeladoFlavors(it);
        const current = Array.isArray(it.sabores) ? it.sabores : [];
        if (current.includes(clean)) return it;
        if (current.length >= maxAllowed) {
          // Si ya alcanzó el máximo, reemplaza el último sabor
          return { ...it, sabores: [...current.slice(0, maxAllowed - 1), clean] };
        }
        return { ...it, sabores: [...current, clean] };
      })
    );
    setFlavorSearch('');
  };

  // Cambiar opción para productos con field `options` (Pote Gio, Paletas, Mini Torta, etc.)
  const handleSelectOptionForItem = (itemIdx, newOption, oldOption, baseProductName) => {
    const cleanOpt = String(newOption || '').trim();
    if (!cleanOpt) return;
    setEditedItems((prev) =>
      prev.map((it, i) => {
        if (i !== itemIdx) return it;
        const updatedName = buildUpdatedItemNameWithOption(
          it.name,
          oldOption,
          cleanOpt,
          baseProductName
        );
        return {
          ...it,
          name: updatedName,
          sabores: [cleanOpt],
          selectedOption: cleanOpt,
        };
      })
    );
    setActivePickerIdx(null);
  };

  const handleAddReplacementProduct = (prod) => {
    if (!prod) return;
    const newItem = {
      _uid: `new_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      id: prod.id || `custom_${Date.now()}`,
      name: prod.name,
      category: prod.category || 'Varios',
      price: Number(prod.price) || 0,
      quantity: 1,
      sabores: [],
      options: prod.options ?? null,
      notes: '',
    };

    const isWeight = isHeladoByWeight(newItem);
    const optCfg = !isWeight
      ? resolveItemOptionsConfig(newItem, allProducts, cafeteriaCatalog)
      : { hasOptions: false };

    const nextIdx = editedItems.length;
    setEditedItems((prev) => [...prev, newItem]);
    if (optCfg.hasOptions || isWeight) {
      setActivePickerIdx(nextIdx);
      setFlavorSearch('');
    } else {
      setActivePickerIdx(null);
    }
    setShowAddProduct(false);
    setProductSearch('');
  };

  // Totales recalculados automáticamente
  const itemsSubtotal = useMemo(() => {
    return editedItems.reduce((acc, it) => {
      const p = Number(it.price || 0);
      const q = Number(it.quantity || 1);
      return acc + p * q;
    }, 0);
  }, [editedItems]);

  const newTotal = useMemo(() => {
    return Math.max(0, itemsSubtotal + Number(envioCost || 0));
  }, [itemsSubtotal, envioCost]);

  const totalDiff = newTotal - Number(initialTotal || 0);

  // Armar link de WhatsApp para coordinar con el cliente
  const openExternalWhatsApp = async (url, browserId = 'default') => {
    const ipc = window.electron?.ipcRenderer;
    if (!ipc?.invoke) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    const result = await ipc.invoke('open-external-url', { url, browserId });
    if (!result?.opened) {
      alert(result?.error || 'No se pudo abrir WhatsApp en el navegador. Intentá nuevamente.');
    }
  };

  const handleChooseExternalBrowser = async (browserId) => {
    const url = pendingWhatsAppUrl;
    setBrowserPickerOpen(false);
    setPendingWhatsAppUrl('');
    if (!url) return;

    try {
      window.localStorage.setItem(WHATSAPP_BROWSER_PREFERENCE_KEY, browserId);
    } catch {}
    await openExternalWhatsApp(url, browserId);
  };

  const handleContactWhatsApp = async () => {
    const rawPhone = String(customerPhone || '').replace(/\D/g, '');
    const normalizedPhone = rawPhone
      ? rawPhone.startsWith('54')
        ? rawPhone
        : `549${rawPhone.replace(/^0+/, '')}`
      : '';

    const orderLabel = appOrderCode ? `#${appOrderCode}` : `#${numeracion || ''}`;
    const greeting = customerName ? `¡Hola ${customerName}!` : '¡Hola!';
    let body = `${greeting} Te escribimos de *Pixel Helados & Café* por tu pedido *${orderLabel}*.`;

    const summaryLines = editedItems.map((it) => {
      const isHelado = isHeladoByWeight(it);
      const sab = isHelado && it.sabores?.length ? ` (${it.sabores.join(', ')})` : '';
      return `• ${it.quantity}x ${it.name}${sab}`;
    });
    body += `\n\nTe consultamos por tu pedido:\n${summaryLines.join('\n')}\n*Total:* ${formatPrice(newTotal)}`;

    const encoded = encodeURIComponent(body);
    const url = normalizedPhone
      ? `https://wa.me/${normalizedPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    const ipc = window.electron?.ipcRenderer;
    if (!ipc?.invoke) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    let savedBrowser = '';
    try {
      savedBrowser = window.localStorage.getItem(WHATSAPP_BROWSER_PREFERENCE_KEY) || '';
    } catch {}

    if (savedBrowser) {
      await openExternalWhatsApp(url, savedBrowser);
      return;
    }

    try {
      const browsers = await ipc.invoke('get-external-browsers');
      setExternalBrowsers(Array.isArray(browsers) ? browsers : []);
      setPendingWhatsAppUrl(url);
      setBrowserPickerOpen(true);
    } catch {
      await openExternalWhatsApp(url);
    }
  };

  const handleConfirmSave = async (acceptAndPrint = false) => {
    if (editedItems.length === 0) {
      alert('El pedido debe tener al menos 1 producto.');
      return;
    }
    setSaving(true);
    try {
      const cleanedForSave = editedItems.map(({ _uid, ...rest }) => ({
        ...rest,
        quantity: Number(rest.quantity || 1),
        price: Number(rest.price || 0),
        sabores: Array.isArray(rest.sabores) ? rest.sabores.filter(Boolean) : [],
        notes: String(rest.notes || '').trim(),
      }));
      await onSave?.({
        items: cleanedForSave,
        total: newTotal,
        acceptAndPrint,
      });
      onClose?.();
    } catch (error) {
      console.error('Error al guardar los cambios del pedido:', error);
      alert(
        typeof error === 'string'
          ? error
          : 'No se pudieron guardar los cambios del pedido. Intentá nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      onClick={(e) => e.stopPropagation()}
      PaperProps={{
        sx: {
          borderRadius: '18px',
          fontFamily: "'Inter', sans-serif",
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.24)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
              Revisar / Editar pedido #{numeracion}
            </span>
            {appOrderCode && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: '#ede9fe',
                  color: '#6d28d9',
                  border: '1px solid #ddd6fe',
                  borderRadius: 6,
                  padding: '2px 7px',
                }}
              >
                App #{appOrderCode}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: 2 }}>
            Quitá o reemplazá productos, opciones o sabores sin stock antes de aceptar
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#475569',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Barra rápida de contacto con el cliente por WhatsApp */}
      {isAppOrder && <div
        style={{
          padding: '10px 20px',
          background: '#f0fdf4',
          borderBottom: '1px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}>
          {customerName || 'Cliente'}{' '}
          {customerPhone ? (
            <span style={{ fontWeight: 600, color: '#15803d' }}>• {customerPhone}</span>
          ) : (
            <span style={{ fontWeight: 500, opacity: 0.75 }}>(Sin teléfono registrado)</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleContactWhatsApp}
          style={{
            background: '#16a34a',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: '0.76rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 2px 5px rgba(22, 163, 74, 0.25)',
          }}
        >
          <MessageCircle size={14} strokeWidth={2.4} />
          Avisar por WhatsApp
        </button>
      </div>}

      {/* Cuerpo scrolleable con lista de productos */}
      <div
        style={{
          padding: '16px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
        }}
      >
        {editedItems.map((it, idx) => {
          const cleanProdName = String(it.name || '')
            .replace(/^\d+\s*x\s*/i, '')
            .trim();
          const isWeightHelado = isHeladoByWeight(it);
          const maxHeladoFlavors = isWeightHelado ? getMaxHeladoFlavors(it) : 0;
          const optionsConfig = !isWeightHelado
            ? resolveItemOptionsConfig(it, allProducts, cafeteriaCatalog)
            : { hasOptions: false, options: [], detectedOption: null };
          const hasInlineVariantInName = Boolean(
            optionsConfig.hasOptions &&
              optionsConfig.detectedOption &&
              normalizeStr(it.name).includes(normalizeStr(optionsConfig.detectedOption))
          );
          const stockTargetName = hasInlineVariantInName
            ? optionsConfig.detectedOption
            : cleanProdName;
          const stockTargetType = hasInlineVariantInName ? 'option' : 'product';
          const stockNormKey = String(stockTargetName).trim().toLowerCase();
          const isProdOut = Boolean(
            outOfStockMap[`${stockTargetType}:${stockNormKey}`] ||
              outOfStockMap[`flavor:${stockNormKey}`] ||
              outOfStockMap[stockNormKey]
          );
          const needsInitialOption =
            !isWeightHelado && optionsConfig.hasOptions && !optionsConfig.detectedOption;
          const isPickerOpen = activePickerIdx === idx || needsInitialOption;
          const availableOptions = optionsConfig.options.filter((option) => {
            const optionKey = String(option).trim().toLowerCase();
            return !(
              outOfStockMap[`option:${optionKey}`] ||
              outOfStockMap[`flavor:${optionKey}`] ||
              outOfStockMap[optionKey]
            );
          });

          return (
            <div
              key={it._uid || idx}
              style={{
                border: isProdOut ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
                background: isProdOut ? '#fff1f2' : '#ffffff',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Fila principal del producto */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 160 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                    {it.name}
                  </span>

                </div>

                {/* Controles de cantidad, precio unitario y borrar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Cantidad */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      background: '#f8fafc',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(idx, -1)}
                      style={{
                        width: 26,
                        height: 26,
                        border: 'none',
                        background: 'transparent',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        color: '#334155',
                      }}
                      title="Restar cantidad"
                    >
                      <Minus size={13} />
                    </button>
                    <span
                      style={{
                        minWidth: 24,
                        textAlign: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: '#0f172a',
                      }}
                    >
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(idx, 1)}
                      style={{
                        width: 26,
                        height: 26,
                        border: 'none',
                        background: 'transparent',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        color: '#334155',
                      }}
                      title="Sumar cantidad"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Precio unitario editable */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      padding: '0 8px',
                      height: 28,
                      background: '#ffffff',
                    }}
                    title="Precio unitario"
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: 3 }}>
                      $
                    </span>
                    <input
                      type="text"
                      value={it.price || 0}
                      onChange={(e) => handleUnitPriceChange(idx, e.target.value)}
                      style={{
                        width: 62,
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        textAlign: 'right',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  {/* Eliminar ítem */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    title="Quitar producto del pedido"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: '1px solid #fecdd3',
                      background: '#fff1f2',
                      color: '#e11d48',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* CASO 1: Helados por peso (1/4, 1/2, 1kg) -> Cambiar / Agregar sabor */}
              {isWeightHelado && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    {(it.sabores || []).map((sab, fIdx) => {
                      const fNorm = String(sab).trim().toLowerCase();
                      const isFlavorOut = Boolean(
                        outOfStockMap[`flavor:${fNorm}`] || outOfStockMap[fNorm]
                      );
                      return (
                        <span
                          key={fIdx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 7,
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            background: isFlavorOut ? '#fee2e2' : '#f1f5f9',
                            color: isFlavorOut ? '#b91c1c' : '#1e293b',
                            border: `1px solid ${isFlavorOut ? '#fca5a5' : '#cbd5e1'}`,
                          }}
                        >
                          <span>• {sab}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFlavor(idx, fIdx)}
                            title="Quitar este sabor del pote"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#64748b',
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: 0,
                              cursor: 'pointer',
                            }}
                          >
                            <X size={13} />
                          </button>
                        </span>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setActivePickerIdx(isPickerOpen ? null : idx);
                        setFlavorSearch('');
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 7,
                        fontSize: '0.73rem',
                        fontWeight: 800,
                        border: '1px dashed #94a3b8',
                        background: isPickerOpen ? '#e2e8f0' : '#ffffff',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: 'inherit',
                      }}
                    >
                      <Plus size={12} /> Cambiar / Agregar sabor ({(it.sabores || []).length}/{maxHeladoFlavors})
                    </button>
                  </div>

                  {isPickerOpen && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: 10,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            padding: '4px 10px',
                          }}
                        >
                          <Search size={14} color="#64748b" />
                          <input
                            type="text"
                            placeholder="Buscar sabor de helado..."
                            value={flavorSearch}
                            onChange={(e) => setFlavorSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && flavorSearch.trim()) {
                                e.preventDefault();
                                handleAddFlavorToItem(idx, flavorSearch.trim());
                              }
                            }}
                            style={{
                              border: 'none',
                              outline: 'none',
                              width: '100%',
                              fontSize: '0.78rem',
                              fontFamily: 'inherit',
                            }}
                          />
                        </div>
                      </div>

                      {filteredFlavors.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 5,
                            maxHeight: 125,
                            overflowY: 'auto',
                          }}
                        >
                          {filteredFlavors.map((fl) => {
                            const alreadySelected = (it.sabores || []).includes(fl.name);
                            return (
                              <button
                                key={fl.id || fl.name}
                                type="button"
                                onClick={() => handleAddFlavorToItem(idx, fl.name)}
                                disabled={alreadySelected}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  border: '1px solid #cbd5e1',
                                  background: alreadySelected ? '#dcfce7' : '#ffffff',
                                  color: alreadySelected ? '#15803d' : '#1e293b',
                                  cursor: alreadySelected ? 'default' : 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                {fl.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CASO 2: Productos con variantes del field `options` (Pote Gio, Paletas, Mini Torta, Cookies, etc.) */}
              {!isWeightHelado && optionsConfig.hasOptions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    {optionsConfig.detectedOption &&
                      !normalizeStr(it.name).includes(normalizeStr(optionsConfig.detectedOption)) &&
                      (() => {
                        const optNorm = String(optionsConfig.detectedOption).trim().toLowerCase();
                        const isOptOut = Boolean(
                          outOfStockMap[`option:${optNorm}`] ||
                          outOfStockMap[`flavor:${optNorm}`] ||
                          outOfStockMap[optNorm]
                        );
                        return (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '3px 8px',
                              borderRadius: 7,
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              background: isOptOut ? '#fee2e2' : '#f1f5f9',
                              color: isOptOut ? '#b91c1c' : '#1e293b',
                              border: `1px solid ${isOptOut ? '#fca5a5' : '#cbd5e1'}`,
                            }}
                          >
                            <span>Variante: {optionsConfig.detectedOption}</span>
                          </span>
                        );
                      })()}

                    <button
                      type="button"
                      onClick={() => setActivePickerIdx(activePickerIdx === idx ? null : idx)}
                      style={{
                        padding: '3px 9px',
                        borderRadius: 7,
                        fontSize: '0.73rem',
                        fontWeight: 800,
                        border: needsInitialOption ? '1px solid #f59e0b' : '1px dashed #6366f1',
                        background: needsInitialOption
                          ? '#fef3c7'
                          : isPickerOpen
                            ? '#e0e7ff'
                            : '#eef2ff',
                        color: needsInitialOption ? '#b45309' : '#4338ca',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: 'inherit',
                      }}
                    >
                      <RefreshCw size={11} />{' '}
                      {needsInitialOption ? 'Elegir variante' : 'Cambiar opción'}
                    </button>
                  </div>

                  {isPickerOpen && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: 10,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569' }}>
                        Elegí la variante disponible ({availableOptions.length} opciones):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {availableOptions.map((optName) => {
                          const isCurrentOpt =
                            normalizeStr(optName) === normalizeStr(optionsConfig.detectedOption || '');

                          return (
                            <button
                              key={optName}
                              type="button"
                              onClick={() =>
                                handleSelectOptionForItem(
                                  idx,
                                  optName,
                                  optionsConfig.detectedOption,
                                  optionsConfig.baseProductName
                                )
                              }
                              style={{
                                padding: '5px 10px',
                                borderRadius: 7,
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                border: isCurrentOpt ? '1.5px solid #4338ca' : '1px solid #cbd5e1',
                                background: isCurrentOpt ? '#e0e7ff' : '#ffffff',
                                color: isCurrentOpt ? '#312e81' : '#1e293b',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <span>{optName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nota del ítem */}
              <input
                type="text"
                placeholder="Nota o aclaración del producto (opcional)..."
                value={it.notes || ''}
                onChange={(e) => handleNoteChange(idx, e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '5px 10px',
                  borderRadius: 7,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '0.76rem',
                  color: '#334155',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          );
        })}

        {/* Botón / Buscador para agregar un producto nuevo del menú */}
        {!showAddProduct ? (
          <button
            type="button"
            onClick={() => setShowAddProduct(true)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1.5px dashed #94a3b8',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontFamily: 'inherit',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Agregar otro producto en reemplazo
          </button>
        ) : (
          <div
            style={{
              border: '1.5px solid #cbd5e1',
              borderRadius: 12,
              padding: 12,
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                Seleccionar producto del menú
              </span>
              <button
                type="button"
                onClick={() => setShowAddProduct(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Cerrar
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '6px 10px',
              }}
            >
              <Search size={15} color="#64748b" />
              <input
                type="text"
                autoFocus
                placeholder="Buscar producto por nombre o categoría..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.82rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 6,
                maxHeight: 165,
                overflowY: 'auto',
              }}
            >
              {filteredReplacementProducts.map((prod, pIdx) => (
                <button
                  key={`${prod.id || pIdx}_${prod.name}`}
                  type="button"
                  onClick={() => handleAddReplacementProduct(prod)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 6,
                    fontFamily: 'inherit',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {prod.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: '#0284c7',
                      flexShrink: 0,
                    }}
                  >
                    {formatPrice(prod.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer con resumen de totales y acciones */}
      <div
        style={{
          padding: '14px 20px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            {totalDiff !== 0 && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                Antes: <span style={{ textDecoration: 'line-through' }}>{formatPrice(initialTotal)}</span>
              </span>
            )}
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
              Nuevo Total: {formatPrice(newTotal)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 14px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleConfirmSave(false)}
            style={{
              padding: '9px 16px',
              borderRadius: 10,
              border: '1px solid #0f172a',
              background: canAcceptAndPrint ? '#ffffff' : '#0f172a',
              color: canAcceptAndPrint ? '#0f172a' : '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'inherit',
            }}
          >
            <Check size={15} strokeWidth={2.5} />
            Guardar cambios
          </button>

          {canAcceptAndPrint && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleConfirmSave(true)}
              style={{
                padding: '9px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
              }}
            >
              <Printer size={15} strokeWidth={2.4} />
              Guardar, aceptar e imprimir
            </button>
          )}
        </div>
      </div>
    </Dialog>

    <Dialog
      open={browserPickerOpen}
      onClose={() => {
        setBrowserPickerOpen(false);
        setPendingWhatsAppUrl('');
      }}
      maxWidth="xs"
      fullWidth
      PaperProps={{ style: { borderRadius: 16, overflow: 'hidden' } }}
    >
      <div style={{ padding: '22px 22px 18px', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
          Abrir WhatsApp con…
        </div>
        <p style={{ margin: '7px 0 16px', fontSize: '0.82rem', lineHeight: 1.45, color: '#64748b' }}>
          Elegí el navegador para abrir el mensaje. Recordaremos esta opción para los próximos pedidos.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {externalBrowsers.map((browser) => (
            <button
              key={browser.id}
              type="button"
              onClick={() => handleChooseExternalBrowser(browser.id)}
              style={{
                width: '100%',
                padding: '11px 13px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontFamily: 'inherit',
                fontSize: '0.84rem',
                fontWeight: 750,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {browser.label}
            </button>
          ))}
        </div>
      </div>
    </Dialog>
    </>
  );
}
