import { pb } from '../lib/pb';

export const DEFAULT_CUP_SIZES_STOCK = {
  '8oz': true,
  '12oz': true,
  '16oz': true,
  '12oz_cold': true,
  '16oz_cold': true,
};

export const DEFAULT_EXTRAS_STOCK = {
  crema: true,
  leche_almendras: true,
  extra_shot: true,
};

/**
 * Detecta si una bebida es fría (milkshake, frappé, smoothie, iced latte, frío, batido)
 */
export function isDrinkCold({ category = '', name = '' } = {}) {
  const catNorm = (category || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const nameNorm = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return (
    catNorm.includes('frappe') ||
    catNorm.includes('frio') ||
    catNorm.includes('cold') ||
    nameNorm.includes('frappe') ||
    nameNorm.includes('frio') ||
    nameNorm.includes('iced') ||
    nameNorm.includes('milkshake') ||
    nameNorm.includes('shake') ||
    nameNorm.includes('smoothie') ||
    nameNorm.includes('batido')
  );
}

/**
 * Comprueba si la medida de vaso está en stock, distinguiendo frío vs caliente para 12oz y 16oz
 */
export function isCupInStock(size, isCold, cupSizesStock = {}) {
  if (size === '8oz') {
    if (isCold) return false;
    return cupSizesStock['8oz'] !== false;
  }
  if (size === '12oz') {
    return isCold
      ? cupSizesStock['12oz_cold'] !== false
      : cupSizesStock['12oz'] !== false;
  }
  if (size === '16oz') {
    return isCold
      ? cupSizesStock['16oz_cold'] !== false
      : cupSizesStock['16oz'] !== false;
  }
  return cupSizesStock[size] !== false;
}

export function getStoredCupSizesStock() {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cup_sizes_stock');
      if (raw) return { ...DEFAULT_CUP_SIZES_STOCK, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error reading cup_sizes_stock from localStorage:', e);
  }
  return { ...DEFAULT_CUP_SIZES_STOCK };
}

export function getStoredExtrasStock() {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('extras_stock');
      if (raw) return { ...DEFAULT_EXTRAS_STOCK, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error reading extras_stock from localStorage:', e);
  }
  return { ...DEFAULT_EXTRAS_STOCK };
}

/**
 * Normaliza y comprueba si un extra tiene stock disponible
 */
export function isExtraInStock(extra, extrasStock = {}) {
  if (!extra) return false;
  if (!extrasStock || typeof extrasStock !== 'object') return true;

  // 1. Por ID directo de PocketBase
  if (extra.id && extrasStock[extra.id] !== undefined) {
    return Boolean(extrasStock[extra.id]);
  }

  // 2. Por coincidencia de nombre normalizado
  const norm = (extra.name || extra.title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (norm.includes('crema') && extrasStock.crema !== undefined) {
    return Boolean(extrasStock.crema);
  }
  if (norm.includes('almendra') && extrasStock.leche_almendras !== undefined) {
    return Boolean(extrasStock.leche_almendras);
  }
  if (norm.includes('shot') && extrasStock.extra_shot !== undefined) {
    return Boolean(extrasStock.extra_shot);
  }

  return true;
}

/**
 * Sincroniza el estado de stock (vasos y extras) con la coleccion cafe_config en PocketBase
 */
export async function syncCafeStockToPb(patch = {}) {
  try {
    const list = await pb
      .collection('cafe_config')
      .getList(1, 1, { filter: 'key="global_costs"' });

    if (list.items && list.items.length > 0) {
      const current = list.items[0];
      const prevData = current.data || {};
      const updatedData = {
        ...prevData,
        ...(patch.cupSizesStock
          ? { cupSizesStock: { ...(prevData.cupSizesStock || DEFAULT_CUP_SIZES_STOCK), ...patch.cupSizesStock } }
          : {}),
        ...(patch.extrasStock
          ? { extrasStock: { ...(prevData.extrasStock || DEFAULT_EXTRAS_STOCK), ...patch.extrasStock } }
          : {}),
      };

      await pb.collection('cafe_config').update(current.id, {
        data: updatedData,
      });
      return updatedData;
    } else {
      const initialData = {
        cupSizesStock: patch.cupSizesStock || DEFAULT_CUP_SIZES_STOCK,
        extrasStock: patch.extrasStock || DEFAULT_EXTRAS_STOCK,
      };
      await pb.collection('cafe_config').create({
        key: 'global_costs',
        data: initialData,
      });
      return initialData;
    }
  } catch (err) {
    console.warn('Error sincronizando stock de cafeteria con PocketBase:', err?.message || err);
    throw err;
  }
}

/**
 * Obtiene el estado de stock desde cafe_config en PocketBase
 */
export async function fetchCafeStockFromPb() {
  try {
    const list = await pb
      .collection('cafe_config')
      .getList(1, 1, { filter: 'key="global_costs"' });

    if (list.items && list.items.length > 0) {
      const data = list.items[0].data || {};
      return {
        cupSizesStock: data.cupSizesStock || DEFAULT_CUP_SIZES_STOCK,
        extrasStock: data.extrasStock || DEFAULT_EXTRAS_STOCK,
      };
    }
  } catch (err) {
    console.warn('Error fetching cafe stock from PocketBase:', err?.message || err);
  }
  return {
    cupSizesStock: getStoredCupSizesStock(),
    extrasStock: getStoredExtrasStock(),
  };
}

/**
 * Detecta si un ítem pertenece a cafetería / barista
 */
export function isBaristaItem(it) {
  if (!it) return false;
  if (it.isCafeteria === true) return true;
  const cat = String(it.category || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (
    cat.includes('cafeter') ||
    cat.includes('cafe') ||
    cat === 'clasico' ||
    cat === 'frio' ||
    cat === 'cold' ||
    cat === 'frappe' ||
    cat === 'smoothie' ||
    cat === 'pasteleria'
  ) {
    return true;
  }

  const size = String(it.size || '').toLowerCase();
  if (
    size.includes('oz') ||
    size.includes('mini') ||
    size.includes('plus') ||
    size.includes('ultra')
  ) {
    return true;
  }

  if (it.vaso || (Array.isArray(it.extras) && it.extras.length > 0)) {
    return true;
  }

  if (it.temperature || it.isCold !== undefined) {
    return true;
  }

  const nameNorm = String(it.name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (
    nameNorm.includes('cafe') ||
    nameNorm.includes('cappuccino') ||
    nameNorm.includes('capuchino') ||
    nameNorm.includes('latte') ||
    nameNorm.includes('espresso') ||
    nameNorm.includes('mocca') ||
    nameNorm.includes('mocha') ||
    nameNorm.includes('frappe') ||
    nameNorm.includes('macchiato') ||
    nameNorm.includes('flat white') ||
    nameNorm.includes('submarino') ||
    nameNorm.includes('chocolate caliente') ||
    nameNorm.includes('smoothie') ||
    nameNorm.includes('milkshake')
  ) {
    return true;
  }

  return false;
}

/**
 * Detecta si un pedido debe ser visible en la vista Barista
 */
export function isBaristaOrder(o) {
  if (!o) return false;
  const isTest = Boolean(o?.isTestOrder || (o?.id && String(o.id).startsWith('local-test-')));
  const hasCafeteria = Array.isArray(o?.items) && o.items.some(isBaristaItem);
  return hasCafeteria || isTest;
}