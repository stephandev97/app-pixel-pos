import {
  AlertTriangle,
  BookOpen,
  Check,
  Coffee,
  Edit2,
  Globe,
  LayoutGrid,
  List,
  Package,
  Percent,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sliders,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { pb } from '../../lib/pb';
import {
  setCupSizesStock,
  toggleCupSizeStock,
  setExtrasStock,
  toggleExtraStock,
} from '../../redux/actions/actionsSlice';
import {
  DEFAULT_CUP_SIZES_STOCK,
  DEFAULT_EXTRAS_STOCK,
  syncCafeStockToPb,
} from '../../utils/cafeStockSync';
import AddDrinkModal from './AddDrinkModal';
import { searchBeverageRecipeOnline } from './aiRecipeSearch';
import {
  ActionButton,
  AddFlavorButton,
  CatChip,
  CategoryFilter,
  Container,
  CupMatrixTable,
  DeleteFlavorButton,
  FilterBar,
  FlavorSelect,
  FormCard,
  FormGrid,
  FormGroup,
  Header,
  InputNumber,
  MarginPill,
  MetricCard,
  MetricGrid,
  MiniInputNumber,
  ModalBodyScroll,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  PbBadge,
  PrimaryButton,
  RateBadge,
  RecipeCard,
  RecipeCardHeader,
  RecipeGrid,
  RecipePill,
  RecipePillsWrap,
  SearchInput,
  SupplyInfo,
  SupplyInputs,
  SupplyItemRow,
  SupplyList,
  TabButton,
  Table,
  TableWrap,
  TabsNav,
  TitleGroup,
} from './CafeCostsStyles';

// Configuración inicial de precios de insumos por defecto (precio pagado, cantidad comprada y unidad)
const DEFAULT_CONFIG = {
  // Café en grano
  coffeePrice: 28000,
  coffeeQty: 1,
  coffeeUnit: 'kg',
  coffeeKg: 28000,

  // Leche de vaca regular
  milkPrice: 1400,
  milkQty: 1,
  milkUnit: 'L',
  milkLiter: 1400,

  // Leche vegetal
  plantMilkPrice: 3200,
  plantMilkQty: 1,
  plantMilkUnit: 'L',
  plantMilkLiter: 3200,

  // Cacao en polvo para chocolate caliente / repostería
  cocoaPrice: 12000,
  cocoaQty: 1,
  cocoaUnit: 'kg',
  cocoaKg: 12000,

  // Té Matcha en polvo (100% puro para bebidas frías y lattes)
  matchaPrice: 28000,
  matchaQty: 250,
  matchaUnit: 'g',
  matchaKg: 112000,

  // Galletitas Oreo para frappés, postres y decoración (peso paquete estándar o unidades)
  oreoPrice: 1600,
  oreoQty: 118,
  oreoUnit: 'g', // 'g' | 'unidad' | 'kg'

  // Hielo en rolito / bolsa para bebidas frías y smoothies
  icePrice: 3000,
  iceQty: 10,
  iceUnit: 'kg',
  iceKg: 300,

  // Helado artesanal / gastronómico para milkshakes y postres
  iceCreamPrice: 8000,
  iceCreamQty: 1,
  iceCreamUnit: 'kg',
  iceCreamKg: 8000,

  // Crema de leche para repostería / sifón chantilly
  creamPrice: 6000,
  creamQty: 1,
  creamUnit: 'L',
  creamLiter: 6000,

  // Cápsulas de gas N2O para sifón de crema chantilly
  chargerPrice: 15000,
  chargerQty: 10,
  chargerUnit: 'unidad',
  chargerYieldMl: 500, // 1 cápsula rinde 500ml de crema en sifón

  // Salsas para decorar / base (chocolate, caramelo, etc.)
  saucePrice: 9500,
  sauceQty: 1,
  sauceUnit: 'kg',
  sauceKg: 9500,
  sauceFlavors: [
    { id: 'chocolate', name: 'Chocolate', price: 9500, qty: 1, unit: 'kg' },
    { id: 'caramelo', name: 'Caramelo', price: 9500, qty: 1, unit: 'kg' },
    { id: 'dulce_de_leche', name: 'Dulce de Leche', price: 9500, qty: 1, unit: 'kg' },
    { id: 'frutos_rojos', name: 'Frutos Rojos', price: 11500, qty: 1, unit: 'kg' },
    { id: 'frutilla', name: 'Frutilla', price: 9500, qty: 1, unit: 'kg' },
    { id: 'pistacho', name: 'Pistacho', price: 16666, qty: 1, unit: 'kg' },
  ],

  // Syrup / jarabe de sabor (vainilla, caramelo, avellana, pistacho, etc.)
  syrupPrice: 15000,
  syrupQty: 1,
  syrupUnit: 'L',
  syrupLiter: 15000,
  syrupFlavors: [
    { id: 'vainilla', name: 'Vainilla', price: 15000, qty: 1, unit: 'L' },
    { id: 'caramelo', name: 'Caramelo', price: 15000, qty: 1, unit: 'L' },
    { id: 'avellana', name: 'Avellana', price: 15000, qty: 1, unit: 'L' },
    { id: 'pistacho', name: 'Pistacho', price: 18250, qty: 1, unit: 'L' },
    { id: 'matcha', name: 'Matcha', price: 14500, qty: 1, unit: 'L' },
    { id: 'dulce_de_leche', name: 'Dulce de Leche', price: 15000, qty: 1, unit: 'L' },
    { id: 'syrup_ddl', name: 'Dulce de Leche', price: 15000, qty: 1, unit: 'L' },
    { id: 'chocolate', name: 'Chocolate', price: 22000, qty: 1, unit: 'L' },
    { id: 'syrup_1790365018338', name: 'Chocolate', price: 22000, qty: 1, unit: 'L' },
    { id: 'chocolate_blanco', name: 'Chocolate blanco', price: 22000, qty: 1, unit: 'L' },
    { id: 'syrup_1790365033640', name: 'Chocolate blanco', price: 22000, qty: 1, unit: 'L' },
    { id: 'azucar', name: 'Azúcar', price: 14000, qty: 1, unit: 'L' },
    { id: 'syrup_1790392238949', name: 'Azúcar', price: 14000, qty: 1, unit: 'L' },
  ],

  // Base / Pulpa de fruta para smoothies y licuados
  smoothiePrice: 1400,
  smoothieQty: 1,
  smoothieUnit: 'porción',
  smoothieCost: 1400,
  smoothieFlavors: [
    { id: 'frutilla', name: 'Frutilla', price: 1200, qty: 1, unit: 'porción' },
    { id: 'frutilla_naranja', name: 'Frutilla-Naranja', price: 1300, qty: 1, unit: 'porción' },
    { id: 'frutos_del_bosque', name: 'Frutos del Bosque', price: 1500, qty: 1, unit: 'porción' },
    { id: 'mango_maracuya', name: 'Mango Maracuyá', price: 1600, qty: 1, unit: 'porción' },
  ],

  // Barra de chocolate para submarino
  chocolateBarPrice: 450,
  chocolateBarQty: 1,
  chocolateBarUnit: 450,

  // Descartables de café caliente por tamaño (8oz, 12oz, 16oz)
  packaging8ozPrice: 220,
  packaging8ozQty: 1,
  packaging8ozUnit: 'vasos',
  packaging8oz: 220,

  packaging12ozPrice: 250,
  packaging12ozQty: 1,
  packaging12ozUnit: 'vasos',
  packaging12oz: 250,

  packaging16ozPrice: 290,
  packaging16ozQty: 1,
  packaging16ozUnit: 'vasos',
  packaging16oz: 290,

  // Descartables milkshake / fríos por tamaño (12oz, 16oz - no lleva 8oz)
  packagingCold12ozPrice: 380,
  packagingCold12ozQty: 1,
  packagingCold12ozUnit: 'vasos',
  packagingCold12oz: 380,

  packagingCold16ozPrice: 440,
  packagingCold16ozQty: 1,
  packagingCold16ozUnit: 'vasos',
  packagingCold16oz: 440,

  // Fallbacks tradicionales
  packagingPrice: 250,
  packagingQty: 1,
  packagingUnit: 'vasos',
  packaging: 250,

  packagingColdPrice: 380,
  packagingColdQty: 1,
  packagingColdUnit: 'vasos',
  packagingCold: 380,

  // Extras de barra (azúcar, agitador, servilletas)
  extrasPrice: 60,
  extrasQty: 1,
  extras: 60,

  // Fondo de absorción / compensación para leche vegetal libre de recargo
  plantMilkFundPrice: 50,
  plantMilkFundQty: 1,
  plantMilkFundUnit: 'taza',
  plantMilkFund: 50,

  // Fiambrería y quesos para tostados, medialunas rellenas y cocina
  hamPrice: 12000,
  hamQty: 1,
  hamUnit: 'kg',
  hamKg: 12000,

  tyboPrice: 11000,
  tyboQty: 1,
  tyboUnit: 'kg',
  tyboKg: 11000,

  cheddarPrice: 13500,
  cheddarQty: 1,
  cheddarUnit: 'kg',
  cheddarKg: 13500,

  lomitoPrice: 14500,
  lomitoQty: 1,
  lomitoUnit: 'kg',
  lomitoKg: 14500,

  sardoPrice: 15500,
  sardoQty: 1,
  sardoUnit: 'kg',
  sardoKg: 15500,

  // Materia prima de repostería y panadería
  mandiocaPrice: 4500,
  mandiocaQty: 1,
  mandiocaUnit: 'kg',
  mandiocaKg: 4500,

  eggsPrice: 5000,
  eggsQty: 30,
  eggsUnit: 'unidad',
  eggsUnitCost: 166.67,

  saltPrice: 1200,
  saltQty: 1,
  saltUnit: 'kg',
  saltKg: 1200,

  sugarPrice: 1400,
  sugarQty: 1,
  sugarUnit: 'kg',
  sugarKg: 1400,

  flour0000Price: 1500,
  flour0000Qty: 1,
  flour0000Unit: 'kg',
  flour0000Kg: 1500,

  butterPrice: 11500,
  butterQty: 1,
  butterUnit: 'kg',
  butterKg: 11500,

  bakingDarkChocPrice: 14000,
  bakingDarkChocQty: 1,
  bakingDarkChocUnit: 'kg',
  bakingDarkChocKg: 14000,

  bakingWhiteChocPrice: 15000,
  bakingWhiteChocQty: 1,
  bakingWhiteChocUnit: 'kg',
  bakingWhiteChocKg: 15000,

  bakingMilkChocPrice: 14500,
  bakingMilkChocQty: 1,
  bakingMilkChocUnit: 'kg',
  bakingMilkChocKg: 14500,

  fee: 3,
  targetMargin: 65,
  coffeeWaste: 6, // 6% merma por purgas y calibración de molino
  milkWaste: 15, // 15% merma por vaporización de leche residual en jarra
};

// Conversión universal de cantidades según unidad a unidad base (g, ml o u)
export function convertToBaseUnits(qty, unit) {
  const q = Number(qty) || 0;
  if (q <= 0) return 1;
  const u = (unit || '').toLowerCase().trim();
  if (u === 'kg' || u === 'l' || u === 'litro' || u === 'litros') {
    return q * 1000;
  }
  return q;
}

// Costo unitario por gramo, por ml o por pieza individual
export function getUnitCost(price, qty, unit) {
  const p = Number(price) || 0;
  const totalBaseUnits = convertToBaseUnits(qty, unit);
  if (totalBaseUnits <= 0) return 0;
  return p / totalBaseUnits;
}

// Costo estándar equivalente (por kilo, por litro o por unidad)
export function getStandardCost(price, qty, unit) {
  const u = (unit || '').toLowerCase().trim();
  if (
    u === 'u' ||
    u === 'unidad' ||
    u === 'unidades' ||
    u === 'vasos' ||
    u === 'barras' ||
    u === 'servicios'
  ) {
    return getUnitCost(price, qty, unit);
  }
  return getUnitCost(price, qty, unit) * 1000;
}

export function getStandardUnitLabel(unit) {
  const u = (unit || '').toLowerCase().trim();
  if (u === 'l' || u === 'ml' || u === 'litro' || u === 'litros') return 'litro';
  if (u === 'kg' || u === 'g') return 'kg';
  if (u === 'vasos') return 'vaso';
  if (u === 'barras') return 'barra';
  if (u === 'servicios') return 'servicio';
  return 'unidad';
}

export function getPortionUnitLabel(unit) {
  const u = (unit || '').toLowerCase().trim();
  if (u === 'l' || u === 'ml' || u === 'litro' || u === 'litros') return 'ml';
  if (u === 'kg' || u === 'g') return 'gramo';
  if (u === 'vasos') return 'vaso';
  if (u === 'barras') return 'barra';
  if (u === 'servicios') return 'servicio';
  return 'unidad';
}

// Detecta si una bebida utiliza vaso milkshake / bebidas frías (vaso cristal + tapa domo)
export function isMilkshakeCup(recipe, category = '', name = '') {
  const norm = `${name || ''} ${recipe?.name || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const catNorm = `${category || ''} ${recipe?.category || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return (
    catNorm.includes('frappe') ||
    catNorm.includes('frio') ||
    catNorm.includes('cold') ||
    norm.includes('frappe') ||
    norm.includes('frio') ||
    norm.includes('iced') ||
    norm.includes('ice') ||
    norm.includes('milkshake') ||
    norm.includes('smoothie') ||
    norm.includes('batido')
  );
}

// Detecta si un producto o receta corresponde a un smoothie / batido frutal
export function isSmoothieItem(recipe, category = '', name = '') {
  const norm = `${name || ''} ${recipe?.name || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const catNorm = `${category || ''} ${recipe?.category || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return (
    Boolean(recipe?.isSmoothie) ||
    Number(recipe?.smoothieCost) > 0 ||
    norm.includes('smoothie') ||
    norm.includes('licuado') ||
    catNorm.includes('smoothie')
  );
}

const CONFIG_STORAGE_KEY = 'cafe_costs_base_config_v1';
const RECIPES_STORAGE_KEY = 'cafe_costs_recipes_v1';

export function normalizeConfig(raw = {}) {
  const parsed = raw || {};
  const normalized = {
    ...DEFAULT_CONFIG,
    ...parsed,
  };

  normalized.coffeePrice = Number(
    parsed.coffeePrice ?? parsed.coffeeKg ?? DEFAULT_CONFIG.coffeePrice
  );
  normalized.coffeeQty = Number(parsed.coffeeQty ?? DEFAULT_CONFIG.coffeeQty);
  normalized.coffeeUnit = parsed.coffeeUnit ?? DEFAULT_CONFIG.coffeeUnit;
  normalized.coffeeKg = getStandardCost(
    normalized.coffeePrice,
    normalized.coffeeQty,
    normalized.coffeeUnit
  );

  normalized.milkPrice = Number(parsed.milkPrice ?? parsed.milkLiter ?? DEFAULT_CONFIG.milkPrice);
  normalized.milkQty = Number(parsed.milkQty ?? DEFAULT_CONFIG.milkQty);
  normalized.milkUnit = parsed.milkUnit ?? DEFAULT_CONFIG.milkUnit;
  normalized.milkLiter = getStandardCost(
    normalized.milkPrice,
    normalized.milkQty,
    normalized.milkUnit
  );

  normalized.plantMilkPrice = Number(
    parsed.plantMilkPrice ?? parsed.plantMilkLiter ?? DEFAULT_CONFIG.plantMilkPrice
  );
  normalized.plantMilkQty = Number(parsed.plantMilkQty ?? DEFAULT_CONFIG.plantMilkQty);
  normalized.plantMilkUnit = parsed.plantMilkUnit ?? DEFAULT_CONFIG.plantMilkUnit;
  normalized.plantMilkLiter = getStandardCost(
    normalized.plantMilkPrice,
    normalized.plantMilkQty,
    normalized.plantMilkUnit
  );

  normalized.cocoaPrice = Number(parsed.cocoaPrice ?? parsed.cocoaKg ?? DEFAULT_CONFIG.cocoaPrice);
  normalized.cocoaQty = Number(parsed.cocoaQty ?? DEFAULT_CONFIG.cocoaQty);
  normalized.cocoaUnit = parsed.cocoaUnit ?? DEFAULT_CONFIG.cocoaUnit;
  normalized.cocoaKg = getStandardCost(
    normalized.cocoaPrice,
    normalized.cocoaQty,
    normalized.cocoaUnit
  );

  normalized.matchaPrice = Number(
    parsed.matchaPrice ?? parsed.matchaKg ?? DEFAULT_CONFIG.matchaPrice
  );
  normalized.matchaQty = Number(parsed.matchaQty ?? DEFAULT_CONFIG.matchaQty);
  normalized.matchaUnit = parsed.matchaUnit ?? DEFAULT_CONFIG.matchaUnit;
  normalized.matchaKg = getStandardCost(
    normalized.matchaPrice,
    normalized.matchaQty,
    normalized.matchaUnit
  );

  normalized.oreoPrice = Number(parsed.oreoPrice ?? DEFAULT_CONFIG.oreoPrice);
  normalized.oreoQty = Number(parsed.oreoQty ?? DEFAULT_CONFIG.oreoQty);
  normalized.oreoUnit = parsed.oreoUnit ?? DEFAULT_CONFIG.oreoUnit;

  normalized.icePrice = Number(parsed.icePrice ?? parsed.iceKg ?? DEFAULT_CONFIG.icePrice);
  normalized.iceQty = Number(parsed.iceQty ?? DEFAULT_CONFIG.iceQty);
  normalized.iceUnit = parsed.iceUnit ?? DEFAULT_CONFIG.iceUnit;
  normalized.iceKg = getStandardCost(normalized.icePrice, normalized.iceQty, normalized.iceUnit);

  normalized.iceCreamPrice = Number(
    parsed.iceCreamPrice ?? parsed.iceCreamKg ?? DEFAULT_CONFIG.iceCreamPrice
  );
  normalized.iceCreamQty = Number(parsed.iceCreamQty ?? DEFAULT_CONFIG.iceCreamQty);
  normalized.iceCreamUnit = parsed.iceCreamUnit ?? DEFAULT_CONFIG.iceCreamUnit;
  normalized.iceCreamKg = getStandardCost(
    normalized.iceCreamPrice,
    normalized.iceCreamQty,
    normalized.iceCreamUnit
  );

  normalized.creamPrice = Number(
    parsed.creamPrice ?? parsed.creamLiter ?? DEFAULT_CONFIG.creamPrice
  );
  normalized.creamQty = Number(parsed.creamQty ?? DEFAULT_CONFIG.creamQty);
  normalized.creamUnit = parsed.creamUnit ?? DEFAULT_CONFIG.creamUnit;
  normalized.creamLiter = getStandardCost(
    normalized.creamPrice,
    normalized.creamQty,
    normalized.creamUnit
  );

  normalized.chargerPrice = Number(parsed.chargerPrice ?? DEFAULT_CONFIG.chargerPrice);
  normalized.chargerQty = Number(parsed.chargerQty ?? DEFAULT_CONFIG.chargerQty);
  normalized.chargerUnit = parsed.chargerUnit ?? DEFAULT_CONFIG.chargerUnit;
  normalized.chargerYieldMl = Number(parsed.chargerYieldMl ?? DEFAULT_CONFIG.chargerYieldMl);

  normalized.saucePrice = Number(parsed.saucePrice ?? parsed.sauceKg ?? DEFAULT_CONFIG.saucePrice);
  normalized.sauceQty = Number(parsed.sauceQty ?? DEFAULT_CONFIG.sauceQty);
  normalized.sauceUnit = parsed.sauceUnit ?? DEFAULT_CONFIG.sauceUnit;
  normalized.sauceKg = getStandardCost(
    normalized.saucePrice,
    normalized.sauceQty,
    normalized.sauceUnit
  );

  normalized.sauceFlavors = (() => {
    const list =
      Array.isArray(parsed.sauceFlavors) && parsed.sauceFlavors.length > 0
        ? parsed.sauceFlavors
        : DEFAULT_CONFIG.sauceFlavors;
    const ids = new Set(list.map((f) => f.id));
    const missing = DEFAULT_CONFIG.sauceFlavors.filter((f) => !ids.has(f.id));
    return (missing.length > 0 ? [...list, ...missing] : list).map((f) => ({
      id: f.id,
      name: f.name || '',
      price: Number(f.price ?? 0),
      qty: Number(f.qty ?? 1),
      unit: f.unit || 'kg',
    }));
  })();

  normalized.syrupPrice = Number(
    parsed.syrupPrice ?? parsed.syrupLiter ?? DEFAULT_CONFIG.syrupPrice
  );
  normalized.syrupQty = Number(parsed.syrupQty ?? DEFAULT_CONFIG.syrupQty);
  normalized.syrupUnit = parsed.syrupUnit ?? DEFAULT_CONFIG.syrupUnit;
  normalized.syrupLiter = getStandardCost(
    normalized.syrupPrice,
    normalized.syrupQty,
    normalized.syrupUnit
  );

  normalized.syrupFlavors = (() => {
    const list =
      Array.isArray(parsed.syrupFlavors) && parsed.syrupFlavors.length > 0
        ? parsed.syrupFlavors
        : DEFAULT_CONFIG.syrupFlavors;
    const ids = new Set(list.map((f) => f.id));
    const missing = DEFAULT_CONFIG.syrupFlavors.filter((f) => !ids.has(f.id));
    return (missing.length > 0 ? [...list, ...missing] : list).map((f) => ({
      id: f.id,
      name: f.name || '',
      price: Number(f.price ?? 0),
      qty: Number(f.qty ?? 1),
      unit: f.unit || 'L',
    }));
  })();

  normalized.smoothiePrice = Number(
    parsed.smoothiePrice ?? parsed.smoothieCost ?? DEFAULT_CONFIG.smoothiePrice
  );
  normalized.smoothieQty = Number(parsed.smoothieQty ?? DEFAULT_CONFIG.smoothieQty);
  normalized.smoothieUnit = parsed.smoothieUnit ?? DEFAULT_CONFIG.smoothieUnit;
  normalized.smoothieCost = getUnitCost(
    normalized.smoothiePrice,
    normalized.smoothieQty,
    normalized.smoothieUnit
  );

  normalized.smoothieFlavors = (
    Array.isArray(parsed.smoothieFlavors) && parsed.smoothieFlavors.length > 0
      ? parsed.smoothieFlavors
      : DEFAULT_CONFIG.smoothieFlavors
  ).map((f) => ({
    id: f.id,
    name: f.name || '',
    price: Number(f.price ?? 0),
    qty: Number(f.qty ?? 1),
    unit: f.unit || 'porción',
  }));

  normalized.chocolateBarPrice = Number(
    parsed.chocolateBarPrice ?? parsed.chocolateBarUnit ?? DEFAULT_CONFIG.chocolateBarPrice
  );
  normalized.chocolateBarQty = Number(parsed.chocolateBarQty ?? DEFAULT_CONFIG.chocolateBarQty);
  normalized.chocolateBarUnit = getUnitCost(
    normalized.chocolateBarPrice,
    normalized.chocolateBarQty,
    'u'
  );

  // Vasos calientes
  normalized.packaging8ozPrice = Number(
    parsed.packaging8ozPrice ?? parsed.packaging8oz ?? DEFAULT_CONFIG.packaging8ozPrice
  );
  normalized.packaging8ozQty = Number(parsed.packaging8ozQty ?? DEFAULT_CONFIG.packaging8ozQty);
  normalized.packaging8ozUnit = parsed.packaging8ozUnit ?? DEFAULT_CONFIG.packaging8ozUnit;
  normalized.packaging8oz = getUnitCost(
    normalized.packaging8ozPrice,
    normalized.packaging8ozQty,
    'u'
  );

  normalized.packaging12ozPrice = Number(
    parsed.packaging12ozPrice ??
      parsed.packaging12oz ??
      parsed.packagingPrice ??
      DEFAULT_CONFIG.packaging12ozPrice
  );
  normalized.packaging12ozQty = Number(
    parsed.packaging12ozQty ?? parsed.packagingQty ?? DEFAULT_CONFIG.packaging12ozQty
  );
  normalized.packaging12ozUnit = parsed.packaging12ozUnit ?? DEFAULT_CONFIG.packaging12ozUnit;
  normalized.packaging12oz = getUnitCost(
    normalized.packaging12ozPrice,
    normalized.packaging12ozQty,
    'u'
  );

  normalized.packaging16ozPrice = Number(
    parsed.packaging16ozPrice ?? parsed.packaging16oz ?? DEFAULT_CONFIG.packaging16ozPrice
  );
  normalized.packaging16ozQty = Number(parsed.packaging16ozQty ?? DEFAULT_CONFIG.packaging16ozQty);
  normalized.packaging16ozUnit = parsed.packaging16ozUnit ?? DEFAULT_CONFIG.packaging16ozUnit;
  normalized.packaging16oz = getUnitCost(
    normalized.packaging16ozPrice,
    normalized.packaging16ozQty,
    'u'
  );

  // Vasos fríos / milkshake
  normalized.packagingCold12ozPrice = Number(
    parsed.packagingCold12ozPrice ??
      parsed.packagingCold12oz ??
      parsed.packagingColdPrice ??
      DEFAULT_CONFIG.packagingCold12ozPrice
  );
  normalized.packagingCold12ozQty = Number(
    parsed.packagingCold12ozQty ?? parsed.packagingColdQty ?? DEFAULT_CONFIG.packagingCold12ozQty
  );
  normalized.packagingCold12ozUnit =
    parsed.packagingCold12ozUnit ?? DEFAULT_CONFIG.packagingCold12ozUnit;
  normalized.packagingCold12oz = getUnitCost(
    normalized.packagingCold12ozPrice,
    normalized.packagingCold12ozQty,
    'u'
  );

  normalized.packagingCold16ozPrice = Number(
    parsed.packagingCold16ozPrice ??
      parsed.packagingCold16oz ??
      DEFAULT_CONFIG.packagingCold16ozPrice
  );
  normalized.packagingCold16ozQty = Number(
    parsed.packagingCold16ozQty ?? DEFAULT_CONFIG.packagingCold16ozQty
  );
  normalized.packagingCold16ozUnit =
    parsed.packagingCold16ozUnit ?? DEFAULT_CONFIG.packagingCold16ozUnit;
  normalized.packagingCold16oz = getUnitCost(
    normalized.packagingCold16ozPrice,
    normalized.packagingCold16ozQty,
    'u'
  );

  normalized.packagingPrice = normalized.packaging12ozPrice;
  normalized.packagingQty = normalized.packaging12ozQty;
  normalized.packagingUnit = normalized.packaging12ozUnit;
  normalized.packaging = normalized.packaging12oz;

  normalized.packagingColdPrice = normalized.packagingCold12ozPrice;
  normalized.packagingColdQty = normalized.packagingCold12ozQty;
  normalized.packagingColdUnit = normalized.packagingCold12ozUnit;
  normalized.packagingCold = normalized.packagingCold12oz;

  normalized.extrasPrice = Number(
    parsed.extrasPrice ?? parsed.extras ?? DEFAULT_CONFIG.extrasPrice
  );
  normalized.extrasQty = Number(parsed.extrasQty ?? DEFAULT_CONFIG.extrasQty);
  normalized.extrasUnit = parsed.extrasUnit ?? 'u';
  normalized.extras = Number(parsed.extras ?? normalized.extrasPrice);

  normalized.plantMilkFundPrice = Number(
    parsed.plantMilkFundPrice ?? parsed.plantMilkFund ?? DEFAULT_CONFIG.plantMilkFundPrice
  );
  normalized.plantMilkFundQty = Number(
    parsed.plantMilkFundQty ?? DEFAULT_CONFIG.plantMilkFundQty
  );
  normalized.plantMilkFundUnit = parsed.plantMilkFundUnit ?? DEFAULT_CONFIG.plantMilkFundUnit;
  normalized.plantMilkFund = Number(
    parsed.plantMilkFund ?? normalized.plantMilkFundPrice
  );

  // Fiambrería y quesos
  normalized.hamPrice = Number(parsed.hamPrice ?? parsed.hamKg ?? DEFAULT_CONFIG.hamPrice);
  normalized.hamQty = Number(parsed.hamQty ?? DEFAULT_CONFIG.hamQty);
  normalized.hamUnit = parsed.hamUnit ?? DEFAULT_CONFIG.hamUnit;
  normalized.hamKg = getStandardCost(normalized.hamPrice, normalized.hamQty, normalized.hamUnit);

  normalized.tyboPrice = Number(parsed.tyboPrice ?? parsed.tyboKg ?? DEFAULT_CONFIG.tyboPrice);
  normalized.tyboQty = Number(parsed.tyboQty ?? DEFAULT_CONFIG.tyboQty);
  normalized.tyboUnit = parsed.tyboUnit ?? DEFAULT_CONFIG.tyboUnit;
  normalized.tyboKg = getStandardCost(normalized.tyboPrice, normalized.tyboQty, normalized.tyboUnit);

  normalized.cheddarPrice = Number(
    parsed.cheddarPrice ?? parsed.cheddarKg ?? DEFAULT_CONFIG.cheddarPrice
  );
  normalized.cheddarQty = Number(parsed.cheddarQty ?? DEFAULT_CONFIG.cheddarQty);
  normalized.cheddarUnit = parsed.cheddarUnit ?? DEFAULT_CONFIG.cheddarUnit;
  normalized.cheddarKg = getStandardCost(
    normalized.cheddarPrice,
    normalized.cheddarQty,
    normalized.cheddarUnit
  );

  normalized.lomitoPrice = Number(
    parsed.lomitoPrice ?? parsed.lomitoKg ?? DEFAULT_CONFIG.lomitoPrice
  );
  normalized.lomitoQty = Number(parsed.lomitoQty ?? DEFAULT_CONFIG.lomitoQty);
  normalized.lomitoUnit = parsed.lomitoUnit ?? DEFAULT_CONFIG.lomitoUnit;
  normalized.lomitoKg = getStandardCost(
    normalized.lomitoPrice,
    normalized.lomitoQty,
    normalized.lomitoUnit
  );

  normalized.sardoPrice = Number(parsed.sardoPrice ?? parsed.sardoKg ?? DEFAULT_CONFIG.sardoPrice);
  normalized.sardoQty = Number(parsed.sardoQty ?? DEFAULT_CONFIG.sardoQty);
  normalized.sardoUnit = parsed.sardoUnit ?? DEFAULT_CONFIG.sardoUnit;
  normalized.sardoKg = getStandardCost(
    normalized.sardoPrice,
    normalized.sardoQty,
    normalized.sardoUnit
  );

  // Repostería y panadería
  normalized.mandiocaPrice = Number(
    parsed.mandiocaPrice ?? parsed.mandiocaKg ?? DEFAULT_CONFIG.mandiocaPrice
  );
  normalized.mandiocaQty = Number(parsed.mandiocaQty ?? DEFAULT_CONFIG.mandiocaQty);
  normalized.mandiocaUnit = parsed.mandiocaUnit ?? DEFAULT_CONFIG.mandiocaUnit;
  normalized.mandiocaKg = getStandardCost(
    normalized.mandiocaPrice,
    normalized.mandiocaQty,
    normalized.mandiocaUnit
  );

  normalized.eggsPrice = Number(
    parsed.eggsPrice ?? parsed.eggsUnitCost ?? DEFAULT_CONFIG.eggsPrice
  );
  normalized.eggsQty = Number(parsed.eggsQty ?? DEFAULT_CONFIG.eggsQty);
  normalized.eggsUnit = parsed.eggsUnit ?? DEFAULT_CONFIG.eggsUnit;
  normalized.eggsUnitCost = getStandardCost(
    normalized.eggsPrice,
    normalized.eggsQty,
    normalized.eggsUnit
  );

  normalized.saltPrice = Number(parsed.saltPrice ?? parsed.saltKg ?? DEFAULT_CONFIG.saltPrice);
  normalized.saltQty = Number(parsed.saltQty ?? DEFAULT_CONFIG.saltQty);
  normalized.saltUnit = parsed.saltUnit ?? DEFAULT_CONFIG.saltUnit;
  normalized.saltKg = getStandardCost(
    normalized.saltPrice,
    normalized.saltQty,
    normalized.saltUnit
  );

  normalized.sugarPrice = Number(parsed.sugarPrice ?? parsed.sugarKg ?? DEFAULT_CONFIG.sugarPrice);
  normalized.sugarQty = Number(parsed.sugarQty ?? DEFAULT_CONFIG.sugarQty);
  normalized.sugarUnit = parsed.sugarUnit ?? DEFAULT_CONFIG.sugarUnit;
  normalized.sugarKg = getStandardCost(
    normalized.sugarPrice,
    normalized.sugarQty,
    normalized.sugarUnit
  );

  normalized.flour0000Price = Number(
    parsed.flour0000Price ?? parsed.flour0000Kg ?? DEFAULT_CONFIG.flour0000Price
  );
  normalized.flour0000Qty = Number(parsed.flour0000Qty ?? DEFAULT_CONFIG.flour0000Qty);
  normalized.flour0000Unit = parsed.flour0000Unit ?? DEFAULT_CONFIG.flour0000Unit;
  normalized.flour0000Kg = getStandardCost(
    normalized.flour0000Price,
    normalized.flour0000Qty,
    normalized.flour0000Unit
  );

  normalized.butterPrice = Number(
    parsed.butterPrice ?? parsed.butterKg ?? DEFAULT_CONFIG.butterPrice
  );
  normalized.butterQty = Number(parsed.butterQty ?? DEFAULT_CONFIG.butterQty);
  normalized.butterUnit = parsed.butterUnit ?? DEFAULT_CONFIG.butterUnit;
  normalized.butterKg = getStandardCost(
    normalized.butterPrice,
    normalized.butterQty,
    normalized.butterUnit
  );

  normalized.bakingDarkChocPrice = Number(
    parsed.bakingDarkChocPrice ?? parsed.bakingDarkChocKg ?? DEFAULT_CONFIG.bakingDarkChocPrice
  );
  normalized.bakingDarkChocQty = Number(
    parsed.bakingDarkChocQty ?? DEFAULT_CONFIG.bakingDarkChocQty
  );
  normalized.bakingDarkChocUnit =
    parsed.bakingDarkChocUnit ?? DEFAULT_CONFIG.bakingDarkChocUnit;
  normalized.bakingDarkChocKg = getStandardCost(
    normalized.bakingDarkChocPrice,
    normalized.bakingDarkChocQty,
    normalized.bakingDarkChocUnit
  );

  normalized.bakingWhiteChocPrice = Number(
    parsed.bakingWhiteChocPrice ?? parsed.bakingWhiteChocKg ?? DEFAULT_CONFIG.bakingWhiteChocPrice
  );
  normalized.bakingWhiteChocQty = Number(
    parsed.bakingWhiteChocQty ?? DEFAULT_CONFIG.bakingWhiteChocQty
  );
  normalized.bakingWhiteChocUnit =
    parsed.bakingWhiteChocUnit ?? DEFAULT_CONFIG.bakingWhiteChocUnit;
  normalized.bakingWhiteChocKg = getStandardCost(
    normalized.bakingWhiteChocPrice,
    normalized.bakingWhiteChocQty,
    normalized.bakingWhiteChocUnit
  );

  normalized.bakingMilkChocPrice = Number(
    parsed.bakingMilkChocPrice ?? parsed.bakingMilkChocKg ?? DEFAULT_CONFIG.bakingMilkChocPrice
  );
  normalized.bakingMilkChocQty = Number(
    parsed.bakingMilkChocQty ?? DEFAULT_CONFIG.bakingMilkChocQty
  );
  normalized.bakingMilkChocUnit =
    parsed.bakingMilkChocUnit ?? DEFAULT_CONFIG.bakingMilkChocUnit;
  normalized.bakingMilkChocKg = getStandardCost(
    normalized.bakingMilkChocPrice,
    normalized.bakingMilkChocQty,
    normalized.bakingMilkChocUnit
  );

  normalized.fee = Number(parsed.fee ?? DEFAULT_CONFIG.fee);
  normalized.targetMargin = Number(parsed.targetMargin ?? DEFAULT_CONFIG.targetMargin);
  normalized.coffeeWaste = Number(parsed.coffeeWaste ?? DEFAULT_CONFIG.coffeeWaste);
  normalized.milkWaste = Number(parsed.milkWaste ?? DEFAULT_CONFIG.milkWaste);

  return normalized;
}

export function isConfigEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;

  const scalarKeys = [
    'coffeePrice',
    'coffeeQty',
    'coffeeUnit',
    'milkPrice',
    'milkQty',
    'milkUnit',
    'plantMilkPrice',
    'plantMilkQty',
    'plantMilkUnit',
    'cocoaPrice',
    'cocoaQty',
    'cocoaUnit',
    'matchaPrice',
    'matchaQty',
    'matchaUnit',
    'oreoPrice',
    'oreoQty',
    'oreoUnit',
    'icePrice',
    'iceQty',
    'iceUnit',
    'iceCreamPrice',
    'iceCreamQty',
    'iceCreamUnit',
    'creamPrice',
    'creamQty',
    'creamUnit',
    'chargerPrice',
    'chargerQty',
    'chargerUnit',
    'chargerYieldMl',
    'saucePrice',
    'sauceQty',
    'sauceUnit',
    'syrupPrice',
    'syrupQty',
    'syrupUnit',
    'smoothiePrice',
    'smoothieQty',
    'smoothieUnit',
    'chocolateBarPrice',
    'chocolateBarQty',
    'packaging8ozPrice',
    'packaging8ozQty',
    'packaging8ozUnit',
    'packaging12ozPrice',
    'packaging12ozQty',
    'packaging12ozUnit',
    'packaging16ozPrice',
    'packaging16ozQty',
    'packaging16ozUnit',
    'packagingCold12ozPrice',
    'packagingCold12ozQty',
    'packagingCold12ozUnit',
    'packagingCold16ozPrice',
    'packagingCold16ozQty',
    'packagingCold16ozUnit',
    'extrasPrice',
    'extrasQty',
    'plantMilkFundPrice',
    'plantMilkFundQty',
    'plantMilkFundUnit',
    'hamPrice',
    'hamQty',
    'hamUnit',
    'tyboPrice',
    'tyboQty',
    'tyboUnit',
    'cheddarPrice',
    'cheddarQty',
    'cheddarUnit',
    'lomitoPrice',
    'lomitoQty',
    'lomitoUnit',
    'sardoPrice',
    'sardoQty',
    'sardoUnit',
    'mandiocaPrice',
    'mandiocaQty',
    'mandiocaUnit',
    'eggsPrice',
    'eggsQty',
    'eggsUnit',
    'saltPrice',
    'saltQty',
    'saltUnit',
    'sugarPrice',
    'sugarQty',
    'sugarUnit',
    'flour0000Price',
    'flour0000Qty',
    'flour0000Unit',
    'butterPrice',
    'butterQty',
    'butterUnit',
    'bakingDarkChocPrice',
    'bakingDarkChocQty',
    'bakingDarkChocUnit',
    'bakingWhiteChocPrice',
    'bakingWhiteChocQty',
    'bakingWhiteChocUnit',
    'bakingMilkChocPrice',
    'bakingMilkChocQty',
    'bakingMilkChocUnit',
    'fee',
    'targetMargin',
    'coffeeWaste',
    'milkWaste',
  ];

  for (const k of scalarKeys) {
    const valA = a[k];
    const valB = b[k];
    if (valA === valB) continue;
    if (valA === '' || valB === '' || valA == null || valB == null) {
      if (valA !== valB) return false;
    } else if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
      if (Number(valA) !== Number(valB)) return false;
    } else {
      if (String(valA).trim() !== String(valB).trim()) return false;
    }
  }

  for (const listKey of ['sauceFlavors', 'syrupFlavors', 'smoothieFlavors']) {
    const listA = Array.isArray(a[listKey]) ? a[listKey] : [];
    const listB = Array.isArray(b[listKey]) ? b[listKey] : [];
    if (listA.length !== listB.length) return false;
    for (let i = 0; i < listA.length; i++) {
      const itemA = listA[i];
      const itemB = listB[i];
      if (!itemA || !itemB) return false;
      if (
        itemA.id !== itemB.id ||
        (itemA.name || '').trim() !== (itemB.name || '').trim() ||
        Number(itemA.price || 0) !== Number(itemB.price || 0) ||
        Number(itemA.qty || 0) !== Number(itemB.qty || 0) ||
        (itemA.unit || '') !== (itemB.unit || '')
      ) {
        return false;
      }
    }
  }

  return true;
}

function getStoredConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return normalizeConfig(parsed);
    }
  } catch (e) {
    console.error('Error cargando config de costos:', e);
  }
  return normalizeConfig(DEFAULT_CONFIG);
}

function getStoredRecipes() {
  try {
    const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        let changed = false;
        Object.keys(parsed).forEach((k) => {
          const rec = parsed[k];
          if (!rec || typeof rec !== 'object') return;
          const kLower = k.toLowerCase();
          const nLower = (rec.name || '').toLowerCase();
          const isNoCoffee =
            kLower.includes('byazqa2facpnoxi') ||
            nLower.includes('chocolate caliente') ||
            nLower.includes('submarino') ||
            nLower.includes('chocolatada') ||
            nLower.includes('milkshake');

          if (isNoCoffee && Number(rec.coffeeGrams) > 0) {
            rec.coffeeGrams = 0;
            changed = true;
          }

          const isChocolate =
            kLower.includes('byazqa2facpnoxi') ||
            nLower.includes('chocolate caliente') ||
            nLower.includes('submarino') ||
            nLower.includes('chocolatada');

          if (
            isChocolate &&
            (!rec.cocoaGrams ||
              Number(rec.cocoaGrams) <= 0 ||
              rec.cocoaGrams === 18 ||
              rec.cocoaGrams === 25)
          ) {
            const sz = (rec.sizeKey || k).toLowerCase();
            rec.cocoaGrams = sz.includes('8oz') ? 17 : sz.includes('16oz') ? 32 : 24;
            changed = true;
          }

          const isMilkshake =
            kLower.includes('milkshake') ||
            nLower.includes('milkshake') ||
            nLower.includes('batido');
          if (isMilkshake && (!rec.iceCreamGrams || Number(rec.iceCreamGrams) <= 0)) {
            const sz = (rec.sizeKey || k).toLowerCase();
            rec.iceCreamGrams = sz.includes('16oz') || sz.includes('16') ? 180 : 120;
            changed = true;
          }

          const isFrappeItem = kLower.includes('frappe') || nLower.includes('frappe');
          if (isFrappeItem) {
            const sz = (rec.sizeKey || k).toLowerCase();
            const is16 = sz.includes('16oz') || sz.includes('16');
            if (!rec.iceGrams || Number(rec.iceGrams) <= 0) {
              rec.iceGrams = is16 ? 200 : 150;
              changed = true;
            }
            if (rec.milkMl === 160 || rec.milkMl === 220) {
              rec.milkMl = is16 ? 110 : 90;
              changed = true;
            }
            if (!rec.whippedCreamGrams || Number(rec.whippedCreamGrams) <= 0) {
              rec.whippedCreamGrams = is16 ? 40 : 30;
              changed = true;
            }
          }
        });
        if (changed) {
          try {
            localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(parsed));
          } catch (_) {
            /* ignore */
          }
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error cargando recetas personalizadas:', e);
  }
  return {};
}

// Mapeo legible y compacto de categorías
export const CATEGORY_NAMES = {
  clasico: '☕ Clásicos',
  cold: '🧊 Fríos',
  frappe: '🍧 Frappés',
  smoothie: '🍓 Smoothies',
  frio: '🥤 Bebidas Frías',
  pasteleria: '🥐 Pastelería',
  extra: '✨ Adicionales',
  otros: '📌 Otros',
};

export const CATEGORY_ORDER = [
  'clasico',
  'cold',
  'frappe',
  'smoothie',
  'frio',
  'pasteleria',
  'extra',
  'otros',
];

export const CATEGORY_COLORS = {
  clasico: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  cold: { border: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8' },
  frappe: { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc' },
  smoothie: { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6' },
  frio: { border: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee' },
  pasteleria: { border: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308' },
  extra: { border: '#4ccd99', bg: 'rgba(76, 205, 153, 0.15)', text: '#4ccd99' },
  otros: { border: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1' },
};

// Helpers universales para obtener el nombre legible de salsas y syrups
export function getSauceName(flavorId, config = null) {
  if (!flavorId) return 'Chocolate';
  const list = config?.sauceFlavors || DEFAULT_CONFIG.sauceFlavors;
  if (Array.isArray(list)) {
    const found = list.find(
      (f) => f.id === flavorId || f.name?.toLowerCase() === String(flavorId).toLowerCase()
    );
    if (found?.name) return found.name;
  }
  const clean = String(flavorId)
    .replace(/^sauce_/, '')
    .replace(/_/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function getSyrupName(flavorId, config = null) {
  if (!flavorId) return 'Vainilla';
  const list = config?.syrupFlavors || DEFAULT_CONFIG.syrupFlavors;
  if (Array.isArray(list)) {
    const found = list.find(
      (f) => f.id === flavorId || f.name?.toLowerCase() === String(flavorId).toLowerCase()
    );
    if (found?.name) return found.name;
  }
  const clean = String(flavorId)
    .replace(/^syrup_/, '')
    .replace(/_/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// Formateo visual y conciso de la receta para mostrar en la tabla
export function formatRecipeSummary(variant, isPastry, config = null) {
  if (isPastry || variant?.recipe?.isPastry) {
    const r = variant?.recipe || {};
    const cost = Number(r?.pastryCost) || 0;
    const parts = [];
    if (Number(r.baseBakeryCost) > 0) parts.push(`Base: $${r.baseBakeryCost}`);
    if (Number(r.jamonGrams) > 0) parts.push(`${r.jamonGrams}g jamón`);
    if (Number(r.tyboGrams) > 0) parts.push(`${r.tyboGrams}g tybo`);
    if (Number(r.cheddarGrams) > 0) parts.push(`${r.cheddarGrams}g cheddar`);
    if (Number(r.lomitoGrams) > 0) parts.push(`${r.lomitoGrams}g lomito`);
    if (Number(r.sardoGrams) > 0) parts.push(`${r.sardoGrams}g sardo`);
    if (Number(r.mandiocaGrams) > 0) parts.push(`${r.mandiocaGrams}g mandioca`);
    if (Number(r.eggsCount) > 0) parts.push(`${r.eggsCount} huevo${r.eggsCount > 1 ? 's' : ''}`);
    if (Number(r.butterGrams) > 0) parts.push(`${r.butterGrams}g manteca`);
    if (Number(r.flourGrams) > 0) parts.push(`${r.flourGrams}g harina`);
    if (Number(r.sugarGrams) > 0) parts.push(`${r.sugarGrams}g azúcar`);
    if (Number(r.darkChocGrams) > 0) parts.push(`${r.darkChocGrams}g choc. negro`);
    if (Number(r.whiteChocGrams) > 0) parts.push(`${r.whiteChocGrams}g choc. blanco`);
    if (Number(r.milkChocGrams) > 0) parts.push(`${r.milkChocGrams}g choc. leche`);
    if (parts.length > 0) {
      return `${parts.join(' · ')} ($${Math.round(cost).toLocaleString('es-AR')})`;
    }
    return `Base: $${Math.round(cost).toLocaleString('es-AR')}`;
  }
  if (variant?.recipe?.isSmoothie) {
    const is16 =
      (variant?.sizeKey || '').toLowerCase().includes('16oz') || variant?.sizeKey === '16';
    const pulpaG = variant?.recipe?.pulpaGrams || (is16 ? 130 : 95);
    const iceG = variant?.recipe?.iceGrams || (is16 ? 200 : 150);
    const waterG = variant?.recipe?.waterGrams || (is16 ? 170 : 125);
    const fId = variant?.recipe?.smoothieFlavor;
    const fName =
      fId && fId !== 'promedio' && fId !== 'custom' ? ` (${fId.replace(/_/g, ' ')})` : '';
    return `${pulpaG}g pulpa${fName} · ${iceG}g hielo · ${waterG}ml agua · vaso milkshake`;
  }
  if (variant?.sizeKey === 'extra' || variant?.recipe?.category === 'extra') {
    if (variant?.recipe?.whippedCreamGrams > 0)
      return `${variant.recipe.whippedCreamGrams}g crema chantilly`;
    if (variant?.recipe?.coffeeGrams > 0) return `${variant.recipe.coffeeGrams}g café espresso`;
    if (variant?.recipe?.milkMl > 0) return `${variant.recipe.milkMl}ml leche vegetal`;
    if (variant?.recipe?.pastryCost > 0)
      return `Topping: $${Math.round(variant.recipe.pastryCost).toLocaleString('es-AR')}`;
    return 'Adicional de barra';
  }
  const coffee = Number(variant?.recipe?.coffeeGrams) || 0;
  const matcha = Number(variant?.recipe?.matchaGrams) || 0;
  const milk = Number(variant?.recipe?.milkMl) || 0;
  const isPlant = variant?.recipe?.milkType === 'plant';
  const milkLabel = isPlant ? 'veg.' : 'leche';
  const cocoa = Number(variant?.recipe?.cocoaGrams) || 0;
  const sauce = Number(variant?.recipe?.sauceGrams) || 0;
  const syrup = Number(variant?.recipe?.syrupMl) || 0;
  const ice = Number(variant?.recipe?.iceGrams) || 0;
  const iceCream = Number(variant?.recipe?.iceCreamGrams) || 0;
  const whippedCream = Number(variant?.recipe?.whippedCreamGrams) || 0;

  const isCold = isMilkshakeCup(variant?.recipe, variant?.recipe?.category, variant?.recipe?.name);
  const rName = (variant?.recipe?.name || '').toLowerCase();

  const parts = [];
  if (iceCream > 0) parts.push(`${iceCream}g helado`);
  if (coffee > 0) parts.push(`${coffee}g café`);
  if (matcha > 0) parts.push(`${matcha}g matcha`);
  if (milk > 0) parts.push(`${milk}ml ${milkLabel}`);
  if (cocoa > 0) parts.push(`${cocoa}g cacao`);
  const oreoUnits = Number(variant?.recipe?.oreoUnits ?? variant?.recipe?.oreoQty) || 0;
  const oreoGrams = Number(variant?.recipe?.oreoGrams) || 0;
  if (oreoUnits > 0) parts.push(`${oreoUnits} u Oreo`);
  else if (oreoGrams > 0) parts.push(`${oreoGrams}g Oreo`);
  if (whippedCream > 0) parts.push(`${whippedCream}g crema`);
  if (sauce > 0) {
    const sName = getSauceName(variant?.recipe?.sauceFlavor, config);
    parts.push(`${sauce}g salsa ${sName.toLowerCase()}`);
  }
  if (syrup > 0) {
    const syName = getSyrupName(variant?.recipe?.syrupFlavor, config);
    parts.push(`${syrup}ml syrup ${syName.toLowerCase()}`);
  }
  const syrup2 = Number(variant?.recipe?.syrup2Ml) || 0;
  if (syrup2 > 0) {
    const sy2Name = getSyrupName(variant?.recipe?.syrup2Flavor, config);
    parts.push(`${syrup2}ml syrup ${sy2Name.toLowerCase()}`);
  }
  const syrup3 = Number(variant?.recipe?.syrup3Ml) || 0;
  if (syrup3 > 0) {
    const sy3Name = getSyrupName(variant?.recipe?.syrup3Flavor, config);
    parts.push(`${syrup3}ml syrup ${sy3Name.toLowerCase()}`);
  }
  if (ice > 0) parts.push(`${ice}g hielo`);
  if (isCold) parts.push(rName.includes('milkshake') ? 'vaso milkshake' : 'vaso frío');

  if (parts.length > 0) {
    return parts.join(' · ');
  }
  return variant?.recipe?.rawRecipeText || 'Sin insumos';
}

// Desglose visual estructurado de ingredientes para la pestaña de Recetario
export function getRecipeIngredientList(recipe, sizeKey = '', config = null) {
  if (!recipe) return [];
  const list = [];
  const isCold = isMilkshakeCup(recipe, recipe.category, recipe.name);

  // Café
  const coffee = Number(recipe.coffeeGrams) || 0;
  if (coffee > 0) {
    list.push({
      icon: '☕',
      label: 'Café Espresso',
      value: `${coffee}g`,
      detail: coffee >= 18 ? 'Doble shot' : 'Shot simple',
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.3)',
    });
  }

  // Leche
  const milk = Number(recipe.milkMl) || 0;
  if (milk > 0) {
    const isPlant = recipe.milkType === 'plant';
    list.push({
      icon: '🥛',
      label: isPlant ? 'Leche Vegetal' : 'Leche',
      value: `${milk}ml`,
      detail: isPlant ? 'Vegetal' : isCold ? 'Fría' : 'Vaporizada sedosa',
      bg: 'rgba(59, 130, 246, 0.15)',
      color: '#60a5fa',
      border: 'rgba(59, 130, 246, 0.3)',
    });
  }

  // Agua (para americano / infusiones / smoothies)
  const water = Number(recipe.waterGrams || recipe.waterMl) || 0;
  const isAmericano =
    (recipe.name || '').toLowerCase().includes('americano') ||
    (recipe.rawRecipeText || '').toLowerCase().includes('agua');
  if (water > 0 || isAmericano) {
    list.push({
      icon: '💧',
      label: isCold ? 'Agua Fría' : 'Agua Caliente',
      value: water > 0 ? `${water}ml` : 'Completar taza',
      detail: isCold ? 'Fría' : 'Caliente filtrada',
      bg: 'rgba(14, 165, 233, 0.15)',
      color: '#38bdf8',
      border: 'rgba(14, 165, 233, 0.3)',
    });
  }

  // Hielo
  const ice = Number(recipe.iceGrams) || 0;
  if (ice > 0) {
    list.push({
      icon: '🧊',
      label: 'Hielo',
      value: `${ice}g`,
      detail: 'Rolito / Frappé',
      bg: 'rgba(147, 197, 253, 0.15)',
      color: '#93c5fd',
      border: 'rgba(147, 197, 253, 0.3)',
    });
  }

  // Helado
  const iceCream = Number(recipe.iceCreamGrams) || 0;
  if (iceCream > 0) {
    list.push({
      icon: '🍨',
      label: 'Helado',
      value: `${iceCream}g`,
      detail: 'Artesanal',
      bg: 'rgba(251, 146, 60, 0.15)',
      color: '#fb923c',
      border: 'rgba(251, 146, 60, 0.3)',
    });
  }

  // Crema Chantilly
  const whipped = Number(recipe.whippedCreamGrams) || 0;
  if (whipped > 0) {
    list.push({
      icon: '🍦',
      label: 'Chantilly',
      value: `${whipped}g`,
      detail: 'Sifón crema',
      bg: 'rgba(244, 114, 182, 0.15)',
      color: '#f472b6',
      border: 'rgba(244, 114, 182, 0.3)',
    });
  }

  // Pulpa / Fruta smoothie
  const pulpa = Number(recipe.pulpaGrams) || 0;
  if (pulpa > 0 || Boolean(recipe.isSmoothie)) {
    const fId = recipe.smoothieFlavor;
    const fLabel =
      fId && fId !== 'promedio' && fId !== 'custom' ? fId.replace(/_/g, ' ') : 'Frutas';
    list.push({
      icon: '🍓',
      label: 'Pulpa Frutal',
      value: `${pulpa || 100}g`,
      detail: fLabel.charAt(0).toUpperCase() + fLabel.slice(1),
      bg: 'rgba(236, 72, 153, 0.15)',
      color: '#ec4899',
      border: 'rgba(236, 72, 153, 0.3)',
    });
  }

  // Syrups (Syrup 1, Syrup 2, Syrup 3)
  const syrup1 = Number(recipe.syrupMl) || 0;
  if (syrup1 > 0) {
    const sName = getSyrupName(recipe.syrupFlavor, config);
    list.push({
      icon: '🍯',
      label: `Syrup ${sName}`,
      value: `${syrup1}ml`,
      detail: 'Jarabe de sabor',
      bg: 'rgba(234, 179, 8, 0.15)',
      color: '#eab308',
      border: 'rgba(234, 179, 8, 0.3)',
    });
  }

  const syrup2 = Number(recipe.syrup2Ml) || 0;
  if (syrup2 > 0) {
    const sName = getSyrupName(recipe.syrup2Flavor, config);
    list.push({
      icon: '🍯',
      label: `Syrup ${sName}`,
      value: `${syrup2}ml`,
      detail: 'Jarabe secundario',
      bg: 'rgba(234, 179, 8, 0.15)',
      color: '#eab308',
      border: 'rgba(234, 179, 8, 0.3)',
    });
  }

  const syrup3 = Number(recipe.syrup3Ml) || 0;
  if (syrup3 > 0) {
    const sName = getSyrupName(recipe.syrup3Flavor, config);
    list.push({
      icon: '🍯',
      label: `Syrup ${sName}`,
      value: `${syrup3}ml`,
      detail: 'Jarabe endulzante',
      bg: 'rgba(234, 179, 8, 0.15)',
      color: '#eab308',
      border: 'rgba(234, 179, 8, 0.3)',
    });
  }

  // Salsas
  const sauce = Number(recipe.sauceGrams) || 0;
  if (sauce > 0) {
    const sName = getSauceName(recipe.sauceFlavor, config);
    list.push({
      icon: '🍫',
      label: `Salsa ${sName}`,
      value: `${sauce}g`,
      detail: 'Decoración / base',
      bg: 'rgba(168, 85, 247, 0.15)',
      color: '#a855f7',
      border: 'rgba(168, 85, 247, 0.3)',
    });
  }

  // Cacao
  const cocoa = Number(recipe.cocoaGrams) || 0;
  if (cocoa > 0) {
    list.push({
      icon: '🍫',
      label: 'Cacao en polvo',
      value: `${cocoa}g`,
      detail: 'Cacao amargo',
      bg: 'rgba(180, 83, 9, 0.15)',
      color: '#d97706',
      border: 'rgba(180, 83, 9, 0.3)',
    });
  }

  // Matcha
  const matcha = Number(recipe.matchaGrams) || 0;
  if (matcha > 0) {
    list.push({
      icon: '🍵',
      label: 'Té Matcha',
      value: `${matcha}g`,
      detail: '100% puro',
      bg: 'rgba(34, 197, 94, 0.15)',
      color: '#22c55e',
      border: 'rgba(34, 197, 94, 0.3)',
    });
  }

  // Pastelería o Adicional
  if (recipe.isPastry) {
    list.push({
      icon: '🥐',
      label: 'Base Pastelería',
      value: recipe.baseBakeryCost ? `$${recipe.baseBakeryCost}` : '1 u',
      detail: 'Porción individual',
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.3)',
    });
    if (Number(recipe.jamonGrams) > 0) {
      list.push({
        icon: '🥓',
        label: 'Jamón',
        value: `${recipe.jamonGrams}g`,
        detail: 'Fiambrería',
        bg: 'rgba(239, 68, 68, 0.15)',
        color: '#f87171',
        border: 'rgba(239, 68, 68, 0.3)',
      });
    }
    if (Number(recipe.tyboGrams) > 0) {
      list.push({
        icon: '🧀',
        label: 'Queso Tybo',
        value: `${recipe.tyboGrams}g`,
        detail: 'Quesería',
        bg: 'rgba(234, 179, 8, 0.15)',
        color: '#eab308',
        border: 'rgba(234, 179, 8, 0.3)',
      });
    }
    if (Number(recipe.cheddarGrams) > 0) {
      list.push({
        icon: '🧀',
        label: 'Queso Cheddar',
        value: `${recipe.cheddarGrams}g`,
        detail: 'Quesería',
        bg: 'rgba(245, 158, 11, 0.15)',
        color: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.3)',
      });
    }
    if (Number(recipe.lomitoGrams) > 0) {
      list.push({
        icon: '🥩',
        label: 'Lomito',
        value: `${recipe.lomitoGrams}g`,
        detail: 'Fiambrería',
        bg: 'rgba(239, 68, 68, 0.15)',
        color: '#f87171',
        border: 'rgba(239, 68, 68, 0.3)',
      });
    }
    if (Number(recipe.sardoGrams) > 0) {
      list.push({
        icon: '🧀',
        label: 'Queso Sardo',
        value: `${recipe.sardoGrams}g`,
        detail: 'Quesería',
        bg: 'rgba(234, 179, 8, 0.15)',
        color: '#eab308',
        border: 'rgba(234, 179, 8, 0.3)',
      });
    }
    if (Number(recipe.mandiocaGrams) > 0) {
      list.push({
        icon: '🌾',
        label: 'Almidón Mandioca',
        value: `${recipe.mandiocaGrams}g`,
        detail: 'Materia prima',
        bg: 'rgba(168, 85, 247, 0.15)',
        color: '#c084fc',
        border: 'rgba(168, 85, 247, 0.3)',
      });
    }
    if (Number(recipe.eggsCount) > 0) {
      list.push({
        icon: '🥚',
        label: 'Huevos',
        value: `${recipe.eggsCount} u`,
        detail: 'Materia prima',
        bg: 'rgba(234, 179, 8, 0.15)',
        color: '#eab308',
        border: 'rgba(234, 179, 8, 0.3)',
      });
    }
    if (Number(recipe.flourGrams) > 0) {
      list.push({
        icon: '🌾',
        label: 'Harina 0000',
        value: `${recipe.flourGrams}g`,
        detail: 'Materia prima',
        bg: 'rgba(245, 158, 11, 0.15)',
        color: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.3)',
      });
    }
    if (Number(recipe.butterGrams) > 0) {
      list.push({
        icon: '🧈',
        label: 'Manteca',
        value: `${recipe.butterGrams}g`,
        detail: 'Materia prima',
        bg: 'rgba(234, 179, 8, 0.15)',
        color: '#eab308',
        border: 'rgba(234, 179, 8, 0.3)',
      });
    }
    if (Number(recipe.darkChocGrams) > 0) {
      list.push({
        icon: '🍫',
        label: 'Choc. Negro',
        value: `${recipe.darkChocGrams}g`,
        detail: 'Cobertura',
        bg: 'rgba(180, 83, 9, 0.15)',
        color: '#d97706',
        border: 'rgba(180, 83, 9, 0.3)',
      });
    }
    if (Number(recipe.whiteChocGrams) > 0) {
      list.push({
        icon: '🍫',
        label: 'Choc. Blanco',
        value: `${recipe.whiteChocGrams}g`,
        detail: 'Cobertura',
        bg: 'rgba(255, 255, 255, 0.15)',
        color: '#f3f4f6',
        border: 'rgba(255, 255, 255, 0.3)',
      });
    }
    if (Number(recipe.milkChocGrams) > 0) {
      list.push({
        icon: '🍫',
        label: 'Choc. c/Leche',
        value: `${recipe.milkChocGrams}g`,
        detail: 'Cobertura',
        bg: 'rgba(217, 119, 6, 0.15)',
        color: '#f59e0b',
        border: 'rgba(217, 119, 6, 0.3)',
      });
    }
  }

  // Galletitas Oreo
  const oreoUnits = Number(recipe.oreoUnits ?? recipe.oreoQty ?? 0);
  const oreoGrams = Number(recipe.oreoGrams ?? 0);
  const rNameLower = (recipe.name || '').toLowerCase();
  const effectiveOreoUnits =
    oreoUnits > 0
      ? oreoUnits
      : oreoGrams === 0 && rNameLower.includes('oreo')
        ? (sizeKey || '').toLowerCase().includes('16')
          ? 2.5
          : 2
        : 0;

  if (effectiveOreoUnits > 0 || oreoGrams > 0) {
    list.push({
      icon: '🍪',
      label: 'Galletitas Oreo',
      value: effectiveOreoUnits > 0 ? `${effectiveOreoUnits} u` : `${oreoGrams}g`,
      detail: effectiveOreoUnits > 0 ? 'Trituradas / Deco' : `${oreoGrams}g trituradas`,
      bg: 'rgba(59, 130, 246, 0.15)',
      color: '#60a5fa',
      border: 'rgba(59, 130, 246, 0.3)',
    });
  }

  return list;
}

// Motor de Inteligencia Artificial para calibración y ajuste automático de recetas de cafetería.
// Analiza el nombre del producto, categoría y variantes de tamaño (8oz, 12oz, 16oz)
// y devuelve las proporciones exactas de café, leche, salsas, syrups y tipo de vaso
// según los estándares internacionales de barista y Specialty Coffee Association (SCA).
export function detectAiRecipe(name = '', sizeKey = '', category = '', config = DEFAULT_CONFIG) {
  const norm = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  const catNorm = (category || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  const size = (sizeKey || '').toLowerCase().trim();

  const makeResult = (data) => ({
    coffeeGrams: Number(data.coffeeGrams) || 0,
    milkMl: Number(data.milkMl) || 0,
    milkType: data.milkType || 'regular',
    cocoaGrams: Number(data.cocoaGrams) || 0,
    oreoUnits: Number(data.oreoUnits) || 0,
    oreoGrams: Number(data.oreoGrams) || 0,
    sauceGrams: Number(data.sauceGrams) || 0,
    sauceFlavor: data.sauceFlavor || 'chocolate',
    syrupMl: Number(data.syrupMl) || 0,
    syrupFlavor: data.syrupFlavor || 'vainilla',
    syrup2Ml: Number(data.syrup2Ml) || 0,
    syrup2Flavor: data.syrup2Flavor || '',
    syrup3Ml: Number(data.syrup3Ml) || 0,
    syrup3Flavor: data.syrup3Flavor || '',
    chocolateCost: 0,
    matchaGrams: Number(data.matchaGrams) || 0,
    isSmoothie: Boolean(data.isSmoothie),
    smoothieFlavor: data.isSmoothie ? data.smoothieFlavor || 'promedio' : '',
    smoothieCost: data.isSmoothie ? Number(data.smoothieCost) || 1400 : 0,
    pulpaGrams: Number(data.pulpaGrams) || 0,
    iceGrams: Number(data.iceGrams) || 0,
    waterGrams: Number(data.waterGrams) || 0,
    iceCreamGrams: Number(data.iceCreamGrams) || 0,
    whippedCreamGrams: Number(data.whippedCreamGrams) || 0,
    isPastry: Boolean(data.isPastry),
    pastryCost: data.isPastry ? Number(data.pastryCost) || 0 : 0,
    baseBakeryCost: data.isPastry ? Number(data.baseBakeryCost) || 0 : 0,
    jamonGrams: data.isPastry ? Number(data.jamonGrams) || 0 : 0,
    tyboGrams: data.isPastry ? Number(data.tyboGrams) || 0 : 0,
    cheddarGrams: data.isPastry ? Number(data.cheddarGrams) || 0 : 0,
    lomitoGrams: data.isPastry ? Number(data.lomitoGrams) || 0 : 0,
    sardoGrams: data.isPastry ? Number(data.sardoGrams) || 0 : 0,
    mandiocaGrams: data.isPastry ? Number(data.mandiocaGrams) || 0 : 0,
    eggsCount: data.isPastry ? Number(data.eggsCount) || 0 : 0,
    flourGrams: data.isPastry ? Number(data.flourGrams) || 0 : 0,
    butterGrams: data.isPastry ? Number(data.butterGrams) || 0 : 0,
    sugarGrams: data.isPastry ? Number(data.sugarGrams) || 0 : 0,
    saltGrams: data.isPastry ? Number(data.saltGrams) || 0 : 0,
    darkChocGrams: data.isPastry ? Number(data.darkChocGrams) || 0 : 0,
    whiteChocGrams: data.isPastry ? Number(data.whiteChocGrams) || 0 : 0,
    milkChocGrams: data.isPastry ? Number(data.milkChocGrams) || 0 : 0,
    cupType: data.cupType || 'hot',
    isCold: Boolean(data.isCold),
    aiExplanation: data.aiExplanation || '',
    rawRecipeText: data.rawRecipeText || '',
  });

  // 1. PASTELERÍA Y PANADERÍA
  const isPastryProduct =
    catNorm.includes('pasteler') ||
    norm.includes('pasteleria') ||
    norm.includes('torta') ||
    norm.includes('cookie') ||
    norm.includes('medialuna') ||
    norm.includes('chipa') ||
    norm.includes('croissant') ||
    norm.includes('roll') ||
    norm.includes('budin') ||
    norm.includes('tostado') ||
    norm.includes('pan de chocolate') ||
    norm.includes('alfajor') ||
    norm.includes('muffin') ||
    norm.includes('scon') ||
    norm.includes('sandwich') ||
    norm.includes('cheesecake');

  if (isPastryProduct) {
    let cost = 1500;
    let desc = 'Pastelería artesanal';
    let baseBakeryCost = 1500;
    let jamonGrams = 0;
    let tyboGrams = 0;
    let cheddarGrams = 0;
    let lomitoGrams = 0;
    let sardoGrams = 0;

    const effH = getUnitCost(config?.hamPrice ?? 12000, config?.hamQty ?? 1, config?.hamUnit ?? 'kg');
    const effT = getUnitCost(config?.tyboPrice ?? 11000, config?.tyboQty ?? 1, config?.tyboUnit ?? 'kg');
    const effC = getUnitCost(config?.cheddarPrice ?? 13500, config?.cheddarQty ?? 1, config?.cheddarUnit ?? 'kg');
    const effL = getUnitCost(config?.lomitoPrice ?? 14500, config?.lomitoQty ?? 1, config?.lomitoUnit ?? 'kg');
    const effS = getUnitCost(config?.sardoPrice ?? 15500, config?.sardoQty ?? 1, config?.sardoUnit ?? 'kg');

    if (norm.includes('tostado') && norm.includes('chipa')) {
      baseBakeryCost = 1000;
      jamonGrams = 35;
      tyboGrams = 35;
      cost = Math.round(baseBakeryCost + jamonGrams * effH + tyboGrams * effT);
      desc = 'Tostado de Chipá relleno con Jamón y Queso Tybo';
    } else if (
      norm.includes('medialuna') &&
      (norm.includes('rellen') || norm.includes('jyq') || norm.includes('jamon') || norm.includes('queso'))
    ) {
      baseBakeryCost = 900;
      jamonGrams = 30;
      tyboGrams = 30;
      cost = Math.round(baseBakeryCost + jamonGrams * effH + tyboGrams * effT);
      desc = 'Medialuna artesanal rellena con Jamón y Queso Tybo';
    } else if (norm.includes('tostado')) {
      baseBakeryCost = 700;
      jamonGrams = 40;
      tyboGrams = 40;
      cost = Math.round(baseBakeryCost + jamonGrams * effH + tyboGrams * effT);
      desc = 'Tostado de jamón y queso';
    } else if (norm.includes('pan de chocolate') || norm.includes('roll')) {
      cost = 2200;
      baseBakeryCost = 2200;
      desc = norm.includes('roll') ? 'Roll de Canela hojaldrado' : 'Pain au Chocolat artesanal';
    } else if (norm.includes('cookie')) {
      cost = 1800;
      baseBakeryCost = 1800;
      desc = 'Cookie rellena horneada';
    } else if (norm.includes('croissant')) {
      cost = 1600;
      baseBakeryCost = 1600;
      desc = 'Croissant francés hojaldrado';
    } else if (norm.includes('chipa')) {
      cost = 1000;
      baseBakeryCost = 1000;
      desc = 'Chipá tradicional de queso';
    } else if (norm.includes('budin')) {
      cost = 1400;
      baseBakeryCost = 1400;
      desc = 'Rebanada de budín húmedo';
    } else if (norm.includes('medialuna')) {
      cost = 900;
      baseBakeryCost = 900;
      desc = 'Medialuna artesanal de manteca';
    }

    let recipeText = `Base pastelería: $${cost}`;
    if (jamonGrams > 0 || tyboGrams > 0 || cheddarGrams > 0 || lomitoGrams > 0 || sardoGrams > 0) {
      const parts = [`Base: $${baseBakeryCost}`];
      if (jamonGrams > 0) parts.push(`${jamonGrams}g jamón`);
      if (tyboGrams > 0) parts.push(`${tyboGrams}g tybo`);
      if (cheddarGrams > 0) parts.push(`${cheddarGrams}g cheddar`);
      if (lomitoGrams > 0) parts.push(`${lomitoGrams}g lomito`);
      if (sardoGrams > 0) parts.push(`${sardoGrams}g sardo`);
      recipeText = parts.join(' · ');
    }

    return makeResult({
      isPastry: true,
      pastryCost: cost,
      baseBakeryCost,
      jamonGrams,
      tyboGrams,
      cheddarGrams,
      lomitoGrams,
      sardoGrams,
      milkType: 'none',
      aiExplanation: `IA: ${desc} (Costo total elaboración: $${cost}).`,
      rawRecipeText: recipeText,
    });
  }

  // 2. EXTRAS Y ADICIONALES DE BARRA
  if (catNorm === 'extra' || size === 'extra') {
    if (norm.includes('shot') || norm.includes('cafe')) {
      return makeResult({
        coffeeGrams: 9,
        milkType: 'none',
        category: 'extra',
        isExtra: true,
        aiExplanation:
          'IA: Shot adicional de espresso simple (9g in). Sin costo de vaso ni extras.',
        rawRecipeText: '1 shot espresso (9g in)',
      });
    }
    if (norm.includes('leche') || norm.includes('almendra') || norm.includes('vegetal')) {
      return makeResult({
        milkMl: 180,
        milkType: 'plant',
        category: 'extra',
        isExtra: true,
        aiExplanation:
          'IA: Cambio a leche vegetal de almendras (180ml). Costo diferencial sobre leche común.',
        rawRecipeText: '180ml leche vegetal (diferencial)',
      });
    }
    if (norm.includes('crema') || norm.includes('chantilly')) {
      return makeResult({
        whippedCreamGrams: 35,
        milkType: 'none',
        category: 'extra',
        isExtra: true,
        aiExplanation: 'IA: Copete adicional de crema chantilly montada con sifón (~35g).',
        rawRecipeText: '35g crema chantilly',
      });
    }
    return makeResult({
      milkType: 'none',
      category: 'extra',
      isExtra: true,
      aiExplanation: 'IA: Adicional de barra sin insumos configurados.',
      rawRecipeText: 'Adicional de barra',
    });
  }

  // 3. SMOOTHIES Y LICUADOS DE FRUTA NATURAL
  if (norm.includes('smoothie') || norm.includes('licuado') || catNorm.includes('smoothie')) {
    let detectedFlavor = 'promedio';
    if (norm.includes('frutilla') && norm.includes('naranja')) detectedFlavor = 'frutilla_naranja';
    else if (norm.includes('frutilla')) detectedFlavor = 'frutilla';
    else if (norm.includes('frutos') || norm.includes('bosque') || norm.includes('berry'))
      detectedFlavor = 'frutos_del_bosque';
    else if (norm.includes('mango') || norm.includes('maracuya')) detectedFlavor = 'mango_maracuya';

    const is16 = size.includes('16oz') || size === '16';
    const pulpaGrams = is16 ? 130 : 95;
    const iceGrams = is16 ? 200 : 150;
    const waterGrams = is16 ? 170 : 125;

    const baseFlavorCost = (() => {
      const list = config?.smoothieFlavors || DEFAULT_CONFIG.smoothieFlavors;
      if (detectedFlavor !== 'promedio' && Array.isArray(list)) {
        const found = list.find((f) => f.id === detectedFlavor);
        if (found) {
          const rate = getUnitCost(found.price, found.qty, found.unit);
          const u = (found.unit || '').toLowerCase().trim();
          if (u === 'kg' || u === 'g') {
            return Math.round(rate * pulpaGrams);
          }
          return Math.round(is16 ? rate * 1.37 : rate);
        }
      }
      return Math.round(is16 ? 1400 * 1.37 : 1400);
    })();

    const finalCost = baseFlavorCost;
    const flavorTitle =
      detectedFlavor === 'promedio' ? 'Frutos del Bosque' : detectedFlavor.replace(/_/g, ' ');

    return makeResult({
      milkType: 'none',
      isSmoothie: true,
      smoothieFlavor: detectedFlavor,
      smoothieCost: finalCost,
      pulpaGrams,
      iceGrams,
      waterGrams,
      cupType: 'milkshake',
      isCold: true,
      aiExplanation: `IA: Smoothie ${flavorTitle} (${pulpaGrams}g pulpa + ${iceGrams}g hielo + ${waterGrams}ml agua). Licuar 1 min. Vaso milkshake con tapa domo.`,
      rawRecipeText: `${pulpaGrams}g pulpa • ${iceGrams}g hielo • ${waterGrams}ml agua`,
    });
  }

  // 4. MILKSHAKE / BATIDO DE HELADO
  if (norm.includes('milkshake') || norm.includes('batido')) {
    const is16 = size.includes('16oz') || size === '16';
    const iceCream = is16 ? 180 : 120; // 180g (~3 bochas) vs 120g (~2 bochas)
    const milk = is16 ? 160 : 120;
    const sauce = is16 ? 35 : 25;
    const sFlavor = norm.includes('dulce')
      ? 'dulce_de_leche'
      : norm.includes('caramel')
        ? 'caramelo'
        : 'chocolate';
    const bochasHint = is16 ? '3 bochas' : '2 bochas';

    return makeResult({
      coffeeGrams: 0, // ¡Milkshake no lleva café!
      iceCreamGrams: iceCream,
      milkMl: milk,
      milkType: 'regular',
      sauceGrams: sauce,
      sauceFlavor: sFlavor,
      cupType: 'milkshake',
      isCold: true,
      aiExplanation: `IA: Milkshake artesanal (${iceCream}g helado [~${bochasHint}] + ${milk}ml leche + ${sauce}g salsa ${sFlavor} en vaso milkshake).`,
      rawRecipeText: `${iceCream}g helado • ${milk}ml leche • ${sauce}g salsa ${sFlavor} • vaso milkshake`,
    });
  }

  // 5. CHOCOLATE CALIENTE / SUBMARINO
  if (
    norm.includes('chocolate caliente') ||
    norm.includes('submarino') ||
    norm.includes('chocolatada') ||
    (norm.includes('chocolate') &&
      !norm.includes('mocha') &&
      !norm.includes('mocca') &&
      !norm.includes('cookie') &&
      !norm.includes('pan de chocolate'))
  ) {
    let milk = 260;
    let cocoa = 24;
    let spoonHint = '3 cdas rasas';
    if (size.includes('8oz') || size === '8') {
      milk = 180;
      cocoa = 17;
      spoonHint = '2 cdas rasas';
    } else if (size.includes('16oz') || size === '16') {
      milk = 340;
      cocoa = 32;
      spoonHint = '4 cdas rasas';
    }

    return makeResult({
      coffeeGrams: 0,
      milkMl: milk,
      milkType: 'regular',
      cocoaGrams: cocoa,
      sauceGrams: 0,
      sauceFlavor: 'chocolate',
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Chocolate Caliente artesanal (${milk}ml leche vaporizada + ${cocoa}g cacao en polvo - ${spoonHint}).`,
      rawRecipeText: `${milk}ml leche • ${cocoa}g cacao`,
    });
  }

  // 6. CAFETERÍA FRÍA / ICED DRINKS (Iced Latte, Iced Caramel, Iced Mocca, Iced Matcha, Iced Americano, etc.)
  const isIcedDrink =
    !norm.includes('frappe') &&
    catNorm !== 'frappe' &&
    !norm.includes('smoothie') &&
    catNorm !== 'smoothie' &&
    !norm.includes('milkshake') &&
    !norm.includes('batido') &&
    (norm.includes('iced') ||
      norm.includes('cold') ||
      catNorm === 'cold' ||
      catNorm === 'frio' ||
      norm.includes('frio') ||
      norm.includes('ice'));

  if (isIcedDrink) {
    const is16 = size.includes('16oz') || size === '16';
    const ice = is16 ? 180 : 140;

    // 6a. ICED MATCHA LATTE (Syrup de Matcha, sin café)
    if (norm.includes('matcha')) {
      const milk = is16 ? 240 : 180;
      const syrup = is16 ? 25 : 20; // 20ml (12oz) / 25ml (16oz) syrup de matcha
      return makeResult({
        coffeeGrams: 0,
        matchaGrams: 0,
        milkMl: milk,
        milkType: 'regular',
        iceGrams: ice,
        whippedCreamGrams: 0,
        sauceGrams: 0,
        syrupMl: syrup,
        syrupFlavor: 'matcha',
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA: Iced Matcha Latte (${syrup}ml syrup de matcha + ${milk}ml leche fría sobre ${ice}g cubos de hielo en vaso domo. Sin café).`,
        rawRecipeText: `${syrup}ml syrup matcha • ${milk}ml leche fría • ${ice}g hielo • vaso domo`,
      });
    }

    // 6b. ICED MOCCA BLANCO
    if ((norm.includes('mocca') || norm.includes('mocha')) && norm.includes('blanco')) {
      const whiteChocSyrup = config?.syrupFlavors?.find(
        (f) => f.name?.toLowerCase().includes('blanco') || f.id?.toLowerCase().includes('blanco')
      );
      const syrupFlavor = whiteChocSyrup ? whiteChocSyrup.id : 'syrup_1790365033640';
      const syrup = is16 ? 35 : 25;
      const milk = is16 ? 200 : 150;
      return makeResult({
        coffeeGrams: 18,
        milkMl: milk,
        milkType: 'regular',
        iceGrams: ice,
        whippedCreamGrams: 0,
        sauceGrams: 0,
        sauceFlavor: 'chocolate',
        syrupMl: syrup,
        syrupFlavor,
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA: Iced Mocca Blanco (doble espresso 18g + ${syrup}ml syrup ${getSyrupName(syrupFlavor, config).toLowerCase()} + ${milk}ml leche fría vertida sobre ${ice}g hielo en vaso domo).`,
        rawRecipeText: `18g café (doble shot) • ${syrup}ml syrup ${getSyrupName(syrupFlavor, config).toLowerCase()} • ${milk}ml leche fría • ${ice}g hielo • vaso domo`,
      });
    }

    // 6c. ICED MOCCA / ICED MOCHA
    if (norm.includes('mocca') || norm.includes('mocha')) {
      const sauce = is16 ? 10 : 8;
      const syrup = is16 ? 35 : 25;
      const milk = is16 ? 200 : 150;
      const chocSyrup =
        config?.syrupFlavors?.find(
          (f) =>
            !f.name?.toLowerCase().includes('blanco') &&
            !f.id?.toLowerCase().includes('blanco') &&
            (f.name?.toLowerCase().includes('chocolate') ||
              f.id?.toLowerCase().includes('chocolate') ||
              f.id === 'syrup_1790365018338')
        )?.id || 'syrup_1790365018338';
      const chocSauce =
        config?.sauceFlavors?.find(
          (f) =>
            f.name?.toLowerCase().includes('chocolate') || f.id?.toLowerCase().includes('chocolate')
        )?.id || 'chocolate';
      const sauceFlavor = chocSauce;
      return makeResult({
        coffeeGrams: 18,
        milkMl: milk,
        milkType: 'regular',
        iceGrams: ice,
        whippedCreamGrams: 0,
        sauceGrams: sauce,
        sauceFlavor,
        syrupMl: syrup,
        syrupFlavor: chocSyrup,
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA: Iced Mocca Latte (doble espresso 18g, ${syrup}ml syrup chocolate, ${milk}ml leche fría, ${sauce}g salsa chocolate para decorar y ${ice}g hielo en vaso domo).`,
        rawRecipeText: `18g café (doble shot) • ${syrup}ml syrup ${getSyrupName(chocSyrup, config).toLowerCase()} • ${sauce}g salsa ${getSauceName(sauceFlavor, config).toLowerCase()} • ${milk}ml leche fría • ${ice}g hielo • vaso domo`,
      });
    }

    // 6c. ICED CARAMEL LATTE
    if (norm.includes('caramel')) {
      const sauce = is16 ? 15 : 10;
      const syrup = is16 ? 20 : 15;
      const milk = is16 ? 210 : 160;
      return makeResult({
        coffeeGrams: 18,
        milkMl: milk,
        milkType: 'regular',
        iceGrams: ice,
        whippedCreamGrams: 0,
        sauceGrams: sauce,
        sauceFlavor: 'caramelo',
        syrupMl: syrup,
        syrupFlavor: 'caramelo',
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA: Iced Caramel Latte (doble espresso 18g + ${milk}ml leche fría + ${syrup}ml syrup caramelo + ${sauce}g salsa caramelo sobre ${ice}g hielo en vaso domo).`,
        rawRecipeText: `18g café (doble shot) • ${syrup}ml syrup caramelo • ${sauce}g salsa caramelo • ${milk}ml leche • ${ice}g hielo • vaso domo`,
      });
    }

    // 6d. ICED AMERICANO
    if (norm.includes('americano') || norm.includes('black') || norm.includes('negro')) {
      const water = is16 ? 220 : 160;
      return makeResult({
        coffeeGrams: 18,
        milkMl: 0,
        milkType: 'none',
        iceGrams: ice,
        waterGrams: water,
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA: Iced Americano (doble espresso 18g + ${water}ml agua fría sobre ${ice}g cubos de hielo en vaso domo).`,
        rawRecipeText: `18g café (doble shot) • ${water}ml agua fría • ${ice}g hielo • vaso domo`,
      });
    }

    // 6e. ICED LATTE ESTÁNDAR
    const milk = is16 ? 240 : 180;
    const syrup = is16 ? 20 : 15;
    const sugarSyrup = config?.syrupFlavors?.find(
      (f) =>
        f.name
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes('azucar') || f.id?.includes('azucar')
    );
    const syrupFlavor = sugarSyrup ? sugarSyrup.id : 'syrup_1790392238949';
    return makeResult({
      coffeeGrams: 18,
      milkMl: milk,
      milkType: 'regular',
      iceGrams: ice,
      whippedCreamGrams: 0,
      sauceGrams: 0,
      syrupMl: syrup,
      syrupFlavor,
      cupType: 'milkshake',
      isCold: true,
      aiExplanation: `IA: Iced Latte (doble espresso 18g + ${syrup}ml syrup ${getSyrupName(syrupFlavor, config).toLowerCase()} + ${milk}ml leche fría vertida sobre ${ice}g cubos de hielo en vaso domo).`,
      rawRecipeText: `18g café (doble shot) • ${syrup}ml syrup ${getSyrupName(syrupFlavor, config).toLowerCase()} • ${milk}ml leche fría • ${ice}g hielo • vaso domo`,
    });
  }

  // 7. FRAPPÉS LICUADOS
  const isFrappe = catNorm === 'frappe' || norm.includes('frappe');

  if (isFrappe) {
    const is16 = size.includes('16oz') || size === '16';
    let coffee = norm.includes('sin cafe') ? 0 : 18;
    let milk = is16 ? 110 : 90;
    let ice = is16 ? 200 : 150;
    let sauce = 0;
    let syrup = 0;
    let syrup2 = 0;
    let syrup3 = 0;
    let cream = is16 ? 40 : 30;
    let sauceFlavor = 'chocolate';
    let syrupFlavor = 'vainilla';
    let syrup2Flavor = '';
    let syrup3Flavor = '';

    const sugarSyrup = config?.syrupFlavors?.find(
      (f) =>
        f.name
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes('azucar') || f.id?.includes('azucar')
    );
    const sugarSyrupId = sugarSyrup ? sugarSyrup.id : 'syrup_1790392238949';

    if (norm.includes('dulce') || norm.includes('ddl')) {
      const ddlSauce = config?.sauceFlavors?.find(
        (f) => f.name?.toLowerCase().includes('dulce') || f.id?.toLowerCase().includes('dulce')
      );
      const ddlSyrup = config?.syrupFlavors?.find(
        (f) => f.name?.toLowerCase().includes('dulce') || f.id?.toLowerCase().includes('dulce')
      );
      const vainillaSyrup = config?.syrupFlavors?.find(
        (f) =>
          f.name?.toLowerCase().includes('vainilla') || f.id?.toLowerCase().includes('vainilla')
      );
      sauceFlavor = ddlSauce ? ddlSauce.id : 'dulce_de_leche';
      sauce = is16 ? 30 : 20;
      syrupFlavor = ddlSyrup ? ddlSyrup.id : 'syrup_ddl';
      syrup = is16 ? 25 : 20;
      syrup2Flavor = vainillaSyrup ? vainillaSyrup.id : 'vainilla';
      syrup2 = is16 ? 15 : 10;
      syrup3Flavor = sugarSyrupId;
      syrup3 = is16 ? 10 : 5;
    } else if (
      norm.includes('mocca blanco') ||
      norm.includes('mocha blanco') ||
      norm.includes('blanco')
    ) {
      const whiteChocSyrup = config?.syrupFlavors?.find(
        (f) => f.name?.toLowerCase().includes('blanco') || f.id?.toLowerCase().includes('blanco')
      );
      syrupFlavor = whiteChocSyrup ? whiteChocSyrup.id : 'syrup_1790365033640';
      syrup = is16 ? 35 : 25;
      sauce = 0;
      sauceFlavor = 'chocolate';
      syrup2Flavor = sugarSyrupId;
      syrup2 = is16 ? 15 : 10;
    } else if (norm.includes('pistacho') || norm.includes('pistachio')) {
      const pistachoSauce = config?.sauceFlavors?.find(
        (f) =>
          f.name?.toLowerCase().includes('pistacho') || f.id?.toLowerCase().includes('pistacho')
      );
      const pistachoSyrup = config?.syrupFlavors?.find(
        (f) =>
          f.name?.toLowerCase().includes('pistacho') || f.id?.toLowerCase().includes('pistacho')
      );
      sauceFlavor = pistachoSauce ? pistachoSauce.id : 'sauce_1790364787081';
      syrupFlavor = pistachoSyrup ? pistachoSyrup.id : 'pistacho';
      sauce = is16 ? 25 : 20;
      syrup = is16 ? 20 : 15;
      syrup2Flavor = sugarSyrupId;
      syrup2 = is16 ? 15 : 10;
    } else if (norm.includes('caramel')) {
      const caramelSauce = config?.sauceFlavors?.find(
        (f) => f.name?.toLowerCase().includes('caramel') || f.id?.toLowerCase().includes('caramel')
      );
      const caramelSyrup = config?.syrupFlavors?.find(
        (f) => f.name?.toLowerCase().includes('caramel') || f.id?.toLowerCase().includes('caramel')
      );
      sauceFlavor = caramelSauce ? caramelSauce.id : 'caramelo';
      syrupFlavor = caramelSyrup ? caramelSyrup.id : 'caramelo';
      sauce = is16 ? 30 : 20;
      syrup = is16 ? 20 : 15;
      syrup2Flavor = sugarSyrupId;
      syrup2 = is16 ? 15 : 10;
    } else if (norm.includes('mocca') || norm.includes('mocha')) {
      const chocSyrup =
        config?.syrupFlavors?.find(
          (f) =>
            !f.name?.toLowerCase().includes('blanco') &&
            !f.id?.toLowerCase().includes('blanco') &&
            (f.name?.toLowerCase().includes('chocolate') ||
              f.id?.toLowerCase().includes('chocolate') ||
              f.id === 'syrup_1790365018338')
        )?.id || 'syrup_1790365018338';
      const chocSauce =
        config?.sauceFlavors?.find(
          (f) =>
            f.name?.toLowerCase().includes('chocolate') || f.id?.toLowerCase().includes('chocolate')
        )?.id || 'chocolate';
      sauceFlavor = chocSauce;
      sauce = is16 ? 10 : 8;
      syrupFlavor = chocSyrup;
      syrup = is16 ? 25 : 20;
      syrup2Flavor = sugarSyrupId;
    } else if (norm.includes('oreo') || norm.includes('cookie') || norm.includes('galletita')) {
      const chocSauce =
        config?.sauceFlavors?.find(
          (f) => f.name?.toLowerCase().includes('chocolate') || f.id === 'chocolate'
        )?.id || 'chocolate';
      const vanSyrup =
        config?.syrupFlavors?.find(
          (f) => f.name?.toLowerCase().includes('vainilla') || f.id === 'vainilla'
        )?.id || 'vainilla';
      sauceFlavor = chocSauce;
      sauce = is16 ? 20 : 15;
      syrupFlavor = vanSyrup;
      syrup = is16 ? 20 : 15;
      syrup2Flavor = sugarSyrupId;
      syrup2 = is16 ? 10 : 5;
      cream = is16 ? 40 : 30;
    } else if (norm.includes('frutos') || norm.includes('berry')) {
      sauceFlavor = 'frutos_rojos';
      syrupFlavor = sugarSyrupId;
      sauce = is16 ? 30 : 20;
      syrup = is16 ? 20 : 15;
    }

    const isOreoItem = norm.includes('oreo') || norm.includes('cookie');
    const cookiesText = isOreoItem
      ? is16
        ? ' • 2.5 galletas Oreo (trituradas)'
        : ' • 2 galletas Oreo (trituradas)'
      : '';
    const cookiesExpl = isOreoItem
      ? is16
        ? ', 2.5 galletas Oreo trituradas'
        : ', 2 galletas Oreo trituradas'
      : '';
    const creamText = cream > 0 ? ` • ${cream}g crema chantilly` : '';
    const sauceText =
      sauce > 0 ? ` • ${sauce}g salsa ${getSauceName(sauceFlavor, config).toLowerCase()}` : '';
    const syrupText =
      syrup > 0 ? ` • ${syrup}ml syrup ${getSyrupName(syrupFlavor, config).toLowerCase()}` : '';
    const syrup2Text =
      syrup2 > 0 ? ` • ${syrup2}ml syrup ${getSyrupName(syrup2Flavor, config).toLowerCase()}` : '';
    const syrup3Text =
      syrup3 > 0 ? ` • ${syrup3}ml syrup ${getSyrupName(syrup3Flavor, config).toLowerCase()}` : '';
    const syrupExpl =
      syrup > 0 ? `, ${syrup}ml syrup ${getSyrupName(syrupFlavor, config).toLowerCase()}` : '';
    const syrup2Expl =
      syrup2 > 0 ? `, ${syrup2}ml syrup ${getSyrupName(syrup2Flavor, config).toLowerCase()}` : '';
    const syrup3Expl =
      syrup3 > 0 ? `, ${syrup3}ml syrup ${getSyrupName(syrup3Flavor, config).toLowerCase()}` : '';

    return makeResult({
      coffeeGrams: coffee,
      milkMl: milk,
      milkType: 'regular',
      iceGrams: ice,
      whippedCreamGrams: cream,
      oreoUnits: isOreoItem ? (is16 ? 2.5 : 2) : 0,
      oreoGrams: isOreoItem ? (is16 ? 27.5 : 22) : 0,
      sauceGrams: sauce,
      sauceFlavor,
      syrupMl: syrup,
      syrupFlavor,
      syrup2Ml: syrup2,
      syrup2Flavor,
      syrup3Ml: syrup3,
      syrup3Flavor,
      cupType: 'milkshake',
      isCold: true,
      aiExplanation: `IA: Frappé frío licuado (${coffee}g café, ${milk}ml leche, ${ice}g hielo${cookiesExpl}${cream > 0 ? `, ${cream}g crema chantilly` : ''}${sauce > 0 ? `, ${sauce}g salsa ${getSauceName(sauceFlavor, config).toLowerCase()}` : ''}${syrupExpl}${syrup2Expl}${syrup3Expl}, vaso domo).`,
      rawRecipeText: `${coffee}g café • ${milk}ml leche • ${ice}g hielo${cookiesText}${creamText}${sauceText}${syrupText}${syrup2Text}${syrup3Text} • vaso milkshake`,
    });
  }

  // 7. BEBIDAS CALIENTES DE CAFETERÍA CLÁSICA
  // 7a. ESPRESSO PURO (Simple o Doble)
  if (
    norm.includes('espresso simple') ||
    norm.includes('ristretto') ||
    (norm.includes('espresso') &&
      !norm.includes('doble') &&
      !norm.includes('americano') &&
      !norm.includes('latte') &&
      !norm.includes('macchiato'))
  ) {
    return makeResult({
      coffeeGrams: 9,
      milkType: 'none',
      cupType: 'hot',
      isCold: false,
      aiExplanation: 'IA: 1 shot de espresso simple calibrado (9g café en grano).',
      rawRecipeText: '1 shot espresso (9g in)',
    });
  }
  if (norm.includes('espresso doble')) {
    return makeResult({
      coffeeGrams: 18,
      milkType: 'none',
      cupType: 'hot',
      isCold: false,
      aiExplanation: 'IA: 2 shots de espresso doble calibrado (18g café en grano).',
      rawRecipeText: '2 shots espresso doble (18g in)',
    });
  }

  // 7b. AMERICANO / LONG BLACK
  if (norm.includes('americano') || norm.includes('long black')) {
    const coffee = size.includes('8oz') || size === '8' ? 9 : 18;
    return makeResult({
      coffeeGrams: coffee,
      milkType: 'none',
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Café Americano (${coffee}g café + agua caliente filtrada, sin leche).`,
      rawRecipeText: `${coffee}g café + agua caliente`,
    });
  }

  // 7c. CORTADO / PICCOLO
  if (
    norm.includes('cortado') ||
    norm.includes('piccolo') ||
    (norm.includes('macchiato') && !norm.includes('caramel'))
  ) {
    let milk = 120;
    if (size.includes('8oz') || size === '8') milk = 70;
    else if (size.includes('16oz') || size === '16') milk = 180;
    return makeResult({
      coffeeGrams: 18,
      milkMl: milk,
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Cortado de especialidad (18g café doble + ${milk}ml leche).`,
      rawRecipeText: `18g café • ${milk}ml leche`,
    });
  }

  // 7d. FLAT WHITE
  if (norm.includes('flat white')) {
    let milk = 200;
    if (size.includes('8oz') || size === '8') milk = 120;
    else if (size.includes('16oz') || size === '16') milk = 280;
    return makeResult({
      coffeeGrams: 18,
      milkMl: milk,
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Flat White con doble shot ristretto (18g café + ${milk}ml microespuma sedosa).`,
      rawRecipeText: `18g café • ${milk}ml leche sedosa`,
    });
  }

  // 7e. CAPPUCCINO
  if (norm.includes('cappuccino') || norm.includes('capuchino')) {
    let milk = 180;
    if (size.includes('8oz') || size === '8') milk = 120;
    else if (size.includes('16oz') || size === '16') milk = 240;
    return makeResult({
      coffeeGrams: 18,
      milkMl: milk,
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Cappuccino tradicional (18g café + ${milk}ml leche con espuma cremosa).`,
      rawRecipeText: `18g café • ${milk}ml leche cremosa`,
    });
  }

  // 7f. CARAMEL MACCHIATO
  if (
    norm.includes('caramel macchiato') ||
    (norm.includes('caramel') && norm.includes('macchiato'))
  ) {
    let milk = 210;
    let sauce = 15;
    let syrup = 20;
    if (size.includes('8oz') || size === '8') {
      milk = 140;
      sauce = 10;
      syrup = 15;
    } else if (size.includes('16oz') || size === '16') {
      milk = 280;
      sauce = 20;
      syrup = 25;
    }
    const sSauce =
      config?.sauceFlavors?.find(
        (f) => f.name?.toLowerCase().includes('caramel') || f.id?.toLowerCase().includes('caramel')
      )?.id || 'caramelo';
    const sSyrup =
      config?.syrupFlavors?.find(
        (f) =>
          f.name?.toLowerCase().includes('vainilla') || f.id?.toLowerCase().includes('vainilla')
      )?.id || 'vainilla';
    return makeResult({
      coffeeGrams: 18,
      milkMl: milk,
      sauceGrams: sauce,
      sauceFlavor: sSauce,
      syrupMl: syrup,
      syrupFlavor: sSyrup,
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Caramel Macchiato clásico (18g café, ${milk}ml leche, ${sauce}g salsa ${getSauceName(sSauce, config).toLowerCase()} y ${syrup}ml syrup ${getSyrupName(sSyrup, config).toLowerCase()}).`,
      rawRecipeText: `18g café • ${milk}ml leche • ${sauce}g salsa ${getSauceName(sSauce, config).toLowerCase()} • ${syrup}ml syrup ${getSyrupName(sSyrup, config).toLowerCase()}`,
    });
  }

  // 7g. MOCCA BLANCO
  if (
    norm.includes('mocca blanco') ||
    norm.includes('mocha blanco') ||
    (norm.includes('mocca') && norm.includes('blanco'))
  ) {
    let milk = 210;
    let syrup = 30;
    if (size.includes('8oz') || size === '8') {
      milk = 140;
      syrup = 20;
    } else if (size.includes('16oz') || size === '16') {
      milk = 280;
      syrup = 40;
    }
    const whiteChocSyrup =
      config?.syrupFlavors?.find(
        (f) => f.name?.toLowerCase().includes('blanco') || f.id?.toLowerCase().includes('blanco')
      )?.id || 'syrup_1790365033640';
    return makeResult({
      coffeeGrams: 18,
      milkMl: milk,
      sauceGrams: 0,
      sauceFlavor: 'chocolate',
      syrupMl: syrup,
      syrupFlavor: whiteChocSyrup,
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Mocca Blanco caliente (18g café, ${milk}ml leche y ${syrup}ml syrup ${getSyrupName(whiteChocSyrup, config).toLowerCase()}).`,
      rawRecipeText: `18g café • ${milk}ml leche • ${syrup}ml syrup ${getSyrupName(whiteChocSyrup, config).toLowerCase()}`,
    });
  }

  // 7h. MOCCA / MOCHACCINO
  if (norm.includes('mocca') || norm.includes('mocha') || norm.includes('mocaccino')) {
    let milk = 210;
    let syrup = 30;
    let sauce = 8;
    if (size.includes('8oz') || size === '8') {
      milk = 140;
      syrup = 20;
      sauce = 5;
    } else if (size.includes('16oz') || size === '16') {
      milk = 280;
      syrup = 40;
      sauce = 10;
    }
    const chocSyrup =
      config?.syrupFlavors?.find(
        (f) =>
          !f.name?.toLowerCase().includes('blanco') &&
          !f.id?.toLowerCase().includes('blanco') &&
          (f.name?.toLowerCase().includes('chocolate') ||
            f.id?.toLowerCase().includes('chocolate') ||
            f.id === 'syrup_1790365018338')
      )?.id || 'syrup_1790365018338';
    const chocSauce =
      config?.sauceFlavors?.find(
        (f) =>
          f.name?.toLowerCase().includes('chocolate') || f.id?.toLowerCase().includes('chocolate')
      )?.id || 'chocolate';
    return makeResult({
      coffeeGrams: 18,
      milkMl: milk,
      sauceGrams: sauce,
      sauceFlavor: chocSauce,
      syrupMl: syrup,
      syrupFlavor: chocSyrup,
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Caffè Mocca (18g café doble, ${milk}ml leche, ${syrup}ml syrup chocolate y ${sauce}g salsa chocolate para decorar el vaso).`,
      rawRecipeText: `18g café • ${milk}ml leche • ${syrup}ml syrup ${getSyrupName(chocSyrup, config).toLowerCase()} • ${sauce}g salsa ${getSauceName(chocSauce, config).toLowerCase()}`,
    });
  }

  // 7i. LÁGRIMA
  if (norm.includes('lagrima')) {
    let coffee = 9;
    let milk = 270;
    if (size.includes('8oz') || size === '8') {
      milk = 180;
    } else if (size.includes('16oz') || size === '16') {
      milk = 350;
    }
    return makeResult({
      coffeeGrams: coffee,
      milkMl: milk,
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Lágrima suave (toque de café 9g + abundante leche ${milk}ml).`,
      rawRecipeText: `9g café • ${milk}ml leche`,
    });
  }

  // 7j. LATTE / CAFÉ CON LECHE
  if (norm.includes('latte') || norm.includes('cafe con leche')) {
    let coffee = 18;
    let milk = 220;
    if (size.includes('8oz') || size === '8') {
      coffee = 9; // 1 shot espresso en 8oz
      milk = 150;
    } else if (size.includes('16oz') || size === '16') {
      coffee = 18;
      milk = 300;
    }
    return makeResult({
      coffeeGrams: coffee,
      milkMl: milk,
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Caffè Latte tradicional (${coffee}g café + ${milk}ml leche texturizada sedosa).`,
      rawRecipeText: `${coffee}g café • ${milk}ml leche texturizada`,
    });
  }

  // 7k. CAFÉ VIENÉS / CAFÉ CON CREMA
  if (norm.includes('vienes') || (norm.includes('cafe') && norm.includes('crema'))) {
    const is16 = size.includes('16oz') || size === '16';
    const coffee = is16 ? 18 : 9;
    const cream = is16 ? 45 : 35;
    return makeResult({
      coffeeGrams: coffee,
      milkMl: 0,
      milkType: 'none',
      whippedCreamGrams: cream,
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Café Vienés (${coffee}g café espresso cubierto con ${cream}g de crema chantilly montada con sifón).`,
      rawRecipeText: `${coffee}g café • ${cream}g crema chantilly`,
    });
  }

  // 7l. INFUSIONES / TÉ
  if (norm.includes('te') || norm.includes('infusion') || norm.includes('mate')) {
    const hasMilk = norm.includes('leche');
    const milk = hasMilk ? (size.includes('16oz') ? 100 : 60) : 0;
    return makeResult({
      milkMl: milk,
      milkType: hasMilk ? 'regular' : 'none',
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA: Infusión en saquito/hebras${hasMilk ? ` con ${milk}ml leche` : ''}.`,
      rawRecipeText: hasMilk ? `${milk}ml leche + té` : 'Infusión en saquito',
    });
  }

  // 8. FALLBACK INTELIGENTE SEGÚN TAMAÑO
  let defaultCoffee = 18;
  let defaultMilk = 200;
  if (size.includes('8oz') || size === '8') {
    defaultCoffee = 9;
    defaultMilk = 150;
  } else if (size.includes('16oz') || size === '16') {
    defaultCoffee = 18;
    defaultMilk = 300;
  }

  return makeResult({
    coffeeGrams: defaultCoffee,
    milkMl: defaultMilk,
    cupType: 'hot',
    isCold: false,
    aiExplanation: `IA: Bebida estándar de cafetería (${defaultCoffee}g café + ${defaultMilk}ml leche).`,
    rawRecipeText: `${defaultCoffee}g café • ${defaultMilk}ml leche`,
  });
}

// Alias de retrocompatibilidad
export function guessDefaultRecipe(
  name = '',
  sizeKey = '',
  category = '',
  config = DEFAULT_CONFIG
) {
  return detectAiRecipe(name, sizeKey, category, config);
}

// Parsea los campos de receta cargados en PocketBase (recipe8oz, recipe12oz, recipe16oz)
export function parsePocketBaseRecipe(
  recipeStr,
  name = '',
  sizeKey = '',
  category = '',
  config = DEFAULT_CONFIG
) {
  const norm = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const catNorm = (category || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Smoothies y licuados con proporciones
  if (isSmoothieItem(null, category, name)) {
    const smoothieGuess = detectAiRecipe(name, sizeKey, category, config);
    if (recipeStr && typeof recipeStr === 'string' && recipeStr.trim()) {
      const pMatch = recipeStr.match(/(\d+)\s*(?:g|gr)?\s*pulpa/i);
      const iMatch = recipeStr.match(/(\d+)\s*(?:g|gr)?\s*hielo/i);
      const wMatch = recipeStr.match(/(\d+)\s*(?:ml|g|gr)?\s*agua/i);
      if (pMatch) smoothieGuess.pulpaGrams = parseInt(pMatch[1], 10);
      if (iMatch) smoothieGuess.iceGrams = parseInt(iMatch[1], 10);
      if (wMatch) smoothieGuess.waterGrams = parseInt(wMatch[1], 10);
    }
    return smoothieGuess;
  }

  // Milkshakes y batidos de helado
  if (norm.includes('milkshake') || norm.includes('batido')) {
    const milkshakeGuess = detectAiRecipe(name, sizeKey, category, config);
    if (recipeStr && typeof recipeStr === 'string' && recipeStr.trim()) {
      const hMatch = recipeStr.match(/(\d+)\s*(?:g|gr)?\s*helado/i);
      const mMatch = recipeStr.match(/(\d+)\s*(?:ml)?\s*leche/i);
      const sMatch = recipeStr.match(/(\d+)\s*(?:g|gr)?\s*salsa/i);
      if (hMatch) milkshakeGuess.iceCreamGrams = parseInt(hMatch[1], 10);
      if (mMatch) milkshakeGuess.milkMl = parseInt(mMatch[1], 10);
      if (sMatch) milkshakeGuess.sauceGrams = parseInt(sMatch[1], 10);
    }
    return milkshakeGuess;
  }

  // Frappés con proporciones y crema chantilly
  if (norm.includes('frappe') || catNorm.includes('frappe')) {
    const frappeGuess = detectAiRecipe(name, sizeKey, category, config);
    if (recipeStr && typeof recipeStr === 'string' && recipeStr.trim()) {
      const cMatch = recipeStr.match(/(\d+)\s*(?:g|gr)?\s*cafe/i);
      const mMatch = recipeStr.match(/(\d+)\s*(?:ml)?\s*leche/i);
      const iMatch = recipeStr.match(/(\d+)\s*(?:g|gr)?\s*hielo/i);
      const crMatch = recipeStr.match(/(\d+)\s*(?:g|gr)?\s*crema/i);
      const sMatch = recipeStr.match(/(\d+)\s*(?:g|gr)?\s*salsa/i);
      const syMatch = recipeStr.match(/(\d+)\s*(?:ml)?\s*syrup/i);
      if (cMatch) frappeGuess.coffeeGrams = parseInt(cMatch[1], 10);
      if (mMatch) frappeGuess.milkMl = parseInt(mMatch[1], 10);
      if (iMatch) frappeGuess.iceGrams = parseInt(iMatch[1], 10);
      if (crMatch) frappeGuess.whippedCreamGrams = parseInt(crMatch[1], 10);
      if (sMatch) frappeGuess.sauceGrams = parseInt(sMatch[1], 10);
      if (syMatch) frappeGuess.syrupMl = parseInt(syMatch[1], 10);
    }
    return frappeGuess;
  }

  // Pastelería y chocolates sin café
  if (
    norm.includes('chocolate caliente') ||
    norm.includes('submarino') ||
    norm.includes('chocolatada') ||
    catNorm.includes('pasteler') ||
    norm.includes('pasteleria') ||
    norm.includes('torta') ||
    norm.includes('cookie') ||
    norm.includes('medialuna') ||
    norm.includes('chipa') ||
    norm.includes('croissant') ||
    norm.includes('roll') ||
    norm.includes('budin') ||
    norm.includes('tostado') ||
    norm.includes('pan de chocolate') ||
    norm.includes('alfajor') ||
    norm.includes('muffin') ||
    norm.includes('scon') ||
    norm.includes('sandwich') ||
    norm.includes('cheesecake')
  ) {
    return detectAiRecipe(name, sizeKey, category, config);
  }

  let cleanRecipeText = recipeStr;
  if (!cleanRecipeText || typeof cleanRecipeText !== 'string' || !cleanRecipeText.trim()) {
    return detectAiRecipe(name, sizeKey, category, config);
  }

  // Si tenemos texto de receta, lo parseamos respetando las cantidades de barista
  const baseGuess = detectAiRecipe(name, sizeKey, category, config);
  let coffeeGrams = baseGuess.coffeeGrams;
  let milkMl = baseGuess.milkMl;
  let milkType = baseGuess.milkType;
  let syrupMl = baseGuess.syrupMl || 0;
  let syrupFlavor = baseGuess.syrupFlavor || 'vainilla';
  let syrup2Ml = baseGuess.syrup2Ml || 0;
  let syrup2Flavor = baseGuess.syrup2Flavor || '';
  let syrup3Ml = baseGuess.syrup3Ml || 0;
  let syrup3Flavor = baseGuess.syrup3Flavor || '';
  let sauceGrams = baseGuess.sauceGrams || 0;
  let sauceFlavor = baseGuess.sauceFlavor || 'chocolate';
  let whippedCreamGrams = baseGuess.whippedCreamGrams || 0;
  let chocolateCost = baseGuess.chocolateCost || 0;
  let iceGrams = baseGuess.iceGrams || 0;

  const cleanLines = cleanRecipeText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  cleanLines.forEach((line) => {
    const l = line.toLowerCase();

    // Detección precisa de café (espresso en ml, gramos o shots)
    const espMlMatch = l.match(/espresso\s*:\s*(\d+)\s*ml/);
    const gMatch = l.match(/(\d+)\s*(?:g|gr)\b/);
    if (espMlMatch) {
      const mlVal = parseInt(espMlMatch[1], 10);
      coffeeGrams = mlVal <= 35 ? 9 : 18;
    } else if (
      gMatch &&
      (l.includes('in') || l.includes('cafe') || l.includes('espresso') || l.includes('shot'))
    ) {
      coffeeGrams = parseInt(gMatch[1], 10);
    } else if (l.includes('espresso') || l.includes('cafe') || l.includes('ristretto')) {
      if (
        l.includes('doble') ||
        l.includes('2 shot') ||
        l.includes('2shot') ||
        l.includes('triple') ||
        l.includes('60 ml') ||
        l.includes('60ml')
      ) {
        coffeeGrams = 18;
      } else if (
        l.includes('simple') ||
        l.includes('1 shot') ||
        l.includes('1shot') ||
        l.includes('30 ml') ||
        l.includes('30ml')
      ) {
        coffeeGrams = 9;
      }
    }

    // Detección de leche
    if (
      l.includes('leche') ||
      l.includes('milk') ||
      l.includes('vaporizada') ||
      l.includes('texturizada')
    ) {
      const mlMatch = l.match(/(\d+)\s*ml\b/);
      if (mlMatch) {
        milkMl = parseInt(mlMatch[1], 10);
      }
      if (
        l.includes('almendra') ||
        l.includes('vegetal') ||
        l.includes('avena') ||
        l.includes('coco') ||
        l.includes('soja')
      ) {
        milkType = 'plant';
      }
    }

    // Detección de salsas y syrup
    const salsaMatch = l.match(/(\d+)\s*(?:g|gr)\s*(?:de\s*)?(?:salsa|chocolate|cacao)/);
    if (salsaMatch) {
      sauceGrams = parseInt(salsaMatch[1], 10);
    }
    const syrupMatch = l.match(/(\d+)\s*(?:ml)\s*(?:de\s*)?(?:syrup|jarabe)/);
    if (syrupMatch) {
      const ml = parseInt(syrupMatch[1], 10);
      let sFlavor = 'vainilla';
      if (l.includes('caramel')) sFlavor = 'caramelo';
      else if (l.includes('pistacho') || l.includes('pistachio')) sFlavor = 'pistacho';
      else if (l.includes('avellana') || l.includes('hazelnut')) sFlavor = 'avellana';
      else if (l.includes('dulce') || l.includes('ddl')) sFlavor = 'syrup_ddl';
      else if (l.includes('blanco')) sFlavor = 'syrup_1790365033640';
      else if (l.includes('matcha')) sFlavor = 'matcha';
      else if (l.includes('chocolate')) sFlavor = 'syrup_1790365018338';
      else if (l.includes('azucar') || l.includes('azúcar') || l.includes('sugar'))
        sFlavor = 'syrup_1790392238949';

      if (syrupMl === 0) {
        syrupMl = ml;
        syrupFlavor = sFlavor;
      } else if (syrup2Ml === 0) {
        syrup2Ml = ml;
        syrup2Flavor = sFlavor;
      } else {
        syrup3Ml = ml;
        syrup3Flavor = sFlavor;
      }
    }
    if (l.includes('caramel')) {
      sauceFlavor = 'caramelo';
    } else if (l.includes('frutos') || l.includes('berry')) {
      sauceFlavor = 'frutos_rojos';
    } else if (l.includes('dulce de leche') || l.includes('ddl')) {
      sauceFlavor = 'dulce_de_leche';
    }

    // Detección de crema chantilly
    const cremaMatch = l.match(/(\d+)\s*(?:g|gr)?\s*(?:de\s*)?(?:crema|chantilly)/);
    if (cremaMatch) {
      whippedCreamGrams = parseInt(cremaMatch[1], 10);
    }

    // Detección de hielo
    const hieloMatch = l.match(/(\d+)\s*(?:g|gr)?\s*(?:de\s*)?hielo/);
    if (hieloMatch) {
      iceGrams = parseInt(hieloMatch[1], 10);
    }
  });

  return {
    coffeeGrams,
    milkMl,
    milkType,
    cocoaGrams: baseGuess.cocoaGrams || 0,
    whippedCreamGrams,
    syrupMl,
    syrupFlavor,
    syrup2Ml,
    syrup2Flavor,
    syrup3Ml,
    syrup3Flavor,
    sauceGrams,
    sauceFlavor,
    chocolateCost,
    isSmoothie: baseGuess.isSmoothie,
    smoothieFlavor: baseGuess.smoothieFlavor,
    smoothieCost: baseGuess.smoothieCost,
    pulpaGrams: baseGuess.pulpaGrams || 0,
    iceGrams: iceGrams !== undefined ? iceGrams : baseGuess.iceGrams || 0,
    waterGrams: baseGuess.waterGrams || 0,
    iceCreamGrams: baseGuess.iceCreamGrams || 0,
    isPastry: baseGuess.isPastry,
    pastryCost: baseGuess.pastryCost,
    cupType: baseGuess.cupType || (isMilkshakeCup(null, category, name) ? 'milkshake' : 'hot'),
    isCold: baseGuess.isCold || isMilkshakeCup(null, category, name),
    rawRecipeText: cleanLines.join(' • '),
  };
}

// Redondeo comercial a múltiplos de $50 o $100
function roundCommercialPrice(price) {
  if (!price || price <= 0) return 0;
  if (price < 1000) {
    return Math.round(price / 50) * 50;
  }
  return Math.round(price / 100) * 100;
}

// Subcomponente minimalista y limpio para configurar precio pagado, cantidad comprada y unidad
function CompactSupplyItem({
  icon,
  title,
  price,
  qty,
  unit,
  unitOptions = ['kg', 'g', 'L', 'ml'],
  onPriceChange,
  onQtyChange,
  onUnitChange,
  effCostText,
}) {
  return (
    <SupplyItemRow>
      <SupplyInfo>
        {icon}
        <span className="name">{title}</span>
      </SupplyInfo>

      <SupplyInputs>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MiniInputNumber $width="110px" title="Precio total pagado">
            <span className="prefix">$</span>
            <input
              type="number"
              value={price ?? ''}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="0"
            />
          </MiniInputNumber>

          <span style={{ fontSize: 11, color: '#B4B6C9' }}>/</span>

          <MiniInputNumber $width="95px" title="Cantidad comprada">
            <input
              type="number"
              step={unit === 'kg' || unit === 'L' ? '0.1' : '1'}
              value={qty ?? ''}
              onChange={(e) => onQtyChange(e.target.value)}
              placeholder="1"
            />
            {unitOptions && unitOptions.length > 1 ? (
              <select
                value={unit}
                onChange={(e) => onUnitChange(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#4ccd99',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  outline: 'none',
                }}
              >
                {unitOptions.map((u) => (
                  <option key={u} value={u} style={{ background: '#240007', color: '#fff' }}>
                    {u}
                  </option>
                ))}
              </select>
            ) : (
              <span className="unit">{unit}</span>
            )}
          </MiniInputNumber>
        </div>

        {effCostText && <RateBadge>{effCostText}</RateBadge>}
      </SupplyInputs>
    </SupplyItemRow>
  );
}

// Subcomponente de tarjeta de receta para el Recetario (pensado para barista / cocina)
function RecipeProductCard({ item, config, onOpenEdit }) {
  const isPastry = Boolean(item.isPastry);
  const isSmoothie = Boolean(item.isSmoothie || isSmoothieItem(null, item.category, item.name));
  const isColdDrink = isSmoothie || isMilkshakeCup(null, item.category, item.name);

  const hasMultipleSizes = item.variants && item.variants.length > 1;

  // Medida activa por defecto (la más común: 12oz, o la primera)
  const defaultSizeKey = useMemo(() => {
    if (!item.variants || item.variants.length === 0) return 'standard';
    const v12 = item.variants.find((v) => (v.sizeKey || '').toLowerCase().includes('12'));
    return v12 ? v12.sizeKey : item.variants[0].sizeKey;
  }, [item.variants]);

  const [selectedSizeKey, setSelectedSizeKey] = useState(defaultSizeKey);

  const activeVariant = useMemo(() => {
    if (!hasMultipleSizes) return item.variants?.[0];
    return item.variants?.find((v) => v.sizeKey === selectedSizeKey) || item.variants?.[0];
  }, [item.variants, hasMultipleSizes, selectedSizeKey]);

  return (
    <RecipeCard>
      <RecipeCardHeader>
        <div className="title-area">
          <div className="item-name">{item.name}</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
              marginTop: 2,
            }}
          >
            <span className="category-tag">{CATEGORY_NAMES[item.category] || item.category}</span>
            <span>•</span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: isPastry ? '#eab308' : isColdDrink ? '#38bdf8' : '#4ccd99',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {isPastry ? '🥐 Pastelería' : isColdDrink ? '🧊 Vaso Domo Frío' : '☕ Vaso Caliente'}
            </span>
          </div>
        </div>

        <ActionButton
          onClick={() => onOpenEdit(item, activeVariant?.sizeKey)}
          title="Ajustar receta o dosis de este producto"
          style={{ padding: '5px 12px', fontSize: 12, flexShrink: 0 }}
        >
          <Edit2 size={13} />
          <span>Ajustar</span>
        </ActionButton>
      </RecipeCardHeader>

      {/* Selector de Medida compacto */}
      {hasMultipleSizes && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {item.variants.map((v) => {
            const isActive = selectedSizeKey === v.sizeKey;
            return (
              <button
                key={v.sizeKey}
                type="button"
                onClick={() => setSelectedSizeKey(v.sizeKey)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 7,
                  background: isActive ? '#4ccd99' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#0b1d16' : '#B4B6C9',
                  border: isActive ? '1px solid #4ccd99' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isActive ? '0 2px 8px rgba(76, 205, 153, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {v.sizeLabel || v.sizeKey.toUpperCase()}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedSizeKey('all')}
            style={{
              all: 'unset',
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 7,
              background: selectedSizeKey === 'all' ? '#4ccd99' : 'rgba(255, 255, 255, 0.06)',
              color: selectedSizeKey === 'all' ? '#0b1d16' : '#B4B6C9',
              border:
                selectedSizeKey === 'all'
                  ? '1px solid #4ccd99'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: selectedSizeKey === 'all' ? '0 2px 8px rgba(76, 205, 153, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Ver todos ({item.variants.length})
          </button>
        </div>
      )}

      {/* Ingredientes de la medida seleccionada (vista por defecto, limpia y directa) */}
      {selectedSizeKey !== 'all' && activeVariant && (
        <RecipePillsWrap style={{ marginTop: 2 }}>
          {getRecipeIngredientList(activeVariant.recipe, activeVariant.sizeKey, config).map(
            (ing, idx) => (
              <RecipePill
                key={idx}
                $bg={ing.bg}
                $color={ing.color}
                $border={ing.border}
                style={{ padding: '6px 12px', fontSize: 13 }}
              >
                <span style={{ fontSize: 14 }}>{ing.icon}</span>
                <span style={{ fontWeight: 800 }}>{ing.value}</span>
                <span>{ing.label}</span>
                {ing.detail && (
                  <span style={{ opacity: 0.8, fontSize: 10.5, fontWeight: 500 }}>
                    • {ing.detail}
                  </span>
                )}
              </RecipePill>
            )
          )}
        </RecipePillsWrap>
      )}

      {/* Comparación compacta en un solo renglón por tamaño si se pulsa "Ver todos" */}
      {selectedSizeKey === 'all' && hasMultipleSizes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
          {item.variants.map((v) => {
            const ingredients = getRecipeIngredientList(v.recipe, v.sizeKey, config);
            return (
              <div
                key={v.sizeKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    color: '#4ccd99',
                    minWidth: 85,
                    fontSize: 12,
                  }}
                >
                  {v.sizeLabel || v.sizeKey.toUpperCase()}:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        background: ing.bg,
                        color: ing.color,
                        border: `1px solid ${ing.border}`,
                        padding: '2px 7px',
                        borderRadius: 6,
                      }}
                    >
                      <span>{ing.icon}</span>
                      <strong>{ing.value}</strong>
                      <span>{ing.label}</span>
                      {ing.detail && (
                        <span style={{ opacity: 0.75, fontSize: 10 }}>({ing.detail})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </RecipeCard>
  );
}

// Subcomponente de tarjeta comercial para la Ficha del Menú (costos, precios y márgenes)
function MenuProductCard({ item, config, evaluateVenta, onOpenEdit }) {
  const isPastry = Boolean(item.isPastry);
  const isSmoothie = Boolean(item.isSmoothie || isSmoothieItem(null, item.category, item.name));
  const isColdDrink = isSmoothie || isMilkshakeCup(null, item.category, item.name);

  const hasMultipleSizes = item.variants && item.variants.length > 1;

  // Medida activa por defecto (la más común: 12oz, o la primera)
  const defaultSizeKey = useMemo(() => {
    if (!item.variants || item.variants.length === 0) return 'standard';
    const v12 = item.variants.find((v) => (v.sizeKey || '').toLowerCase().includes('12'));
    return v12 ? v12.sizeKey : item.variants[0].sizeKey;
  }, [item.variants]);

  const [selectedSizeKey, setSelectedSizeKey] = useState(defaultSizeKey);

  const activeVariant = useMemo(() => {
    if (!hasMultipleSizes) return item.variants?.[0];
    return item.variants?.find((v) => v.sizeKey === selectedSizeKey) || item.variants?.[0];
  }, [item.variants, hasMultipleSizes, selectedSizeKey]);

  const evalObj = useMemo(() => {
    if (!activeVariant) return { netIncome: 0, profit: 0, margin: 0, isHealthy: false };
    return evaluateVenta(activeVariant.price, activeVariant.cost);
  }, [activeVariant, evaluateVenta]);

  // Desglose limpio de costos de insumos para la variante activa
  const costBreakdown = useMemo(() => {
    if (!activeVariant?.costObj) return [];
    const list = [];
    const co = activeVariant.costObj;
    const r = activeVariant.recipe || {};

    if (co.costCoffee > 0) {
      list.push({
        icon: '☕',
        label: 'Café',
        amount: r.coffeeGrams ? `${r.coffeeGrams}g` : '',
        cost: Math.round(co.costCoffee),
      });
    }
    if (co.costMilk > 0) {
      const isPlant = r.milkType === 'plant';
      list.push({
        icon: '🥛',
        label: isPlant ? 'Veg.' : 'Leche',
        amount: r.milkMl ? `${r.milkMl}ml` : '',
        cost: Math.round(co.costMilk),
      });
    }
    if (co.costPkg > 0) {
      list.push({
        icon: '🥤',
        label: 'Vaso',
        cost: Math.round(co.costPkg),
      });
    }
    if (co.costSyrup > 0) {
      list.push({
        icon: '🍯',
        label: 'Syrup',
        cost: Math.round(co.costSyrup),
      });
    }
    if (co.costSauce > 0) {
      list.push({
        icon: '🍫',
        label: 'Salsa',
        cost: Math.round(co.costSauce),
      });
    }
    if (co.costOreo > 0) {
      list.push({
        icon: '🍪',
        label: 'Oreo',
        amount: co.oreoUnits ? `${co.oreoUnits}u` : co.oreoGrams ? `${co.oreoGrams}g` : '',
        cost: Math.round(co.costOreo),
      });
    }
    if (co.costSpecial > 0) {
      list.push({
        icon: '🍫',
        label: 'Choc.',
        cost: Math.round(co.costSpecial),
      });
    }
    if (co.costWhippedCream > 0) {
      list.push({
        icon: '🍦',
        label: 'Crema',
        cost: Math.round(co.costWhippedCream),
      });
    }
    if (co.costBase > 0) {
      list.push({
        icon: '🥐',
        label: 'Base',
        cost: Math.round(co.costBase),
      });
    }
    if (co.costHam > 0) {
      list.push({
        icon: '🥓',
        label: 'Jamón',
        cost: Math.round(co.costHam),
      });
    }
    if (co.costTybo > 0) {
      list.push({
        icon: '🧀',
        label: 'Q. Tybo',
        cost: Math.round(co.costTybo),
      });
    }
    if (co.costCheddar > 0) {
      list.push({
        icon: '🧀',
        label: 'Cheddar',
        cost: Math.round(co.costCheddar),
      });
    }
    if (co.costLomito > 0) {
      list.push({
        icon: '🥩',
        label: 'Lomito',
        cost: Math.round(co.costLomito),
      });
    }
    if (co.costSardo > 0) {
      list.push({
        icon: '🧀',
        label: 'Q. Sardo',
        cost: Math.round(co.costSardo),
      });
    }
    if (co.costExtras > 0) {
      list.push({
        icon: '✨',
        label: 'Extras',
        cost: Math.round(co.costExtras),
      });
    }
    if (co.costPlantMilkFund > 0) {
      list.push({
        icon: '🌱',
        label: 'Fondo Leche Veg.',
        cost: Math.round(co.costPlantMilkFund),
      });
    }
    return list;
  }, [activeVariant]);

  return (
    <RecipeCard>
      {/* Cabecera: Nombre, categoría y acción */}
      <RecipeCardHeader>
        <div className="title-area">
          <div className="item-name">{item.name}</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
              marginTop: 2,
            }}
          >
            <span className="category-tag">{CATEGORY_NAMES[item.category] || item.category}</span>
            <span>•</span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: isPastry ? '#eab308' : isColdDrink ? '#38bdf8' : '#4ccd99',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {isPastry ? '🥐 Pastelería' : isColdDrink ? '🧊 Frío' : '☕ Caliente'}
            </span>
          </div>
        </div>

        <ActionButton
          onClick={() => onOpenEdit(item, activeVariant?.sizeKey)}
          title="Modificar precio, margen o receta de este producto"
          style={{ padding: '5px 12px', fontSize: 12, flexShrink: 0 }}
        >
          <Edit2 size={13} />
          <span>Ajustar</span>
        </ActionButton>
      </RecipeCardHeader>

      {/* Selector de Medida compacto */}
      {hasMultipleSizes && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {item.variants.map((v) => {
            const isActive = selectedSizeKey === v.sizeKey;
            return (
              <button
                key={v.sizeKey}
                type="button"
                onClick={() => setSelectedSizeKey(v.sizeKey)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 7,
                  background: isActive ? '#4ccd99' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#0b1d16' : '#B4B6C9',
                  border: isActive ? '1px solid #4ccd99' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isActive ? '0 2px 8px rgba(76, 205, 153, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {v.sizeLabel || v.sizeKey.toUpperCase()}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedSizeKey('all')}
            style={{
              all: 'unset',
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 7,
              background: selectedSizeKey === 'all' ? '#4ccd99' : 'rgba(255, 255, 255, 0.06)',
              color: selectedSizeKey === 'all' ? '#0b1d16' : '#B4B6C9',
              border:
                selectedSizeKey === 'all'
                  ? '1px solid #4ccd99'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: selectedSizeKey === 'all' ? '0 2px 8px rgba(76, 205, 153, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Ver todos ({item.variants.length})
          </button>
        </div>
      )}

      {/* BLOQUE FINANCIERO PRINCIPAL (cuando NO es 'all') */}
      {selectedSizeKey !== 'all' && activeVariant && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Fila de 4 KPIs financieros */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
              gap: 8,
              background: 'rgba(0, 0, 0, 0.28)',
              borderRadius: 10,
              padding: '10px 12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* 1. Precio Venta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#A9AABC',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Precio Venta
              </span>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: activeVariant.price > 0 ? '#fff' : '#ef4444',
                  lineHeight: 1.2,
                }}
              >
                {activeVariant.price > 0
                  ? `$${activeVariant.price.toLocaleString('es-AR')}`
                  : 'Sin precio'}
              </span>
              <span style={{ fontSize: 10.5, color: '#B4B6C9', opacity: 0.85 }}>
                {activeVariant.sizeLabel || 'Unidad'}
              </span>
            </div>

            {/* 2. Costo Total de Elaboración */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#A9AABC',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Costo Elab.
              </span>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0', lineHeight: 1.2 }}>
                ${Math.round(activeVariant.cost).toLocaleString('es-AR')}
              </span>
              <span style={{ fontSize: 10.5, color: '#eab308', opacity: 0.9 }}>
                Sug: ${activeVariant.suggestedPrice.toLocaleString('es-AR')}
              </span>
            </div>

            {/* 3. Margen Real */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#A9AABC',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Margen %
              </span>
              <div>
                {activeVariant.price > 0 ? (
                  <MarginPill
                    $variant={evalObj.isHealthy ? 'good' : evalObj.margin >= 45 ? 'warn' : 'bad'}
                  >
                    {evalObj.margin}%
                  </MarginPill>
                ) : (
                  <span style={{ fontSize: 13, color: '#B4B6C9' }}>-</span>
                )}
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: evalObj.margin < 50 ? '#ef4444' : '#4ccd99',
                  opacity: 0.9,
                }}
              >
                {evalObj.margin < 50 ? '⚠️ Bajo margen' : `Obj: ${config.targetMargin}%`}
              </span>
            </div>

            {/* 4. Ganancia Neta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#A9AABC',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Ganancia Neta
              </span>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color:
                    evalObj.profit > 0
                      ? '#4ccd99'
                      : activeVariant.price > 0
                        ? '#ef4444'
                        : '#B4B6C9',
                  lineHeight: 1.2,
                }}
              >
                {activeVariant.price > 0
                  ? `${evalObj.profit >= 0 ? '+' : ''}$${Math.round(evalObj.profit).toLocaleString('es-AR')}`
                  : '-'}
              </span>
              <span style={{ fontSize: 10.5, color: '#B4B6C9', opacity: 0.85 }}>por unidad</span>
            </div>
          </div>

          {/* Desglose de Costos en pastillas limpias */}
          {costBreakdown.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#A9AABC', marginRight: 2 }}>
                Desglose:
              </span>
              {costBreakdown.map((b, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '2px 7px',
                    borderRadius: 6,
                    color: '#e2e8f0',
                  }}
                  title={
                    b.amount ? `${b.label}: ${b.amount} = $${b.cost}` : `${b.label} = $${b.cost}`
                  }
                >
                  <span>{b.icon}</span>
                  <span style={{ opacity: 0.8 }}>{b.label}:</span>
                  <strong style={{ color: '#4ccd99' }}>${b.cost}</strong>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista "Ver todos": Tira comparativa limpia de todos los tamaños */}
      {selectedSizeKey === 'all' && hasMultipleSizes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
          {item.variants.map((v) => {
            const vEval = evaluateVenta(v.price, v.cost);
            return (
              <div
                key={v.sizeKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 90 }}>
                  <span style={{ fontWeight: 800, color: '#4ccd99', fontSize: 12 }}>
                    {v.sizeLabel || v.sizeKey.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 11.5, color: '#B4B6C9' }}>
                    Costo:{' '}
                    <strong style={{ color: '#fff' }}>
                      ${Math.round(v.cost).toLocaleString('es-AR')}
                    </strong>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#B4B6C9' }}>
                    Venta:{' '}
                    <strong style={{ color: v.price > 0 ? '#fff' : '#ef4444' }}>
                      {v.price > 0 ? `$${v.price.toLocaleString('es-AR')}` : 'Sin precio'}
                    </strong>
                  </div>
                  <div>
                    {v.price > 0 ? (
                      <MarginPill
                        $variant={vEval.isHealthy ? 'good' : vEval.margin >= 45 ? 'warn' : 'bad'}
                      >
                        {vEval.margin}%
                      </MarginPill>
                    ) : (
                      <span style={{ fontSize: 11.5, color: '#B4B6C9' }}>-</span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: vEval.profit > 0 ? '#4ccd99' : '#ef4444',
                    }}
                  >
                    {v.price > 0
                      ? `${vEval.profit >= 0 ? '+' : ''}$${Math.round(vEval.profit).toLocaleString('es-AR')}`
                      : '-'}
                  </div>
                  <div style={{ fontSize: 11, color: '#eab308', opacity: 0.9 }}>
                    Sug: ${v.suggestedPrice.toLocaleString('es-AR')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </RecipeCard>
  );
}

// Función auxiliar para formatear la receta estructurada en texto para PocketBase
export function formatRecipeForPb(r, config) {
  if (!r) return '';
  if (r.isSmoothie || Number(r.smoothieCost) > 0) {
    const pG = r.pulpaGrams || 130;
    const iG = r.iceGrams || 200;
    const wG = r.waterGrams || 170;
    return `${pG}g pulpa\n${iG}g hielo\n${wG}ml agua\nvaso milkshake`;
  }
  const parts = [];
  if (r.iceCreamGrams > 0) parts.push(`${r.iceCreamGrams}g helado`);
  if (r.coffeeGrams > 0) parts.push(`${r.coffeeGrams}g café`);
  if (r.matchaGrams > 0) parts.push(`${r.matchaGrams}g té matcha`);
  if (r.milkMl > 0)
    parts.push(`${r.milkMl}ml ${r.milkType === 'plant' ? 'leche vegetal' : 'leche'}`);
  if (r.cocoaGrams > 0) parts.push(`${r.cocoaGrams}g cacao`);
  if (r.sauceGrams > 0) {
    const sLabel = getSauceName(r.sauceFlavor, config);
    parts.push(`${r.sauceGrams}g salsa ${sLabel.toLowerCase()}`);
  }
  if (r.syrupMl > 0) {
    const syLabel = getSyrupName(r.syrupFlavor, config);
    parts.push(`${r.syrupMl}ml syrup ${syLabel.toLowerCase()}`);
  }
  if (r.syrup2Ml > 0) {
    const sy2Label = getSyrupName(r.syrup2Flavor, config);
    parts.push(`${r.syrup2Ml}ml syrup ${sy2Label.toLowerCase()}`);
  }
  if (r.syrup3Ml > 0) {
    const sy3Label = getSyrupName(r.syrup3Flavor, config);
    parts.push(`${r.syrup3Ml}ml syrup ${sy3Label.toLowerCase()}`);
  }
  if (r.oreoUnits > 0) {
    parts.push(`${r.oreoUnits} u galletitas Oreo trituradas`);
  } else if (r.oreoGrams > 0) {
    parts.push(`${r.oreoGrams}g galletitas Oreo trituradas`);
  } else if (
    r.rawRecipeText &&
    (r.rawRecipeText.toLowerCase().includes('oreo') ||
      r.rawRecipeText.toLowerCase().includes('galleta'))
  ) {
    parts.push('galletitas Oreo trituradas');
  }
  if (r.whippedCreamGrams > 0) parts.push(`${r.whippedCreamGrams}g crema chantilly`);
  if (r.iceGrams > 0) parts.push(`${r.iceGrams}g hielo`);
  if (r.cupType === 'milkshake') parts.push('vaso domo');
  return parts.join('\n');
}

export default function CafeCosts() {
  const [showAddDrinkModal, setShowAddDrinkModal] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'recipes' | 'inputs' | 'simulator'
  const [menuViewMode, setMenuViewMode] = useState('cards'); // 'cards' | 'table'
  const [config, setConfig] = useState(getStoredConfig);
  const [savedConfig, setSavedConfig] = useState(getStoredConfig);
  const savedConfigRef = useRef(savedConfig);
  useEffect(() => {
    savedConfigRef.current = savedConfig;
  }, [savedConfig]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Detección en tiempo real de cambios no guardados en los insumos
  const hasConfigChanges = useMemo(() => {
    return !isConfigEqual(config, savedConfig);
  }, [config, savedConfig]);

  const [customRecipes, setCustomRecipes] = useState(getStoredRecipes);

  // Estado de productos desde PocketBase
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  // Modal para editar receta de un producto
  const [editingItem, setEditingItem] = useState(null);
  const [editingVariantKey, setEditingVariantKey] = useState(null);

  // Estados para actualización directa de precios en PocketBase
  const [savingPriceId, setSavingPriceId] = useState(null);
  const [priceSuccessToast, setPriceSuccessToast] = useState(null);
  const [inlineEditState, setInlineEditState] = useState(null);

  const dispatch = useDispatch();
  const cupSizesStock = useSelector((s) => s.actions?.cupSizesStock ?? DEFAULT_CUP_SIZES_STOCK);
  const extrasStock = useSelector((s) => s.actions?.extrasStock ?? DEFAULT_EXTRAS_STOCK);

  const handleToggleCupSizeStock = async (sizeKey) => {
    const current = cupSizesStock[sizeKey] !== false;
    const next = !current;
    dispatch(toggleCupSizeStock(sizeKey));
    try {
      await syncCafeStockToPb({
        cupSizesStock: { ...cupSizesStock, [sizeKey]: next },
      });
      setPriceSuccessToast(`✓ Vaso ${sizeKey} marcado como ${next ? 'En stock' : 'Sin stock'} (guardado en PB)`);
      setTimeout(() => setPriceSuccessToast(null), 3500);
    } catch (e) {
      console.error('Error saving cup size stock to PB:', e);
      dispatch(toggleCupSizeStock(sizeKey));
      alert('Error al guardar stock de vasos en PocketBase: ' + (e?.message || e));
    }
  };

  const handleToggleExtraStock = async (extraKey) => {
    const current = extrasStock[extraKey] !== false;
    const next = !current;
    dispatch(toggleExtraStock(extraKey));
    try {
      await syncCafeStockToPb({
        extrasStock: { ...extrasStock, [extraKey]: next },
      });
      setPriceSuccessToast(`✓ Extra marcado como ${next ? 'En stock' : 'Sin stock'} (guardado en PB)`);
      setTimeout(() => setPriceSuccessToast(null), 3500);
    } catch (e) {
      console.error('Error saving extra stock to PB:', e);
      dispatch(toggleExtraStock(extraKey));
      alert('Error al guardar stock de extra en PocketBase: ' + (e?.message || e));
    }
  };

  const handleOpenEdit = (item, variantKey = null) => {
    setEditingItem(item);
    setEditingVariantKey(variantKey || item.variants[0]?.sizeKey || 'standard');
  };

  const handleDrinkCreated = (createdRecord, newRecipes) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === createdRecord.id);
      if (exists) {
        return prev.map((p) => (p.id === createdRecord.id ? { ...p, ...createdRecord } : p));
      }
      return [...prev, createdRecord].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });

    if (newRecipes && typeof newRecipes === 'object') {
      const updated = { ...customRecipes };
      if (newRecipes['8oz']) updated[`${createdRecord.id}_8oz`] = newRecipes['8oz'];
      if (newRecipes['12oz']) updated[`${createdRecord.id}_12oz`] = newRecipes['12oz'];
      if (newRecipes['16oz']) updated[`${createdRecord.id}_16oz`] = newRecipes['16oz'];
      if (newRecipes['standard']) updated[`${createdRecord.id}_standard`] = newRecipes['standard'];
      setCustomRecipes(updated);
      try {
        localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {
        /* ignore */
      }
    }

    setPriceSuccessToast(`✨ ¡Bebida "${createdRecord.name}" creada y sincronizada con éxito!`);
    setTimeout(() => setPriceSuccessToast(null), 5000);
  };

  // Notificación / Banner de calibración IA
  const [aiBanner, setAiBanner] = useState(null);

  // Calibración automática inteligente de todo el menú con IA
  const handleCalibrateAllWithAi = () => {
    const updatedRecipes = { ...customRecipes };
    let calibratedCount = 0;

    products.forEach((p) => {
      let cat = (p.category || '').toLowerCase().trim();
      if (p.name?.toLowerCase().includes('smoothie')) {
        cat = 'smoothie';
      } else if (!cat) {
        cat = 'clasico';
      }

      if (cat === 'extra') {
        const key = `${p.id}_extra`;
        updatedRecipes[key] = detectAiRecipe(p.name, 'extra', cat, config);
        calibratedCount++;
      } else {
        const p8 = Number(p.price_8oz || 0);
        const p12 = Number(p.price_12oz || 0);
        const p16 = Number(p.price_16oz || 0);
        const hasSizes = p8 > 0 || p12 > 0 || p16 > 0;

        if (hasSizes) {
          if (p8 > 0) {
            updatedRecipes[`${p.id}_8oz`] = detectAiRecipe(p.name, '8oz', cat, config);
          }
          if (p12 > 0) {
            updatedRecipes[`${p.id}_12oz`] = detectAiRecipe(p.name, '12oz', cat, config);
          }
          if (p16 > 0) {
            updatedRecipes[`${p.id}_16oz`] = detectAiRecipe(p.name, '16oz', cat, config);
          }
          calibratedCount++;
        } else {
          updatedRecipes[`${p.id}_standard`] = detectAiRecipe(p.name, 'standard', cat, config);
          calibratedCount++;
        }
      }
    });

    setCustomRecipes(updatedRecipes);
    try {
      localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
    } catch (e) {
      console.error('Error saving calibrated recipes:', e);
    }

    // Persistir calibración completa en PocketBase
    products.forEach((p) => {
      const pRecipes = {};
      const cat = (p.category || '').toLowerCase().trim();
      const p8 = Number(p.price_8oz || 0);
      const p12 = Number(p.price_12oz || 0);
      const p16 = Number(p.price_16oz || 0);
      if (cat === 'extra') {
        pRecipes['extra'] = updatedRecipes[`${p.id}_extra`];
      } else if (p8 > 0 || p12 > 0 || p16 > 0) {
        if (p8 > 0) pRecipes['8oz'] = updatedRecipes[`${p.id}_8oz`];
        if (p12 > 0) pRecipes['12oz'] = updatedRecipes[`${p.id}_12oz`];
        if (p16 > 0) pRecipes['16oz'] = updatedRecipes[`${p.id}_16oz`];
      } else {
        pRecipes['standard'] = updatedRecipes[`${p.id}_standard`];
      }
      pb.collection('products_cafeteria')
        .update(p.id, { recipes: pRecipes })
        .catch(() => {});
    });

    setAiBanner(
      `✨ ¡Se calibraron con éxito las recetas de ${calibratedCount} productos con IA y se sincronizaron con PocketBase!`
    );
    setTimeout(() => setAiBanner(null), 6000);
  };

  // Simulador rápido
  const [simCoffee, setSimCoffee] = useState(18);
  const [simMilk, setSimMilk] = useState(160);
  const [simMilkType, setSimMilkType] = useState('regular');
  const [simTakeAway, setSimTakeAway] = useState(true);
  const [simCupType, setSimCupType] = useState('hot'); // 'hot' | 'milkshake'
  const [simSize, setSimSize] = useState('12oz'); // '8oz' | '12oz' | '16oz'
  const [simExtras, setSimExtras] = useState(true);
  const [simTargetMargin, setSimTargetMargin] = useState(65);
  const [simManualPrice, setSimManualPrice] = useState('');

  // 1. Cargar productos desde PocketBase (products_cafeteria)
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [list, configResult] = await Promise.all([
          pb.collection('products_cafeteria').getFullList({ sort: 'name' }),
          pb
            .collection('cafe_config')
            .getList(1, 1, { filter: 'key="global_costs"' })
            .catch(() => null),
        ]);
        if (!cancelled) {
          setProducts(list);
          if (configResult?.items?.length > 0 && configResult.items[0].data) {
            const pbConfig = configResult.items[0].data;
            const merged = normalizeConfig(pbConfig);
            setConfig(merged);
            setSavedConfig(merged);
            try {
              localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));
            } catch (_) {
              /* ignore */
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching data from PB:', err);
          setError(err?.message || 'Error al conectar con el servidor PocketBase');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    // Suscripción en tiempo real a productos
    const coll = pb.collection('products_cafeteria');
    coll
      .subscribe('*', (e) => {
        setProducts((prev) => {
          if (e.action === 'delete') {
            return prev.filter((p) => p.id !== e.record.id);
          }
          if (e.action === 'create') {
            return [...prev, e.record].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          }
          if (e.action === 'update') {
            return prev.map((p) => (p.id === e.record.id ? { ...p, ...e.record } : p));
          }
          return prev;
        });
      })
      .catch((e) => console.warn('PB products subscription error:', e));

    // Suscripción en tiempo real a cafe_config
    const configColl = pb.collection('cafe_config');
    configColl
      .subscribe('*', (e) => {
        if (
          (e.action === 'create' || e.action === 'update') &&
          e.record?.data &&
          e.record?.key === 'global_costs'
        ) {
          if (e.record.data.cupSizesStock) {
            dispatch(setCupSizesStock(e.record.data.cupSizesStock));
          }
          if (e.record.data.extrasStock) {
            dispatch(setExtrasStock(e.record.data.extrasStock));
          }
          const merged = normalizeConfig(e.record.data);
          setSavedConfig(merged);
          setConfig((current) => {
            if (isConfigEqual(current, savedConfigRef.current)) {
              return merged;
            }
            return current;
          });
        }
      })
      .catch((e) => console.warn('PB cafe_config subscription error:', e));

    return () => {
      cancelled = true;
      coll.unsubscribe('*').catch(() => {});
      configColl.unsubscribe('*').catch(() => {});
    };
  }, [dispatch]);

  // Sincronización explícita de config con PocketBase (colección cafe_config)
  const saveConfigToPb = useCallback(
    async (newConfig) => {
      try {
        const list = await pb
          .collection('cafe_config')
          .getList(1, 1, { filter: 'key="global_costs"' });
        if (list.items && list.items.length > 0) {
          const current = list.items[0];
          const prev = current.data || {};
          await pb.collection('cafe_config').update(current.id, {
            key: 'global_costs',
            data: {
              ...prev,
              ...newConfig,
              cupSizesStock: prev.cupSizesStock || cupSizesStock,
              extrasStock: prev.extrasStock || extrasStock,
            },
          });
        } else {
          await pb.collection('cafe_config').create({
            key: 'global_costs',
            data: {
              ...newConfig,
              cupSizesStock,
              extrasStock,
            },
          });
        }
      } catch (err) {
        console.warn('Error syncing cafe_config to PocketBase:', err?.message || err);
        throw err;
      }
    },
    [cupSizesStock, extrasStock]
  );

  // Confirmar y sincronizar cambios de insumos a PocketBase
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      await saveConfigToPb(config);
      setSavedConfig(config);
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
      } catch (_) {
        /* ignore */
      }
      setPriceSuccessToast('✓ Insumos y costos guardados y sincronizados con PocketBase');
      setTimeout(() => setPriceSuccessToast(null), 4000);
    } catch (err) {
      console.error('Error guardando insumos en PB:', err);
      alert('Error al guardar insumos en PocketBase: ' + (err?.message || err));
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Descartar cambios locales y volver a los guardados en PocketBase
  const handleDiscardConfig = () => {
    setConfig(savedConfig);
  };

  // Modificación local fluida de config (sin peticiones de red por cada tecla)
  const handleConfigChange = (field, value) => {
    setConfig((prev) => {
      let updated;
      if (typeof field === 'object' && field !== null) {
        updated = { ...prev, ...field };
      } else {
        const isUnitField = typeof field === 'string' && field.endsWith('Unit');
        const processedVal = isUnitField ? value : value === '' ? '' : Number(value);
        updated = { ...prev, [field]: processedVal };
      }

      // Sincronizar claves tradicionales para simulador y retrocompatibilidad
      updated.coffeeKg = getStandardCost(
        updated.coffeePrice ?? updated.coffeeKg,
        updated.coffeeQty ?? 1,
        updated.coffeeUnit ?? 'kg'
      );
      updated.milkLiter = getStandardCost(
        updated.milkPrice ?? updated.milkLiter,
        updated.milkQty ?? 1,
        updated.milkUnit ?? 'L'
      );
      updated.plantMilkLiter = getStandardCost(
        updated.plantMilkPrice ?? updated.plantMilkLiter,
        updated.plantMilkQty ?? 1,
        updated.plantMilkUnit ?? 'L'
      );
      updated.cocoaKg = getStandardCost(
        updated.cocoaPrice ?? updated.cocoaKg,
        updated.cocoaQty ?? 1,
        updated.cocoaUnit ?? 'kg'
      );
      updated.iceKg = getStandardCost(
        updated.icePrice ?? updated.iceKg,
        updated.iceQty ?? 10,
        updated.iceUnit ?? 'kg'
      );
      updated.iceCreamKg = getStandardCost(
        updated.iceCreamPrice ?? updated.iceCreamKg,
        updated.iceCreamQty ?? 1,
        updated.iceCreamUnit ?? 'kg'
      );
      updated.creamLiter = getStandardCost(
        updated.creamPrice ?? updated.creamLiter,
        updated.creamQty ?? 1,
        updated.creamUnit ?? 'L'
      );
      updated.sauceKg = getStandardCost(
        updated.saucePrice ?? updated.sauceKg,
        updated.sauceQty ?? 1,
        updated.sauceUnit ?? 'kg'
      );
      updated.syrupLiter = getStandardCost(
        updated.syrupPrice ?? updated.syrupLiter,
        updated.syrupQty ?? 1,
        updated.syrupUnit ?? 'L'
      );
      updated.chocolateBarUnit = getUnitCost(
        updated.chocolateBarPrice ?? updated.chocolateBarUnit,
        updated.chocolateBarQty ?? 1,
        'u'
      );
      updated.smoothieCost = getUnitCost(
        updated.smoothiePrice ?? updated.smoothieCost,
        updated.smoothieQty ?? 1,
        updated.smoothieUnit ?? 'porción'
      );
      updated.packaging8oz = getUnitCost(
        updated.packaging8ozPrice ?? updated.packaging8oz,
        updated.packaging8ozQty ?? 1,
        'u'
      );
      updated.packaging12oz = getUnitCost(
        updated.packaging12ozPrice ?? updated.packaging12oz,
        updated.packaging12ozQty ?? 1,
        'u'
      );
      updated.packaging16oz = getUnitCost(
        updated.packaging16ozPrice ?? updated.packaging16oz,
        updated.packaging16ozQty ?? 1,
        'u'
      );
      updated.packagingCold12oz = getUnitCost(
        updated.packagingCold12ozPrice ?? updated.packagingCold12oz,
        updated.packagingCold12ozQty ?? 1,
        'u'
      );
      updated.packagingCold16oz = getUnitCost(
        updated.packagingCold16ozPrice ?? updated.packagingCold16oz,
        updated.packagingCold16ozQty ?? 1,
        'u'
      );
      updated.packaging = updated.packaging12oz;
      updated.packagingCold = updated.packagingCold12oz;
      updated.extras = getUnitCost(
        updated.extrasPrice ?? updated.extras,
        updated.extrasQty ?? 1,
        'u'
      );
      updated.plantMilkFund = Number(
        updated.plantMilkFundPrice ?? updated.plantMilkFund ?? 0
      );

      return updated;
    });
  };

  const handleResetConfig = () => {
    if (
      window.confirm(
        '¿Deseas restablecer todos los costos de insumos a los valores por defecto? (Deberás presionar "Confirmar Cambios" para guardarlo en PocketBase)'
      )
    ) {
      setConfig(normalizeConfig(DEFAULT_CONFIG));
    }
  };

  // Handlers locales para administración dinámica de sabores de salsas, syrups y smoothies
  const handleFlavorChange = (flavorType, index, field, value) => {
    setConfig((prev) => {
      const listKey =
        flavorType === 'sauce'
          ? 'sauceFlavors'
          : flavorType === 'smoothie'
            ? 'smoothieFlavors'
            : 'syrupFlavors';
      const currentList = Array.isArray(prev[listKey])
        ? prev[listKey].map((item) => ({ ...item }))
        : [...DEFAULT_CONFIG[listKey]];
      if (!currentList[index]) return prev;
      const isTextField = field === 'name' || field === 'unit';
      const processedVal = isTextField ? value : value === '' ? '' : Number(value);
      currentList[index] = {
        ...currentList[index],
        [field]: processedVal,
      };
      return {
        ...prev,
        [listKey]: currentList,
      };
    });
  };

  const handleAddFlavor = (flavorType) => {
    setConfig((prev) => {
      const isSauce = flavorType === 'sauce';
      const isSmoothie = flavorType === 'smoothie';
      const listKey = isSauce ? 'sauceFlavors' : isSmoothie ? 'smoothieFlavors' : 'syrupFlavors';
      const currentList = Array.isArray(prev[listKey])
        ? prev[listKey].map((item) => ({ ...item }))
        : [...DEFAULT_CONFIG[listKey]];
      const newId = `${flavorType}_${Date.now()}`;
      const newFlavor = isSauce
        ? { id: newId, name: 'Nueva Salsa', price: 9500, qty: 1, unit: 'kg' }
        : isSmoothie
          ? { id: newId, name: 'Nuevo Sabor', price: 1400, qty: 1, unit: 'porción' }
          : { id: newId, name: 'Nuevo Syrup', price: 11000, qty: 1, unit: 'L' };
      return {
        ...prev,
        [listKey]: [...currentList, newFlavor],
      };
    });
  };

  const handleRemoveFlavor = (flavorType, index) => {
    setConfig((prev) => {
      const listKey =
        flavorType === 'sauce'
          ? 'sauceFlavors'
          : flavorType === 'smoothie'
            ? 'smoothieFlavors'
            : 'syrupFlavors';
      const currentList = Array.isArray(prev[listKey]) ? [...prev[listKey]] : [];
      if (currentList.length <= 1) return prev;
      const nextList = currentList.filter((_, i) => i !== index);
      return {
        ...prev,
        [listKey]: nextList,
      };
    });
  };

  // Actualizar precio de un producto en PocketBase directamente
  const handleUpdateProductPrice = async (productId, sizeKey, newPrice) => {
    const numPrice = Math.max(0, Math.round(Number(newPrice) || 0));
    setSavingPriceId(`${productId}_${sizeKey}`);
    try {
      const patch = {};
      if (sizeKey === '8oz') patch.price_8oz = numPrice;
      else if (sizeKey === '12oz') patch.price_12oz = numPrice;
      else if (sizeKey === '16oz') patch.price_16oz = numPrice;
      else if (sizeKey === 'extra') {
        patch.price_extra = numPrice;
        patch.price = numPrice;
      } else {
        patch.price = numPrice;
      }

      await pb.collection('products_cafeteria').update(productId, patch);

      // Actualización optimista del estado local
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...patch } : p)));

      // Si el ítem abierto en modal es este, actualizar sus variantes
      setEditingItem((prev) => {
        if (!prev || prev.id !== productId) return prev;
        return {
          ...prev,
          ...patch,
          variants: (prev.variants || []).map((v) =>
            v.sizeKey === sizeKey ? { ...v, price: numPrice } : v
          ),
        };
      });

      const sizeLabel = sizeKey === 'standard' ? '' : ` (${sizeKey})`;
      setPriceSuccessToast(
        `✓ Precio${sizeLabel} actualizado a $${numPrice.toLocaleString('es-AR')} en PocketBase`
      );
      setTimeout(() => setPriceSuccessToast(null), 4000);
      return true;
    } catch (err) {
      console.error('Error updating price in PocketBase:', err);
      alert(`Error al actualizar precio en PocketBase: ${err?.message || err}`);
      return false;
    } finally {
      setSavingPriceId(null);
    }
  };

  // Guardar recetas personalizadas y precios en PocketBase
  const handleSaveRecipes = async (recipesMapOrKey, singleData, productId, updatedPricesMap) => {
    let updated;
    if (typeof recipesMapOrKey === 'string') {
      updated = { ...customRecipes, [recipesMapOrKey]: singleData };
    } else {
      updated = { ...customRecipes, ...recipesMapOrKey };
    }
    setCustomRecipes(updated);
    try {
      localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving recipe to localStorage:', e);
    }

    if (productId) {
      try {
        const pbUpdate = {};
        const formatPb = (r) => formatRecipeForPb(r, config);

        const currentProd = products.find((p) => p.id === productId);
        const existingRecipesJson =
          currentProd?.recipes && typeof currentProd.recipes === 'object'
            ? { ...currentProd.recipes }
            : {};

        if (typeof recipesMapOrKey === 'object') {
          if (recipesMapOrKey[`${productId}_8oz`]) {
            const r8 = recipesMapOrKey[`${productId}_8oz`];
            existingRecipesJson['8oz'] = r8;
            pbUpdate.recipe8oz = formatPb(r8);
          }
          if (recipesMapOrKey[`${productId}_12oz`]) {
            const r12 = recipesMapOrKey[`${productId}_12oz`];
            existingRecipesJson['12oz'] = r12;
            pbUpdate.recipe12oz = formatPb(r12);
          }
          if (recipesMapOrKey[`${productId}_16oz`]) {
            const r16 = recipesMapOrKey[`${productId}_16oz`];
            existingRecipesJson['16oz'] = r16;
            pbUpdate.recipe16oz = formatPb(r16);
          }
          if (recipesMapOrKey[`${productId}_standard`]) {
            const rStd = recipesMapOrKey[`${productId}_standard`];
            existingRecipesJson['standard'] = rStd;
          }
          if (recipesMapOrKey[`${productId}_extra`]) {
            const rExt = recipesMapOrKey[`${productId}_extra`];
            existingRecipesJson['extra'] = rExt;
          }
        } else if (typeof recipesMapOrKey === 'string' && singleData) {
          const sz = recipesMapOrKey.replace(`${productId}_`, '');
          existingRecipesJson[sz] = singleData;
          if (sz === '8oz') pbUpdate.recipe8oz = formatPb(singleData);
          if (sz === '12oz') pbUpdate.recipe12oz = formatPb(singleData);
          if (sz === '16oz') pbUpdate.recipe16oz = formatPb(singleData);
        }

        pbUpdate.recipes = existingRecipesJson;

        // Precios por tamaño o estándar
        if (updatedPricesMap && typeof updatedPricesMap === 'object') {
          if (updatedPricesMap['8oz'] !== undefined) {
            pbUpdate.price_8oz = Math.max(0, Math.round(Number(updatedPricesMap['8oz']) || 0));
          }
          if (updatedPricesMap['12oz'] !== undefined) {
            pbUpdate.price_12oz = Math.max(0, Math.round(Number(updatedPricesMap['12oz']) || 0));
          }
          if (updatedPricesMap['16oz'] !== undefined) {
            pbUpdate.price_16oz = Math.max(0, Math.round(Number(updatedPricesMap['16oz']) || 0));
          }
          if (updatedPricesMap['standard'] !== undefined) {
            pbUpdate.price = Math.max(0, Math.round(Number(updatedPricesMap['standard']) || 0));
          }
          if (updatedPricesMap['extra'] !== undefined) {
            const extPrice = Math.max(0, Math.round(Number(updatedPricesMap['extra']) || 0));
            pbUpdate.price_extra = extPrice;
            pbUpdate.price = extPrice;
          }
        }

        if (Object.keys(pbUpdate).length > 0) {
          await pb.collection('products_cafeteria').update(productId, pbUpdate);

          // Actualización optimista local de los productos
          setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...pbUpdate } : p)));
          setPriceSuccessToast('✓ Receta y precios actualizados en PocketBase');
          setTimeout(() => setPriceSuccessToast(null), 4000);
        }
      } catch (err) {
        console.warn('PB recipe/price update fallback to localStorage:', err?.message);
      }
    }

    setEditingItem(null);
    setEditingVariantKey(null);
  };

  // Precios efectivos por gramo y ml incluyendo mermas operativas y cantidades compradas
  const effCoffeePerGram = useMemo(() => {
    const rawCostPerG = getUnitCost(
      config.coffeePrice ?? config.coffeeKg,
      config.coffeeQty ?? 1,
      config.coffeeUnit ?? 'kg'
    );
    const wasteFactor = 1 + Number(config.coffeeWaste || 0) / 100;
    return rawCostPerG * wasteFactor;
  }, [
    config.coffeePrice,
    config.coffeeKg,
    config.coffeeQty,
    config.coffeeUnit,
    config.coffeeWaste,
  ]);

  const effMilkPerMl = useMemo(() => {
    const rawCostPerMl = getUnitCost(
      config.milkPrice ?? config.milkLiter,
      config.milkQty ?? 1,
      config.milkUnit ?? 'L'
    );
    const wasteFactor = 1 + Number(config.milkWaste || 0) / 100;
    return rawCostPerMl * wasteFactor;
  }, [config.milkPrice, config.milkLiter, config.milkQty, config.milkUnit, config.milkWaste]);

  const effPlantMilkPerMl = useMemo(() => {
    const rawCostPerMl = getUnitCost(
      config.plantMilkPrice ?? config.plantMilkLiter,
      config.plantMilkQty ?? 1,
      config.plantMilkUnit ?? 'L'
    );
    const wasteFactor = 1 + Number(config.milkWaste || 0) / 100;
    return rawCostPerMl * wasteFactor;
  }, [
    config.plantMilkPrice,
    config.plantMilkLiter,
    config.plantMilkQty,
    config.plantMilkUnit,
    config.milkWaste,
  ]);

  const effCocoaPerGram = useMemo(() => {
    return getUnitCost(
      config.cocoaPrice ?? config.cocoaKg ?? 12000,
      config.cocoaQty ?? 1,
      config.cocoaUnit ?? 'kg'
    );
  }, [config.cocoaPrice, config.cocoaKg, config.cocoaQty, config.cocoaUnit]);

  const effMatchaPerGram = useMemo(() => {
    return getUnitCost(
      config.matchaPrice ?? DEFAULT_CONFIG.matchaPrice,
      config.matchaQty ?? DEFAULT_CONFIG.matchaQty,
      config.matchaUnit ?? DEFAULT_CONFIG.matchaUnit
    );
  }, [config.matchaPrice, config.matchaQty, config.matchaUnit]);

  const effIcePerGram = useMemo(() => {
    return getUnitCost(
      config.icePrice ?? config.iceKg ?? 3000,
      config.iceQty ?? 10,
      config.iceUnit ?? 'kg'
    );
  }, [config.icePrice, config.iceKg, config.iceQty, config.iceUnit]);

  const effIceCreamPerGram = useMemo(() => {
    return getUnitCost(
      config.iceCreamPrice ?? config.iceCreamKg ?? 8000,
      config.iceCreamQty ?? 1,
      config.iceCreamUnit ?? 'kg'
    );
  }, [config.iceCreamPrice, config.iceCreamKg, config.iceCreamQty, config.iceCreamUnit]);

  const effCreamPerMl = useMemo(() => {
    return getUnitCost(
      config.creamPrice ?? config.creamLiter ?? 6000,
      config.creamQty ?? 1,
      config.creamUnit ?? 'L'
    );
  }, [config.creamPrice, config.creamLiter, config.creamQty, config.creamUnit]);

  const effChargerPerUnit = useMemo(() => {
    return getUnitCost(
      config.chargerPrice ?? 15000,
      config.chargerQty ?? 10,
      config.chargerUnit ?? 'unidad'
    );
  }, [config.chargerPrice, config.chargerQty, config.chargerUnit]);

  // Costo efectivo por gramo/ml de crema montada en sifón (crema líquida + carga gas N2O prorrateada)
  const effWhippedCreamPerGram = useMemo(() => {
    const yieldMl = Number(config.chargerYieldMl) || 500;
    const gasCostPerMl = yieldMl > 0 ? effChargerPerUnit / yieldMl : 0;
    return effCreamPerMl + gasCostPerMl;
  }, [effCreamPerMl, effChargerPerUnit, config.chargerYieldMl]);

  const effSyrupPerMl = useMemo(() => {
    return getUnitCost(
      config.syrupPrice ?? config.syrupLiter ?? 11000,
      config.syrupQty ?? 1,
      config.syrupUnit ?? 'L'
    );
  }, [config.syrupPrice, config.syrupLiter, config.syrupQty, config.syrupUnit]);

  const effSaucePerGram = useMemo(() => {
    return getUnitCost(
      config.saucePrice ?? config.sauceKg ?? 9500,
      config.sauceQty ?? 1,
      config.sauceUnit ?? 'kg'
    );
  }, [config.saucePrice, config.sauceKg, config.sauceQty, config.sauceUnit]);

  const effChocolateBar = useMemo(() => {
    return getUnitCost(
      config.chocolateBarPrice ?? config.chocolateBarUnit ?? 450,
      config.chocolateBarQty ?? 1,
      'u'
    );
  }, [config.chocolateBarPrice, config.chocolateBarUnit, config.chocolateBarQty]);

  const effSmoothieCost = useMemo(() => {
    return getUnitCost(
      config.smoothiePrice ?? config.smoothieCost ?? 1400,
      config.smoothieQty ?? 1,
      config.smoothieUnit ?? 'porción'
    );
  }, [config.smoothiePrice, config.smoothieCost, config.smoothieQty, config.smoothieUnit]);

  const effOreoCost = useMemo(() => {
    const unit = (config.oreoUnit || 'g').toLowerCase().trim();
    const isUnit = unit === 'unidad' || unit === 'u' || unit === 'unidades';
    const unitCost = getUnitCost(
      config.oreoPrice ?? DEFAULT_CONFIG.oreoPrice,
      config.oreoQty ?? DEFAULT_CONFIG.oreoQty,
      config.oreoUnit ?? DEFAULT_CONFIG.oreoUnit
    );
    const perUnit = isUnit ? unitCost : unitCost * 11;
    const perGram = isUnit ? unitCost / 11 : unitCost;
    return { perGram, perUnit, isUnit, unitCost };
  }, [config.oreoPrice, config.oreoQty, config.oreoUnit]);

  const effHamPerGram = useMemo(() => {
    return getUnitCost(
      config.hamPrice ?? DEFAULT_CONFIG.hamPrice,
      config.hamQty ?? DEFAULT_CONFIG.hamQty,
      config.hamUnit ?? DEFAULT_CONFIG.hamUnit
    );
  }, [config.hamPrice, config.hamQty, config.hamUnit]);

  const effTyboPerGram = useMemo(() => {
    return getUnitCost(
      config.tyboPrice ?? DEFAULT_CONFIG.tyboPrice,
      config.tyboQty ?? DEFAULT_CONFIG.tyboQty,
      config.tyboUnit ?? DEFAULT_CONFIG.tyboUnit
    );
  }, [config.tyboPrice, config.tyboQty, config.tyboUnit]);

  const effCheddarPerGram = useMemo(() => {
    return getUnitCost(
      config.cheddarPrice ?? DEFAULT_CONFIG.cheddarPrice,
      config.cheddarQty ?? DEFAULT_CONFIG.cheddarQty,
      config.cheddarUnit ?? DEFAULT_CONFIG.cheddarUnit
    );
  }, [config.cheddarPrice, config.cheddarQty, config.cheddarUnit]);

  const effLomitoPerGram = useMemo(() => {
    return getUnitCost(
      config.lomitoPrice ?? DEFAULT_CONFIG.lomitoPrice,
      config.lomitoQty ?? DEFAULT_CONFIG.lomitoQty,
      config.lomitoUnit ?? DEFAULT_CONFIG.lomitoUnit
    );
  }, [config.lomitoPrice, config.lomitoQty, config.lomitoUnit]);

  const effSardoPerGram = useMemo(() => {
    return getUnitCost(
      config.sardoPrice ?? DEFAULT_CONFIG.sardoPrice,
      config.sardoQty ?? DEFAULT_CONFIG.sardoQty,
      config.sardoUnit ?? DEFAULT_CONFIG.sardoUnit
    );
  }, [config.sardoPrice, config.sardoQty, config.sardoUnit]);

  const effMandiocaPerGram = useMemo(() => {
    return getUnitCost(
      config.mandiocaPrice ?? DEFAULT_CONFIG.mandiocaPrice,
      config.mandiocaQty ?? DEFAULT_CONFIG.mandiocaQty,
      config.mandiocaUnit ?? DEFAULT_CONFIG.mandiocaUnit
    );
  }, [config.mandiocaPrice, config.mandiocaQty, config.mandiocaUnit]);

  const effEggPerUnit = useMemo(() => {
    return getUnitCost(
      config.eggsPrice ?? DEFAULT_CONFIG.eggsPrice,
      config.eggsQty ?? DEFAULT_CONFIG.eggsQty,
      config.eggsUnit ?? DEFAULT_CONFIG.eggsUnit
    );
  }, [config.eggsPrice, config.eggsQty, config.eggsUnit]);

  const effSaltPerGram = useMemo(() => {
    return getUnitCost(
      config.saltPrice ?? DEFAULT_CONFIG.saltPrice,
      config.saltQty ?? DEFAULT_CONFIG.saltQty,
      config.saltUnit ?? DEFAULT_CONFIG.saltUnit
    );
  }, [config.saltPrice, config.saltQty, config.saltUnit]);

  const effSugarPerGram = useMemo(() => {
    return getUnitCost(
      config.sugarPrice ?? DEFAULT_CONFIG.sugarPrice,
      config.sugarQty ?? DEFAULT_CONFIG.sugarQty,
      config.sugarUnit ?? DEFAULT_CONFIG.sugarUnit
    );
  }, [config.sugarPrice, config.sugarQty, config.sugarUnit]);

  const effFlourPerGram = useMemo(() => {
    return getUnitCost(
      config.flour0000Price ?? DEFAULT_CONFIG.flour0000Price,
      config.flour0000Qty ?? DEFAULT_CONFIG.flour0000Qty,
      config.flour0000Unit ?? DEFAULT_CONFIG.flour0000Unit
    );
  }, [config.flour0000Price, config.flour0000Qty, config.flour0000Unit]);

  const effButterPerGram = useMemo(() => {
    return getUnitCost(
      config.butterPrice ?? DEFAULT_CONFIG.butterPrice,
      config.butterQty ?? DEFAULT_CONFIG.butterQty,
      config.butterUnit ?? DEFAULT_CONFIG.butterUnit
    );
  }, [config.butterPrice, config.butterQty, config.butterUnit]);

  const effBakingDarkChocPerGram = useMemo(() => {
    return getUnitCost(
      config.bakingDarkChocPrice ?? DEFAULT_CONFIG.bakingDarkChocPrice,
      config.bakingDarkChocQty ?? DEFAULT_CONFIG.bakingDarkChocQty,
      config.bakingDarkChocUnit ?? DEFAULT_CONFIG.bakingDarkChocUnit
    );
  }, [config.bakingDarkChocPrice, config.bakingDarkChocQty, config.bakingDarkChocUnit]);

  const effBakingWhiteChocPerGram = useMemo(() => {
    return getUnitCost(
      config.bakingWhiteChocPrice ?? DEFAULT_CONFIG.bakingWhiteChocPrice,
      config.bakingWhiteChocQty ?? DEFAULT_CONFIG.bakingWhiteChocQty,
      config.bakingWhiteChocUnit ?? DEFAULT_CONFIG.bakingWhiteChocUnit
    );
  }, [config.bakingWhiteChocPrice, config.bakingWhiteChocQty, config.bakingWhiteChocUnit]);

  const effBakingMilkChocPerGram = useMemo(() => {
    return getUnitCost(
      config.bakingMilkChocPrice ?? DEFAULT_CONFIG.bakingMilkChocPrice,
      config.bakingMilkChocQty ?? DEFAULT_CONFIG.bakingMilkChocQty,
      config.bakingMilkChocUnit ?? DEFAULT_CONFIG.bakingMilkChocUnit
    );
  }, [config.bakingMilkChocPrice, config.bakingMilkChocQty, config.bakingMilkChocUnit]);

  // Costo por gramo según el sabor de salsa seleccionado (con fallback)
  const getSauceFlavorCost = useCallback(
    (flavorId) => {
      const list = config.sauceFlavors || DEFAULT_CONFIG.sauceFlavors;
      if (flavorId && Array.isArray(list)) {
        const found = list.find(
          (f) => f.id === flavorId || f.name?.toLowerCase() === String(flavorId).toLowerCase()
        );
        if (found) {
          return getUnitCost(found.price, found.qty, found.unit);
        }
      }
      if (Array.isArray(list) && list.length > 0) {
        return getUnitCost(list[0].price, list[0].qty, list[0].unit);
      }
      return effSaucePerGram;
    },
    [config.sauceFlavors, effSaucePerGram]
  );

  // Costo por ml según el sabor de syrup seleccionado (con fallback)
  const getSyrupFlavorCost = useCallback(
    (flavorId) => {
      const list = config.syrupFlavors || DEFAULT_CONFIG.syrupFlavors;
      if (flavorId && Array.isArray(list)) {
        const found = list.find(
          (f) => f.id === flavorId || f.name?.toLowerCase() === String(flavorId).toLowerCase()
        );
        if (found) {
          return getUnitCost(found.price, found.qty, found.unit);
        }
      }
      if (Array.isArray(list) && list.length > 0) {
        return getUnitCost(list[0].price, list[0].qty, list[0].unit);
      }
      return effSyrupPerMl;
    },
    [config.syrupFlavors, effSyrupPerMl]
  );

  // Costo por porción según el sabor de smoothie seleccionado y el tamaño del vaso (12oz vs 16oz)
  const getSmoothieFlavorCost = useCallback(
    (flavorId, sizeKey = '12oz', customPulpaGrams = null) => {
      const list = config.smoothieFlavors || DEFAULT_CONFIG.smoothieFlavors;
      const is16 = (sizeKey || '').toLowerCase().includes('16oz') || sizeKey === '16';
      const pulpaGrams =
        customPulpaGrams !== null && Number(customPulpaGrams) > 0
          ? Number(customPulpaGrams)
          : is16
            ? 130
            : 95;

      const calcFlavorCost = (item) => {
        if (!item) return is16 ? Math.round(1400 * 1.37) : 1400;
        const rate = getUnitCost(item.price, item.qty, item.unit);
        const u = (item.unit || '').toLowerCase().trim();
        if (u === 'kg' || u === 'g') {
          return Math.round(rate * pulpaGrams);
        }
        return Math.round(is16 ? rate * 1.37 : rate);
      };

      if (flavorId && Array.isArray(list)) {
        if (flavorId === 'promedio' || flavorId === 'average') {
          const totalCost = list.reduce((acc, f) => acc + calcFlavorCost(f), 0);
          return list.length > 0
            ? Math.round(totalCost / list.length)
            : is16
              ? Math.round(effSmoothieCost * 1.37)
              : effSmoothieCost;
        }
        const found = list.find(
          (f) =>
            f.id === flavorId ||
            f.name?.toLowerCase().trim() === String(flavorId).toLowerCase().trim()
        );
        if (found) {
          return calcFlavorCost(found);
        }
      }
      if (Array.isArray(list) && list.length > 0) {
        const totalCost = list.reduce((acc, f) => acc + calcFlavorCost(f), 0);
        return Math.round(totalCost / list.length);
      }
      return is16 ? Math.round(effSmoothieCost * 1.37) : effSmoothieCost;
    },
    [config.smoothieFlavors, effSmoothieCost]
  );

  const effPackaging8oz = useMemo(() => {
    return getUnitCost(
      config.packaging8ozPrice ?? config.packaging8oz ?? 220,
      config.packaging8ozQty ?? 1,
      'u'
    );
  }, [config.packaging8ozPrice, config.packaging8oz, config.packaging8ozQty]);

  const effPackaging12oz = useMemo(() => {
    return getUnitCost(
      config.packaging12ozPrice ?? config.packaging12oz ?? config.packagingPrice ?? 250,
      config.packaging12ozQty ?? config.packagingQty ?? 1,
      'u'
    );
  }, [
    config.packaging12ozPrice,
    config.packaging12oz,
    config.packagingPrice,
    config.packaging12ozQty,
    config.packagingQty,
  ]);

  const effPackaging16oz = useMemo(() => {
    return getUnitCost(
      config.packaging16ozPrice ?? config.packaging16oz ?? 290,
      config.packaging16ozQty ?? 1,
      'u'
    );
  }, [config.packaging16ozPrice, config.packaging16oz, config.packaging16ozQty]);

  const effPackagingCold12oz = useMemo(() => {
    return getUnitCost(
      config.packagingCold12ozPrice ?? config.packagingCold12oz ?? config.packagingColdPrice ?? 380,
      config.packagingCold12ozQty ?? config.packagingColdQty ?? 1,
      'u'
    );
  }, [
    config.packagingCold12ozPrice,
    config.packagingCold12oz,
    config.packagingColdPrice,
    config.packagingCold12ozQty,
    config.packagingColdQty,
  ]);

  const effPackagingCold16oz = useMemo(() => {
    return getUnitCost(
      config.packagingCold16ozPrice ?? config.packagingCold16oz ?? 440,
      config.packagingCold16ozQty ?? 1,
      'u'
    );
  }, [config.packagingCold16ozPrice, config.packagingCold16oz, config.packagingCold16ozQty]);

  const effPackaging = effPackaging12oz;
  const effPackagingCold = effPackagingCold12oz;

  // Helper para obtener costo unitario de descartable según tipo y tamaño (8oz, 12oz, 16oz)
  const getPackagingUnitCost = useCallback(
    (cupType, sizeKey) => {
      const isCold = cupType === 'milkshake';
      const s = (sizeKey || '').toLowerCase();
      if (isCold) {
        // Milkshake no tiene 8oz. 16oz usa packagingCold16oz, todo lo demás 12oz
        if (s.includes('16oz') || s === '16') return effPackagingCold16oz;
        return effPackagingCold12oz;
      } else {
        if (s.includes('8oz') || s === '8') return effPackaging8oz;
        if (s.includes('16oz') || s === '16') return effPackaging16oz;
        return effPackaging12oz;
      }
    },
    [
      effPackaging8oz,
      effPackaging12oz,
      effPackaging16oz,
      effPackagingCold12oz,
      effPackagingCold16oz,
    ]
  );

  const effExtras = useMemo(() => {
    return getUnitCost(config.extrasPrice ?? config.extras ?? 60, config.extrasQty ?? 1, 'u');
  }, [config.extrasPrice, config.extras, config.extrasQty]);

  const effPlantMilkFund = useMemo(() => {
    return Number(config.plantMilkFundPrice ?? config.plantMilkFund ?? 0);
  }, [config.plantMilkFundPrice, config.plantMilkFund]);

  // Función de cálculo de costo por bebida o pastelería
  const calculateCost = useCallback(
    (recipe, isTakeAway = false) => {
      if (recipe?.isPastry) {
        const baseBakery = Number(recipe.baseBakeryCost ?? recipe.pastryCost ?? 0);
        const costHam = (Number(recipe.jamonGrams) || 0) * effHamPerGram;
        const costTybo = (Number(recipe.tyboGrams) || 0) * effTyboPerGram;
        const costCheddar = (Number(recipe.cheddarGrams) || 0) * effCheddarPerGram;
        const costLomito = (Number(recipe.lomitoGrams) || 0) * effLomitoPerGram;
        const costSardo = (Number(recipe.sardoGrams) || 0) * effSardoPerGram;
        const deliIngredientsCost = costHam + costTybo + costCheddar + costLomito + costSardo;

        const costMandioca = (Number(recipe.mandiocaGrams) || 0) * effMandiocaPerGram;
        const costEggs = (Number(recipe.eggsCount) || 0) * effEggPerUnit;
        const costFlour = (Number(recipe.flourGrams) || 0) * effFlourPerGram;
        const costButter = (Number(recipe.butterGrams) || 0) * effButterPerGram;
        const costSugar = (Number(recipe.sugarGrams) || 0) * effSugarPerGram;
        const costSalt = (Number(recipe.saltGrams) || 0) * effSaltPerGram;
        const costDarkChoc = (Number(recipe.darkChocGrams) || 0) * effBakingDarkChocPerGram;
        const costWhiteChoc = (Number(recipe.whiteChocGrams) || 0) * effBakingWhiteChocPerGram;
        const costMilkChoc = (Number(recipe.milkChocGrams) || 0) * effBakingMilkChocPerGram;
        const bakingIngredientsCost =
          costMandioca +
          costEggs +
          costFlour +
          costButter +
          costSugar +
          costSalt +
          costDarkChoc +
          costWhiteChoc +
          costMilkChoc;

        const additionalIngredientsCost = deliIngredientsCost + bakingIngredientsCost;
        const basePastry =
          additionalIngredientsCost > 0
            ? baseBakery + additionalIngredientsCost
            : Number(recipe.pastryCost || baseBakery || 0);

        const costPkg = isTakeAway ? effPackaging12oz / 2 : 0;
        const costExtras = effExtras / 2;
        const total = basePastry + costPkg + costExtras;
        return {
          total,
          costCoffee: 0,
          costMilk: 0,
          costOreo: 0,
          costSyrup: 0,
          costSauce: 0,
          costSpecial: 0,
          costWhippedCream: 0,
          costPkg,
          costExtras,
          costPlantMilkFund: 0,
          costBase: baseBakery,
          costHam,
          costTybo,
          costCheddar,
          costLomito,
          costSardo,
          costMandioca,
          costEggs,
          costFlour,
          costButter,
          costSugar,
          costSalt,
          costDarkChoc,
          costWhiteChoc,
          costMilkChoc,
          cupType: 'hot',
        };
      }

      const {
        coffeeGrams = 0,
        milkMl = 0,
        milkType = 'regular',
        cocoaGrams = 0,
        whippedCreamGrams = 0,
        syrupMl = 0,
        syrupFlavor = '',
        syrup2Ml = 0,
        syrup2Flavor = '',
        syrup3Ml = 0,
        syrup3Flavor = '',
        matchaGrams = 0,
        sauceGrams = 0,
        sauceFlavor = '',
        chocolateCost = 0,
        smoothieCost = 0,
        smoothieFlavor = '',
        isSmoothie = false,
        sizeKey = '',
      } = recipe || {};

      const isExtraItem = Boolean(
        recipe?.category === 'extra' ||
          recipe?.sizeKey === 'extra' ||
          recipe?.isExtra ||
          (recipe?.name || '').toLowerCase().includes('extra') ||
          (recipe?.name || '').toLowerCase().includes('adicional')
      );

      const costCoffee = (Number(coffeeGrams) || 0) * effCoffeePerGram;
      const costMatcha = (Number(matchaGrams) || 0) * effMatchaPerGram;

      let milkCostPerMl = 0;
      if (milkType === 'plant') {
        milkCostPerMl = isExtraItem
          ? Math.max(0, effPlantMilkPerMl - effMilkPerMl)
          : effPlantMilkPerMl;
      } else if (milkType === 'regular') {
        milkCostPerMl = effMilkPerMl;
      }

      const costMilk = (Number(milkMl) || 0) * milkCostPerMl;
      const costCocoa = (Number(cocoaGrams) || 0) * effCocoaPerGram;
      const costSyrup1 = (Number(syrupMl) || 0) * getSyrupFlavorCost(syrupFlavor);
      const costSyrup2 = (Number(syrup2Ml) || 0) * getSyrupFlavorCost(syrup2Flavor);
      const costSyrup3 = (Number(syrup3Ml) || 0) * getSyrupFlavorCost(syrup3Flavor);
      const costSyrup = costSyrup1 + costSyrup2 + costSyrup3;
      const costSauce = (Number(sauceGrams) || 0) * getSauceFlavorCost(sauceFlavor);
      const costSpecial =
        chocolateCost !== undefined && chocolateCost !== 0
          ? Number(chocolateCost)
          : recipe?.chocolateBar
            ? effChocolateBar
            : 0;
      const is16 = (sizeKey || '').toLowerCase().includes('16oz') || sizeKey === '16';
      const isSmoothieProduct = Boolean(
        isSmoothie || recipe?.isSmoothie || isSmoothieItem(recipe, recipe?.category, recipe?.name)
      );
      const costSmoothie = (() => {
        if (!isSmoothieProduct) return 0;
        if (Number(smoothieCost) > 0) {
          return Number(smoothieCost);
        }
        if (smoothieFlavor) {
          return getSmoothieFlavorCost(smoothieFlavor || 'promedio', sizeKey, recipe?.pulpaGrams);
        }
        return 0;
      })();

      const isColdDrinkItem =
        isSmoothieProduct ||
        isMilkshakeCup(recipe, recipe?.category, recipe?.name) ||
        Boolean(recipe?.isCold);

      const costIce = isColdDrinkItem
        ? (recipe?.iceGrams !== undefined && recipe.iceGrams !== null && recipe.iceGrams !== ''
            ? Number(recipe.iceGrams)
            : isSmoothieProduct
              ? is16
                ? 200
                : 150
              : 0) * effIcePerGram
        : 0;

      const isMilkshake =
        (recipe?.name || '').toLowerCase().includes('milkshake') ||
        (recipe?.name || '').toLowerCase().includes('batido');
      const effIceCreamGrams = isMilkshake
        ? recipe?.iceCreamGrams !== undefined &&
          recipe.iceCreamGrams !== null &&
          recipe.iceCreamGrams !== ''
          ? Number(recipe.iceCreamGrams)
          : is16
            ? 180
            : 120
        : 0;
      const costIceCream = effIceCreamGrams * effIceCreamPerGram;

      const effWhippedCreamGrams =
        recipe?.whippedCreamGrams !== undefined &&
        recipe.whippedCreamGrams !== null &&
        recipe.whippedCreamGrams !== ''
          ? Number(recipe.whippedCreamGrams)
          : 0;
      const costWhippedCream = effWhippedCreamGrams * effWhippedCreamPerGram;

      let oreoUnits = Number(recipe?.oreoUnits ?? recipe?.oreoQty ?? 0);
      let oreoGrams = Number(recipe?.oreoGrams ?? 0);
      const rName = (recipe?.name || '').toLowerCase();
      if (oreoUnits === 0 && oreoGrams === 0 && rName.includes('oreo')) {
        oreoUnits = is16 ? 2.5 : 2;
      }
      const costOreo =
        oreoUnits > 0
          ? oreoUnits * effOreoCost.perUnit
          : oreoGrams > 0
            ? oreoGrams * effOreoCost.perGram
            : 0;

      // Determinación precisa del tipo de vaso: Vaso Milkshake (domo + sorbete) vs Vaso Térmico de Café, y su tamaño
      const isColdMilkshake = isSmoothie || isMilkshakeCup(recipe, recipe?.category, recipe?.name);
      const cupType = isColdMilkshake ? 'milkshake' : 'hot';
      const cupCost = getPackagingUnitCost(cupType, sizeKey);
      const costPkg = isTakeAway && !isExtraItem ? cupCost : 0;
      const costExtras = isExtraItem ? 0 : effExtras;
      const costPlantMilkFund = isExtraItem ? 0 : effPlantMilkFund;

      const total =
        costCoffee +
        costMatcha +
        costMilk +
        costCocoa +
        costOreo +
        costSyrup +
        costSauce +
        costSpecial +
        costSmoothie +
        costIce +
        costIceCream +
        costWhippedCream +
        costPkg +
        costExtras +
        costPlantMilkFund;
      return {
        total,
        costCoffee,
        costMatcha,
        costMilk,
        costCocoa,
        costOreo,
        oreoUnits,
        oreoGrams,
        costSyrup,
        costSauce,
        costSpecial,
        costSmoothie,
        costIce,
        costIceCream,
        costWhippedCream,
        costPkg,
        costExtras,
        costPlantMilkFund,
        costBase:
          costCoffee +
          costMatcha +
          costMilk +
          costCocoa +
          costOreo +
          costSyrup +
          costSauce +
          costSpecial +
          costSmoothie +
          costIce +
          costIceCream +
          costWhippedCream +
          costPlantMilkFund,
        cupType: isColdMilkshake ? 'milkshake' : 'hot',
        cupCost,
      };
    },
    [
      effCoffeePerGram,
      effMatchaPerGram,
      effPlantMilkPerMl,
      effMilkPerMl,
      effCocoaPerGram,
      effOreoCost,
      effIcePerGram,
      effIceCreamPerGram,
      effWhippedCreamPerGram,
      getSyrupFlavorCost,
      getSauceFlavorCost,
      getSmoothieFlavorCost,
      effChocolateBar,
      effSmoothieCost,
      getPackagingUnitCost,
      effPackaging12oz,
      effExtras,
      effPlantMilkFund,
      effHamPerGram,
      effTyboPerGram,
      effCheddarPerGram,
      effLomitoPerGram,
      effSardoPerGram,
      effMandiocaPerGram,
      effEggPerUnit,
      effSaltPerGram,
      effSugarPerGram,
      effFlourPerGram,
      effButterPerGram,
      effBakingDarkChocPerGram,
      effBakingWhiteChocPerGram,
      effBakingMilkChocPerGram,
    ]
  );

  // Cálculo de precio sugerido según margen objetivo y comisión
  const calculateSuggestedPrice = useCallback(
    (cost, targetMargin = config.targetMargin) => {
      const margin = (Number(targetMargin) || 0) / 100;
      const fee = (Number(config.fee) || 0) / 100;
      const denom = 1 - margin - fee;
      if (denom <= 0) return 0;
      const raw = cost / denom;
      return roundCommercialPrice(raw);
    },
    [config.targetMargin, config.fee]
  );

  // Cálculo de margen y ganancia en base al precio actual de PocketBase
  const evaluateVenta = useCallback(
    (actualPrice, cost) => {
      if (!actualPrice || actualPrice <= 0) {
        return { netIncome: 0, profit: 0, margin: 0, isHealthy: false };
      }
      const fee = (Number(config.fee) || 0) / 100;
      const netIncome = actualPrice * (1 - fee);
      const profit = netIncome - cost;
      const margin = Math.round((profit / actualPrice) * 1000) / 10;
      return {
        netIncome,
        profit,
        margin,
        isHealthy: margin >= (Number(config.targetMargin) || 60) - 5,
      };
    },
    [config.fee, config.targetMargin]
  );

  // Lista procesada: 1 solo item por producto englobando todas sus medidas
  const processedItems = useMemo(() => {
    return products.map((p) => {
      let cat = (p.category || '').toLowerCase().trim();
      if (p.name?.toLowerCase().includes('smoothie')) {
        cat = 'smoothie';
      } else if (!cat) {
        cat = 'clasico';
      }

      const variants = [];
      const pNameLower = (p.name || '').toLowerCase();
      const isNaturallyNoCoffee =
        pNameLower.includes('chocolate caliente') ||
        pNameLower.includes('submarino') ||
        pNameLower.includes('chocolatada') ||
        pNameLower.includes('milkshake') ||
        pNameLower.includes('matcha') ||
        p.id === 'byazqa2facpnoxi';

      // Si es categoría 'extra'
      if (cat === 'extra') {
        const key = `${p.id}_extra`;
        const rawRecipe =
          p.recipes?.['extra'] ||
          customRecipes[key] ||
          detectAiRecipe(p.name, 'extra', cat, config);
        const recipe = {
          ...rawRecipe,
          sizeKey: 'extra',
          category: cat,
          name: p.name,
          isExtra: true,
        };
        if (isNaturallyNoCoffee) recipe.coffeeGrams = 0;
        const price = Number(p.price || p.price_extra || 0);
        const costObj = calculateCost(recipe, false);
        const suggestedPrice = calculateSuggestedPrice(costObj.total);
        variants.push({
          sizeKey: 'extra',
          sizeLabel: 'Adicional',
          recipeKey: key,
          price,
          recipe,
          cost: costObj.total,
          costObj,
          suggestedPrice,
        });
      } else {
        const p8 = Number(p.price_8oz || 0);
        const p12 = Number(p.price_12oz || 0);
        const p16 = Number(p.price_16oz || 0);
        const hasSizes = p8 > 0 || p12 > 0 || p16 > 0;

        if (hasSizes) {
          if (p8 > 0) {
            const key = `${p.id}_8oz`;
            const rawRecipe =
              p.recipes?.['8oz'] ||
              customRecipes[key] ||
              parsePocketBaseRecipe(p.recipe8oz, p.name, '8oz', cat, config);
            const recipe = { ...rawRecipe, sizeKey: '8oz', category: cat, name: p.name };
            if (isNaturallyNoCoffee) recipe.coffeeGrams = 0;
            const costObj = calculateCost(recipe, true);
            const suggestedPrice = calculateSuggestedPrice(costObj.total);
            variants.push({
              sizeKey: '8oz',
              sizeLabel: 'Mini (8oz)',
              recipeKey: key,
              price: p8,
              recipe,
              cost: costObj.total,
              costObj,
              suggestedPrice,
            });
          }
          if (p12 > 0) {
            const key = `${p.id}_12oz`;
            const rawRecipe =
              p.recipes?.['12oz'] ||
              customRecipes[key] ||
              parsePocketBaseRecipe(p.recipe12oz, p.name, '12oz', cat, config);
            const recipe = { ...rawRecipe, sizeKey: '12oz', category: cat, name: p.name };
            if (isNaturallyNoCoffee) recipe.coffeeGrams = 0;
            const costObj = calculateCost(recipe, true);
            const suggestedPrice = calculateSuggestedPrice(costObj.total);
            variants.push({
              sizeKey: '12oz',
              sizeLabel: 'Plus (12oz)',
              recipeKey: key,
              price: p12,
              recipe,
              cost: costObj.total,
              costObj,
              suggestedPrice,
            });
          }
          if (p16 > 0) {
            const key = `${p.id}_16oz`;
            const rawRecipe =
              p.recipes?.['16oz'] ||
              customRecipes[key] ||
              parsePocketBaseRecipe(p.recipe16oz, p.name, '16oz', cat, config);
            const recipe = { ...rawRecipe, sizeKey: '16oz', category: cat, name: p.name };
            if (isNaturallyNoCoffee) recipe.coffeeGrams = 0;
            const costObj = calculateCost(recipe, true);
            const suggestedPrice = calculateSuggestedPrice(costObj.total);
            variants.push({
              sizeKey: '16oz',
              sizeLabel: 'Ultra (16oz)',
              recipeKey: key,
              price: p16,
              recipe,
              cost: costObj.total,
              costObj,
              suggestedPrice,
            });
          }
        } else {
          const key = `${p.id}_standard`;
          const rawRecipe =
            p.recipes?.['standard'] ||
            customRecipes[key] ||
            parsePocketBaseRecipe('', p.name, 'standard', cat, config);
          const recipe = { ...rawRecipe, sizeKey: 'standard', category: cat, name: p.name };
          if (isNaturallyNoCoffee) recipe.coffeeGrams = 0;
          const price = Number(p.price || 0);
          const costObj = calculateCost(recipe, !recipe.isPastry);
          const suggestedPrice = calculateSuggestedPrice(costObj.total);
          variants.push({
            sizeKey: 'standard',
            sizeLabel: 'Unidad',
            recipeKey: key,
            price,
            recipe,
            cost: costObj.total,
            costObj,
            suggestedPrice,
          });
        }
      }

      const costs = variants.map((v) => v.cost);
      const prices = variants.map((v) => v.price).filter((pr) => pr > 0);
      const suggestedPrices = variants.map((v) => v.suggestedPrice);

      const minCost = costs.length > 0 ? Math.min(...costs) : 0;
      const maxCost = costs.length > 0 ? Math.max(...costs) : 0;

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      const minSuggested = suggestedPrices.length > 0 ? Math.min(...suggestedPrices) : 0;
      const maxSuggested = suggestedPrices.length > 0 ? Math.max(...suggestedPrices) : 0;

      const isPastry =
        variants.some((v) => v.recipe?.isPastry) ||
        cat.includes('pasteler') ||
        guessDefaultRecipe(p.name, '', cat).isPastry;

      const isSmoothie =
        variants.some((v) => v.recipe?.isSmoothie || Number(v.recipe?.smoothieCost) > 0) ||
        isSmoothieItem(null, cat, p.name);

      const isExtra =
        cat === 'extra' ||
        cat.includes('extra') ||
        cat.includes('adicional') ||
        pNameLower.includes('extra shot') ||
        pNameLower.includes('crema') ||
        pNameLower.includes('leche vegetal') ||
        pNameLower.includes('leche almendras') ||
        pNameLower.includes('leche avena') ||
        pNameLower.includes('leche coco') ||
        pNameLower.includes('shot de cafe') ||
        pNameLower.includes('shot café') ||
        variants.some((v) => v.recipe?.isExtra);

      return {
        id: p.id,
        name: p.name,
        category: cat,
        hasMultipleSizes: variants.length > 1,
        variants,
        minCost,
        maxCost,
        minPrice,
        maxPrice,
        minSuggested,
        maxSuggested,
        isPastry,
        isSmoothie,
        isExtra,
        record: p,
      };
    });
  }, [products, customRecipes, calculateCost, calculateSuggestedPrice, config]);

  // Categorías ordenadas según CATEGORY_ORDER
  const categories = useMemo(() => {
    const set = new Set();
    processedItems.forEach((it) => {
      if (it.category) set.add(it.category.toLowerCase().trim());
    });
    return Array.from(set).sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a);
      const idxB = CATEGORY_ORDER.indexOf(b);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });
  }, [processedItems]);

  // Filtrar ítems por búsqueda y categoría
  const filteredItems = useMemo(() => {
    return processedItems.filter((item) => {
      const matchesCat =
        selectedCategory === 'todas' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.variants.some(
          (v) =>
            v.sizeKey.toLowerCase().includes(q) ||
            v.sizeLabel.toLowerCase().includes(q) ||
            (v.recipe?.rawRecipeText || '').toLowerCase().includes(q)
        );
      return matchesCat && matchesSearch;
    });
  }, [processedItems, selectedCategory, searchQuery]);

  // Ítems y categorías exclusivos para el Recetario (se excluyen pastelería y extras/adicionales como crema, extra shot, leches vegetales)
  const recipeItems = useMemo(() => {
    return processedItems.filter(
      (item) =>
        !item.isPastry &&
        !item.isExtra &&
        !item.category.includes('pasteler') &&
        !item.category.includes('extra') &&
        !item.category.includes('adicional')
    );
  }, [processedItems]);

  const recipeCategories = useMemo(() => {
    return categories.filter(
      (cat) => !cat.includes('pasteler') && !cat.includes('extra') && !cat.includes('adicional')
    );
  }, [categories]);

  const filteredRecipeItems = useMemo(() => {
    return recipeItems.filter((item) => {
      const activeCat =
        selectedCategory === 'pasteleria' ||
        selectedCategory === 'extra' ||
        selectedCategory === 'adicional'
          ? 'todas'
          : selectedCategory;
      const matchesCat =
        activeCat === 'todas' || item.category.toLowerCase() === activeCat.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.variants.some(
          (v) =>
            v.sizeKey.toLowerCase().includes(q) ||
            v.sizeLabel.toLowerCase().includes(q) ||
            (v.recipe?.rawRecipeText || '').toLowerCase().includes(q)
        );
      return matchesCat && matchesSearch;
    });
  }, [recipeItems, selectedCategory, searchQuery]);

  // Agrupamiento por categorías exclusivo para el Recetario
  const groupedRecipeItems = useMemo(() => {
    const groups = {};
    filteredRecipeItems.forEach((item) => {
      const cat = item.category || 'otros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredRecipeItems]);

  const visibleRecipeCategories = useMemo(() => {
    const keys = Object.keys(groupedRecipeItems);
    return keys.sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a);
      const idxB = CATEGORY_ORDER.indexOf(b);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });
  }, [groupedRecipeItems]);

  // Métricas generales del menú
  const metrics = useMemo(() => {
    if (processedItems.length === 0) {
      return { count: 0, avgMargin: 0, avgProfit: 0, lowMarginCount: 0 };
    }

    let totalMargin = 0;
    let totalProfit = 0;
    let lowMarginCount = 0;
    let validCount = 0;

    processedItems.forEach((item) => {
      item.variants.forEach((v) => {
        if (v.price >= 100) {
          const evalObj = evaluateVenta(v.price, v.cost);
          if (evalObj.margin > -100) {
            totalMargin += evalObj.margin;
            totalProfit += evalObj.profit;
            validCount++;
            if (evalObj.margin < 50) {
              lowMarginCount++;
            }
          }
        }
      });
    });

    return {
      count: processedItems.length,
      avgMargin: validCount > 0 ? Math.round((totalMargin / validCount) * 10) / 10 : 0,
      avgProfit: validCount > 0 ? Math.round(totalProfit / validCount) : 0,
      lowMarginCount,
    };
  }, [processedItems, evaluateVenta]);

  // Cálculo del simulador interactivo
  const simResult = useMemo(() => {
    const effectiveSize = simCupType === 'milkshake' && simSize === '8oz' ? '12oz' : simSize;
    const recipe = {
      coffeeGrams: simCoffee,
      milkMl: simMilk,
      milkType: simMilkType,
      cupType: simCupType,
      sizeKey: effectiveSize,
    };
    const costs = calculateCost(recipe, simTakeAway);
    const suggested = calculateSuggestedPrice(costs.total, simTargetMargin);

    let manualStats = null;
    const manualVal = Number(simManualPrice);
    if (manualVal && manualVal > 0) {
      const fee = Number(config.fee || 0) / 100;
      const net = manualVal * (1 - fee);
      const profit = net - costs.total;
      const margin = Math.round((profit / manualVal) * 1000) / 10;
      manualStats = { profit, margin };
    }

    return { costs, suggested, manualStats, effectiveSize };
  }, [
    simCoffee,
    simMilk,
    simMilkType,
    simTakeAway,
    simCupType,
    simSize,
    simTargetMargin,
    simManualPrice,
    config.fee,
    calculateCost,
    calculateSuggestedPrice,
  ]);

  return (
    <Container>
      <Header>
        <TitleGroup>
          <div className="title-left">
            <Coffee size={28} color="#4ccd99" />
            <h1>Costos Cafetería</h1>
          </div>
          <PbBadge title="Conectado a la colección PocketBase: products_cafeteria">
            <span className="dot" />
            PB: {products.length} ítems
          </PbBadge>
        </TitleGroup>

        <TabsNav>
          <TabButton $active={activeTab === 'menu'} onClick={() => setActiveTab('menu')}>
            <Coffee size={15} />
            <span>Ficha Menú</span>
          </TabButton>
          <TabButton $active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')}>
            <BookOpen size={15} />
            <span>Recetario</span>
          </TabButton>
          <TabButton $active={activeTab === 'inputs'} onClick={() => setActiveTab('inputs')}>
            <Package size={15} />
            <span>Insumos</span>
            {hasConfigChanges && (
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#f59e0b',
                  boxShadow: '0 0 6px #f59e0b',
                  marginLeft: 3,
                }}
                title="Cambios pendientes sin guardar"
              />
            )}
          </TabButton>
          <TabButton $active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')}>
            <Sliders size={15} />
            <span>Simulador</span>
          </TabButton>
        </TabsNav>
      </Header>

      {/* MÉTRICAS RÁPIDAS SUPERIORES (SOLO EN FICHA COMERCIAL Y SIMULADOR) */}
      {activeTab !== 'recipes' && (
        <MetricGrid>
          <MetricCard>
            <span className="label">Margen Promedio</span>
            <span className="value">{metrics.avgMargin}%</span>
            <span className="subtext" style={{ color: '#4ccd99' }}>
              Objetivo: {config.targetMargin}%
            </span>
          </MetricCard>

          <MetricCard>
            <span className="label">Ganancia / Taza</span>
            <span className="value">${metrics.avgProfit.toLocaleString('es-AR')}</span>
            <span className="subtext">Promedio neto</span>
          </MetricCard>

          <MetricCard>
            <span className="label">Productos Carta</span>
            <span className="value">{metrics.count}</span>
            <span className="subtext">Evaluados</span>
          </MetricCard>

          <MetricCard>
            <span className="label">Bajo Margen</span>
            <span
              className="value"
              style={{ color: metrics.lowMarginCount > 0 ? '#ef4444' : '#4ccd99' }}
            >
              {metrics.lowMarginCount}
            </span>
            <span
              className="subtext"
              style={{ color: metrics.lowMarginCount > 0 ? '#ef4444' : '#4ccd99' }}
            >
              {metrics.lowMarginCount > 0 ? 'Menores a 50%' : 'Márgenes óptimos'}
            </span>
          </MetricCard>
        </MetricGrid>
      )}

      {/* TOAST GLOBAL DE NOTIFICACIONES */}
      {priceSuccessToast && (
        <div
          style={{
            background: 'rgba(76, 205, 153, 0.15)',
            border: '1px solid #4ccd99',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            color: '#4ccd99',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(76, 205, 153, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={18} />
            <span>{priceSuccessToast}</span>
          </div>
          <button
            style={{ all: 'unset', cursor: 'pointer', color: '#B4B6C9' }}
            onClick={() => setPriceSuccessToast(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* PESTAÑA 1: FICHA DEL MENÚ EN VIVO CON POCKETBASE */}
      {activeTab === 'menu' && (
        <>
          <FilterBar>
            <SearchInput>
              <Search size={16} color="#A9AABC" />
              <input
                type="text"
                placeholder="Buscar bebida o variedad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  style={{ all: 'unset', cursor: 'pointer', color: '#A9AABC' }}
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </SearchInput>

            <CategoryFilter>
              <CatChip
                $active={selectedCategory === 'todas'}
                onClick={() => setSelectedCategory('todas')}
              >
                Todas ({processedItems.length})
              </CatChip>
              {categories.map((cat) => {
                const count = processedItems.filter((it) => it.category === cat).length;
                return (
                  <CatChip
                    key={cat}
                    $active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {CATEGORY_NAMES[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
                  </CatChip>
                );
              })}
            </CategoryFilter>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginLeft: 'auto',
                flexWrap: 'wrap',
              }}
            >
              {/* Selector de Vista: Tarjetas vs Tabla */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  padding: 3,
                  borderRadius: 9,
                  border: '1px solid rgba(255,255,255,0.08)',
                  gap: 3,
                }}
              >
                <button
                  type="button"
                  onClick={() => setMenuViewMode('cards')}
                  title="Ver en formato tarjetas compactas"
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 10px',
                    borderRadius: 7,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: menuViewMode === 'cards' ? 'rgba(76,205,153,0.2)' : 'transparent',
                    color: menuViewMode === 'cards' ? '#4ccd99' : '#B4B6C9',
                    border:
                      menuViewMode === 'cards'
                        ? '1px solid rgba(76,205,153,0.35)'
                        : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LayoutGrid size={13} />
                  <span>Tarjetas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMenuViewMode('table')}
                  title="Ver en formato tabla comparativa"
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 10px',
                    borderRadius: 7,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: menuViewMode === 'table' ? 'rgba(76,205,153,0.2)' : 'transparent',
                    color: menuViewMode === 'table' ? '#4ccd99' : '#B4B6C9',
                    border:
                      menuViewMode === 'table'
                        ? '1px solid rgba(76,205,153,0.35)'
                        : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <List size={13} />
                  <span>Tabla</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddDrinkModal(true)}
                title="Agregar una nueva bebida a la cafetería y buscar su receta en internet con IA"
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.6)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 9,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Plus size={15} />+ Nueva Bebida
              </button>

              <button
                type="button"
                onClick={handleCalibrateAllWithAi}
                title="Detectar nombres y calibrar automáticamente todas las recetas del menú con IA"
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background:
                    'linear-gradient(135deg, rgba(76,205,153,0.18) 0%, rgba(59,130,246,0.18) 100%)',
                  border: '1px solid rgba(76, 205, 153, 0.4)',
                  color: '#4ccd99',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 13px',
                  borderRadius: 9,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <Sparkles size={15} color="#4ccd99" />
                Calibrar Todo con IA
              </button>
            </div>
          </FilterBar>

          {aiBanner && (
            <div
              style={{
                background: 'rgba(76, 205, 153, 0.15)',
                border: '1px solid #4ccd99',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                color: '#4ccd99',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} />
                <span>{aiBanner}</span>
              </div>
              <button
                style={{ all: 'unset', cursor: 'pointer', color: '#B4B6C9' }}
                onClick={() => setAiBanner(null)}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#B4B6C9' }}>
              <RefreshCw className="animate-spin" size={24} style={{ marginBottom: 12 }} />
              <div>Cargando productos de cafetería desde PocketBase...</div>
            </div>
          ) : error ? (
            <div
              style={{
                padding: '24px',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 12,
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <AlertTriangle size={24} />
              <div>{error}</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                color: '#B4B6C9',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 12,
                marginTop: 16,
              }}
            >
              <Package size={36} color="#B4B6C9" style={{ opacity: 0.4, marginBottom: 10 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                No se encontraron productos
              </div>
              <div style={{ fontSize: 13 }}>
                Intenta ajustar la búsqueda o seleccionar otra categoría.
              </div>
            </div>
          ) : menuViewMode === 'cards' ? (
            <RecipeGrid>
              {filteredItems.map((item) => (
                <MenuProductCard
                  key={item.id}
                  item={item}
                  config={config}
                  evaluateVenta={evaluateVenta}
                  onOpenEdit={handleOpenEdit}
                />
              ))}
            </RecipeGrid>
          ) : (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Medida</th>
                    <th>Costo Elab.</th>
                    <th>Precio Venta</th>
                    <th>Margen %</th>
                    <th>Ganancia Neta</th>
                    <th>Sugerido</th>
                    <th style={{ textAlign: 'center', width: 90 }}>Ajustar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    return item.variants.map((v, vIdx) => {
                      const evalObj = evaluateVenta(v.price, v.cost);
                      return (
                        <tr
                          key={`${item.id}_${v.sizeKey}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleOpenEdit(item, v.sizeKey)}
                        >
                          <td>
                            {vIdx === 0 && (
                              <div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: '#fff',
                                    fontSize: 13,
                                    lineHeight: 1.25,
                                  }}
                                >
                                  {item.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: '#B4B6C9',
                                    marginTop: 2,
                                    opacity: 0.75,
                                  }}
                                >
                                  {CATEGORY_NAMES[item.category] || item.category}
                                </div>
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: '#4ccd99', fontSize: 11.5 }}>
                              {v.sizeLabel || v.sizeKey.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                              ${Math.round(v.cost).toLocaleString('es-AR')}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{ color: v.price > 0 ? '#fff' : '#ef4444', fontWeight: 700 }}
                            >
                              {v.price > 0 ? `$${v.price.toLocaleString('es-AR')}` : 'Sin precio'}
                            </span>
                          </td>
                          <td>
                            {v.price > 0 ? (
                              <MarginPill
                                $variant={
                                  evalObj.isHealthy ? 'good' : evalObj.margin >= 45 ? 'warn' : 'bad'
                                }
                              >
                                {evalObj.margin}%
                              </MarginPill>
                            ) : (
                              <span style={{ color: '#B4B6C9' }}>-</span>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                color:
                                  evalObj.profit > 0
                                    ? '#4ccd99'
                                    : v.price > 0
                                      ? '#ef4444'
                                      : '#B4B6C9',
                                fontWeight: 700,
                              }}
                            >
                              {v.price > 0
                                ? `${evalObj.profit >= 0 ? '+' : ''}$${Math.round(evalObj.profit).toLocaleString('es-AR')}`
                                : '-'}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: '#eab308', fontWeight: 600 }}>
                              ${v.suggestedPrice.toLocaleString('es-AR')}
                            </span>
                          </td>
                          <td
                            style={{ textAlign: 'center', width: 90 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ActionButton
                              onClick={() => handleOpenEdit(item, v.sizeKey)}
                              title="Ajustar receta o precio de esta medida"
                              style={{ padding: '5px 12px', fontSize: 12 }}
                            >
                              <Edit2 size={13} />
                              <span>Ajustar</span>
                            </ActionButton>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </Table>
            </TableWrap>
          )}
        </>
      )}

      {/* PESTAÑA: RECETARIO EXCLUSIVO (SOLO RECETAS) */}
      {activeTab === 'recipes' && (
        <>
          <FilterBar>
            <SearchInput>
              <Search size={16} color="#A9AABC" />
              <input
                type="text"
                placeholder="Buscar receta o ingrediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  style={{ all: 'unset', cursor: 'pointer', color: '#A9AABC' }}
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </SearchInput>

            <CategoryFilter>
              <CatChip
                $active={
                  selectedCategory === 'todas' ||
                  selectedCategory === 'pasteleria' ||
                  selectedCategory === 'extra' ||
                  selectedCategory === 'adicional'
                }
                onClick={() => setSelectedCategory('todas')}
              >
                Todas ({recipeItems.length})
              </CatChip>
              {recipeCategories.map((cat) => {
                const count = recipeItems.filter((it) => it.category === cat).length;
                return (
                  <CatChip
                    key={cat}
                    $active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {CATEGORY_NAMES[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
                  </CatChip>
                );
              })}
            </CategoryFilter>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={() => setShowAddDrinkModal(true)}
                title="Agregar una nueva bebida y buscar su receta en internet con IA"
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.6)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 9,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Plus size={15} />+ Nueva Bebida
              </button>
            </div>
          </FilterBar>

          {/* Cuadrícula de Recetas (Exclusivamente Bebidas / Sin Pastelería) */}
          {filteredRecipeItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                color: '#B4B6C9',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 12,
                marginTop: 16,
              }}
            >
              <BookOpen size={36} color="#B4B6C9" style={{ opacity: 0.4, marginBottom: 10 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                No se encontraron recetas
              </div>
              <div style={{ fontSize: 13 }}>
                Intenta ajustar la búsqueda o seleccionar otra categoría de bebidas.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
              {visibleRecipeCategories.map((catKey) => {
                const itemsInCat = groupedRecipeItems[catKey] || [];
                if (itemsInCat.length === 0) return null;
                const catTheme = CATEGORY_COLORS[catKey] || {
                  border: '#4ccd99',
                  bg: 'rgba(76, 205, 153, 0.15)',
                  text: '#4ccd99',
                };

                return (
                  <div key={catKey}>
                    {/* Cabecera de Categoría */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        background: 'rgba(0, 0, 0, 0.32)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderLeft: `4px solid ${catTheme.border}`,
                        borderRadius: 10,
                        marginBottom: 12,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: '#fff',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {CATEGORY_NAMES[catKey] ||
                            catKey.charAt(0).toUpperCase() + catKey.slice(1)}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            background: catTheme.bg,
                            border: `1px solid ${catTheme.border}55`,
                            color: catTheme.text,
                            padding: '2px 8px',
                            borderRadius: 12,
                          }}
                        >
                          {itemsInCat.length} {itemsInCat.length === 1 ? 'receta' : 'recetas'}
                        </span>
                      </div>
                    </div>

                    {/* Grilla de Recetas de esta Categoría */}
                    <RecipeGrid style={{ marginTop: 0 }}>
                      {itemsInCat.map((item) => (
                        <RecipeProductCard
                          key={item.id}
                          item={item}
                          config={config}
                          onOpenEdit={handleOpenEdit}
                        />
                      ))}
                    </RecipeGrid>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PESTAÑA 2: CONFIGURACIÓN DE INSUMOS BASE (PRECIOS DE COMPRA) */}
      {activeTab === 'inputs' && (
        <>
          {/* BANNER DE ESTADO Y ACCIONES DE GUARDADO */}
          <div
            style={{
              background: hasConfigChanges
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(61, 0, 15, 0.85))'
                : 'linear-gradient(135deg, rgba(76, 205, 153, 0.1), rgba(61, 0, 15, 0.65))',
              border: `1px solid ${hasConfigChanges ? 'rgba(245, 158, 11, 0.45)' : 'rgba(76, 205, 153, 0.25)'}`,
              borderRadius: 12,
              padding: '12px 18px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              boxShadow: hasConfigChanges
                ? '0 4px 18px rgba(245, 158, 11, 0.15)'
                : '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: hasConfigChanges
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(76, 205, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: hasConfigChanges ? '#f59e0b' : '#4ccd99',
                  flexShrink: 0,
                }}
              >
                {hasConfigChanges ? <AlertTriangle size={20} /> : <Check size={20} />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                  {hasConfigChanges
                    ? '⚠️ Hay cambios pendientes en los insumos'
                    : '✓ Costos de insumos sincronizados con PocketBase'}
                </div>
                <div style={{ fontSize: 12, color: '#B4B6C9' }}>
                  {hasConfigChanges
                    ? 'Los cambios se calculan al instante de forma fluida. Pulsa "Confirmar Cambios" para guardarlos definitivamente.'
                    : 'Todos los costos de compra, mermas y raciones están guardados en PocketBase.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {hasConfigChanges && (
                <button
                  type="button"
                  onClick={handleDiscardConfig}
                  disabled={isSavingConfig}
                  style={{
                    all: 'unset',
                    cursor: isSavingConfig ? 'not-allowed' : 'pointer',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#B4B6C9',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <X size={14} /> Descartar Cambios
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={!hasConfigChanges || isSavingConfig}
                style={{
                  all: 'unset',
                  cursor: !hasConfigChanges || isSavingConfig ? 'not-allowed' : 'pointer',
                  padding: '8px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: hasConfigChanges ? '#1a0006' : 'rgba(255, 255, 255, 0.4)',
                  background: hasConfigChanges ? '#4ccd99' : 'rgba(255, 255, 255, 0.08)',
                  border: hasConfigChanges ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: hasConfigChanges ? '0 4px 14px rgba(76, 205, 153, 0.35)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease',
                }}
              >
                {isSavingConfig ? (
                  <>
                    <RefreshCw className="animate-spin" size={15} />
                    <span>Guardando en PocketBase...</span>
                  </>
                ) : hasConfigChanges ? (
                  <>
                    <Save size={15} />
                    <span>Confirmar Cambios</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Guardado en PB</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <FormGrid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
            {/* 1. INSUMOS DE BARRA */}
            <FormCard>
              <h3 className="card-title">
                <Coffee size={17} color="#4ccd99" />
                Insumos de Barra
              </h3>

              <SupplyList>
                <CompactSupplyItem
                  icon={<Coffee size={15} color="#eab308" />}
                  title="Café en Grano"
                  price={config.coffeePrice ?? config.coffeeKg}
                  qty={config.coffeeQty ?? 1}
                  unit={config.coffeeUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('coffeePrice', val)}
                  onQtyChange={(val) => handleConfigChange('coffeeQty', val)}
                  onUnitChange={(val) => handleConfigChange('coffeeUnit', val)}
                  effCostText={`$${effCoffeePerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🥛</span>}
                  title="Leche de Vaca"
                  price={config.milkPrice ?? config.milkLiter}
                  qty={config.milkQty ?? 1}
                  unit={config.milkUnit ?? 'L'}
                  unitOptions={['L', 'ml']}
                  onPriceChange={(val) => handleConfigChange('milkPrice', val)}
                  onQtyChange={(val) => handleConfigChange('milkQty', val)}
                  onUnitChange={(val) => handleConfigChange('milkUnit', val)}
                  effCostText={`$${effMilkPerMl.toFixed(2)} / ml`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🌱</span>}
                  title="Leche Vegetal"
                  price={config.plantMilkPrice ?? config.plantMilkLiter}
                  qty={config.plantMilkQty ?? 1}
                  unit={config.plantMilkUnit ?? 'L'}
                  unitOptions={['L', 'ml']}
                  onPriceChange={(val) => handleConfigChange('plantMilkPrice', val)}
                  onQtyChange={(val) => handleConfigChange('plantMilkQty', val)}
                  onUnitChange={(val) => handleConfigChange('plantMilkUnit', val)}
                  effCostText={`$${effPlantMilkPerMl.toFixed(2)} / ml`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🍫</span>}
                  title="Cacao en Polvo"
                  price={config.cocoaPrice ?? config.cocoaKg ?? 12000}
                  qty={config.cocoaQty ?? 1}
                  unit={config.cocoaUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('cocoaPrice', val)}
                  onQtyChange={(val) => handleConfigChange('cocoaQty', val)}
                  onUnitChange={(val) => handleConfigChange('cocoaUnit', val)}
                  effCostText={`$${effCocoaPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🍵</span>}
                  title="Té Matcha"
                  price={config.matchaPrice ?? 28000}
                  qty={config.matchaQty ?? 250}
                  unit={config.matchaUnit ?? 'g'}
                  unitOptions={['g', 'kg']}
                  onPriceChange={(val) => handleConfigChange('matchaPrice', val)}
                  onQtyChange={(val) => handleConfigChange('matchaQty', val)}
                  onUnitChange={(val) => handleConfigChange('matchaUnit', val)}
                  effCostText={`$${effMatchaPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🧊</span>}
                  title="Hielo en Rolito"
                  price={config.icePrice ?? config.iceKg ?? 3000}
                  qty={config.iceQty ?? 10}
                  unit={config.iceUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('icePrice', val)}
                  onQtyChange={(val) => handleConfigChange('iceQty', val)}
                  onUnitChange={(val) => handleConfigChange('iceUnit', val)}
                  effCostText={`$${effIcePerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🍨</span>}
                  title="Helado Artesanal / Base"
                  price={config.iceCreamPrice ?? config.iceCreamKg ?? 8000}
                  qty={config.iceCreamQty ?? 1}
                  unit={config.iceCreamUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('iceCreamPrice', val)}
                  onQtyChange={(val) => handleConfigChange('iceCreamQty', val)}
                  onUnitChange={(val) => handleConfigChange('iceCreamUnit', val)}
                  effCostText={`$${effIceCreamPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🥛</span>}
                  title="Pote Crema de Leche"
                  price={config.creamPrice ?? config.creamLiter ?? 6000}
                  qty={config.creamQty ?? 1}
                  unit={config.creamUnit ?? 'L'}
                  unitOptions={['L', 'ml']}
                  onPriceChange={(val) => handleConfigChange('creamPrice', val)}
                  onQtyChange={(val) => handleConfigChange('creamQty', val)}
                  onUnitChange={(val) => handleConfigChange('creamUnit', val)}
                  effCostText={`$${effCreamPerMl.toFixed(2)} / ml`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🎈</span>}
                  title="Cápsulas Gas N2O (Sifón)"
                  price={config.chargerPrice ?? 15000}
                  qty={config.chargerQty ?? 10}
                  unit={config.chargerUnit ?? 'unidad'}
                  unitOptions={['unidad']}
                  onPriceChange={(val) => handleConfigChange('chargerPrice', val)}
                  onQtyChange={(val) => handleConfigChange('chargerQty', val)}
                  onUnitChange={(val) => handleConfigChange('chargerUnit', val)}
                  effCostText={`$${effChargerPerUnit.toFixed(0)} / cáp.`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🍪</span>}
                  title="Galletitas Oreo"
                  price={config.oreoPrice ?? DEFAULT_CONFIG.oreoPrice}
                  qty={config.oreoQty ?? DEFAULT_CONFIG.oreoQty}
                  unit={config.oreoUnit ?? DEFAULT_CONFIG.oreoUnit}
                  unitOptions={['g', 'unidad', 'kg']}
                  onPriceChange={(val) => handleConfigChange('oreoPrice', val)}
                  onQtyChange={(val) => handleConfigChange('oreoQty', val)}
                  onUnitChange={(val) => handleConfigChange('oreoUnit', val)}
                  effCostText={
                    (config.oreoUnit || '').toLowerCase().includes('u')
                      ? `$${effOreoCost.perUnit.toFixed(1)} / u`
                      : `$${effOreoCost.perGram.toFixed(2)} / g ($${effOreoCost.perUnit.toFixed(1)}/u)`
                  }
                />

                <div
                  style={{
                    gridColumn: '1 / -1',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: 8,
                    padding: '7px 12px',
                    fontSize: 11,
                    color: '#93c5fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span>
                    🍦 <strong>Sifón de Chantilly:</strong> 1 cápsula rinde 500ml de crema montada.
                  </span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>
                    Costo crema + gas: ${effWhippedCreamPerGram.toFixed(2)} / g (~$
                    {Math.round(effWhippedCreamPerGram * 30)} copete 30g)
                  </span>
                </div>
              </SupplyList>
            </FormCard>

            {/* 2. FIAMBRERÍA Y QUESOS */}
            <FormCard>
              <h3 className="card-title">
                <span style={{ fontSize: 16 }}>🥪</span>
                Fiambrería y Quesos
              </h3>

              <SupplyList>
                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🥓</span>}
                  title="Jamón Cocido"
                  price={config.hamPrice ?? 12000}
                  qty={config.hamQty ?? 1}
                  unit={config.hamUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('hamPrice', val)}
                  onQtyChange={(val) => handleConfigChange('hamQty', val)}
                  onUnitChange={(val) => handleConfigChange('hamUnit', val)}
                  effCostText={`$${effHamPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🧀</span>}
                  title="Queso Tybo"
                  price={config.tyboPrice ?? 11000}
                  qty={config.tyboQty ?? 1}
                  unit={config.tyboUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('tyboPrice', val)}
                  onQtyChange={(val) => handleConfigChange('tyboQty', val)}
                  onUnitChange={(val) => handleConfigChange('tyboUnit', val)}
                  effCostText={`$${effTyboPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🧀</span>}
                  title="Queso Cheddar"
                  price={config.cheddarPrice ?? 13500}
                  qty={config.cheddarQty ?? 1}
                  unit={config.cheddarUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('cheddarPrice', val)}
                  onQtyChange={(val) => handleConfigChange('cheddarQty', val)}
                  onUnitChange={(val) => handleConfigChange('cheddarUnit', val)}
                  effCostText={`$${effCheddarPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🥩</span>}
                  title="Lomito Horneado"
                  price={config.lomitoPrice ?? 14500}
                  qty={config.lomitoQty ?? 1}
                  unit={config.lomitoUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('lomitoPrice', val)}
                  onQtyChange={(val) => handleConfigChange('lomitoQty', val)}
                  onUnitChange={(val) => handleConfigChange('lomitoUnit', val)}
                  effCostText={`$${effLomitoPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🧀</span>}
                  title="Queso Sardo"
                  price={config.sardoPrice ?? 15500}
                  qty={config.sardoQty ?? 1}
                  unit={config.sardoUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('sardoPrice', val)}
                  onQtyChange={(val) => handleConfigChange('sardoQty', val)}
                  onUnitChange={(val) => handleConfigChange('sardoUnit', val)}
                  effCostText={`$${effSardoPerGram.toFixed(2)} / g`}
                />

                <div
                  style={{
                    gridColumn: '1 / -1',
                    background: 'rgba(234, 179, 8, 0.08)',
                    border: '1px solid rgba(234, 179, 8, 0.25)',
                    borderRadius: 8,
                    padding: '7px 12px',
                    fontSize: 11,
                    color: '#fef08a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span>
                    🥪 <strong>Tostados y Medialunas:</strong> Cálculo exacto por gramos de fiambre.
                  </span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>
                    35g Jamón + 35g Tybo = ${Math.round(35 * effHamPerGram + 35 * effTyboPerGram)}
                  </span>
                </div>
              </SupplyList>
            </FormCard>

            {/* 3. MATERIA PRIMA Y REPOSTERÍA */}
            <FormCard>
              <h3 className="card-title">
                <span style={{ fontSize: 16 }}>🥧</span>
                Materia Prima y Repostería
              </h3>

              <SupplyList>
                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🌾</span>}
                  title="Almidón de Mandioca"
                  price={config.mandiocaPrice ?? 4500}
                  qty={config.mandiocaQty ?? 1}
                  unit={config.mandiocaUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('mandiocaPrice', val)}
                  onQtyChange={(val) => handleConfigChange('mandiocaQty', val)}
                  onUnitChange={(val) => handleConfigChange('mandiocaUnit', val)}
                  effCostText={`$${effMandiocaPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🥚</span>}
                  title="Huevos"
                  price={config.eggsPrice ?? 5000}
                  qty={config.eggsQty ?? 30}
                  unit={config.eggsUnit ?? 'unidad'}
                  unitOptions={['unidad', 'u']}
                  onPriceChange={(val) => handleConfigChange('eggsPrice', val)}
                  onQtyChange={(val) => handleConfigChange('eggsQty', val)}
                  onUnitChange={(val) => handleConfigChange('eggsUnit', val)}
                  effCostText={`$${effEggPerUnit.toFixed(1)} / u`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🌾</span>}
                  title="Harina 0000"
                  price={config.flour0000Price ?? 1500}
                  qty={config.flour0000Qty ?? 1}
                  unit={config.flour0000Unit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('flour0000Price', val)}
                  onQtyChange={(val) => handleConfigChange('flour0000Qty', val)}
                  onUnitChange={(val) => handleConfigChange('flour0000Unit', val)}
                  effCostText={`$${effFlourPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🧈</span>}
                  title="Manteca"
                  price={config.butterPrice ?? 11500}
                  qty={config.butterQty ?? 1}
                  unit={config.butterUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('butterPrice', val)}
                  onQtyChange={(val) => handleConfigChange('butterQty', val)}
                  onUnitChange={(val) => handleConfigChange('butterUnit', val)}
                  effCostText={`$${effButterPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🧂</span>}
                  title="Sal Fina"
                  price={config.saltPrice ?? 1200}
                  qty={config.saltQty ?? 1}
                  unit={config.saltUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('saltPrice', val)}
                  onQtyChange={(val) => handleConfigChange('saltQty', val)}
                  onUnitChange={(val) => handleConfigChange('saltUnit', val)}
                  effCostText={`$${effSaltPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🍬</span>}
                  title="Azúcar Común"
                  price={config.sugarPrice ?? 1400}
                  qty={config.sugarQty ?? 1}
                  unit={config.sugarUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('sugarPrice', val)}
                  onQtyChange={(val) => handleConfigChange('sugarQty', val)}
                  onUnitChange={(val) => handleConfigChange('sugarUnit', val)}
                  effCostText={`$${effSugarPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🍫</span>}
                  title="Chocolate Negro (Repostería)"
                  price={config.bakingDarkChocPrice ?? 14000}
                  qty={config.bakingDarkChocQty ?? 1}
                  unit={config.bakingDarkChocUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('bakingDarkChocPrice', val)}
                  onQtyChange={(val) => handleConfigChange('bakingDarkChocQty', val)}
                  onUnitChange={(val) => handleConfigChange('bakingDarkChocUnit', val)}
                  effCostText={`$${effBakingDarkChocPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🍫</span>}
                  title="Chocolate Blanco (Repostería)"
                  price={config.bakingWhiteChocPrice ?? 15000}
                  qty={config.bakingWhiteChocQty ?? 1}
                  unit={config.bakingWhiteChocUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('bakingWhiteChocPrice', val)}
                  onQtyChange={(val) => handleConfigChange('bakingWhiteChocQty', val)}
                  onUnitChange={(val) => handleConfigChange('bakingWhiteChocUnit', val)}
                  effCostText={`$${effBakingWhiteChocPerGram.toFixed(2)} / g`}
                />

                <CompactSupplyItem
                  icon={<span style={{ fontSize: 14 }}>🍫</span>}
                  title="Chocolate con Leche (Repostería)"
                  price={config.bakingMilkChocPrice ?? 14500}
                  qty={config.bakingMilkChocQty ?? 1}
                  unit={config.bakingMilkChocUnit ?? 'kg'}
                  unitOptions={['kg', 'g']}
                  onPriceChange={(val) => handleConfigChange('bakingMilkChocPrice', val)}
                  onQtyChange={(val) => handleConfigChange('bakingMilkChocQty', val)}
                  onUnitChange={(val) => handleConfigChange('bakingMilkChocUnit', val)}
                  effCostText={`$${effBakingMilkChocPerGram.toFixed(2)} / g`}
                />

                <div
                  style={{
                    gridColumn: '1 / -1',
                    background: 'rgba(234, 179, 8, 0.08)',
                    border: '1px solid rgba(234, 179, 8, 0.25)',
                    borderRadius: 8,
                    padding: '7px 12px',
                    fontSize: 11,
                    color: '#fef08a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span>
                    🥧 <strong>Producción Propia:</strong> Insumos clave para chipá, hojaldres, medialunas, cookies y rellenos.
                  </span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>
                    Almidón Mandioca: ${(effMandiocaPerGram * 1000).toLocaleString('es-AR')}/kg · Huevo: ${effEggPerUnit.toFixed(0)}/u
                  </span>
                </div>
              </SupplyList>
            </FormCard>

            {/* 4. VASOS DESCARTABLES Y EXTRAS */}
            <FormCard>
              <h3 className="card-title">
                <Package size={17} color="#4ccd99" />
                Vasos Descartables y Extras
              </h3>

              <CupMatrixTable>
                <thead>
                  <tr>
                    <th style={{ width: '24%' }}>Medida</th>
                    <th style={{ width: '28%' }}>☕ Vaso Café</th>
                    <th style={{ width: '28%' }}>🥤 Vaso Milkshake</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>Stock POS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong style={{ color: '#fff', fontSize: 13 }}>8oz</strong>
                      <span style={{ fontSize: 11, color: '#B4B6C9', marginLeft: 4 }}>(Mini)</span>
                    </td>
                    <td>
                      <MiniInputNumber $width="115px">
                        <span className="prefix">$</span>
                        <input
                          type="number"
                          value={config.packaging8ozPrice ?? config.packaging8oz}
                          onChange={(e) => handleConfigChange('packaging8ozPrice', e.target.value)}
                        />
                        <span className="unit">/ vaso</span>
                      </MiniInputNumber>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: '#B4B6C9', fontStyle: 'italic' }}>
                        — No aplica
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleCupSizeStock('8oz')}
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '4px 8px',
                          borderRadius: 7,
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            cupSizesStock['8oz'] !== false
                              ? 'rgba(76, 205, 153, 0.18)'
                              : 'rgba(239, 68, 68, 0.18)',
                          color:
                            cupSizesStock['8oz'] !== false ? '#4ccd99' : '#ef4444',
                          border: `1px solid ${
                            cupSizesStock['8oz'] !== false
                              ? 'rgba(76, 205, 153, 0.35)'
                              : 'rgba(239, 68, 68, 0.35)'
                          }`,
                          transition: 'all 0.15s ease',
                        }}
                        title="Alternar stock de vaso 8oz en el punto de venta (guarda en PB)"
                      >
                        <span style={{ fontSize: 9 }}>{cupSizesStock['8oz'] !== false ? '●' : '✕'}</span>
                        <span>☕ Café: {cupSizesStock['8oz'] !== false ? 'En stock' : 'Sin stock'}</span>
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <strong style={{ color: '#fff', fontSize: 13 }}>12oz</strong>
                      <span style={{ fontSize: 11, color: '#B4B6C9', marginLeft: 4 }}>(Plus)</span>
                    </td>
                    <td>
                      <MiniInputNumber $width="115px">
                        <span className="prefix">$</span>
                        <input
                          type="number"
                          value={config.packaging12ozPrice ?? config.packaging12oz}
                          onChange={(e) => handleConfigChange('packaging12ozPrice', e.target.value)}
                        />
                        <span className="unit">/ vaso</span>
                      </MiniInputNumber>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <MiniInputNumber $width="115px">
                          <span className="prefix">$</span>
                          <input
                            type="number"
                            value={config.packagingCold12ozPrice ?? config.packagingCold12oz}
                            onChange={(e) =>
                              handleConfigChange('packagingCold12ozPrice', e.target.value)
                            }
                          />
                          <span className="unit">/ vaso</span>
                        </MiniInputNumber>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleCupSizeStock('12oz')}
                          style={{
                            all: 'unset',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 7px',
                            borderRadius: 6,
                            fontSize: 10.5,
                            fontWeight: 700,
                            background:
                              cupSizesStock['12oz'] !== false
                                ? 'rgba(76, 205, 153, 0.18)'
                                : 'rgba(239, 68, 68, 0.18)',
                            color:
                              cupSizesStock['12oz'] !== false ? '#4ccd99' : '#ef4444',
                            border: `1px solid ${
                              cupSizesStock['12oz'] !== false
                                ? 'rgba(76, 205, 153, 0.35)'
                                : 'rgba(239, 68, 68, 0.35)'
                            }`,
                            transition: 'all 0.15s ease',
                          }}
                          title="Alternar stock de vaso caliente 12oz (Café)"
                        >
                          <span style={{ fontSize: 9 }}>{cupSizesStock['12oz'] !== false ? '●' : '✕'}</span>
                          <span>☕ Café: {cupSizesStock['12oz'] !== false ? 'En stock' : 'Sin stock'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleCupSizeStock('12oz_cold')}
                          style={{
                            all: 'unset',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 7px',
                            borderRadius: 6,
                            fontSize: 10.5,
                            fontWeight: 700,
                            background:
                              cupSizesStock['12oz_cold'] !== false
                                ? 'rgba(76, 205, 153, 0.18)'
                                : 'rgba(239, 68, 68, 0.18)',
                            color:
                              cupSizesStock['12oz_cold'] !== false ? '#4ccd99' : '#ef4444',
                            border: `1px solid ${
                              cupSizesStock['12oz_cold'] !== false
                                ? 'rgba(76, 205, 153, 0.35)'
                                : 'rgba(239, 68, 68, 0.35)'
                            }`,
                            transition: 'all 0.15s ease',
                          }}
                          title="Alternar stock de vaso frío 12oz (Milkshake / Frappé)"
                        >
                          <span style={{ fontSize: 9 }}>{cupSizesStock['12oz_cold'] !== false ? '●' : '✕'}</span>
                          <span>🥤 Frío: {cupSizesStock['12oz_cold'] !== false ? 'En stock' : 'Sin stock'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <strong style={{ color: '#fff', fontSize: 13 }}>16oz</strong>
                      <span style={{ fontSize: 11, color: '#B4B6C9', marginLeft: 4 }}>(Ultra)</span>
                    </td>
                    <td>
                      <MiniInputNumber $width="115px">
                        <span className="prefix">$</span>
                        <input
                          type="number"
                          value={config.packaging16ozPrice ?? config.packaging16oz}
                          onChange={(e) => handleConfigChange('packaging16ozPrice', e.target.value)}
                        />
                        <span className="unit">/ vaso</span>
                      </MiniInputNumber>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <MiniInputNumber $width="115px">
                          <span className="prefix">$</span>
                          <input
                            type="number"
                            value={config.packagingCold16ozPrice ?? config.packagingCold16oz}
                            onChange={(e) =>
                              handleConfigChange('packagingCold16ozPrice', e.target.value)
                            }
                          />
                          <span className="unit">/ vaso</span>
                        </MiniInputNumber>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleCupSizeStock('16oz')}
                          style={{
                            all: 'unset',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 7px',
                            borderRadius: 6,
                            fontSize: 10.5,
                            fontWeight: 700,
                            background:
                              cupSizesStock['16oz'] !== false
                                ? 'rgba(76, 205, 153, 0.18)'
                                : 'rgba(239, 68, 68, 0.18)',
                            color:
                              cupSizesStock['16oz'] !== false ? '#4ccd99' : '#ef4444',
                            border: `1px solid ${
                              cupSizesStock['16oz'] !== false
                                ? 'rgba(76, 205, 153, 0.35)'
                                : 'rgba(239, 68, 68, 0.35)'
                            }`,
                            transition: 'all 0.15s ease',
                          }}
                          title="Alternar stock de vaso caliente 16oz (Café)"
                        >
                          <span style={{ fontSize: 9 }}>{cupSizesStock['16oz'] !== false ? '●' : '✕'}</span>
                          <span>☕ Café: {cupSizesStock['16oz'] !== false ? 'En stock' : 'Sin stock'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleCupSizeStock('16oz_cold')}
                          style={{
                            all: 'unset',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 7px',
                            borderRadius: 6,
                            fontSize: 10.5,
                            fontWeight: 700,
                            background:
                              cupSizesStock['16oz_cold'] !== false
                                ? 'rgba(76, 205, 153, 0.18)'
                                : 'rgba(239, 68, 68, 0.18)',
                            color:
                              cupSizesStock['16oz_cold'] !== false ? '#4ccd99' : '#ef4444',
                            border: `1px solid ${
                              cupSizesStock['16oz_cold'] !== false
                                ? 'rgba(76, 205, 153, 0.35)'
                                : 'rgba(239, 68, 68, 0.35)'
                            }`,
                            transition: 'all 0.15s ease',
                          }}
                          title="Alternar stock de vaso frío 16oz (Milkshake / Frappé)"
                        >
                          <span style={{ fontSize: 9 }}>{cupSizesStock['16oz_cold'] !== false ? '●' : '✕'}</span>
                          <span>🥤 Frío: {cupSizesStock['16oz_cold'] !== false ? 'En stock' : 'Sin stock'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </CupMatrixTable>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 10,
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 12, color: '#EDEDEE', fontWeight: 600 }}>
                  ✨ Extras de Barra (Azúcar, servilletas, agitador)
                </span>
                <MiniInputNumber $width="120px">
                  <span className="prefix">$</span>
                  <input
                    type="number"
                    value={config.extrasPrice ?? config.extras}
                    onChange={(e) => handleConfigChange('extrasPrice', e.target.value)}
                  />
                  <span className="unit">/ serv</span>
                </MiniInputNumber>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 10,
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  marginTop: 6,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 12, color: '#4ccd99', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    🌱 Fondo Leche Vegetal (Prorrateo)
                  </span>
                  <span style={{ fontSize: 10.5, color: '#B4B6C9' }}>
                    Financia la leche vegetal sin cargo distribuyendo este costo en cada bebida
                  </span>
                </div>
                <MiniInputNumber $width="120px">
                  <span className="prefix">$</span>
                  <input
                    type="number"
                    value={config.plantMilkFundPrice ?? config.plantMilkFund ?? 50}
                    onChange={(e) => handleConfigChange('plantMilkFundPrice', e.target.value)}
                  />
                  <span className="unit">/ taza</span>
                </MiniInputNumber>
              </div>

              {/* CONTROL DE STOCK DE EXTRAS / ADICIONALES */}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Sparkles size={14} color="#4ccd99" />
                    Disponibilidad de Extras en POS
                  </span>
                  <span style={{ fontSize: 11, color: '#B4B6C9' }}>
                    Sincronizado en tiempo real con PB
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 8,
                  }}
                >
                  {[
                    { key: 'crema', label: 'Crema Chantilly', icon: '🍦' },
                    { key: 'leche_almendras', label: 'Leche de Almendras', icon: '🥛' },
                    { key: 'extra_shot', label: 'Extra Shot Espresso', icon: '☕' },
                  ].map((ext) => {
                    const inStock = extrasStock[ext.key] !== false;
                    return (
                      <div
                        key={ext.key}
                        style={{
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: `1px solid ${
                            inStock ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.3)'
                          }`,
                          borderRadius: 9,
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                          <span style={{ fontSize: 14 }}>{ext.icon}</span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: inStock ? '#fff' : '#9ca3af',
                              textDecoration: inStock ? 'none' : 'line-through',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ext.label}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleExtraStock(ext.key)}
                          style={{
                            all: 'unset',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            background: inStock
                              ? 'rgba(76, 205, 153, 0.18)'
                              : 'rgba(239, 68, 68, 0.18)',
                            color: inStock ? '#4ccd99' : '#ef4444',
                            border: `1px solid ${
                              inStock
                                ? 'rgba(76, 205, 153, 0.35)'
                                : 'rgba(239, 68, 68, 0.35)'
                            }`,
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                          }}
                          title={`Alternar stock de ${ext.label} en el punto de venta`}
                        >
                          <span style={{ fontSize: 8 }}>{inStock ? '●' : '✕'}</span>
                          <span>{inStock ? 'Stock' : 'Agotado'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FormCard>

            {/* 3. SALSAS POR SABOR */}
            <FormCard>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingBottom: 10,
                }}
              >
                <h3 className="card-title" style={{ border: 'none', padding: 0 }}>
                  <span style={{ fontSize: 16 }}>🍫</span>
                  Salsas por Sabor
                </h3>
                <AddFlavorButton type="button" onClick={() => handleAddFlavor('sauce')}>
                  + Agregar Sabor
                </AddFlavorButton>
              </div>

              <SupplyList>
                {(config.sauceFlavors || DEFAULT_CONFIG.sauceFlavors).map((flavor, idx) => {
                  const effCost = getUnitCost(flavor.price, flavor.qty, flavor.unit);
                  return (
                    <SupplyItemRow key={flavor.id || idx}>
                      <SupplyInfo style={{ minWidth: 100, flex: '1 1 auto' }}>
                        <input
                          type="text"
                          value={flavor.name}
                          onChange={(e) => handleFlavorChange('sauce', idx, 'name', e.target.value)}
                          placeholder="Nombre sabor"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px dashed rgba(255,255,255,0.18)',
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            width: '100%',
                            maxWidth: 125,
                            outline: 'none',
                            padding: '2px 0',
                          }}
                        />
                      </SupplyInfo>

                      <SupplyInputs>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MiniInputNumber $width="95px" title="Precio pagado">
                            <span className="prefix">$</span>
                            <input
                              type="number"
                              value={flavor.price ?? ''}
                              onChange={(e) =>
                                handleFlavorChange('sauce', idx, 'price', e.target.value)
                              }
                              placeholder="0"
                            />
                          </MiniInputNumber>

                          <span style={{ fontSize: 11, color: '#B4B6C9' }}>/</span>

                          <MiniInputNumber $width="85px" title="Cantidad comprada">
                            <input
                              type="number"
                              step={flavor.unit === 'kg' ? '0.1' : '1'}
                              value={flavor.qty ?? ''}
                              onChange={(e) =>
                                handleFlavorChange('sauce', idx, 'qty', e.target.value)
                              }
                              placeholder="1"
                            />
                            <select
                              value={flavor.unit || 'kg'}
                              onChange={(e) =>
                                handleFlavorChange('sauce', idx, 'unit', e.target.value)
                              }
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#4ccd99',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                padding: 0,
                                outline: 'none',
                              }}
                            >
                              <option value="kg" style={{ background: '#240007', color: '#fff' }}>
                                kg
                              </option>
                              <option value="g" style={{ background: '#240007', color: '#fff' }}>
                                g
                              </option>
                            </select>
                          </MiniInputNumber>
                        </div>

                        <RateBadge>${effCost.toFixed(2)} / g</RateBadge>

                        {(config.sauceFlavors || DEFAULT_CONFIG.sauceFlavors).length > 1 && (
                          <DeleteFlavorButton
                            type="button"
                            onClick={() => handleRemoveFlavor('sauce', idx)}
                            title="Eliminar sabor"
                          >
                            ×
                          </DeleteFlavorButton>
                        )}
                      </SupplyInputs>
                    </SupplyItemRow>
                  );
                })}
              </SupplyList>
            </FormCard>

            {/* 4. SYRUPS POR SABOR */}
            <FormCard>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingBottom: 10,
                }}
              >
                <h3 className="card-title" style={{ border: 'none', padding: 0 }}>
                  <span style={{ fontSize: 16 }}>🍯</span>
                  Syrups por Sabor
                </h3>
                <AddFlavorButton type="button" onClick={() => handleAddFlavor('syrup')}>
                  + Agregar Sabor
                </AddFlavorButton>
              </div>

              <SupplyList>
                {(config.syrupFlavors || DEFAULT_CONFIG.syrupFlavors).map((flavor, idx) => {
                  const effCost = getUnitCost(flavor.price, flavor.qty, flavor.unit);
                  return (
                    <SupplyItemRow key={flavor.id || idx}>
                      <SupplyInfo style={{ minWidth: 100, flex: '1 1 auto' }}>
                        <input
                          type="text"
                          value={flavor.name}
                          onChange={(e) => handleFlavorChange('syrup', idx, 'name', e.target.value)}
                          placeholder="Nombre sabor"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px dashed rgba(255,255,255,0.18)',
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            width: '100%',
                            maxWidth: 125,
                            outline: 'none',
                            padding: '2px 0',
                          }}
                        />
                      </SupplyInfo>

                      <SupplyInputs>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MiniInputNumber $width="95px" title="Precio pagado">
                            <span className="prefix">$</span>
                            <input
                              type="number"
                              value={flavor.price ?? ''}
                              onChange={(e) =>
                                handleFlavorChange('syrup', idx, 'price', e.target.value)
                              }
                              placeholder="0"
                            />
                          </MiniInputNumber>

                          <span style={{ fontSize: 11, color: '#B4B6C9' }}>/</span>

                          <MiniInputNumber $width="85px" title="Cantidad comprada">
                            <input
                              type="number"
                              step={flavor.unit === 'L' ? '0.1' : '1'}
                              value={flavor.qty ?? ''}
                              onChange={(e) =>
                                handleFlavorChange('syrup', idx, 'qty', e.target.value)
                              }
                              placeholder="1"
                            />
                            <select
                              value={flavor.unit || 'L'}
                              onChange={(e) =>
                                handleFlavorChange('syrup', idx, 'unit', e.target.value)
                              }
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#4ccd99',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                padding: 0,
                                outline: 'none',
                              }}
                            >
                              <option value="L" style={{ background: '#240007', color: '#fff' }}>
                                L
                              </option>
                              <option value="ml" style={{ background: '#240007', color: '#fff' }}>
                                ml
                              </option>
                            </select>
                          </MiniInputNumber>
                        </div>

                        <RateBadge>${effCost.toFixed(2)} / ml</RateBadge>

                        {(config.syrupFlavors || DEFAULT_CONFIG.syrupFlavors).length > 1 && (
                          <DeleteFlavorButton
                            type="button"
                            onClick={() => handleRemoveFlavor('syrup', idx)}
                            title="Eliminar sabor"
                          >
                            ×
                          </DeleteFlavorButton>
                        )}
                      </SupplyInputs>
                    </SupplyItemRow>
                  );
                })}
              </SupplyList>
            </FormCard>

            {/* 5. SMOOTHIES POR SABOR */}
            <FormCard>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingBottom: 10,
                }}
              >
                <h3 className="card-title" style={{ border: 'none', padding: 0 }}>
                  <span style={{ fontSize: 16 }}>🍓</span>
                  Smoothies por Sabor
                </h3>
                <AddFlavorButton type="button" onClick={() => handleAddFlavor('smoothie')}>
                  + Agregar Sabor
                </AddFlavorButton>
              </div>

              <SupplyList>
                {(config.smoothieFlavors || DEFAULT_CONFIG.smoothieFlavors).map((flavor, idx) => {
                  const effCost = getUnitCost(flavor.price, flavor.qty, flavor.unit);
                  const unitLbl = flavor.unit || 'porción';
                  return (
                    <SupplyItemRow key={flavor.id || idx}>
                      <SupplyInfo style={{ minWidth: 100, flex: '1 1 auto' }}>
                        <input
                          type="text"
                          value={flavor.name}
                          onChange={(e) =>
                            handleFlavorChange('smoothie', idx, 'name', e.target.value)
                          }
                          placeholder="Nombre sabor"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px dashed rgba(255,255,255,0.18)',
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            width: '100%',
                            maxWidth: 125,
                            outline: 'none',
                            padding: '2px 0',
                          }}
                        />
                      </SupplyInfo>

                      <SupplyInputs>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MiniInputNumber $width="95px" title="Precio pagado">
                            <span className="prefix">$</span>
                            <input
                              type="number"
                              value={flavor.price ?? ''}
                              onChange={(e) =>
                                handleFlavorChange('smoothie', idx, 'price', e.target.value)
                              }
                              placeholder="0"
                            />
                          </MiniInputNumber>

                          <span style={{ fontSize: 11, color: '#B4B6C9' }}>/</span>

                          <MiniInputNumber $width="95px" title="Cantidad comprada">
                            <input
                              type="number"
                              step={flavor.unit === 'kg' || flavor.unit === 'L' ? '0.1' : '1'}
                              value={flavor.qty ?? ''}
                              onChange={(e) =>
                                handleFlavorChange('smoothie', idx, 'qty', e.target.value)
                              }
                              placeholder="1"
                            />
                            <select
                              value={flavor.unit || 'porción'}
                              onChange={(e) =>
                                handleFlavorChange('smoothie', idx, 'unit', e.target.value)
                              }
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#4ccd99',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                padding: 0,
                                outline: 'none',
                              }}
                            >
                              <option
                                value="porción"
                                style={{ background: '#240007', color: '#fff' }}
                              >
                                porc.
                              </option>
                              <option value="u" style={{ background: '#240007', color: '#fff' }}>
                                u
                              </option>
                              <option value="kg" style={{ background: '#240007', color: '#fff' }}>
                                kg
                              </option>
                              <option value="g" style={{ background: '#240007', color: '#fff' }}>
                                g
                              </option>
                            </select>
                          </MiniInputNumber>
                        </div>

                        <RateBadge>
                          ${Math.round(effCost).toLocaleString('es-AR')} /{' '}
                          {unitLbl === 'porción' ? 'porc.' : unitLbl}
                        </RateBadge>

                        {(config.smoothieFlavors || DEFAULT_CONFIG.smoothieFlavors).length > 1 && (
                          <DeleteFlavorButton
                            type="button"
                            onClick={() => handleRemoveFlavor('smoothie', idx)}
                            title="Eliminar sabor"
                          >
                            ×
                          </DeleteFlavorButton>
                        )}
                      </SupplyInputs>
                    </SupplyItemRow>
                  );
                })}
              </SupplyList>
            </FormCard>

            {/* 6. MÁRGENES Y MERMAS */}
            <FormCard style={{ gridColumn: '1 / -1' }}>
              <h3 className="card-title">
                <Percent size={17} color="#4ccd99" />
                Márgenes Financieros y Mermas
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#B4B6C9',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Margen Objetivo
                  </label>
                  <MiniInputNumber $width="100%">
                    <input
                      type="number"
                      value={config.targetMargin}
                      onChange={(e) => handleConfigChange('targetMargin', e.target.value)}
                    />
                    <span className="unit">%</span>
                  </MiniInputNumber>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#B4B6C9',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Comisión Cobro (MP)
                  </label>
                  <MiniInputNumber $width="100%">
                    <input
                      type="number"
                      value={config.fee}
                      onChange={(e) => handleConfigChange('fee', e.target.value)}
                    />
                    <span className="unit">%</span>
                  </MiniInputNumber>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#B4B6C9',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Merma Molino
                  </label>
                  <MiniInputNumber $width="100%">
                    <input
                      type="number"
                      value={config.coffeeWaste}
                      onChange={(e) => handleConfigChange('coffeeWaste', e.target.value)}
                    />
                    <span className="unit">%</span>
                  </MiniInputNumber>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#B4B6C9',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Merma Leche
                  </label>
                  <MiniInputNumber $width="100%">
                    <input
                      type="number"
                      value={config.milkWaste}
                      onChange={(e) => handleConfigChange('milkWaste', e.target.value)}
                    />
                    <span className="unit">%</span>
                  </MiniInputNumber>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <ActionButton
                  onClick={handleResetConfig}
                  style={{ padding: '6px 12px', fontSize: 11 }}
                >
                  <RefreshCw size={12} /> Restablecer Valores por Defecto
                </ActionButton>
              </div>
            </FormCard>
          </FormGrid>

          {/* BARRA FLOTANTE STICKY INFERIOR CUANDO HAY CAMBIOS PENDIENTES */}
          {hasConfigChanges && (
            <div
              style={{
                position: 'sticky',
                bottom: 12,
                zIndex: 40,
                background: 'rgba(36, 0, 7, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid #f59e0b',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(245, 158, 11, 0.2)',
                borderRadius: 14,
                padding: '12px 20px',
                marginTop: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    Tienes cambios pendientes sin confirmar en los insumos
                  </div>
                  <div style={{ fontSize: 11, color: '#B4B6C9' }}>
                    Se aplican al cálculo en vivo. Confirma para sincronizarlos con PocketBase.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleDiscardConfig}
                  disabled={isSavingConfig}
                  style={{
                    all: 'unset',
                    cursor: isSavingConfig ? 'not-allowed' : 'pointer',
                    padding: '7px 14px',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#B4B6C9',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <X size={14} /> Descartar
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  style={{
                    all: 'unset',
                    cursor: isSavingConfig ? 'not-allowed' : 'pointer',
                    padding: '8px 18px',
                    borderRadius: 7,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1a0006',
                    background: '#4ccd99',
                    boxShadow: '0 4px 12px rgba(76, 205, 153, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isSavingConfig ? (
                    <>
                      <RefreshCw className="animate-spin" size={15} /> Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={15} /> Confirmar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* PESTAÑA 3: SIMULADOR RÁPIDO DE BEBIDAS */}
      {activeTab === 'simulator' && (
        <FormGrid>
          <FormCard>
            <h3 className="card-title">
              <Sliders size={18} color="#4ccd99" />
              Configurador de Receta al Vuelo
            </h3>

            <FormGroup>
              <label>Gramos de Café (Molienda)</label>
              <InputNumber>
                <input
                  type="number"
                  value={simCoffee}
                  onChange={(e) => setSimCoffee(Number(e.target.value) || 0)}
                />
                <span className="unit">gramos</span>
              </InputNumber>
            </FormGroup>

            <FormGroup>
              <label>Mililitros de Leche</label>
              <InputNumber>
                <input
                  type="number"
                  value={simMilk}
                  onChange={(e) => setSimMilk(Number(e.target.value) || 0)}
                />
                <span className="unit">ml</span>
              </InputNumber>
            </FormGroup>

            <FormGroup>
              <label>Tipo de Leche</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <CatChip
                  $active={simMilkType === 'regular'}
                  onClick={() => setSimMilkType('regular')}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Vaca Regular
                </CatChip>
                <CatChip
                  $active={simMilkType === 'plant'}
                  onClick={() => setSimMilkType('plant')}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Vegetal
                </CatChip>
                <CatChip
                  $active={simMilkType === 'none'}
                  onClick={() => setSimMilkType('none')}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Sin Leche (Negro)
                </CatChip>
              </div>
            </FormGroup>

            <FormGroup>
              <label>Opciones Adicionales</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <CatChip
                  $active={simTakeAway}
                  onClick={() => setSimTakeAway(!simTakeAway)}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  {simTakeAway ? '✓ Con Vaso Take Away' : 'Sin Vaso Descartable'}
                </CatChip>
                <CatChip
                  $active={simExtras}
                  onClick={() => setSimExtras(!simExtras)}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  {simExtras ? '✓ Con Extras (Azúcar/Agitador)' : 'Sin Extras'}
                </CatChip>
              </div>
            </FormGroup>

            {simTakeAway && (
              <>
                <FormGroup>
                  <label>Tamaño de Vaso Take Away</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {simCupType !== 'milkshake' && (
                      <CatChip
                        $active={simSize === '8oz'}
                        onClick={() => setSimSize('8oz')}
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        8oz (Mini)
                      </CatChip>
                    )}
                    <CatChip
                      $active={
                        simSize === '12oz' || (simCupType === 'milkshake' && simSize === '8oz')
                      }
                      onClick={() => setSimSize('12oz')}
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      12oz (Plus)
                    </CatChip>
                    <CatChip
                      $active={simSize === '16oz'}
                      onClick={() => setSimSize('16oz')}
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      16oz (Ultra)
                    </CatChip>
                  </div>
                </FormGroup>

                <FormGroup>
                  <label>Tipo de Vaso Take Away</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <CatChip
                      $active={simCupType === 'hot'}
                      onClick={() => setSimCupType('hot')}
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      ☕ Vaso Café (${Math.round(getPackagingUnitCost('hot', simSize))})
                    </CatChip>
                    <CatChip
                      $active={simCupType === 'milkshake'}
                      onClick={() => {
                        setSimCupType('milkshake');
                        if (simSize === '8oz') setSimSize('12oz');
                      }}
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      🥤 Vaso Milkshake ($
                      {Math.round(
                        getPackagingUnitCost('milkshake', simSize === '8oz' ? '12oz' : simSize)
                      )}
                      )
                    </CatChip>
                  </div>
                  {simCupType === 'milkshake' && (
                    <span className="subhint" style={{ marginTop: 4 }}>
                      * Las bebidas frías no tienen 8oz; se sirven en 12oz o 16oz.
                    </span>
                  )}
                </FormGroup>
              </>
            )}

            <FormGroup>
              <label>Margen Objetivo Deseado</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                {[55, 60, 65, 70, 75].map((m) => (
                  <CatChip
                    key={m}
                    $active={simTargetMargin === m}
                    onClick={() => setSimTargetMargin(m)}
                  >
                    {m}%
                  </CatChip>
                ))}
              </div>
              <InputNumber>
                <input
                  type="number"
                  value={simTargetMargin}
                  onChange={(e) => setSimTargetMargin(Number(e.target.value) || 0)}
                />
                <span className="unit">% de margen</span>
              </InputNumber>
            </FormGroup>
          </FormCard>

          <FormCard>
            <h3 className="card-title">
              <TrendingUp size={18} color="#4ccd99" />
              Resultado y Rentabilidad
            </h3>

            <div
              style={{
                background: 'rgba(0,0,0,0.25)',
                padding: 16,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#B4B6C9' }}>Costo Café:</span>
                <strong>${Math.round(simResult.costs.costCoffee).toLocaleString('es-AR')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#B4B6C9' }}>Costo Leche:</span>
                <strong>${Math.round(simResult.costs.costMilk).toLocaleString('es-AR')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#B4B6C9' }}>
                  Costo Packaging (
                  {!simTakeAway
                    ? 'Sin Vaso'
                    : `${simCupType === 'milkshake' ? 'Vaso Milkshake' : 'Vaso Café'} ${simResult.effectiveSize}`}
                  ):
                </span>
                <strong>${Math.round(simResult.costs.costPkg).toLocaleString('es-AR')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#B4B6C9' }}>Costo Extras:</span>
                <strong>${Math.round(simResult.costs.costExtras).toLocaleString('es-AR')}</strong>
              </div>
              {simResult.costs.costPlantMilkFund > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#B4B6C9' }}>🌱 Fondo Leche Veg.:</span>
                  <strong>${Math.round(simResult.costs.costPlantMilkFund).toLocaleString('es-AR')}</strong>
                </div>
              )}
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: 8,
                  marginTop: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                <span>Costo Total Directo:</span>
                <span style={{ color: '#4ccd99' }}>
                  ${Math.round(simResult.costs.total).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                borderRadius: 12,
                padding: 18,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#eab308',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Precio Sugerido al Público (Margen {simTargetMargin}%)
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '6px 0' }}>
                ${simResult.suggested.toLocaleString('es-AR')}
              </div>
              <div style={{ fontSize: 12, color: '#B4B6C9' }}>
                Ganancia neta estimada: +$
                {Math.round(
                  simResult.suggested * (1 - config.fee / 100) - simResult.costs.total
                ).toLocaleString('es-AR')}{' '}
                por taza
              </div>
            </div>

            <FormGroup>
              <label>¿Querés probar con un precio de venta fijo?</label>
              <InputNumber>
                <span className="prefix">$</span>
                <input
                  type="number"
                  placeholder="Ej: 3500"
                  value={simManualPrice}
                  onChange={(e) => setSimManualPrice(e.target.value)}
                />
              </InputNumber>
              {simResult.manualStats && (
                <div
                  style={{
                    fontSize: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 6,
                    padding: 8,
                    borderRadius: 8,
                    background:
                      simResult.manualStats.profit >= 0
                        ? 'rgba(76,205,153,0.15)'
                        : 'rgba(239,68,68,0.15)',
                    color: simResult.manualStats.profit >= 0 ? '#4ccd99' : '#ef4444',
                    fontWeight: 700,
                  }}
                >
                  <span>Margen: {simResult.manualStats.margin}%</span>
                  <span>
                    Ganancia: ${Math.round(simResult.manualStats.profit).toLocaleString('es-AR')}
                  </span>
                </div>
              )}
            </FormGroup>
          </FormCard>
        </FormGrid>
      )}

      {/* MODAL DE EDICIÓN RÁPIDA DE RECETA / COSTO */}
      {editingItem && (
        <ModalOverlay onClick={() => setEditingItem(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>
                  Editar: {editingItem.name}
                </h3>
                <button
                  style={{ all: 'unset', cursor: 'pointer', color: '#B4B6C9', padding: 4 }}
                  onClick={() => setEditingItem(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: '#B4B6C9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <span>
                  Categoría: <strong>{editingItem.category}</strong>
                </span>
                <span>•</span>
                <span
                  style={{
                    background: editingItem.isPastry
                      ? 'rgba(234, 179, 8, 0.15)'
                      : editingItem.isSmoothie
                        ? 'rgba(236, 72, 153, 0.15)'
                        : (editingItem.name || '').toLowerCase().includes('chocolate caliente') ||
                            (editingItem.name || '').toLowerCase().includes('submarino')
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(76, 205, 153, 0.15)',
                    color: editingItem.isPastry
                      ? '#eab308'
                      : editingItem.isSmoothie
                        ? '#ec4899'
                        : (editingItem.name || '').toLowerCase().includes('chocolate caliente') ||
                            (editingItem.name || '').toLowerCase().includes('submarino')
                          ? '#f59e0b'
                          : '#4ccd99',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                >
                  {editingItem.isPastry
                    ? '🥐 Pastelería / Comida'
                    : editingItem.isSmoothie
                      ? '🍓 Smoothie / Bebida Fría'
                      : (editingItem.name || '').toLowerCase().includes('chocolate caliente') ||
                          (editingItem.name || '').toLowerCase().includes('submarino')
                        ? '🍫 Chocolate / Especialidad'
                        : '☕ Bebida de Cafetería'}
                </span>
              </div>
            </ModalHeader>

            <EditRecipeForm
              item={editingItem}
              initialVariantKey={editingVariantKey}
              onSave={(result, pricesMap) =>
                handleSaveRecipes(result, null, editingItem.id, pricesMap)
              }
              onUpdatePrice={handleUpdateProductPrice}
              savingPriceId={savingPriceId}
              onCancel={() => setEditingItem(null)}
              calculateCost={calculateCost}
              calculateSuggestedPrice={calculateSuggestedPrice}
              evaluateVenta={evaluateVenta}
              effPackaging={effPackaging}
              effPackagingCold={effPackagingCold}
              getPackagingUnitCost={getPackagingUnitCost}
              getSmoothieFlavorCost={getSmoothieFlavorCost}
              effIcePerGram={effIcePerGram}
              effIceCreamPerGram={effIceCreamPerGram}
              effWhippedCreamPerGram={effWhippedCreamPerGram}
              effMatchaPerGram={effMatchaPerGram}
              effExtras={effExtras}
              effOreoCost={effOreoCost}
              effHamPerGram={effHamPerGram}
              effTyboPerGram={effTyboPerGram}
              effCheddarPerGram={effCheddarPerGram}
              effLomitoPerGram={effLomitoPerGram}
              effSardoPerGram={effSardoPerGram}
              effMandiocaPerGram={effMandiocaPerGram}
              effEggPerUnit={effEggPerUnit}
              effSaltPerGram={effSaltPerGram}
              effSugarPerGram={effSugarPerGram}
              effFlourPerGram={effFlourPerGram}
              effButterPerGram={effButterPerGram}
              effBakingDarkChocPerGram={effBakingDarkChocPerGram}
              effBakingWhiteChocPerGram={effBakingWhiteChocPerGram}
              effBakingMilkChocPerGram={effBakingMilkChocPerGram}
              config={config}
            />
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL PARA AGREGAR NUEVA BEBIDA CON IA */}
      <AddDrinkModal
        isOpen={showAddDrinkModal}
        onClose={() => setShowAddDrinkModal(false)}
        config={config}
        onCreated={handleDrinkCreated}
        formatRecipeForPb={formatRecipeForPb}
      />
    </Container>
  );
}

// Subcomponente de formulario para el modal con soporte de medidas/variantes
function EditRecipeForm({
  item,
  initialVariantKey,
  onSave,
  onCancel,
  calculateCost,
  calculateSuggestedPrice,
  evaluateVenta,
  effPackaging = 250,
  effPackagingCold = 380,
  getPackagingUnitCost,
  getSmoothieFlavorCost,
  effIcePerGram = 0.3,
  effIceCreamPerGram = 8,
  effWhippedCreamPerGram = 9,
  effMatchaPerGram = 0.12,
  effExtras = 60,
  effOreoCost = { perGram: 13.56, perUnit: 149.15 },
  effHamPerGram = 12,
  effTyboPerGram = 11,
  effCheddarPerGram = 13.5,
  effLomitoPerGram = 14.5,
  effSardoPerGram = 15.5,
  effMandiocaPerGram = 4.5,
  effEggPerUnit = 166.67,
  effSaltPerGram = 1.2,
  effSugarPerGram = 1.4,
  effFlourPerGram = 1.5,
  effButterPerGram = 11.5,
  effBakingDarkChocPerGram = 14,
  effBakingWhiteChocPerGram = 15,
  effBakingMilkChocPerGram = 14.5,
  config,
  onUpdatePrice,
  savingPriceId,
}) {
  const isPastry = item.isPastry;
  const isSmoothie = Boolean(item.isSmoothie || isSmoothieItem(null, item.category, item.name));
  const isColdDrink = isSmoothie || isMilkshakeCup(null, item.category, item.name);
  const fixedCupType = isColdDrink ? 'milkshake' : 'hot';
  const isExtra = Boolean(
    item.category === 'extra' ||
      item.id === 'ygwuo80ym7cmldz' ||
      item.id === 'b2xd1i5fu90rp67' ||
      (item.name || '').toLowerCase().includes('extra') ||
      (item.name || '').toLowerCase().includes('adicional')
  );

  const itemNameLower = (item.name || '').toLowerCase();
  const isMilkshakeDrink = itemNameLower.includes('milkshake') || itemNameLower.includes('batido');
  const isMatchaDrink = itemNameLower.includes('matcha');
  const isChocolateDrink =
    itemNameLower.includes('chocolate caliente') ||
    itemNameLower.includes('submarino') ||
    itemNameLower.includes('chocolatada') ||
    item.id === 'byazqa2facpnoxi';
  const isNoCoffeeProduct =
    isChocolateDrink ||
    isMilkshakeDrink ||
    isMatchaDrink ||
    isPastry ||
    isSmoothie ||
    (isExtra && !itemNameLower.includes('shot') && !itemNameLower.includes('cafe'));

  // Medida activa seleccionada para editar
  const [activeKey, setActiveKey] = useState(
    initialVariantKey || item.variants[0]?.sizeKey || 'standard'
  );

  useEffect(() => {
    if (initialVariantKey) {
      setActiveKey(initialVariantKey);
    }
  }, [initialVariantKey]);

  // Estado local de precios por variante para PocketBase
  const [pricesState, setPricesState] = useState(() => {
    const map = {};
    item.variants.forEach((v) => {
      map[v.sizeKey] = v.price ?? 0;
    });
    return map;
  });

  // Estado local de recetas por variante
  const [variantsState, setVariantsState] = useState(() => {
    const map = {};
    item.variants.forEach((v) => {
      const aiRec = detectAiRecipe(item.name, v.sizeKey, item.category, config);
      const isSmoothieVar = Boolean(v.recipe?.isSmoothie || aiRec.isSmoothie);
      const defaultSmoothieFlavor = isSmoothieVar
        ? v.recipe?.smoothieFlavor || aiRec.smoothieFlavor || 'promedio'
        : '';
      const is16 = (v.sizeKey || '').toLowerCase().includes('16');
      const defaultPulpaGrams = isSmoothieVar
        ? v.recipe?.pulpaGrams !== undefined
          ? v.recipe.pulpaGrams
          : aiRec.pulpaGrams || (is16 ? 130 : 95)
        : 0;
      const isColdItem = isColdDrink || Boolean(aiRec.isCold) || Boolean(v.recipe?.isCold);
      const defaultIceGrams = isColdItem
        ? v.recipe?.iceGrams !== undefined
          ? v.recipe.iceGrams
          : aiRec.iceGrams || (is16 ? 200 : 150)
        : 0;
      const defaultWaterGrams = isSmoothieVar
        ? v.recipe?.waterGrams !== undefined
          ? v.recipe.waterGrams
          : aiRec.waterGrams || (is16 ? 170 : 125)
        : 0;
      const defaultIceCreamGrams = isMilkshakeDrink
        ? v.recipe?.iceCreamGrams !== undefined
          ? v.recipe.iceCreamGrams
          : aiRec.iceCreamGrams || (is16 ? 180 : 120)
        : 0;
      const defaultSmoothieCost = isSmoothieVar
        ? (v.recipe?.smoothieCost ??
          aiRec.smoothieCost ??
          (getSmoothieFlavorCost
            ? getSmoothieFlavorCost(defaultSmoothieFlavor, v.sizeKey, defaultPulpaGrams)
            : is16
              ? 1900
              : 1400))
        : 0;

      map[v.sizeKey] = {
        coffeeGrams: isNoCoffeeProduct
          ? 0
          : v.recipe?.coffeeGrams !== undefined
            ? v.recipe.coffeeGrams
            : aiRec.coffeeGrams,
        matchaGrams:
          v.recipe?.matchaGrams !== undefined ? v.recipe.matchaGrams : aiRec.matchaGrams || 0,
        milkMl: v.recipe?.milkMl !== undefined ? v.recipe.milkMl : aiRec.milkMl,
        milkType: v.recipe?.milkType || aiRec.milkType,
        cocoaGrams:
          v.recipe?.cocoaGrams !== undefined ? v.recipe.cocoaGrams : aiRec.cocoaGrams || 0,
        oreoUnits:
          v.recipe?.oreoUnits !== undefined
            ? v.recipe.oreoUnits
            : v.recipe?.oreoQty !== undefined
              ? v.recipe.oreoQty
              : aiRec.oreoUnits || 0,
        oreoGrams:
          v.recipe?.oreoGrams !== undefined ? v.recipe.oreoGrams : aiRec.oreoGrams || 0,
        iceCreamGrams: defaultIceCreamGrams,
        whippedCreamGrams:
          v.recipe?.whippedCreamGrams !== undefined
            ? v.recipe.whippedCreamGrams
            : aiRec.whippedCreamGrams || 0,
        sauceGrams: v.recipe?.sauceGrams !== undefined ? v.recipe.sauceGrams : aiRec.sauceGrams,
        sauceFlavor: v.recipe?.sauceFlavor || aiRec.sauceFlavor,
        syrupMl: v.recipe?.syrupMl !== undefined ? v.recipe.syrupMl : aiRec.syrupMl,
        syrupFlavor: v.recipe?.syrupFlavor || aiRec.syrupFlavor,
        syrup2Ml: v.recipe?.syrup2Ml !== undefined ? v.recipe.syrup2Ml : aiRec.syrup2Ml || 0,
        syrup2Flavor: v.recipe?.syrup2Flavor || aiRec.syrup2Flavor || 'vainilla',
        syrup3Ml: v.recipe?.syrup3Ml !== undefined ? v.recipe.syrup3Ml : aiRec.syrup3Ml || 0,
        syrup3Flavor: v.recipe?.syrup3Flavor || aiRec.syrup3Flavor || 'syrup_1790392238949',
        chocolateCost: 0,
        isSmoothie: isSmoothieVar,
        smoothieFlavor: defaultSmoothieFlavor,
        smoothieCost: defaultSmoothieCost,
        pulpaGrams: defaultPulpaGrams,
        iceGrams: defaultIceGrams,
        waterGrams: defaultWaterGrams,
        pastryCost: v.recipe?.pastryCost ?? aiRec.pastryCost,
        baseBakeryCost:
          v.recipe?.baseBakeryCost !== undefined
            ? Number(v.recipe.baseBakeryCost)
            : aiRec.baseBakeryCost !== undefined
              ? aiRec.baseBakeryCost
              : Number(v.recipe?.pastryCost) || 0,
        jamonGrams:
          v.recipe?.jamonGrams !== undefined
            ? Number(v.recipe.jamonGrams)
            : aiRec.jamonGrams || 0,
        tyboGrams:
          v.recipe?.tyboGrams !== undefined
            ? Number(v.recipe.tyboGrams)
            : aiRec.tyboGrams || 0,
        cheddarGrams:
          v.recipe?.cheddarGrams !== undefined
            ? Number(v.recipe.cheddarGrams)
            : aiRec.cheddarGrams || 0,
        lomitoGrams:
          v.recipe?.lomitoGrams !== undefined
            ? Number(v.recipe.lomitoGrams)
            : aiRec.lomitoGrams || 0,
        sardoGrams:
          v.recipe?.sardoGrams !== undefined
            ? Number(v.recipe.sardoGrams)
            : aiRec.sardoGrams || 0,
        mandiocaGrams:
          v.recipe?.mandiocaGrams !== undefined
            ? Number(v.recipe.mandiocaGrams)
            : aiRec.mandiocaGrams || 0,
        eggsCount:
          v.recipe?.eggsCount !== undefined
            ? Number(v.recipe.eggsCount)
            : aiRec.eggsCount || 0,
        flourGrams:
          v.recipe?.flourGrams !== undefined
            ? Number(v.recipe.flourGrams)
            : aiRec.flourGrams || 0,
        butterGrams:
          v.recipe?.butterGrams !== undefined
            ? Number(v.recipe.butterGrams)
            : aiRec.butterGrams || 0,
        sugarGrams:
          v.recipe?.sugarGrams !== undefined
            ? Number(v.recipe.sugarGrams)
            : aiRec.sugarGrams || 0,
        saltGrams:
          v.recipe?.saltGrams !== undefined
            ? Number(v.recipe.saltGrams)
            : aiRec.saltGrams || 0,
        darkChocGrams:
          v.recipe?.darkChocGrams !== undefined
            ? Number(v.recipe.darkChocGrams)
            : aiRec.darkChocGrams || 0,
        whiteChocGrams:
          v.recipe?.whiteChocGrams !== undefined
            ? Number(v.recipe.whiteChocGrams)
            : aiRec.whiteChocGrams || 0,
        milkChocGrams:
          v.recipe?.milkChocGrams !== undefined
            ? Number(v.recipe.milkChocGrams)
            : aiRec.milkChocGrams || 0,
        cupType: aiRec.cupType || fixedCupType,
      };
    });
    return map;
  });

  // Visibilidad inteligente de café, cacao, matcha, helado, crema, salsa y syrup (se ocultan si no corresponden a la bebida)
  const [visibleIngredients, setVisibleIngredients] = useState(() => {
    const init = {};
    item.variants.forEach((v) => {
      const aiRec = detectAiRecipe(item.name, v.sizeKey, item.category, config);
      const naturallyHasCoffee = !isNoCoffeeProduct && Boolean(aiRec.coffeeGrams > 0);
      const hasCoffeeValue = !isNoCoffeeProduct && Boolean(Number(v.recipe?.coffeeGrams) > 0);
      const naturallyHasMatcha = (isMatchaDrink && !aiRec.isCold) || Boolean(aiRec.matchaGrams > 0);
      const hasMatchaValue = Boolean(Number(v.recipe?.matchaGrams) > 0);
      const naturallyHasCocoa = Boolean(aiRec.cocoaGrams > 0);
      const hasCocoaValue = Boolean(Number(v.recipe?.cocoaGrams) > 0);
      const naturallyHasIce = isColdDrink || Boolean(aiRec.iceGrams > 0);
      const hasIceValue = Boolean(Number(v.recipe?.iceGrams) > 0);
      const naturallyHasIceCream = isMilkshakeDrink || Boolean(aiRec.iceCreamGrams > 0);
      const hasIceCreamValue = Boolean(Number(v.recipe?.iceCreamGrams) > 0);
      const naturallyHasWhippedCream = Boolean(aiRec.whippedCreamGrams > 0);
      const hasWhippedCreamValue = Boolean(Number(v.recipe?.whippedCreamGrams) > 0);
      const naturallyHasSauce = Boolean(aiRec.sauceGrams > 0);
      const hasSauceValue = Boolean(Number(v.recipe?.sauceGrams) > 0);
      const naturallyHasOreo = Boolean(
        aiRec.oreoUnits > 0 || aiRec.oreoGrams > 0 || itemNameLower.includes('oreo')
      );
      const hasOreoValue = Boolean(
        Number(v.recipe?.oreoUnits) > 0 ||
          Number(v.recipe?.oreoQty) > 0 ||
          Number(v.recipe?.oreoGrams) > 0
      );
      const naturallyHasSyrup = Boolean(aiRec.syrupMl > 0);
      const hasSyrupValue = Boolean(Number(v.recipe?.syrupMl) > 0);
      const naturallyHasSyrup2 = Boolean(aiRec.syrup2Ml > 0);
      const hasSyrup2Value = Boolean(Number(v.recipe?.syrup2Ml) > 0);
      const naturallyHasSyrup3 = Boolean(aiRec.syrup3Ml > 0);
      const hasSyrup3Value = Boolean(Number(v.recipe?.syrup3Ml) > 0);

      init[v.sizeKey] = {
        coffee: naturallyHasCoffee || hasCoffeeValue,
        matcha: naturallyHasMatcha || hasMatchaValue,
        cocoa: naturallyHasCocoa || hasCocoaValue,
        oreo: naturallyHasOreo || hasOreoValue,
        ice: naturallyHasIce || hasIceValue,
        iceCream: naturallyHasIceCream || hasIceCreamValue,
        whippedCream: naturallyHasWhippedCream || hasWhippedCreamValue,
        sauce: naturallyHasSauce || hasSauceValue,
        syrup: naturallyHasSyrup || hasSyrupValue,
        syrup2: naturallyHasSyrup2 || hasSyrup2Value,
        syrup3: naturallyHasSyrup3 || hasSyrup3Value,
      };
    });
    return init;
  });

  const [aiFeedback, setAiFeedback] = useState(null);

  const handleAiAdjust = () => {
    const newMap = {};
    const newVis = {};
    let explanation = '';
    item.variants.forEach((v) => {
      const rec = detectAiRecipe(item.name, v.sizeKey, item.category, config);
      if (!explanation && rec.aiExplanation) {
        explanation = rec.aiExplanation;
      }
      const is16 = (v.sizeKey || '').toLowerCase().includes('16');
      const isSmoothieVar = Boolean(rec.isSmoothie);
      const isCold = Boolean(rec.isCold || isColdDrink);
      newMap[v.sizeKey] = {
        coffeeGrams: isNoCoffeeProduct ? 0 : rec.coffeeGrams,
        matchaGrams: rec.matchaGrams || 0,
        milkMl: rec.milkMl,
        milkType: rec.milkType,
        cocoaGrams: rec.cocoaGrams || 0,
        oreoUnits: rec.oreoUnits || 0,
        oreoGrams: rec.oreoGrams || 0,
        iceCreamGrams: isMilkshakeDrink ? rec.iceCreamGrams || (is16 ? 180 : 120) : 0,
        whippedCreamGrams: rec.whippedCreamGrams || 0,
        sauceGrams: rec.sauceGrams,
        sauceFlavor: rec.sauceFlavor,
        syrupMl: rec.syrupMl,
        syrupFlavor: rec.syrupFlavor,
        syrup2Ml: rec.syrup2Ml || 0,
        syrup2Flavor: rec.syrup2Flavor || 'vainilla',
        syrup3Ml: rec.syrup3Ml || 0,
        syrup3Flavor: rec.syrup3Flavor || 'syrup_1790392238949',
        chocolateCost: 0,
        isSmoothie: isSmoothieVar,
        smoothieFlavor: isSmoothieVar ? rec.smoothieFlavor || 'promedio' : '',
        smoothieCost: isSmoothieVar ? rec.smoothieCost : 0,
        pulpaGrams: isSmoothieVar ? rec.pulpaGrams || (is16 ? 130 : 95) : 0,
        iceGrams: isCold ? rec.iceGrams || (is16 ? 200 : 150) : 0,
        waterGrams: isSmoothieVar ? rec.waterGrams || (is16 ? 170 : 125) : 0,
        pastryCost: rec.pastryCost,
        baseBakeryCost: rec.baseBakeryCost !== undefined ? rec.baseBakeryCost : rec.pastryCost,
        jamonGrams: rec.jamonGrams || 0,
        tyboGrams: rec.tyboGrams || 0,
        cheddarGrams: rec.cheddarGrams || 0,
        lomitoGrams: rec.lomitoGrams || 0,
        sardoGrams: rec.sardoGrams || 0,
        mandiocaGrams: rec.mandiocaGrams || 0,
        eggsCount: rec.eggsCount || 0,
        flourGrams: rec.flourGrams || 0,
        butterGrams: rec.butterGrams || 0,
        sugarGrams: rec.sugarGrams || 0,
        saltGrams: rec.saltGrams || 0,
        darkChocGrams: rec.darkChocGrams || 0,
        whiteChocGrams: rec.whiteChocGrams || 0,
        milkChocGrams: rec.milkChocGrams || 0,
        cupType: rec.cupType,
      };
      newVis[v.sizeKey] = {
        coffee: !isNoCoffeeProduct && Boolean(rec.coffeeGrams > 0),
        matcha: (isMatchaDrink && !isCold) || Boolean(rec.matchaGrams > 0),
        cocoa: Boolean(rec.cocoaGrams > 0),
        oreo: Boolean(rec.oreoUnits > 0 || rec.oreoGrams > 0 || item.name.toLowerCase().includes('oreo')),
        ice: isCold || Boolean(rec.iceGrams > 0),
        iceCream: isMilkshakeDrink || Boolean(rec.iceCreamGrams > 0),
        whippedCream: Boolean(rec.whippedCreamGrams > 0),
        sauce: Boolean(rec.sauceGrams > 0),
        syrup: Boolean(rec.syrupMl > 0),
        syrup2: Boolean(rec.syrup2Ml > 0),
        syrup3: Boolean(rec.syrup3Ml > 0),
      };
    });
    setVariantsState(newMap);
    setVisibleIngredients(newVis);
    setAiFeedback(explanation || `Medidas calibradas por IA para ${item.name}`);
  };

  const [searchingOnline, setSearchingOnline] = useState(false);

  const handleSearchOnlineAi = async () => {
    try {
      setSearchingOnline(true);
      setAiFeedback('🔍 Buscando receta en internet...');
      const onlineResult = await searchBeverageRecipeOnline(item.name, item.category, config);
      const onlineRecipes = onlineResult?.recipes || {};
      const newMap = {};
      const newVis = {};
      let explanation = onlineResult?.summary || '';

      item.variants.forEach((v) => {
        const rec =
          onlineRecipes[v.sizeKey] ||
          onlineRecipes['standard'] ||
          detectAiRecipe(item.name, v.sizeKey, item.category, config);
        if (!explanation && rec.aiExplanation) {
          explanation = rec.aiExplanation;
        }
        const is16 = (v.sizeKey || '').toLowerCase().includes('16');
        const isSmoothieVar = Boolean(rec.isSmoothie);
        const isCold = Boolean(rec.isCold || isColdDrink);
        newMap[v.sizeKey] = {
          coffeeGrams: isNoCoffeeProduct ? 0 : rec.coffeeGrams,
          matchaGrams: rec.matchaGrams || 0,
          milkMl: rec.milkMl,
          milkType: rec.milkType,
          cocoaGrams: rec.cocoaGrams || 0,
          oreoUnits: rec.oreoUnits || 0,
          oreoGrams: rec.oreoGrams || 0,
          iceCreamGrams: isMilkshakeDrink ? rec.iceCreamGrams || (is16 ? 180 : 120) : 0,
          whippedCreamGrams: rec.whippedCreamGrams || 0,
          sauceGrams: rec.sauceGrams,
          sauceFlavor: rec.sauceFlavor,
          syrupMl: rec.syrupMl,
          syrupFlavor: rec.syrupFlavor,
          syrup2Ml: rec.syrup2Ml || 0,
          syrup2Flavor: rec.syrup2Flavor || 'vainilla',
          syrup3Ml: rec.syrup3Ml || 0,
          syrup3Flavor: rec.syrup3Flavor || 'syrup_1790392238949',
          chocolateCost: 0,
          isSmoothie: isSmoothieVar,
          smoothieFlavor: isSmoothieVar ? rec.smoothieFlavor || 'promedio' : '',
          smoothieCost: isSmoothieVar ? rec.smoothieCost : 0,
          pulpaGrams: isSmoothieVar ? rec.pulpaGrams || (is16 ? 130 : 95) : 0,
          iceGrams: isCold ? rec.iceGrams || (is16 ? 200 : 150) : 0,
          waterGrams: isSmoothieVar ? rec.waterGrams || (is16 ? 170 : 125) : 0,
          pastryCost: rec.pastryCost,
          baseBakeryCost: rec.baseBakeryCost !== undefined ? rec.baseBakeryCost : rec.pastryCost,
          jamonGrams: rec.jamonGrams || 0,
          tyboGrams: rec.tyboGrams || 0,
          cheddarGrams: rec.cheddarGrams || 0,
          lomitoGrams: rec.lomitoGrams || 0,
          sardoGrams: rec.sardoGrams || 0,
          mandiocaGrams: rec.mandiocaGrams || 0,
          eggsCount: rec.eggsCount || 0,
          flourGrams: rec.flourGrams || 0,
          butterGrams: rec.butterGrams || 0,
          sugarGrams: rec.sugarGrams || 0,
          saltGrams: rec.saltGrams || 0,
          darkChocGrams: rec.darkChocGrams || 0,
          whiteChocGrams: rec.whiteChocGrams || 0,
          milkChocGrams: rec.milkChocGrams || 0,
          cupType: rec.cupType,
        };
        newVis[v.sizeKey] = {
          coffee: !isNoCoffeeProduct && Boolean(rec.coffeeGrams > 0),
          matcha: (isMatchaDrink && !isCold) || Boolean(rec.matchaGrams > 0),
          cocoa: Boolean(rec.cocoaGrams > 0),
          oreo: Boolean(rec.oreoUnits > 0 || rec.oreoGrams > 0 || item.name.toLowerCase().includes('oreo')),
          ice: isCold || Boolean(rec.iceGrams > 0),
          iceCream: isMilkshakeDrink || Boolean(rec.iceCreamGrams > 0),
          whippedCream: Boolean(rec.whippedCreamGrams > 0),
          sauce: Boolean(rec.sauceGrams > 0),
          syrup: Boolean(rec.syrupMl > 0),
          syrup2: Boolean(rec.syrup2Ml > 0),
          syrup3: Boolean(rec.syrup3Ml > 0),
        };
      });
      setVariantsState(newMap);
      setVisibleIngredients(newVis);
      setAiFeedback(`🌐 Receta encontrada en internet: ${explanation}`);
    } catch (err) {
      console.error('Error buscando receta online:', err);
      setAiFeedback('No se pudo conectar a internet. Se utilizó la calibración local.');
      handleAiAdjust();
    } finally {
      setSearchingOnline(false);
    }
  };

  const currentVariant = item.variants.find((v) => v.sizeKey === activeKey) || item.variants[0];

  const currentPrice =
    pricesState[currentVariant?.sizeKey] !== undefined
      ? pricesState[currentVariant?.sizeKey]
      : currentVariant?.price || 0;

  const updateCurrentPrice = (val) => {
    const num = val === '' ? '' : Number(val);
    setPricesState((prev) => ({
      ...prev,
      [currentVariant?.sizeKey]: num,
    }));
  };

  const currentRecipe = variantsState[currentVariant?.sizeKey] || {};
  const currentVis = visibleIngredients[currentVariant?.sizeKey] || {
    coffee: false,
    matcha: false,
    cocoa: false,
    oreo: false,
    ice: false,
    iceCream: false,
    whippedCream: false,
    sauce: false,
    syrup: false,
    syrup2: false,
    syrup3: false,
  };
  const isCoffeeVisible = !isNoCoffeeProduct && Boolean(currentVis.coffee);
  const isMatchaVisible = Boolean(currentVis.matcha);
  const isCocoaVisible = Boolean(currentVis.cocoa);
  const isOreoVisible = Boolean(currentVis.oreo);
  const isIceVisible = Boolean(currentVis.ice);
  const isIceCreamVisible = Boolean(currentVis.iceCream);
  const isWhippedCreamVisible = Boolean(currentVis.whippedCream);
  const isSauceVisible = Boolean(currentVis.sauce);
  const isSyrupVisible = Boolean(currentVis.syrup);
  const isSyrup2Visible = Boolean(currentVis.syrup2);
  const isSyrup3Visible = Boolean(currentVis.syrup3);

  const handleAddMatcha = () => {
    const sKey = currentVariant?.sizeKey;
    const is16 = (sKey || '').toLowerCase().includes('16');
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], matcha: true },
    }));
    if (!Number(currentRecipe.matchaGrams)) {
      updateCurrentRecipe('matchaGrams', is16 ? 4 : 3);
    }
  };

  const handleRemoveMatcha = () => {
    const sKey = currentVariant?.sizeKey;
    updateCurrentRecipe('matchaGrams', 0);
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], matcha: false },
    }));
  };

  const handleAddIce = () => {
    const sKey = currentVariant?.sizeKey;
    const is16 = (sKey || '').toLowerCase().includes('16');
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], ice: true },
    }));
    if (!Number(currentRecipe.iceGrams)) {
      updateCurrentRecipe('iceGrams', is16 ? 180 : 140);
    }
  };

  const handleRemoveIce = () => {
    const sKey = currentVariant?.sizeKey;
    updateCurrentRecipe('iceGrams', 0);
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], ice: false },
    }));
  };

  const updateCurrentRecipe = (field, val) => {
    setVariantsState((prev) => ({
      ...prev,
      [currentVariant.sizeKey]: {
        ...prev[currentVariant.sizeKey],
        [field]: val,
      },
    }));
  };

  const updateCurrentRecipeMultiple = (fieldsObj) => {
    setVariantsState((prev) => ({
      ...prev,
      [currentVariant.sizeKey]: {
        ...prev[currentVariant.sizeKey],
        ...fieldsObj,
      },
    }));
  };

  const handleAddIceCream = () => {
    const sKey = currentVariant?.sizeKey;
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], iceCream: true },
    }));
    if (!Number(currentRecipe.iceCreamGrams)) {
      const defaultGrams = sKey?.includes('16') ? 180 : 120;
      updateCurrentRecipe('iceCreamGrams', defaultGrams);
    }
  };

  const handleRemoveIceCream = () => {
    const sKey = currentVariant?.sizeKey;
    updateCurrentRecipe('iceCreamGrams', 0);
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], iceCream: false },
    }));
  };

  const handleAddWhippedCream = () => {
    const sKey = currentVariant?.sizeKey;
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], whippedCream: true },
    }));
    if (!Number(currentRecipe.whippedCreamGrams)) {
      const defaultGrams = sKey?.includes('16') ? 40 : 30;
      updateCurrentRecipe('whippedCreamGrams', defaultGrams);
    }
  };

  const handleRemoveWhippedCream = () => {
    const sKey = currentVariant?.sizeKey;
    updateCurrentRecipe('whippedCreamGrams', 0);
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], whippedCream: false },
    }));
  };

  const handleAddCocoa = () => {
    const sKey = currentVariant?.sizeKey;
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], cocoa: true },
    }));
    if (!Number(currentRecipe.cocoaGrams)) {
      const defaultCocoa = sKey?.includes('8oz') ? 17 : sKey?.includes('16oz') ? 32 : 24;
      updateCurrentRecipe('cocoaGrams', defaultCocoa);
    }
  };

  const handleRemoveCocoa = () => {
    const sKey = currentVariant?.sizeKey;
    updateCurrentRecipe('cocoaGrams', 0);
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], cocoa: false },
    }));
  };

  const handleAddOreo = () => {
    const sKey = currentVariant?.sizeKey;
    const is16 = (sKey || '').toLowerCase().includes('16');
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], oreo: true },
    }));
    if (!Number(currentRecipe.oreoUnits) && !Number(currentRecipe.oreoGrams)) {
      updateCurrentRecipe('oreoUnits', is16 ? 2.5 : 2);
    }
  };

  const handleRemoveOreo = () => {
    const sKey = currentVariant?.sizeKey;
    updateCurrentRecipe('oreoUnits', 0);
    updateCurrentRecipe('oreoGrams', 0);
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], oreo: false },
    }));
  };

  const handleAddSauce = () => {
    const sKey = currentVariant?.sizeKey;
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], sauce: true },
    }));
    if (!Number(currentRecipe.sauceGrams)) {
      updateCurrentRecipe('sauceGrams', 15);
    }
  };

  const handleRemoveSauce = () => {
    const sKey = currentVariant?.sizeKey;
    updateCurrentRecipe('sauceGrams', 0);
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], sauce: false },
    }));
  };

  const handleAddSyrup = () => {
    const sKey = currentVariant?.sizeKey;
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], syrup: true },
    }));
    if (!Number(currentRecipe.syrupMl)) {
      updateCurrentRecipe('syrupMl', 15);
    }
  };

  const handleRemoveSyrup = () => {
    const sKey = currentVariant?.sizeKey;
    updateCurrentRecipe('syrupMl', 0);
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], syrup: false },
    }));
  };

  const handleAddSyrup2 = () => {
    const sKey = currentVariant?.sizeKey;
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], syrup2: true },
    }));
    if (!Number(currentRecipe.syrup2Ml)) {
      updateCurrentRecipe('syrup2Ml', 10);
    }
    if (!currentRecipe.syrup2Flavor) {
      updateCurrentRecipe('syrup2Flavor', 'vainilla');
    }
  };

  const handleRemoveSyrup2 = () => {
    const sKey = currentVariant?.sizeKey;
    updateCurrentRecipe('syrup2Ml', 0);
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], syrup2: false },
    }));
  };

  const handleAddSyrup3 = () => {
    const sKey = currentVariant?.sizeKey;
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], syrup3: true },
    }));
    if (!Number(currentRecipe.syrup3Ml)) {
      updateCurrentRecipe('syrup3Ml', 10);
    }
    if (!currentRecipe.syrup3Flavor) {
      updateCurrentRecipe('syrup3Flavor', 'syrup_1790392238949');
    }
  };

  const handleRemoveSyrup3 = () => {
    const sKey = currentVariant?.sizeKey;
    updateCurrentRecipe('syrup3Ml', 0);
    setVisibleIngredients((prev) => ({
      ...prev,
      [sKey]: { ...prev[sKey], syrup3: false },
    }));
  };

  const currentHotCupCost = getPackagingUnitCost
    ? getPackagingUnitCost('hot', currentVariant?.sizeKey)
    : effPackaging;
  const currentColdCupCost = getPackagingUnitCost
    ? getPackagingUnitCost('milkshake', currentVariant?.sizeKey)
    : effPackagingCold;

  const hamRate =
    effHamPerGram ||
    getUnitCost(config?.hamPrice ?? 12000, config?.hamQty ?? 1, config?.hamUnit ?? 'kg');
  const tyboRate =
    effTyboPerGram ||
    getUnitCost(config?.tyboPrice ?? 11000, config?.tyboQty ?? 1, config?.tyboUnit ?? 'kg');
  const cheddarRate =
    effCheddarPerGram ||
    getUnitCost(config?.cheddarPrice ?? 13500, config?.cheddarQty ?? 1, config?.cheddarUnit ?? 'kg');
  const lomitoRate =
    effLomitoPerGram ||
    getUnitCost(config?.lomitoPrice ?? 14500, config?.lomitoQty ?? 1, config?.lomitoUnit ?? 'kg');
  const sardoRate =
    effSardoPerGram ||
    getUnitCost(config?.sardoPrice ?? 15500, config?.sardoQty ?? 1, config?.sardoUnit ?? 'kg');

  const mandiocaRate =
    effMandiocaPerGram ||
    getUnitCost(config?.mandiocaPrice ?? 4500, config?.mandiocaQty ?? 1, config?.mandiocaUnit ?? 'kg');
  const eggRate =
    effEggPerUnit ||
    getStandardCost(config?.eggsPrice ?? 5000, config?.eggsQty ?? 30, config?.eggsUnit ?? 'unidad') ||
    166.67;
  const saltRate =
    effSaltPerGram ||
    getUnitCost(config?.saltPrice ?? 1200, config?.saltQty ?? 1, config?.saltUnit ?? 'kg');
  const sugarRate =
    effSugarPerGram ||
    getUnitCost(config?.sugarPrice ?? 1400, config?.sugarQty ?? 1, config?.sugarUnit ?? 'kg');
  const flourRate =
    effFlourPerGram ||
    getUnitCost(config?.flour0000Price ?? 1500, config?.flour0000Qty ?? 1, config?.flour0000Unit ?? 'kg');
  const butterRate =
    effButterPerGram ||
    getUnitCost(config?.butterPrice ?? 11500, config?.butterQty ?? 1, config?.butterUnit ?? 'kg');
  const darkChocRate =
    effBakingDarkChocPerGram ||
    getUnitCost(
      config?.bakingDarkChocPrice ?? 14000,
      config?.bakingDarkChocQty ?? 1,
      config?.bakingDarkChocUnit ?? 'kg'
    );
  const whiteChocRate =
    effBakingWhiteChocPerGram ||
    getUnitCost(
      config?.bakingWhiteChocPrice ?? 15000,
      config?.bakingWhiteChocQty ?? 1,
      config?.bakingWhiteChocUnit ?? 'kg'
    );
  const milkChocRate =
    effBakingMilkChocPerGram ||
    getUnitCost(
      config?.bakingMilkChocPrice ?? 14500,
      config?.bakingMilkChocQty ?? 1,
      config?.bakingMilkChocUnit ?? 'kg'
    );

  const currentBaseBakery = Number(currentRecipe.baseBakeryCost ?? currentRecipe.pastryCost ?? 0);
  const currentHamGrams = Number(currentRecipe.jamonGrams) || 0;
  const currentTyboGrams = Number(currentRecipe.tyboGrams) || 0;
  const currentCheddarGrams = Number(currentRecipe.cheddarGrams) || 0;
  const currentLomitoGrams = Number(currentRecipe.lomitoGrams) || 0;
  const currentSardoGrams = Number(currentRecipe.sardoGrams) || 0;

  const currentMandiocaGrams = Number(currentRecipe.mandiocaGrams) || 0;
  const currentEggsCount = Number(currentRecipe.eggsCount) || 0;
  const currentFlourGrams = Number(currentRecipe.flourGrams) || 0;
  const currentButterGrams = Number(currentRecipe.butterGrams) || 0;
  const currentSugarGrams = Number(currentRecipe.sugarGrams) || 0;
  const currentSaltGrams = Number(currentRecipe.saltGrams) || 0;
  const currentDarkChocGrams = Number(currentRecipe.darkChocGrams) || 0;
  const currentWhiteChocGrams = Number(currentRecipe.whiteChocGrams) || 0;
  const currentMilkChocGrams = Number(currentRecipe.milkChocGrams) || 0;

  const currentDeliCost =
    currentHamGrams * hamRate +
    currentTyboGrams * tyboRate +
    currentCheddarGrams * cheddarRate +
    currentLomitoGrams * lomitoRate +
    currentSardoGrams * sardoRate;

  const currentBakingCost =
    currentMandiocaGrams * mandiocaRate +
    currentEggsCount * eggRate +
    currentFlourGrams * flourRate +
    currentButterGrams * butterRate +
    currentSugarGrams * sugarRate +
    currentSaltGrams * saltRate +
    currentDarkChocGrams * darkChocRate +
    currentWhiteChocGrams * whiteChocRate +
    currentMilkChocGrams * milkChocRate;

  const updatePastryCost = (overrides = {}) => {
    const base =
      Number(
        overrides.baseBakeryCost !== undefined
          ? overrides.baseBakeryCost
          : (currentRecipe.baseBakeryCost ?? currentRecipe.pastryCost ?? 0)
      ) || 0;
    const j =
      Number(overrides.jamonGrams !== undefined ? overrides.jamonGrams : currentRecipe.jamonGrams) || 0;
    const t =
      Number(overrides.tyboGrams !== undefined ? overrides.tyboGrams : currentRecipe.tyboGrams) || 0;
    const c =
      Number(
        overrides.cheddarGrams !== undefined ? overrides.cheddarGrams : currentRecipe.cheddarGrams
      ) || 0;
    const l =
      Number(overrides.lomitoGrams !== undefined ? overrides.lomitoGrams : currentRecipe.lomitoGrams) ||
      0;
    const s =
      Number(overrides.sardoGrams !== undefined ? overrides.sardoGrams : currentRecipe.sardoGrams) || 0;
    const m =
      Number(
        overrides.mandiocaGrams !== undefined ? overrides.mandiocaGrams : currentRecipe.mandiocaGrams
      ) || 0;
    const e =
      Number(overrides.eggsCount !== undefined ? overrides.eggsCount : currentRecipe.eggsCount) || 0;
    const f =
      Number(overrides.flourGrams !== undefined ? overrides.flourGrams : currentRecipe.flourGrams) || 0;
    const b =
      Number(overrides.butterGrams !== undefined ? overrides.butterGrams : currentRecipe.butterGrams) ||
      0;
    const su =
      Number(overrides.sugarGrams !== undefined ? overrides.sugarGrams : currentRecipe.sugarGrams) || 0;
    const sa =
      Number(overrides.saltGrams !== undefined ? overrides.saltGrams : currentRecipe.saltGrams) || 0;
    const dc =
      Number(
        overrides.darkChocGrams !== undefined ? overrides.darkChocGrams : currentRecipe.darkChocGrams
      ) || 0;
    const wc =
      Number(
        overrides.whiteChocGrams !== undefined ? overrides.whiteChocGrams : currentRecipe.whiteChocGrams
      ) || 0;
    const mc =
      Number(
        overrides.milkChocGrams !== undefined ? overrides.milkChocGrams : currentRecipe.milkChocGrams
      ) || 0;

    const deli = j * hamRate + t * tyboRate + c * cheddarRate + l * lomitoRate + s * sardoRate;
    const baking =
      m * mandiocaRate +
      e * eggRate +
      f * flourRate +
      b * butterRate +
      su * sugarRate +
      sa * saltRate +
      dc * darkChocRate +
      wc * whiteChocRate +
      mc * milkChocRate;

    return deli + baking > 0
      ? Math.round(base + deli + baking)
      : Number(currentRecipe.pastryCost || base) || 0;
  };

  // Cálculo en tiempo real de la medida seleccionada
  const currentCostObj = calculateCost(
    {
      ...currentRecipe,
      sizeKey: currentVariant?.sizeKey,
      category: item.category,
      name: item.name,
      isExtra,
      coffeeGrams: isCoffeeVisible ? Number(currentRecipe.coffeeGrams) || 0 : 0,
      milkMl: Number(currentRecipe.milkMl) || 0,
      milkType: currentRecipe.milkType || 'regular',
      cocoaGrams: isCocoaVisible ? Number(currentRecipe.cocoaGrams) || 0 : 0,
      oreoUnits: isOreoVisible ? Number(currentRecipe.oreoUnits) || 0 : 0,
      oreoGrams: isOreoVisible ? Number(currentRecipe.oreoGrams) || 0 : 0,
      iceCreamGrams: isIceCreamVisible ? Number(currentRecipe.iceCreamGrams) || 0 : 0,
      whippedCreamGrams: isWhippedCreamVisible ? Number(currentRecipe.whippedCreamGrams) || 0 : 0,
      sauceGrams: isSauceVisible ? Number(currentRecipe.sauceGrams) || 0 : 0,
      sauceFlavor: currentRecipe.sauceFlavor,
      syrupMl: isSyrupVisible ? Number(currentRecipe.syrupMl) || 0 : 0,
      syrupFlavor: currentRecipe.syrupFlavor,
      syrup2Ml: isSyrup2Visible ? Number(currentRecipe.syrup2Ml) || 0 : 0,
      syrup2Flavor: currentRecipe.syrup2Flavor,
      syrup3Ml: isSyrup3Visible ? Number(currentRecipe.syrup3Ml) || 0 : 0,
      syrup3Flavor: currentRecipe.syrup3Flavor,
      isSmoothie,
      smoothieFlavor: isSmoothie ? currentRecipe.smoothieFlavor || '' : '',
      smoothieCost: isSmoothie ? Number(currentRecipe.smoothieCost) || 0 : 0,
      pulpaGrams: isSmoothie ? Number(currentRecipe.pulpaGrams) || 0 : 0,
      iceGrams: isIceVisible ? Number(currentRecipe.iceGrams) || 0 : 0,
      waterGrams: isSmoothie ? Number(currentRecipe.waterGrams) || 0 : 0,
      cupType: fixedCupType,
      isPastry,
      pastryCost: Number(currentRecipe.pastryCost) || 0,
      baseBakeryCost: Number(currentRecipe.baseBakeryCost) || currentBaseBakery,
      jamonGrams: currentHamGrams,
      tyboGrams: currentTyboGrams,
      cheddarGrams: currentCheddarGrams,
      lomitoGrams: currentLomitoGrams,
      sardoGrams: currentSardoGrams,
      mandiocaGrams: currentMandiocaGrams,
      eggsCount: currentEggsCount,
      flourGrams: currentFlourGrams,
      butterGrams: currentButterGrams,
      sugarGrams: currentSugarGrams,
      saltGrams: currentSaltGrams,
      darkChocGrams: currentDarkChocGrams,
      whiteChocGrams: currentWhiteChocGrams,
      milkChocGrams: currentMilkChocGrams,
    },
    !isPastry && !isExtra
  );
  const currentSuggestedPrice = calculateSuggestedPrice(currentCostObj.total);
  const evalVenta = evaluateVenta
    ? evaluateVenta(currentPrice, currentCostObj.total)
    : { netIncome: 0, profit: 0, margin: 0, isHealthy: false };

  const handleSubmit = (e) => {
    e.preventDefault();
    const resultToSave = {};
    item.variants.forEach((v) => {
      const r = variantsState[v.sizeKey] || {};
      if (isPastry) {
        const baseB = Number(r.baseBakeryCost ?? r.pastryCost) || 0;
        const jG = Number(r.jamonGrams) || 0;
        const tG = Number(r.tyboGrams) || 0;
        const cG = Number(r.cheddarGrams) || 0;
        const lG = Number(r.lomitoGrams) || 0;
        const sG = Number(r.sardoGrams) || 0;
        const mandiocaG = Number(r.mandiocaGrams) || 0;
        const eggsC = Number(r.eggsCount) || 0;
        const flourG = Number(r.flourGrams) || 0;
        const butterG = Number(r.butterGrams) || 0;
        const sugarG = Number(r.sugarGrams) || 0;
        const saltG = Number(r.saltGrams) || 0;
        const darkChocG = Number(r.darkChocGrams) || 0;
        const whiteChocG = Number(r.whiteChocGrams) || 0;
        const milkChocG = Number(r.milkChocGrams) || 0;

        const deliCost =
          jG * hamRate +
          tG * tyboRate +
          cG * cheddarRate +
          lG * lomitoRate +
          sG * sardoRate;
        const bakingCost =
          mandiocaG * mandiocaRate +
          eggsC * eggRate +
          flourG * flourRate +
          butterG * butterRate +
          sugarG * sugarRate +
          saltG * saltRate +
          darkChocG * darkChocRate +
          whiteChocG * whiteChocRate +
          milkChocG * milkChocRate;

        const additionalCost = deliCost + bakingCost;
        const finalPastryCost =
          additionalCost > 0 ? Math.round(baseB + additionalCost) : Number(r.pastryCost || baseB) || 0;

        const parts = [];
        if (baseB > 0) parts.push(`Base: $${baseB}`);
        if (jG > 0) parts.push(`${jG}g jamón`);
        if (tG > 0) parts.push(`${tG}g tybo`);
        if (cG > 0) parts.push(`${cG}g cheddar`);
        if (lG > 0) parts.push(`${lG}g lomito`);
        if (sG > 0) parts.push(`${sG}g sardo`);
        if (mandiocaG > 0) parts.push(`${mandiocaG}g mandioca`);
        if (eggsC > 0) parts.push(`${eggsC} huevo${eggsC > 1 ? 's' : ''}`);
        if (flourG > 0) parts.push(`${flourG}g harina`);
        if (butterG > 0) parts.push(`${butterG}g manteca`);
        if (sugarG > 0) parts.push(`${sugarG}g azúcar`);
        if (darkChocG > 0) parts.push(`${darkChocG}g choc. negro`);
        if (whiteChocG > 0) parts.push(`${whiteChocG}g choc. blanco`);
        if (milkChocG > 0) parts.push(`${milkChocG}g choc. leche`);
        const rawTxt =
          parts.length > 0
            ? parts.join(' · ')
            : v.recipe?.rawRecipeText || `Base pastelería: $${finalPastryCost}`;

        resultToSave[v.recipeKey] = {
          coffeeGrams: 0,
          milkMl: 0,
          milkType: 'none',
          cocoaGrams: 0,
          iceCreamGrams: 0,
          whippedCreamGrams: 0,
          sauceGrams: 0,
          syrupMl: 0,
          syrupFlavor: '',
          syrup2Ml: 0,
          syrup2Flavor: '',
          syrup3Ml: 0,
          syrup3Flavor: '',
          chocolateCost: 0,
          isSmoothie: false,
          smoothieCost: 0,
          cupType: 'hot',
          isPastry: true,
          pastryCost: finalPastryCost,
          baseBakeryCost: baseB,
          jamonGrams: jG,
          tyboGrams: tG,
          cheddarGrams: cG,
          lomitoGrams: lG,
          sardoGrams: sG,
          mandiocaGrams: mandiocaG,
          eggsCount: eggsC,
          flourGrams: flourG,
          butterGrams: butterG,
          sugarGrams: sugarG,
          saltGrams: saltG,
          darkChocGrams: darkChocG,
          whiteChocGrams: whiteChocG,
          milkChocGrams: milkChocG,
          rawRecipeText: rawTxt,
        };
      } else if (isSmoothie) {
        const sFlav = r.smoothieFlavor || 'promedio';
        const sCost = Number(r.smoothieCost) || 1400;
        const is16 = (v.sizeKey || '').toLowerCase().includes('16');
        const pG = Number(r.pulpaGrams) || (is16 ? 130 : 95);
        const iG = Number(r.iceGrams) || (is16 ? 200 : 150);
        const wG = Number(r.waterGrams) || (is16 ? 170 : 125);
        const fLabel = sFlav === 'promedio' ? 'Frutos del Bosque' : sFlav.replace(/_/g, ' ');
        resultToSave[v.recipeKey] = {
          coffeeGrams: 0,
          milkMl: 0,
          milkType: 'none',
          cocoaGrams: 0,
          iceCreamGrams: 0,
          whippedCreamGrams: 0,
          sauceGrams: 0,
          sauceFlavor: '',
          syrupMl: 0,
          syrupFlavor: '',
          syrup2Ml: 0,
          syrup2Flavor: '',
          syrup3Ml: 0,
          syrup3Flavor: '',
          chocolateCost: 0,
          isSmoothie: true,
          smoothieFlavor: sFlav,
          smoothieCost: sCost,
          pulpaGrams: pG,
          iceGrams: iG,
          waterGrams: wG,
          cupType: 'milkshake',
          isPastry: false,
          pastryCost: 0,
          rawRecipeText: `${pG}g pulpa ${fLabel} • ${iG}g hielo • ${wG}ml agua`,
        };
      } else {
        const isCoffeeVis = !isNoCoffeeProduct && Boolean(visibleIngredients[v.sizeKey]?.coffee);
        const isCocoaVis = Boolean(visibleIngredients[v.sizeKey]?.cocoa);
        const isIceVis = Boolean(visibleIngredients[v.sizeKey]?.ice);
        const isIceCreamVis = Boolean(visibleIngredients[v.sizeKey]?.iceCream);
        const isWhippedCreamVis = Boolean(visibleIngredients[v.sizeKey]?.whippedCream);
        const isSauceVis = visibleIngredients[v.sizeKey]?.sauce;
        const isOreoVis = Boolean(visibleIngredients[v.sizeKey]?.oreo);
        const isSyrupVis = visibleIngredients[v.sizeKey]?.syrup;
        const isSyrup2Vis = visibleIngredients[v.sizeKey]?.syrup2;
        const isSyrup3Vis = visibleIngredients[v.sizeKey]?.syrup3;
        const iceCreamG = isIceCreamVis ? Number(r.iceCreamGrams) || 0 : 0;
        const whippedCreamG = isWhippedCreamVis ? Number(r.whippedCreamGrams) || 0 : 0;
        const coffeeG = isNoCoffeeProduct ? 0 : isCoffeeVis ? Number(r.coffeeGrams) || 0 : 0;
        const milkG = Number(r.milkMl) || 0;
        const iceG = isIceVis ? Number(r.iceGrams) || 0 : 0;
        const cocoaG = isCocoaVis ? Number(r.cocoaGrams) || 0 : 0;
        const oreoU = isOreoVis ? Number(r.oreoUnits) || 0 : 0;
        const oreoG = isOreoVis ? Number(r.oreoGrams) || 0 : 0;
        const sauceG = isSauceVis ? Number(r.sauceGrams) || 0 : 0;
        const syrupG = isSyrupVis ? Number(r.syrupMl) || 0 : 0;
        const syrup2G = isSyrup2Vis ? Number(r.syrup2Ml) || 0 : 0;
        const syrup3G = isSyrup3Vis ? Number(r.syrup3Ml) || 0 : 0;

        const parts = [];
        if (iceCreamG > 0) parts.push(`${iceCreamG}g helado`);
        if (coffeeG > 0) parts.push(`${coffeeG}g café`);
        if (milkG > 0) parts.push(`${milkG}ml ${r.milkType === 'plant' ? 'veg.' : 'leche'}`);
        if (iceG > 0) parts.push(`${iceG}g hielo`);
        if (cocoaG > 0) parts.push(`${cocoaG}g cacao`);
        if (oreoU > 0) parts.push(`${oreoU} galletas Oreo trituradas`);
        else if (oreoG > 0) parts.push(`${oreoG}g Oreo trituradas`);
        if (whippedCreamG > 0) parts.push(`${whippedCreamG}g crema`);
        if (sauceG > 0) {
          const sLabel = getSauceName(r.sauceFlavor, config);
          parts.push(`${sauceG}g salsa ${sLabel.toLowerCase()}`);
        }
        if (syrupG > 0) {
          const syLabel = getSyrupName(r.syrupFlavor, config);
          parts.push(`${syrupG}ml syrup ${syLabel.toLowerCase()}`);
        }
        if (syrup2G > 0) {
          const sy2Label = getSyrupName(r.syrup2Flavor, config);
          parts.push(`${syrup2G}ml syrup ${sy2Label.toLowerCase()}`);
        }
        if (syrup3G > 0) {
          const sy3Label = getSyrupName(r.syrup3Flavor, config);
          parts.push(`${syrup3G}ml syrup ${sy3Label.toLowerCase()}`);
        }
        if (fixedCupType === 'milkshake') parts.push('vaso milkshake');

        resultToSave[v.recipeKey] = {
          coffeeGrams: coffeeG,
          milkMl: milkG,
          milkType: r.milkType || 'regular',
          iceGrams: iceG,
          cocoaGrams: cocoaG,
          oreoUnits: oreoU,
          oreoGrams: oreoG,
          iceCreamGrams: iceCreamG,
          whippedCreamGrams: whippedCreamG,
          sauceGrams: sauceG,
          sauceFlavor: r.sauceFlavor || 'chocolate',
          syrupMl: syrupG,
          syrupFlavor: r.syrupFlavor || 'vainilla',
          syrup2Ml: syrup2G,
          syrup2Flavor: r.syrup2Flavor || 'vainilla',
          syrup3Ml: syrup3G,
          syrup3Flavor: r.syrup3Flavor || 'syrup_1790392238949',
          chocolateCost: 0,
          isSmoothie: false,
          smoothieCost: 0,
          cupType: fixedCupType,
          isPastry: false,
          pastryCost: 0,
          rawRecipeText: parts.join(' • ') || v.recipe?.rawRecipeText || '',
        };
      }
    });
    onSave(resultToSave, pricesState);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <ModalBodyScroll>
        {/* Selector de Medidas y Calibración IA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {item.variants.length > 1 ? (
            <div style={{ display: 'flex', gap: 6, flex: '1 1 auto' }}>
              {item.variants.map((v) => {
                const currentVPrice =
                  pricesState[v.sizeKey] !== undefined ? pricesState[v.sizeKey] : v.price;
                return (
                  <CatChip
                    key={v.sizeKey}
                    type="button"
                    $active={activeKey === v.sizeKey}
                    onClick={() => setActiveKey(v.sizeKey)}
                    style={{ flex: 1, textAlign: 'center', padding: '7px 8px' }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{v.sizeLabel}</div>
                    <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
                      ${Number(currentVPrice || 0).toLocaleString('es-AR')}
                    </div>
                  </CatChip>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#B4B6C9' }}>Medida Estándar</div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginLeft: 'auto',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={handleSearchOnlineAi}
              disabled={searchingOnline}
              title="Buscar receta en internet con IA según estándares internacionales de barismo"
              style={{
                all: 'unset',
                cursor: searchingOnline ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background:
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.3) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                color: '#60a5fa',
                padding: '6px 11px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 700,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                opacity: searchingOnline ? 0.7 : 1,
              }}
            >
              {searchingOnline ? (
                <RefreshCw className="animate-spin" size={13} />
              ) : (
                <Globe size={13} />
              )}
              {searchingOnline ? 'Buscando...' : 'Buscar en Internet'}
            </button>

            <button
              type="button"
              onClick={handleAiAdjust}
              title="Auto-calibrar proporciones con IA según el producto"
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(76, 205, 153, 0.12)',
                border: '1px solid rgba(76, 205, 153, 0.4)',
                color: '#4ccd99',
                padding: '6px 11px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 700,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Sparkles size={13} /> Auto-Ajustar IA
            </button>
          </div>
        </div>

        {aiFeedback && (
          <div
            style={{
              fontSize: 11.5,
              color: '#4ccd99',
              background: 'rgba(76, 205, 153, 0.08)',
              border: '1px solid rgba(76, 205, 153, 0.25)',
              borderRadius: 8,
              padding: '7px 11px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Check size={14} style={{ flexShrink: 0 }} />
            <span>{aiFeedback}</span>
          </div>
        )}

        {/* Tarjeta de Precio y Métricas en Vivo */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(76, 205, 153, 0.08) 0%, rgba(15, 23, 42, 0.65) 100%)',
            border: '1px solid rgba(76, 205, 153, 0.28)',
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#4ccd99',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Precio de Venta {currentVariant?.sizeLabel ? `(${currentVariant.sizeLabel})` : ''}
            </span>
            <button
              type="button"
              onClick={() => updateCurrentPrice(currentSuggestedPrice)}
              title="Aplicar precio sugerido calculado según costo y margen"
              style={{
                all: 'unset',
                cursor: 'pointer',
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                color: '#eab308',
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={11} /> Sugerido: ${currentSuggestedPrice.toLocaleString('es-AR')}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <InputNumber
              style={{
                flex: '1 1 130px',
                background: '#0b1320',
                borderColor: 'rgba(76, 205, 153, 0.45)',
                padding: '6px 10px',
              }}
            >
              <span className="prefix" style={{ color: '#4ccd99', fontWeight: 800, fontSize: 16 }}>
                $
              </span>
              <input
                type="number"
                value={currentPrice === '' ? '' : currentPrice}
                onChange={(e) => updateCurrentPrice(e.target.value)}
                placeholder="0"
                style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}
              />
            </InputNumber>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
                flex: '2 1 200px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: '#B4B6C9',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Costo
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 1 }}>
                  ${Math.round(currentCostObj.total).toLocaleString('es-AR')}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: '#B4B6C9',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Margen
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    marginTop: 1,
                    color:
                      evalVenta.margin >= 60
                        ? '#4ccd99'
                        : evalVenta.margin >= 45
                          ? '#eab308'
                          : '#ef4444',
                  }}
                >
                  {Number(currentPrice) > 0 ? `${evalVenta.margin}%` : '-'}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: '#B4B6C9',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Ganancia
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    marginTop: 1,
                    color: evalVenta.profit >= 0 ? '#4ccd99' : '#ef4444',
                  }}
                >
                  {evalVenta.profit >= 0 ? '+' : ''}$
                  {Math.round(evalVenta.profit || 0).toLocaleString('es-AR')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isPastry ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* BASE DE PANADERÍA / COMPRA */}
            <FormGroup>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <label style={{ margin: 0 }}>🥐 Base de Panadería (Masa, Medialuna o Chipá)</label>
                <span style={{ fontSize: 11, color: '#4ccd99', fontWeight: 600 }}>
                  Costo base de compra / masa
                </span>
              </div>
              <InputNumber>
                <span className="prefix">$</span>
                <input
                  type="number"
                  value={currentRecipe.baseBakeryCost ?? currentRecipe.pastryCost ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCurrentRecipe('baseBakeryCost', val);
                    updateCurrentRecipe('pastryCost', updatePastryCost({ baseBakeryCost: val }));
                  }}
                  placeholder="Ej: 1000"
                  autoFocus
                />
                <span className="unit">/ unidad base</span>
              </InputNumber>
            </FormGroup>

            {/* SECCIÓN FIAMBRERÍA Y QUESOS PARA RELLENO */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  🥪 Relleno: Fiambrería y Quesos
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: currentDeliCost > 0 ? '#eab308' : '#9ca3af',
                  }}
                >
                  {currentDeliCost > 0
                    ? `+$${Math.round(currentDeliCost).toLocaleString('es-AR')} en relleno`
                    : 'Sin fiambre'}
                </span>
              </div>

              {/* Presets rápidos */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const newValues = {
                      jamonGrams: 30,
                      tyboGrams: 30,
                      cheddarGrams: 0,
                      lomitoGrams: 0,
                      sardoGrams: 0,
                    };
                    updateCurrentRecipeMultiple({
                      ...newValues,
                      pastryCost: updatePastryCost(newValues),
                    });
                  }}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'rgba(234, 179, 8, 0.12)',
                    color: '#eab308',
                    border: '1px solid rgba(234, 179, 8, 0.25)',
                  }}
                >
                  🥐 Medialuna JYQ (30g+30g)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newValues = {
                      jamonGrams: 35,
                      tyboGrams: 35,
                      cheddarGrams: 0,
                      lomitoGrams: 0,
                      sardoGrams: 0,
                    };
                    updateCurrentRecipeMultiple({
                      ...newValues,
                      pastryCost: updatePastryCost(newValues),
                    });
                  }}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'rgba(76, 205, 153, 0.12)',
                    color: '#4ccd99',
                    border: '1px solid rgba(76, 205, 153, 0.25)',
                  }}
                >
                  🧀 Tostado Chipá (35g+35g)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newValues = {
                      jamonGrams: 40,
                      tyboGrams: 40,
                      cheddarGrams: 0,
                      lomitoGrams: 0,
                      sardoGrams: 0,
                    };
                    updateCurrentRecipeMultiple({
                      ...newValues,
                      pastryCost: updatePastryCost(newValues),
                    });
                  }}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  🥪 Tostado JYQ (40g+40g)
                </button>
                {(currentHamGrams > 0 ||
                  currentTyboGrams > 0 ||
                  currentCheddarGrams > 0 ||
                  currentLomitoGrams > 0 ||
                  currentSardoGrams > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      const newValues = {
                        jamonGrams: 0,
                        tyboGrams: 0,
                        cheddarGrams: 0,
                        lomitoGrams: 0,
                        sardoGrams: 0,
                      };
                      updateCurrentRecipeMultiple({
                        ...newValues,
                        pastryCost: updatePastryCost(newValues),
                      });
                    }}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    ✕ Sin relleno
                  </button>
                )}
              </div>

              {/* Fila Jamón */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 120,
                  }}
                >
                  🥓 Jamón Cocido
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.jamonGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('jamonGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ jamonGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentHamGrams * hamRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Queso Tybo */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 120,
                  }}
                >
                  🧀 Queso Tybo
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.tyboGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('tyboGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ tyboGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentTyboGrams * tyboRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Queso Cheddar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 120,
                  }}
                >
                  🧀 Queso Cheddar
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.cheddarGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('cheddarGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ cheddarGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentCheddarGrams * cheddarRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Lomito */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 120,
                  }}
                >
                  🥩 Lomito Horneado
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.lomitoGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('lomitoGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ lomitoGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentLomitoGrams * lomitoRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Queso Sardo */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 120,
                  }}
                >
                  🧀 Queso Sardo
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.sardoGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('sardoGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ sardoGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentSardoGrams * sardoRate)}
                  </RateBadge>
                </div>
              </div>
            </div>

            {/* SECCIÓN MATERIA PRIMA Y REPOSTERÍA */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  🌾 Materia Prima & Repostería
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: currentBakingCost > 0 ? '#c084fc' : '#9ca3af',
                  }}
                >
                  {currentBakingCost > 0
                    ? `+$${Math.round(currentBakingCost).toLocaleString('es-AR')} en insumos`
                    : 'Sin insumos adicionales'}
                </span>
              </div>

              {/* Presets rápidos de repostería */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const newValues = {
                      mandiocaGrams: 70,
                      eggsCount: 0.5,
                      butterGrams: 20,
                      sardoGrams: 25,
                    };
                    updateCurrentRecipeMultiple({
                      ...newValues,
                      pastryCost: updatePastryCost(newValues),
                    });
                  }}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'rgba(168, 85, 247, 0.12)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                  }}
                >
                  🧀 Masa Chipá (70g mand. + 0.5 hvo + 20g mant. + 25g sardo)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newValues = {
                      flourGrams: 45,
                      butterGrams: 25,
                      sugarGrams: 20,
                      darkChocGrams: 20,
                    };
                    updateCurrentRecipeMultiple({
                      ...newValues,
                      pastryCost: updatePastryCost(newValues),
                    });
                  }}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'rgba(217, 119, 6, 0.12)',
                    color: '#f59e0b',
                    border: '1px solid rgba(217, 119, 6, 0.25)',
                  }}
                >
                  🍪 Cookie Choc (45g har. + 25g mant. + 20g azúc. + 20g choc)
                </button>
                {(currentMandiocaGrams > 0 ||
                  currentEggsCount > 0 ||
                  currentFlourGrams > 0 ||
                  currentButterGrams > 0 ||
                  currentSugarGrams > 0 ||
                  currentSaltGrams > 0 ||
                  currentDarkChocGrams > 0 ||
                  currentWhiteChocGrams > 0 ||
                  currentMilkChocGrams > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      const newValues = {
                        mandiocaGrams: 0,
                        eggsCount: 0,
                        flourGrams: 0,
                        butterGrams: 0,
                        sugarGrams: 0,
                        saltGrams: 0,
                        darkChocGrams: 0,
                        whiteChocGrams: 0,
                        milkChocGrams: 0,
                      };
                      updateCurrentRecipeMultiple({
                        ...newValues,
                        pastryCost: updatePastryCost(newValues),
                      });
                    }}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    ✕ Limpiar repostería
                  </button>
                )}
              </div>

              {/* Fila Almidón Mandioca */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 140,
                  }}
                >
                  🌾 Almidón Mandioca
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.mandiocaGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('mandiocaGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ mandiocaGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentMandiocaGrams * mandiocaRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Huevos */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 140,
                  }}
                >
                  🥚 Huevos
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      step="0.5"
                      value={currentRecipe.eggsCount ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('eggsCount', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ eggsCount: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">u</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentEggsCount * eggRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Harina 0000 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 140,
                  }}
                >
                  🌾 Harina 0000
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.flourGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('flourGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ flourGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentFlourGrams * flourRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Manteca */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 140,
                  }}
                >
                  🧈 Manteca
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.butterGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('butterGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ butterGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentButterGrams * butterRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Azúcar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 140,
                  }}
                >
                  🍬 Azúcar Común
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.sugarGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('sugarGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ sugarGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentSugarGrams * sugarRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Sal Fina */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 140,
                  }}
                >
                  🧂 Sal Fina
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.saltGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('saltGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ saltGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentSaltGrams * saltRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Choc Negro */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 140,
                  }}
                >
                  🍫 Chocolate Negro Cobertura
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.darkChocGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('darkChocGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ darkChocGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentDarkChocGrams * darkChocRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Choc Blanco */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 140,
                  }}
                >
                  🍫 Chocolate Blanco Cobertura
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.whiteChocGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('whiteChocGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ whiteChocGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentWhiteChocGrams * whiteChocRate)}
                  </RateBadge>
                </div>
              </div>

              {/* Fila Choc c/Leche */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 140,
                  }}
                >
                  🍫 Chocolate con Leche Cobertura
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniInputNumber $width="90px">
                    <input
                      type="number"
                      value={currentRecipe.milkChocGrams ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentRecipe('milkChocGrams', val);
                        updateCurrentRecipe('pastryCost', updatePastryCost({ milkChocGrams: val }));
                      }}
                      placeholder="0"
                    />
                    <span className="unit">g</span>
                  </MiniInputNumber>
                  <RateBadge style={{ minWidth: 65, textAlign: 'right' }}>
                    ${Math.round(currentMilkChocGrams * milkChocRate)}
                  </RateBadge>
                </div>
              </div>
            </div>

            {/* Resumen total elaboración */}
            <div
              style={{
                marginTop: 4,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(76, 205, 153, 0.1)',
                border: '1px solid rgba(76, 205, 153, 0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 12, color: '#B4B6C9' }}>
                Costo Total Elaboración (
                {currentBaseBakery > 0 ? `$${currentBaseBakery} base` : 'sin base'}
                {currentDeliCost > 0 ? ` + $${Math.round(currentDeliCost)} relleno` : ''}
                {currentBakingCost > 0 ? ` + $${Math.round(currentBakingCost)} repostería` : ''}):
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#4ccd99' }}>
                ${Math.round(currentBaseBakery + currentDeliCost + currentBakingCost).toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        ) : isSmoothie ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FormGroup>
              <label>Sabor de Pulpa Base</label>
              <FlavorSelect
                value={currentRecipe.smoothieFlavor || 'promedio'}
                onChange={(e) => {
                  const fId = e.target.value;
                  updateCurrentRecipe('smoothieFlavor', fId);
                  if (fId !== 'custom') {
                    const sKey = currentVariant?.sizeKey || '12oz';
                    const basePrice = getSmoothieFlavorCost
                      ? getSmoothieFlavorCost(fId, sKey, currentRecipe.pulpaGrams)
                      : 1400;
                    updateCurrentRecipe('smoothieCost', basePrice);
                  }
                }}
                title="Seleccionar sabor de smoothie"
              >
                <option value="promedio">
                  📊 Promedio general ($
                  {Math.round(
                    getSmoothieFlavorCost
                      ? getSmoothieFlavorCost(
                          'promedio',
                          currentVariant?.sizeKey,
                          currentRecipe.pulpaGrams
                        )
                      : 1400
                  )}
                  )
                </option>
                {(config?.smoothieFlavors || DEFAULT_CONFIG.smoothieFlavors).map((f) => {
                  const sKey = currentVariant?.sizeKey || '12oz';
                  const fCost = getSmoothieFlavorCost
                    ? getSmoothieFlavorCost(f.id, sKey, currentRecipe.pulpaGrams)
                    : 1400;
                  return (
                    <option key={f.id} value={f.id}>
                      🍓 {f.name} (${Math.round(fCost).toLocaleString('es-AR')})
                    </option>
                  );
                })}
                <option value="custom">✏️ Costo manual personalizado</option>
              </FlavorSelect>
            </FormGroup>

            {currentRecipe.smoothieFlavor === 'custom' && (
              <FormGroup>
                <label>Costo Manual de Pulpa</label>
                <InputNumber>
                  <span className="prefix">$</span>
                  <input
                    type="number"
                    value={currentRecipe.smoothieCost ?? ''}
                    onChange={(e) => updateCurrentRecipe('smoothieCost', e.target.value)}
                    placeholder="1400"
                  />
                  <span className="unit">/ porción</span>
                </InputNumber>
              </FormGroup>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}
            >
              <FormGroup style={{ margin: 0 }}>
                <label style={{ fontSize: 11, color: '#f472b6', fontWeight: 700 }}>🍓 Pulpa</label>
                <InputNumber>
                  <input
                    type="number"
                    value={currentRecipe.pulpaGrams ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentRecipe('pulpaGrams', val);
                      if (
                        currentRecipe.smoothieFlavor &&
                        currentRecipe.smoothieFlavor !== 'custom'
                      ) {
                        const sKey = currentVariant?.sizeKey || '12oz';
                        const newCost = getSmoothieFlavorCost
                          ? getSmoothieFlavorCost(currentRecipe.smoothieFlavor, sKey, val)
                          : 1400;
                        updateCurrentRecipe('smoothieCost', newCost);
                      }
                    }}
                    placeholder={currentVariant?.sizeKey?.includes('16') ? '130' : '95'}
                  />
                  <span className="unit">g</span>
                </InputNumber>
              </FormGroup>

              <FormGroup style={{ margin: 0 }}>
                <label style={{ fontSize: 11, color: '#60a5fa', fontWeight: 700 }}>🧊 Hielo</label>
                <InputNumber>
                  <input
                    type="number"
                    value={currentRecipe.iceGrams ?? ''}
                    onChange={(e) => updateCurrentRecipe('iceGrams', e.target.value)}
                    placeholder={currentVariant?.sizeKey?.includes('16') ? '200' : '150'}
                  />
                  <span className="unit">g</span>
                </InputNumber>
              </FormGroup>

              <FormGroup style={{ margin: 0 }}>
                <label style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700 }}>💧 Agua</label>
                <InputNumber>
                  <input
                    type="number"
                    value={currentRecipe.waterGrams ?? ''}
                    onChange={(e) => updateCurrentRecipe('waterGrams', e.target.value)}
                    placeholder={currentVariant?.sizeKey?.includes('16') ? '170' : '125'}
                  />
                  <span className="unit">ml</span>
                </InputNumber>
              </FormGroup>
            </div>

            <div style={{ fontSize: 11, color: '#8F91A2', textAlign: 'right' }}>
              Total vaso:{' '}
              {(Number(currentRecipe.pulpaGrams) || 0) +
                (Number(currentRecipe.iceGrams) || 0) +
                (Number(currentRecipe.waterGrams) || 0)}
              g
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Fila principal: Café y Leche */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isCoffeeVisible ? '1fr 1fr' : '1fr',
                gap: 10,
              }}
            >
              {isCoffeeVisible && (
                <FormGroup>
                  <label>Café (Molienda)</label>
                  <InputNumber>
                    <input
                      type="number"
                      value={currentRecipe.coffeeGrams ?? ''}
                      onChange={(e) => updateCurrentRecipe('coffeeGrams', e.target.value)}
                      placeholder="0"
                    />
                    <span className="unit">gramos</span>
                  </InputNumber>
                </FormGroup>
              )}

              <FormGroup>
                <label>Leche</label>
                <InputNumber>
                  <input
                    type="number"
                    value={currentRecipe.milkMl ?? ''}
                    onChange={(e) => updateCurrentRecipe('milkMl', e.target.value)}
                    placeholder="0"
                  />
                  <span className="unit">ml</span>
                </InputNumber>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  <CatChip
                    type="button"
                    $active={currentRecipe.milkType === 'regular'}
                    onClick={() => updateCurrentRecipe('milkType', 'regular')}
                    style={{ flex: 1, textAlign: 'center', padding: '4px 6px', fontSize: 11 }}
                  >
                    Vaca
                  </CatChip>
                  <CatChip
                    type="button"
                    $active={currentRecipe.milkType === 'plant'}
                    onClick={() => updateCurrentRecipe('milkType', 'plant')}
                    style={{ flex: 1, textAlign: 'center', padding: '4px 6px', fontSize: 11 }}
                  >
                    Vegetal
                  </CatChip>
                  <CatChip
                    type="button"
                    $active={currentRecipe.milkType === 'none'}
                    onClick={() => updateCurrentRecipe('milkType', 'none')}
                    style={{ flex: 1, textAlign: 'center', padding: '4px 6px', fontSize: 11 }}
                  >
                    Sin Leche
                  </CatChip>
                </div>
              </FormGroup>
            </div>

            {/* Insumos adicionales activos */}
            {(isIceVisible ||
              isIceCreamVisible ||
              isWhippedCreamVisible ||
              isCocoaVisible ||
              isMatchaVisible ||
              isOreoVisible ||
              isSauceVisible ||
              isSyrupVisible) && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 10,
                }}
              >
                {isIceVisible && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <label style={{ margin: 0 }}>🧊 Hielo</label>
                      <button
                        type="button"
                        onClick={handleRemoveIce}
                        title="Quitar hielo"
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.1)',
                        }}
                      >
                        <X size={11} /> Quitar
                      </button>
                    </div>
                    <InputNumber>
                      <input
                        type="number"
                        value={currentRecipe.iceGrams ?? ''}
                        onChange={(e) => updateCurrentRecipe('iceGrams', e.target.value)}
                        placeholder="140"
                      />
                      <span className="unit">gramos</span>
                    </InputNumber>
                  </FormGroup>
                )}

                {isIceCreamVisible && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <label style={{ margin: 0 }}>🍨 Helado</label>
                      <button
                        type="button"
                        onClick={handleRemoveIceCream}
                        title="Quitar helado"
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.1)',
                        }}
                      >
                        <X size={11} /> Quitar
                      </button>
                    </div>
                    <InputNumber>
                      <input
                        type="number"
                        value={currentRecipe.iceCreamGrams ?? ''}
                        onChange={(e) => updateCurrentRecipe('iceCreamGrams', e.target.value)}
                        placeholder="120"
                      />
                      <span className="unit">gramos</span>
                    </InputNumber>
                  </FormGroup>
                )}

                {isWhippedCreamVisible && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <label style={{ margin: 0 }}>🍦 Crema Chantilly</label>
                      <button
                        type="button"
                        onClick={handleRemoveWhippedCream}
                        title="Quitar crema"
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.1)',
                        }}
                      >
                        <X size={11} /> Quitar
                      </button>
                    </div>
                    <InputNumber>
                      <input
                        type="number"
                        value={currentRecipe.whippedCreamGrams ?? ''}
                        onChange={(e) => updateCurrentRecipe('whippedCreamGrams', e.target.value)}
                        placeholder="30"
                      />
                      <span className="unit">gramos</span>
                    </InputNumber>
                  </FormGroup>
                )}

                {isCocoaVisible && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <label style={{ margin: 0 }}>🍫 Cacao</label>
                      <button
                        type="button"
                        onClick={handleRemoveCocoa}
                        title="Quitar cacao"
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.1)',
                        }}
                      >
                        <X size={11} /> Quitar
                      </button>
                    </div>
                    <InputNumber>
                      <input
                        type="number"
                        value={currentRecipe.cocoaGrams ?? ''}
                        onChange={(e) => updateCurrentRecipe('cocoaGrams', e.target.value)}
                        placeholder="20"
                      />
                      <span className="unit">gramos</span>
                    </InputNumber>
                  </FormGroup>
                )}

                {isMatchaVisible && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <label style={{ margin: 0, color: '#4ade80' }}>🍵 Té Matcha</label>
                      <button
                        type="button"
                        onClick={handleRemoveMatcha}
                        title="Quitar té matcha"
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.1)',
                        }}
                      >
                        <X size={11} /> Quitar
                      </button>
                    </div>
                    <InputNumber>
                      <input
                        type="number"
                        value={currentRecipe.matchaGrams ?? ''}
                        onChange={(e) => updateCurrentRecipe('matchaGrams', e.target.value)}
                        placeholder="3"
                      />
                      <span className="unit">gramos</span>
                    </InputNumber>
                  </FormGroup>
                )}

                {isOreoVisible && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <label style={{ margin: 0 }}>🍪 Galletitas Oreo</label>
                      <button
                        type="button"
                        onClick={handleRemoveOreo}
                        title="Quitar galletitas Oreo"
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.1)',
                        }}
                      >
                        <X size={11} /> Quitar
                      </button>
                    </div>
                    <InputNumber>
                      <input
                        type="number"
                        step={Number(currentRecipe.oreoGrams) > 0 ? '1' : '0.5'}
                        value={
                          Number(currentRecipe.oreoGrams) > 0
                            ? currentRecipe.oreoGrams ?? ''
                            : currentRecipe.oreoUnits ?? ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (Number(currentRecipe.oreoGrams) > 0) {
                            updateCurrentRecipe('oreoGrams', val);
                          } else {
                            updateCurrentRecipe('oreoUnits', val);
                          }
                        }}
                        placeholder="2"
                      />
                      <span className="unit">
                        {Number(currentRecipe.oreoGrams) > 0 ? 'gramos' : 'unidades'}
                      </span>
                    </InputNumber>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      <CatChip
                        type="button"
                        $active={
                          !Number(currentRecipe.oreoGrams) || Number(currentRecipe.oreoUnits) > 0
                        }
                        onClick={() => {
                          const g = Number(currentRecipe.oreoGrams) || 0;
                          const u = g > 0 ? Math.round((g / 11) * 2) / 2 : 2;
                          updateCurrentRecipe('oreoUnits', u);
                          updateCurrentRecipe('oreoGrams', 0);
                        }}
                        style={{ flex: 1, textAlign: 'center', padding: '2px 4px', fontSize: 10 }}
                      >
                        Unidades
                      </CatChip>
                      <CatChip
                        type="button"
                        $active={Number(currentRecipe.oreoGrams) > 0}
                        onClick={() => {
                          const u = Number(currentRecipe.oreoUnits) || 2;
                          updateCurrentRecipe('oreoGrams', Math.round(u * 11));
                          updateCurrentRecipe('oreoUnits', 0);
                        }}
                        style={{ flex: 1, textAlign: 'center', padding: '2px 4px', fontSize: 10 }}
                      >
                        Gramos (g)
                      </CatChip>
                    </div>
                  </FormGroup>
                )}

                {isSauceVisible && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <label style={{ margin: 0 }}>🍯 Salsa</label>
                      <button
                        type="button"
                        onClick={handleRemoveSauce}
                        title="Quitar salsa"
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.1)',
                        }}
                      >
                        <X size={11} /> Quitar
                      </button>
                    </div>
                    <InputNumber>
                      <input
                        type="number"
                        value={currentRecipe.sauceGrams ?? ''}
                        onChange={(e) => updateCurrentRecipe('sauceGrams', e.target.value)}
                        placeholder="15"
                      />
                      <span className="unit">g</span>
                    </InputNumber>
                    <FlavorSelect
                      style={{ marginTop: 4 }}
                      value={currentRecipe.sauceFlavor || 'chocolate'}
                      onChange={(e) => updateCurrentRecipe('sauceFlavor', e.target.value)}
                    >
                      {(config?.sauceFlavors || DEFAULT_CONFIG.sauceFlavors).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </FlavorSelect>
                  </FormGroup>
                )}

                {isSyrupVisible && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <label style={{ margin: 0 }}>🍯 Syrup</label>
                      <button
                        type="button"
                        onClick={handleRemoveSyrup}
                        title="Quitar syrup"
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.1)',
                        }}
                      >
                        <X size={11} /> Quitar
                      </button>
                    </div>
                    <InputNumber>
                      <input
                        type="number"
                        value={currentRecipe.syrupMl ?? ''}
                        onChange={(e) => updateCurrentRecipe('syrupMl', e.target.value)}
                        placeholder="15"
                      />
                      <span className="unit">ml</span>
                    </InputNumber>
                    <FlavorSelect
                      style={{ marginTop: 4 }}
                      value={currentRecipe.syrupFlavor || 'vainilla'}
                      onChange={(e) => updateCurrentRecipe('syrupFlavor', e.target.value)}
                    >
                      {(config?.syrupFlavors || DEFAULT_CONFIG.syrupFlavors).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </FlavorSelect>
                  </FormGroup>
                )}

                {isSyrup2Visible && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <label style={{ margin: 0 }}>🍯 2do Syrup</label>
                      <button
                        type="button"
                        onClick={handleRemoveSyrup2}
                        title="Quitar 2do syrup"
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.1)',
                        }}
                      >
                        <X size={11} /> Quitar
                      </button>
                    </div>
                    <InputNumber>
                      <input
                        type="number"
                        value={currentRecipe.syrup2Ml ?? ''}
                        onChange={(e) => updateCurrentRecipe('syrup2Ml', e.target.value)}
                        placeholder="10"
                      />
                      <span className="unit">ml</span>
                    </InputNumber>
                    <FlavorSelect
                      style={{ marginTop: 4 }}
                      value={currentRecipe.syrup2Flavor || 'vainilla'}
                      onChange={(e) => updateCurrentRecipe('syrup2Flavor', e.target.value)}
                    >
                      {(config?.syrupFlavors || DEFAULT_CONFIG.syrupFlavors).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </FlavorSelect>
                  </FormGroup>
                )}

                {isSyrup3Visible && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <label style={{ margin: 0 }}>🍯 3er Syrup</label>
                      <button
                        type="button"
                        onClick={handleRemoveSyrup3}
                        title="Quitar 3er syrup"
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.1)',
                        }}
                      >
                        <X size={11} /> Quitar
                      </button>
                    </div>
                    <InputNumber>
                      <input
                        type="number"
                        value={currentRecipe.syrup3Ml ?? ''}
                        onChange={(e) => updateCurrentRecipe('syrup3Ml', e.target.value)}
                        placeholder="10"
                      />
                      <span className="unit">ml</span>
                    </InputNumber>
                    <FlavorSelect
                      style={{ marginTop: 4 }}
                      value={currentRecipe.syrup3Flavor || 'syrup_1790392238949'}
                      onChange={(e) => updateCurrentRecipe('syrup3Flavor', e.target.value)}
                    >
                      {(config?.syrupFlavors || DEFAULT_CONFIG.syrupFlavors).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </FlavorSelect>
                  </FormGroup>
                )}
              </div>
            )}

            {/* Fila compacta de botones para agregar extras */}
            {(!isIceVisible ||
              !isIceCreamVisible ||
              !isWhippedCreamVisible ||
              !isCocoaVisible ||
              !isMatchaVisible ||
              !isOreoVisible ||
              !isSauceVisible ||
              !isSyrupVisible ||
              (isSyrupVisible && !isSyrup2Visible) ||
              (isSyrup2Visible && !isSyrup3Visible)) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                  paddingTop: 2,
                }}
              >
                <span style={{ fontSize: 11, color: '#8F91A2', fontWeight: 600 }}>+ Extra:</span>
                {!isIceVisible && (
                  <button
                    type="button"
                    onClick={handleAddIce}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#60a5fa',
                      background: 'rgba(96, 165, 250, 0.08)',
                      border: '1px dashed rgba(96, 165, 250, 0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    + Hielo
                  </button>
                )}
                {!isWhippedCreamVisible && (
                  <button
                    type="button"
                    onClick={handleAddWhippedCream}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#38bdf8',
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px dashed rgba(56, 189, 248, 0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    + Crema
                  </button>
                )}
                {!isIceCreamVisible && (
                  <button
                    type="button"
                    onClick={handleAddIceCream}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#ec4899',
                      background: 'rgba(236, 72, 153, 0.08)',
                      border: '1px dashed rgba(236, 72, 153, 0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    + Helado
                  </button>
                )}
                {!isCocoaVisible && (
                  <button
                    type="button"
                    onClick={handleAddCocoa}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#fb923c',
                      background: 'rgba(251, 146, 60, 0.08)',
                      border: '1px dashed rgba(251, 146, 60, 0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    + Cacao
                  </button>
                )}
                {!isOreoVisible && (
                  <button
                    type="button"
                    onClick={handleAddOreo}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#60a5fa',
                      background: 'rgba(96, 165, 250, 0.08)',
                      border: '1px dashed rgba(96, 165, 250, 0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    + Oreo
                  </button>
                )}
                {!isMatchaVisible && (
                  <button
                    type="button"
                    onClick={handleAddMatcha}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#4ade80',
                      background: 'rgba(74, 222, 128, 0.08)',
                      border: '1px dashed rgba(74, 222, 128, 0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    + Matcha
                  </button>
                )}
                {!isSauceVisible && (
                  <button
                    type="button"
                    onClick={handleAddSauce}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#eab308',
                      background: 'rgba(234, 179, 8, 0.08)',
                      border: '1px dashed rgba(234, 179, 8, 0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    + Salsa
                  </button>
                )}
                {!isSyrupVisible && (
                  <button
                    type="button"
                    onClick={handleAddSyrup}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#a78bfa',
                      background: 'rgba(167, 139, 250, 0.08)',
                      border: '1px dashed rgba(167, 139, 250, 0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    + Syrup
                  </button>
                )}
                {isSyrupVisible && !isSyrup2Visible && (
                  <button
                    type="button"
                    onClick={handleAddSyrup2}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#c084fc',
                      background: 'rgba(192, 132, 252, 0.08)',
                      border: '1px dashed rgba(192, 132, 252, 0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    + 2do Syrup
                  </button>
                )}
                {isSyrup2Visible && !isSyrup3Visible && (
                  <button
                    type="button"
                    onClick={handleAddSyrup3}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#e879f9',
                      background: 'rgba(232, 121, 249, 0.08)',
                      border: '1px dashed rgba(232, 121, 249, 0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    + 3er Syrup
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </ModalBodyScroll>

      <ModalFooter>
        <ActionButton type="button" onClick={onCancel}>
          Cancelar
        </ActionButton>
        <PrimaryButton type="submit">
          <Check size={16} /> Guardar Cambios
        </PrimaryButton>
      </ModalFooter>
    </form>
  );
}
