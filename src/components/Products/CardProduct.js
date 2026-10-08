import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import uniqid from 'uniqid';
import { createPortal } from 'react-dom';
import {
  Check,
  ChevronDown,
  Coffee,
  CupSoda,
  Flame,
  IceCreamCone,
  Minus,
  Plus,
  Snowflake,
  Sparkles,
  X,
} from 'lucide-react';

import { addToCart, decrementById, removeFromCart, setProductFlavorBreakdown } from '../../redux/cart/cartSlice';
import {
  Background,
  BodyScroll,
  BotonAgregar,
  BotonCompraLocal,
  CardProductStyled,
  ContentAclaracion,
  Field,
  FooterSticky,
  GhostPill,
  Header,
  InputDetalle,
  LabelRow,
  OptionBtn,
  OptionsGrid,
  RemoveLink,
  selectCompact,
  SelectStyles,
  Subtitle,
  Title,
  WindowProductStyled,
} from './styles/CardProductStyled';

import {
  ACCENTS,
  dubai,
  clasica,
  tortas,
  gio,
  alfajores,
  smoothies,
  cookies,
  cookiesRellenas,
  PRODUCT_OPTIONS,
  KNOWN_SPECIFIC_FLAVORS,
  GENERIC_PRODUCT_OPTION_MATCHERS,
  hasSpecificFlavorInName,
  getMatchedProductOptionKey,
} from './productOptionsConstants';
import { isExtraInStock, isCupInStock, isDrinkCold } from '../../utils/cafeStockSync';
import ProductInfoIcon from './ProductInfoIcon';

const isElectron = !!window.electron;

export default function CardProduct({
  name,
  price,
  id,
  category,
  // Props recibidas desde el padre (Products.js)
  flatOptions = [],
  groupOptions = [],
  loadingSabores = false,
  isCafeteria = false,
  cafeteriaExtras = [],
  price_8oz = 0,
  price_12oz = 0,
  price_16oz = 0,
  leche_almendras = false,
  extra_shot = false,
  crema = false,
  name_vaso = false,
  permite_frio = undefined,
  opcion_frio = undefined,
  allow_cold = undefined,
  permite_canela = undefined,
  opcion_canela = undefined,
  allow_cinnamon = undefined,
  canela_opcion = undefined,
  canela = undefined,
  options = null,
  opciones = null,
  sabores = null,
  variedades = null,
  variedad = null,
  description = '',
  descripcion = '',
  recipe8oz = '',
  recipe12oz = '',
  recipe16oz = '',
  recipes = null,
  ...restProps
}) {
  const dispatch = useDispatch();
  const cupSizesStock = useSelector((s) => s.actions?.cupSizesStock || {});
  const extrasStock = useSelector((s) => s.actions?.extrasStock || {});


  const normalizedName = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  const cleanNoSpaces = normalizedName.replace(/\s+/g, '');
  const isMilkshake =
    cleanNoSpaces.includes('milkshake') ||
    normalizedName.includes('milk shake') ||
    normalizedName.includes('shake') ||
    normalizedName.includes('batido');

  // --- Opciones/Sabores directos desde el campo JSON del producto en PocketBase ---
  const rawProductOptions =
    options ??
    opciones ??
    variedades ??
    variedad ??
    restProps?.options ??
    restProps?.opciones ??
    (category !== 'Helado' ? sabores ?? restProps?.sabores : null);

  const parsedDirectOptions = useMemo(() => {
    if (!rawProductOptions) return [];
    let raw = rawProductOptions;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        if (raw.includes('\n')) {
          return raw
            .split('\n')
            .map((s) => s.replace(/^[-*•\d.]+\s*/, '').trim())
            .filter(Boolean)
            .map((s) => ({ value: s, label: s }));
        }
        if (raw.includes(',')) {
          return raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => ({ value: s, label: s }));
        }
        if (raw.includes(';')) {
          return raw
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => ({ value: s, label: s }));
        }
        if (raw.trim()) {
          return [{ value: raw.trim(), label: raw.trim() }];
        }
        return [];
      }
    }
    if (Array.isArray(raw)) {
      return raw
        .map((item) => {
          if (!item) return null;
          if (typeof item === 'string') return { value: item.trim(), label: item.trim() };
          if (typeof item === 'object') {
            const val =
              item.value ??
              item.label ??
              item.name ??
              item.nombre ??
              item.sabor ??
              item.variedad ??
              item.title ??
              '';
            return val ? { value: String(val).trim(), label: String(val).trim() } : null;
          }
          return { value: String(item).trim(), label: String(item).trim() };
        })
        .filter(Boolean);
    }
    if (typeof raw === 'object' && raw !== null) {
      const list = Array.isArray(raw.options)
        ? raw.options
        : Array.isArray(raw.sabores)
          ? raw.sabores
          : Array.isArray(raw.opciones)
            ? raw.opciones
            : Array.isArray(raw.variedades)
              ? raw.variedades
              : Array.isArray(raw.items)
                ? raw.items
                : Object.values(raw);
      if (Array.isArray(list)) {
        return list
          .map((item) => {
            if (!item) return null;
            if (typeof item === 'string') return { value: item.trim(), label: item.trim() };
            if (typeof item === 'object') {
              const val =
                item.value ??
                item.label ??
                item.name ??
                item.nombre ??
                item.sabor ??
                item.variedad ??
                item.title ??
                '';
              return val ? { value: String(val).trim(), label: String(val).trim() } : null;
            }
            return { value: String(item).trim(), label: String(item).trim() };
          })
          .filter(Boolean);
      }
    }
    return [];
  }, [rawProductOptions]);

  const isPasteleriaCategory =
    category?.toLowerCase() === 'pasteleria' ||
    category?.toLowerCase() === 'pastelería';

  const isPasteleriaName =
    normalizedName.includes('cookie') ||
    normalizedName.includes('torta') ||
    normalizedName.includes('alfajor') ||
    normalizedName.includes('muffin') ||
    normalizedName.includes('budin') ||
    normalizedName.includes('croissant') ||
    normalizedName.includes('medialuna') ||
    normalizedName.includes('pote gio') ||
    normalizedName.includes('smoothie');

  const isPasteleriaOrFood = isPasteleriaCategory || isPasteleriaName;

  // --- Opciones unificadas para productos de Cafetería ---
  const cafeteriaProductOptions = useMemo(() => {
    // 1. Opciones directas desde PocketBase (campo JSON options / opciones)
    if (parsedDirectOptions.length > 0) {
      return parsedDirectOptions;
    }

    // Bebidas en general (chocolate caliente, cafés, té, milkshake, etc.) NO deben mostrar sabores de helado
    if (!isPasteleriaOrFood || isMilkshake) {
      return [];
    }

    // Si el nombre ya contiene un sabor específico (ej: "Cookie Kinder", "Cookie Marroc"), NO usar opciones genéricas
    if (hasSpecificFlavorInName(normalizedName)) {
      return [];
    }

    // 3. Fallback desde PRODUCT_OPTIONS estático (solo para productos genéricos: "cookie", "cookie rellena", etc.)
    const matchedKey = getMatchedProductOptionKey(normalizedName);

    if (matchedKey && PRODUCT_OPTIONS[matchedKey]?.length > 0) {
      return PRODUCT_OPTIONS[matchedKey].map((opt) => ({ value: opt, label: opt }));
    }

    // 4. Buscar coincidencia en la colección sabores de PB solo si el producto es genérico
    if (groupOptions.length > 0) {
      const match = groupOptions.find((g) => {
        const groupLabel = (g.label || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();
        const groupLabelClean = groupLabel.replace(/\s+/g, '');
        return (
          (groupLabelClean.includes('cookie') ||
            groupLabelClean.includes('torta') ||
            groupLabelClean.includes('alfajor') ||
            groupLabelClean.includes('pasteleria')) &&
          (normalizedName === groupLabel ||
            cleanNoSpaces === groupLabelClean ||
            (matchedKey && groupLabelClean === matchedKey.replace(/\s+/g, '')))
        );
      });
      if (match && match.options?.length > 0) {
        return match.options;
      }
    }

    return [];
  }, [
    parsedDirectOptions,
    isMilkshake,
    isPasteleriaOrFood,
    groupOptions,
    normalizedName,
    cleanNoSpaces,
  ]);

  // Opciones de sabores de helado para milkshake y productos con helado
  const iceCreamFlavorOptions = useMemo(() => {
    const list = groupOptions.length > 0 ? groupOptions : flatOptions;
    if (Array.isArray(list)) {
      return list.map((item) => {
        if (item && Array.isArray(item.options)) {
          return {
            ...item,
            options: [...item.options].sort((a, b) =>
              (a.label || a.value || '').localeCompare(b.label || b.value || '', 'es', {
                sensitivity: 'base',
              })
            ),
          };
        }
        return item;
      });
    }
    return [];
  }, [groupOptions, flatOptions]);

  // --- Estados de selección ---
  const [open, setOpen] = useState(false);
  const [selectedTemperature, setSelectedTemperature] = useState('Caliente');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedExtraIds, setSelectedExtraIds] = useState([]);
  const [isExtrasExpanded, setIsExtrasExpanded] = useState(false);
  const [selectedVariety, setSelectedVariety] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [withCinnamon, setWithCinnamon] = useState(false);
  const [vasoName, setVasoName] = useState('');
  const [hasNote, setHasNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isHoveredSubmit, setIsHoveredSubmit] = useState(false);
  const { cartItems } = useSelector((state) => state.cart);
  const [flavorCounts, setFlavorCounts] = useState({});

  const handleFlavorClick = (label) => {
    const nextCounts = {
      ...flavorCounts,
      [label]: (flavorCounts[label] || 0) + 1,
    };
    setFlavorCounts(nextCounts);

    const totalQty = Object.values(nextCounts).reduce((acc, c) => acc + c, 0);
    const activeFlavors = Object.entries(nextCounts).filter(([_, c]) => c > 0);
    const saboresArray =
      activeFlavors.length === 1
        ? [activeFlavors[0][0]]
        : activeFlavors.map(([lbl, c]) => (c > 1 ? `${c}x ${lbl}` : lbl));

    const finalNote = hasNote && noteText.trim() ? noteText.trim() : '';

    dispatch(
      setProductFlavorBreakdown({
        id: id,
        name: name,
        price: basePrice || price || 0,
        category: category || 'Cafetería',
        isCafeteria: Boolean(
          isCafeteria ||
          category === 'clasico' ||
          category === 'frio' ||
          category === 'cold' ||
          category === 'frappe' ||
          category === 'smoothie' ||
          category === 'pasteleria' ||
          category === 'Cafetería' ||
          category === 'cafeteria'
        ),
        quantity: totalQty,
        sabores: saboresArray,
        saboresBreakdown: nextCounts,
        ...(finalNote ? { note: finalNote, listdetalle: finalNote } : {}),
      })
    );
  };

  const handleFlavorDecrement = (e, label) => {
    e.stopPropagation();
    const current = flavorCounts[label] || 0;
    const nextCounts = { ...flavorCounts };
    if (current <= 1) {
      delete nextCounts[label];
    } else {
      nextCounts[label] = current - 1;
    }
    setFlavorCounts(nextCounts);

    const totalQty = Object.values(nextCounts).reduce((acc, c) => acc + c, 0);
    const activeFlavors = Object.entries(nextCounts).filter(([_, c]) => c > 0);
    const saboresArray =
      activeFlavors.length === 1
        ? [activeFlavors[0][0]]
        : activeFlavors.map(([lbl, c]) => (c > 1 ? `${c}x ${lbl}` : lbl));

    const finalNote = hasNote && noteText.trim() ? noteText.trim() : '';

    dispatch(
      setProductFlavorBreakdown({
        id: id,
        name: name,
        price: basePrice || price || 0,
        category: category || 'Cafetería',
        isCafeteria: Boolean(
          isCafeteria ||
          category === 'clasico' ||
          category === 'frio' ||
          category === 'cold' ||
          category === 'frappe' ||
          category === 'smoothie' ||
          category === 'pasteleria' ||
          category === 'Cafetería' ||
          category === 'cafeteria'
        ),
        quantity: totalQty,
        sabores: saboresArray,
        saboresBreakdown: nextCounts,
        ...(finalNote ? { note: finalNote, listdetalle: finalNote } : {}),
      })
    );
  };

  const totalAddedInModal = useMemo(() => {
    return Object.values(flavorCounts).reduce((acc, count) => acc + count, 0);
  }, [flavorCounts]);

  const isCappuccino = useMemo(() => {
    return normalizedName.includes('cappuccino') || normalizedName.includes('capuchino');
  }, [normalizedName]);

  // Detección de bebidas que admiten canela (Cappuccino, Latte, Mocca, etc. o configurado en PocketBase)
  const supportsCinnamonOption = useMemo(() => {
    const explicitCinnamon =
      permite_canela ??
      opcion_canela ??
      allow_cinnamon ??
      canela_opcion ??
      canela ??
      restProps?.permite_canela ??
      restProps?.opcion_canela ??
      restProps?.allow_cinnamon ??
      restProps?.canela_opcion ??
      restProps?.canela;

    if (explicitCinnamon === false) return false;
    if (explicitCinnamon === true) return true;

    if (
      isPasteleriaOrFood ||
      category === 'extra' ||
      category === 'Pastelería' ||
      category === 'pasteleria' ||
      category === 'Helado' ||
      category === 'Paletas'
    ) {
      return false;
    }

    const isCinnamonEligible =
      normalizedName.includes('cappuccino') ||
      normalizedName.includes('capuchino') ||
      normalizedName.includes('latte') ||
      normalizedName.includes('flat white') ||
      normalizedName.includes('mocca') ||
      normalizedName.includes('mocha') ||
      normalizedName.includes('macchiato') ||
      normalizedName.includes('chocolate caliente') ||
      normalizedName.includes('submarino');

    return Boolean(isCinnamonEligible);
  }, [
    permite_canela,
    opcion_canela,
    allow_cinnamon,
    canela_opcion,
    canela,
    restProps,
    isPasteleriaOrFood,
    category,
    normalizedName,
  ]);

  // Filtrar los extras disponibles según los booleanos configurados en el producto (PocketBase)
  const isExtraAllowed = useCallback(
    (extra) => {
      const norm = (extra?.name || extra?.title || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

      // Leche de Almendras
      if (norm.includes('almendra')) {
        return Boolean(leche_almendras);
      }
      // Extra Shot
      if (norm.includes('shot')) {
        return Boolean(extra_shot);
      }
      // Crema
      if (norm.includes('crema')) {
        return Boolean(crema);
      }
      // Canela (si es Cappuccino, ya cuenta con el toggle booleano superior, no duplicar en extras)
      if (norm.includes('canela') && isCappuccino) {
        return false;
      }

      return true;
    },
    [leche_almendras, extra_shot, crema, isCappuccino]
  );

  const allowedCafeteriaExtras = useMemo(() => {
    const list = cafeteriaExtras
      .filter(isExtraAllowed)
      .map((extra) => {
        const norm = (extra?.name || extra?.title || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();
        // Si es canela en otra bebida, asegurar que sea sin costo (price_extra: 0)
        if (norm.includes('canela')) {
          return {
            ...extra,
            price_extra: 0,
            inStock: isExtraInStock(extra, extrasStock),
          };
        }
        return {
          ...extra,
          inStock: isExtraInStock(extra, extrasStock),
        };
      });

    // Si NO es Cappuccino y es bebida de cafetería, asegurar que "Canela" esté como opción sin costo
    if (!isCappuccino && !isPasteleriaOrFood && category !== 'extra') {
      const hasCinnamonAlready = list.some((e) => {
        const norm = (e?.name || e?.title || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        return norm.includes('canela');
      });

      if (!hasCinnamonAlready) {
        list.push({
          id: 'extra-canela-free',
          name: 'Canela',
          price_extra: 0,
          inStock: true,
        });
      }
    }

    return list;
  }, [cafeteriaExtras, isExtraAllowed, extrasStock, isCappuccino, isPasteleriaOrFood, category]);

  const isInherentlyCold = useMemo(() => {
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
      nameNorm.includes('smoothie') ||
      nameNorm.includes('milkshake') ||
      nameNorm.includes('shake') ||
      nameNorm.includes('batido')
    );
  }, [category, name]);

  // Detectar si el producto pertenece a cafetería (por prop, categoría o atributos de café)
  const isCafeItem = Boolean(
    isMilkshake ||
    isCafeteria ||
    category === 'clasico' ||
    category === 'frappe' ||
    category === 'frio' ||
    category === 'pasteleria' ||
    category === 'extra' ||
    category === 'Cafetería' ||
    category === 'cafeteria' ||
    Number(price_8oz) > 0 ||
    Number(price_12oz) > 0 ||
    Number(price_16oz) > 0 ||
    normalizedName.includes('latte') ||
    normalizedName.includes('mocca') ||
    normalizedName.includes('cappuccino') ||
    normalizedName.includes('americano') ||
    normalizedName.includes('macchiato') ||
    normalizedName.includes('espresso') ||
    normalizedName.includes('flat white')
  );

  const isCafeteriaProduct = Boolean(isCafeteria || isCafeItem);

  const productInfoData = useMemo(
    () => ({
      name,
      category,
      isCafeteria: isCafeteriaProduct,
      description: description || restProps.description || '',
      descripcion: descripcion || restProps.descripcion || '',
      recipes: recipes || restProps.recipes || null,
      recipe8oz: recipe8oz || restProps.recipe8oz || '',
      recipe12oz: recipe12oz || restProps.recipe12oz || '',
      recipe16oz: recipe16oz || restProps.recipe16oz || '',
    }),
    [name, category, isCafeteriaProduct, description, descripcion, recipes, recipe8oz, recipe12oz, recipe16oz, restProps]
  );

  // Si es una bebida de cafetería y no es ya frappé/milkshake/pastelería,
  // permite elegir entre Caliente y Frío (Latte, Mocca, Mocca Blanco, Caramel Macchiato, Americano, Cappuccino, etc.)
  // Respeta el booleano configurado en PocketBase (permite_frio, opcion_frio, allow_cold)
  const supportsTemperatureOption = useMemo(() => {
    // 1. Si explícitamente se configuró en PocketBase que NO permite frío:
    const explicitColdConfig =
      permite_frio ??
      opcion_frio ??
      allow_cold ??
      restProps?.permite_frio ??
      restProps?.opcion_frio ??
      restProps?.allow_cold;

    if (explicitColdConfig === false) return false;

    // 2. Si ya es intrínsecamente fría (frappé, milkshake, smoothie), pastelería o extra:
    if (isInherentlyCold || isPasteleriaOrFood || category === 'extra') return false;

    // 3. Si explícitamente se configuró que SÍ permite frío:
    if (explicitColdConfig === true) return true;

    // 4. Bebidas que por su naturaleza tradicional son exclusivamente calientes:
    const isHotOnlyDrink =
      normalizedName === 'espresso' ||
      normalizedName.startsWith('espresso ') ||
      normalizedName === 'flat white' ||
      normalizedName.includes('chocolate caliente');

    if (isHotOnlyDrink) return false;

    // 5. Bebidas de café clásicas que admiten versión fría (Latte, Mocca, Caramel Macchiato, Americano, Cappuccino, etc.)
    const isCoffeeBeverage =
      category === 'clasico' ||
      category === 'cafeteria' ||
      category === 'Cafetería' ||
      isCafeteria ||
      Number(price_8oz) > 0 ||
      Number(price_12oz) > 0 ||
      Number(price_16oz) > 0 ||
      normalizedName.includes('latte') ||
      normalizedName.includes('mocca') ||
      normalizedName.includes('cappuccino') ||
      normalizedName.includes('americano') ||
      normalizedName.includes('macchiato');

    return Boolean(isCoffeeBeverage);
  }, [
    permite_frio,
    opcion_frio,
    allow_cold,
    restProps,
    isInherentlyCold,
    isPasteleriaOrFood,
    category,
    isCafeteria,
    price_8oz,
    price_12oz,
    price_16oz,
    normalizedName,
  ]);

  const isColdDrink = useMemo(() => {
    if (isInherentlyCold) return true;
    if (supportsTemperatureOption) {
      return selectedTemperature === 'Frío';
    }
    return isDrinkCold({ category, name });
  }, [isInherentlyCold, supportsTemperatureOption, selectedTemperature, category, name]);

  const handleTemperatureChange = (temp) => {
    setSelectedTemperature(temp);
    if (selectedSize) {
      const willBeCold = temp === 'Frío';
      const isSizeStillInStock = isCupInStock(selectedSize, willBeCold, cupSizesStock);
      if (!isSizeStillInStock) {
        setSelectedSize('');
      }
    }
  };

  const allConfiguredSizes = useMemo(() => {
    const list = [];
    const p8 = Number(price_8oz);
    const p12 = Number(price_12oz);
    const p16 = Number(price_16oz);

    if (!isNaN(p8) && p8 > 0) {
      list.push({
        size: '8oz',
        label: 'Mini (8oz)',
        name: 'Mini',
        oz: '8 oz',
        price: p8,
        inStock: isCupInStock('8oz', isColdDrink, cupSizesStock),
      });
    }
    if (!isNaN(p12) && p12 > 0) {
      list.push({
        size: '12oz',
        label: 'Plus (12oz)',
        name: 'Plus',
        oz: '12 oz',
        price: p12,
        inStock: isCupInStock('12oz', isColdDrink, cupSizesStock),
      });
    }
    if (!isNaN(p16) && p16 > 0) {
      list.push({
        size: '16oz',
        label: 'Ultra (16oz)',
        name: 'Ultra',
        oz: '16 oz',
        price: p16,
        inStock: isCupInStock('16oz', isColdDrink, cupSizesStock),
      });
    }
    return list;
  }, [price_8oz, price_12oz, price_16oz, cupSizesStock, isColdDrink]);

  const availableSizes = useMemo(() => {
    return allConfiguredSizes.filter((sz) => sz.inStock);
  }, [allConfiguredSizes]);

  const hasConfiguredSizes = allConfiguredSizes.length > 0;
  const isOutOfCupStock = isCafeteria && hasConfiguredSizes && availableSizes.length === 0;

  // Auto-seleccionar tamaño cuando solo hay 1 medida con stock disponible
  useEffect(() => {
    if (open && availableSizes.length === 1 && !selectedSize) {
      setSelectedSize(availableSizes[0].size);
    }
  }, [open, availableSizes, selectedSize]);

  // Si un extra seleccionado se queda sin stock, quitarlo de la selección
  useEffect(() => {
    setSelectedExtraIds((prev) =>
      prev.filter((id) => {
        const extra = allowedCafeteriaExtras.find((e) => e.id === id);
        return extra ? extra.inStock : true;
      })
    );
  }, [allowedCafeteriaExtras]);

  // Validaciones de selección obligatoria
  const isSizeRequired = allConfiguredSizes.length > 0;
  const isSizeValid =
    !isSizeRequired ||
    (Boolean(selectedSize) && availableSizes.some((sz) => sz.size === selectedSize)) ||
    (availableSizes.length === 1 && !selectedSize);

  const isVarietyRequired = cafeteriaProductOptions.length > 0;
  const isVarietyValid = !isVarietyRequired || Boolean(selectedVariety);

  const isCafeteriaValid = !isOutOfCupStock && isSizeValid && isVarietyValid;

  const basePrice = useMemo(() => {
    if (availableSizes.length > 1) {
      const selectedSizeObj = availableSizes.find((sz) => sz.size === selectedSize);
      return selectedSizeObj ? selectedSizeObj.price : availableSizes[0]?.price || 0;
    }
    if (availableSizes.length === 1) {
      return availableSizes[0].price;
    }
    return price || 0;
  }, [availableSizes, selectedSize, price]);

  // Suma total de los adicionales seleccionados (usando el campo price_extra plano de cada registro extra)
  const extrasPriceTotal = useMemo(() => {
    let tot = 0;
    for (const extraId of selectedExtraIds) {
      const extra = allowedCafeteriaExtras.find((e) => e.id === extraId);
      if (extra && extra.inStock) {
        tot += Number(extra.price_extra || 0);
      }
    }
    return tot;
  }, [selectedExtraIds, allowedCafeteriaExtras]);

  const totalPrice = useMemo(() => {
    return basePrice + extrasPriceTotal;
  }, [basePrice, extrasPriceTotal]);

  const toggleExtra = (extraId) => {
    const extra = allowedCafeteriaExtras.find((e) => e.id === extraId);
    if (extra && !extra.inStock) return;
    setSelectedExtraIds((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    );
  };

  const handleCafeteriaSubmit = () => {
    if (!isCafeteriaValid) return;

    const selectedSizeObj =
      availableSizes.length > 1
        ? availableSizes.find((sz) => sz.size === selectedSize)
        : availableSizes.length === 1
          ? availableSizes[0]
          : null;

    const extrasList = [];
    for (const extraId of selectedExtraIds) {
      const extra = allowedCafeteriaExtras.find((e) => e.id === extraId);
      if (extra) {
        const extraPrice = Number(extra.price_extra || 0);
        if (extraPrice > 0) {
          extrasList.push(`${extra.name} (+$${extraPrice})`);
        } else {
          extrasList.push(extra.name);
        }
      }
    }
    if (isCappuccino && withCinnamon && !extrasList.some((e) => /canela/i.test(e))) {
      extrasList.push('Canela');
    }

    const hasCinnamonSelected =
      (isCappuccino && withCinnamon) ||
      extrasList.some((e) => /canela/i.test(e));

    const flavorLabel =
      selectedFlavor?.label ||
      selectedFlavor?.value ||
      (typeof selectedFlavor === 'string' ? selectedFlavor : '');

    const finalSabores = flavorLabel ? [flavorLabel] : selectedVariety ? [selectedVariety] : [];

    const isFrio = supportsTemperatureOption && selectedTemperature === 'Frío';
    const finalProductName = isFrio ? `${name} (Frío)` : name;
    const finalSizeLabel = selectedSizeObj
      ? isFrio
        ? `${selectedSizeObj.label} · Frío`
        : selectedSizeObj.label
      : isFrio
        ? 'Frío'
        : '';

    const detailParts = [];
    if (flavorLabel) detailParts.push(`Sabor: ${flavorLabel}`);
    if (hasNote && noteText.trim()) detailParts.push(noteText.trim());

    const isCafItem = Boolean(
      isCafeteria ||
      category === 'clasico' ||
      category === 'frio' ||
      category === 'cold' ||
      category === 'frappe' ||
      category === 'smoothie' ||
      category === 'pasteleria' ||
      category === 'Cafetería' ||
      category === 'cafeteria'
    );

    dispatch(
      addToCart({
        id: uniqid(),
        name: finalProductName,
        price: totalPrice,
        category: category || 'Cafetería',
        size: finalSizeLabel,
        temperature: isFrio ? 'Frío' : 'Caliente',
        isCold: isFrio || isInherentlyCold,
        extras: extrasList,
        canela: hasCinnamonSelected,
        withCinnamon: hasCinnamonSelected,
        vaso: vasoName.trim(),
        sabores: finalSabores,
        isCafeteria: isCafItem,
        ...(detailParts.length > 0 ? { listdetalle: detailParts.join(' · ') } : {}),
        ...(hasNote && noteText.trim() ? { note: noteText.trim() } : {}),
      })
    );

    // Reset options
    setSelectedSize('');
    setSelectedTemperature('Caliente');
    setSelectedVariety('');
    setSelectedFlavor(null);
    setSelectedExtraIds([]);
    setWithCinnamon(false);
    setIsExtrasExpanded(false);
    setVasoName('');
    setHasNote(false);
    setNoteText('');
    setOpen(false);
  };

  const handleDirectAdd = () => {
    const finalPrice = availableSizes.length > 0 ? availableSizes[0].price : price || 0;
    const sizeLabel = availableSizes.length === 1 ? availableSizes[0].label : '';
    const isCafItem = Boolean(
      isCafeteria ||
      category === 'clasico' ||
      category === 'frio' ||
      category === 'cold' ||
      category === 'frappe' ||
      category === 'smoothie' ||
      category === 'pasteleria' ||
      category === 'Cafetería' ||
      category === 'cafeteria'
    );
    dispatch(
      addToCart({
        id: uniqid(),
        name: name, // nombre limpio
        price: finalPrice,
        category: category || 'Cafetería',
        size: sizeLabel,
        extras: [],
        vaso: '',
        isCafeteria: isCafItem,
      })
    );
  };

  // --- Apertura/cierre del modal ---
  useEffect(() => {
    // aplica en <html> y <body> por compatibilidad
    document.body.classList.toggle('modal-open', open);

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [open]);

  // Máximo de sabores por producto (1kg -> 4, 1/2kg -> 3, 1/4kg -> 3, etc.)
  const maxSabores = useMemo(() => {
    const nm = (normalizedName || '').replace(/\s+/g, '');
    if (nm.includes('1kg') || nm.includes('1kilo')) return 4;
    if (nm.includes('1/2') || nm.includes('medio')) return 3;
    if (nm.includes('1/4') || nm.includes('cuarto')) return 3;
    if (nm.includes('cucurucho') || nm.includes('vasito') || nm.includes('cono')) return 2;
    return 3;
  }, [normalizedName]);

  const isPaleta = category === 'Paletas';
  const hasSpecificFlavor = hasSpecificFlavorInName(normalizedName);

  const isPaletaDubai =
    (isPaleta || normalizedName.includes('paleta')) &&
    /dubai/i.test(normalizedName) &&
    !hasSpecificFlavor;

  const isPaletaClasica =
    (isPaleta || normalizedName.includes('paleta')) &&
    /(clasica|clásica)/i.test(normalizedName) &&
    !hasSpecificFlavor;

  const isPaletaGeneric = isPaleta && !hasSpecificFlavor;

  const productWithOptionsKey = getMatchedProductOptionKey(normalizedName);
  const hasCustomOptions = Boolean(productWithOptionsKey);

  const isSingleFlavorSelect =
    isPaletaGeneric ||
    isPaletaDubai ||
    isPaletaClasica ||
    parsedDirectOptions.length > 0 ||
    hasCustomOptions ||
    cafeteriaProductOptions.length > 0;

  const getOptions = () => {
    let result = [];

    // 1. Opciones directas desde el registro del producto en PocketBase (campo JSON options)
    if (parsedDirectOptions.length > 0) {
      result = parsedDirectOptions;
    } else {
      if (isPaletaDubai) {
        result = dubai.map((s) => ({ value: s, label: s }));
      } else if (isPaletaClasica) {
        result = clasica.map((s) => ({ value: s, label: s }));
      } else if (hasCustomOptions && PRODUCT_OPTIONS[productWithOptionsKey]) {
        result = PRODUCT_OPTIONS[productWithOptionsKey].map((o) => ({
          value: o,
          label: o,
        }));
      } else if (cafeteriaProductOptions.length > 0) {
        result = cafeteriaProductOptions;
      } else {
        result = groupOptions.length > 0 ? groupOptions : flatOptions;
      }
    }

    // Ordenar alfabéticamente respetando y manteniendo las categorías
    if (Array.isArray(result)) {
      return result.map((item) => {
        if (item && Array.isArray(item.options)) {
          return {
            ...item,
            options: [...item.options].sort((a, b) =>
              (a.label || a.value || '').localeCompare(b.label || b.value || '', 'es', {
                sensitivity: 'base',
              })
            ),
          };
        }
        return item;
      });
    }

    return result;
  };

  // --- Form ---
  const { control, register, handleSubmit, setError, clearErrors, watch, reset } = useForm({
    defaultValues: {
      sabores: [{ value: '' }], // siempre al menos 1
      detalle: '',
      usarDetalle: false,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'sabores',
  });

  const watchedSabores = watch('sabores');

  // Al abrir, reseteo a 1 sabor y sincronizo contadores con el carrito
  const openModal = () => {
    replace([{ value: '' }]);
    const existingInCart = cartItems.find((it) => it.id === id);
    if (existingInCart?.saboresBreakdown) {
      setFlavorCounts(existingInCart.saboresBreakdown);
    } else {
      setFlavorCounts({});
    }
    setHasNote(Boolean(existingInCart?.note || existingInCart?.listdetalle));
    setNoteText(existingInCart?.note || existingInCart?.listdetalle || '');
    reset((curr) => ({ ...curr, usarDetalle: false, detalle: '' }));
    setSelectedTemperature('Caliente');
    setIsExtrasExpanded(false);
    setOpen(true);
  };

  const isHeladoProduct =
    !isMilkshake &&
    (category === 'Helado' ||
      normalizedName.includes('1/4') ||
      normalizedName.includes('1/2') ||
      normalizedName.includes('1 kg') ||
      normalizedName.includes('1kg'));

  const selectedFlavorsCount = (watchedSabores || [])
    .map((s) => (typeof s === 'string' ? s : s?.value || s?.label))
    .filter((s) => typeof s === 'string' && s.trim().length > 0).length;
  const hasNoFlavorsSelected = selectedFlavorsCount === 0;
  const isOmitirHeladoHovered = isHeladoProduct && hasNoFlavorsSelected && isHoveredSubmit;

  const closeModal = () => {
    setFlavorCounts({});
    setSelectedFlavor(null);
    setHasNote(false);
    setNoteText('');
    setIsHoveredSubmit(false);
    setIsExtrasExpanded(false);
    setOpen(false);
  };

  // Evito duplicados y vacíos (permitiendo omitir sabores en helados)
  const onSubmit = ({ sabores, usarDetalle, detalle }) => {
    const lista = (sabores || [])
      .map((s) => (typeof s === 'string' ? s : s?.value || s?.label))
      .filter((s) => typeof s === 'string' && s.trim().length > 0);

    if (!lista.length) {
      if (isHeladoProduct) {
        // Omitir sabores permitido para helados (1/4, 1/2, 1kg)
        const uid = uniqid();
        const finalNote = (hasNote && noteText.trim()) || (usarDetalle ? detalle?.trim() : '');
        const payload = finalNote
          ? { name, id: uid, price, sabores: [], category, note: finalNote, listdetalle: finalNote }
          : { name, id: uid, price, sabores: [], category };

        dispatch(addToCart(payload));
        setHasNote(false);
        setNoteText('');
        closeModal();
        return;
      }

      setError('sabores.0', { type: 'required', message: 'Elegí un sabor' });
      return;
    }

    // duplicados
    const set = new Set(lista.map((x) => x.trim().toLowerCase()));
    if (set.size !== lista.length) {
      setError('sabores', { type: 'validate', message: 'No repitas sabores' });
      return;
    }

    const uid = uniqid();
    const finalNote = (hasNote && noteText.trim()) || (usarDetalle ? detalle?.trim() : '');
    const payload = finalNote
      ? { name, id: uid, price, sabores: lista, category, note: finalNote, listdetalle: finalNote }
      : { name, id: uid, price, sabores: lista, category };

    dispatch(addToCart(payload));
    setHasNote(false);
    setNoteText('');
    closeModal();
  };

  // Añadir/quitar sabor
  const addSabor = () => {
    if (fields.length < maxSabores) {
      append({ value: '' });
      clearErrors('sabores');
    }
  };

  const selectStylesFix = useMemo(
    () => ({
      ...selectCompact,
      control: (base, state) => ({
        ...base,
        background: '#fff',
        borderColor: state.isFocused ? '#111' : '#e6e6ee',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(0,0,0,.08)' : 'none',
        minHeight: 36,
        height: 36,
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
      }),
      singleValue: (base) => ({
        ...base,
        color: '#111', // ← texto seleccionado visible
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
      }),
      input: (base) => ({
        ...base,
        color: '#111',
        fontFamily: 'Inter, sans-serif', // ← caret / texto al tipear
      }),
      placeholder: (base) => ({
        ...base,
        color: '#9aa3b2', // ← placeholder gris legible
        fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
      }),
      option: (base, state) => ({
        ...base,
        color: '#111',
        background: state.isFocused ? '#eef2ff' : '#fff',
        fontFamily: 'Inter, sans-serif', // hover suave
      }),
      menu: (base) => ({
        ...base,
        zIndex: 9999,
        fontFamily: 'Inter, sans-serif', // evita quedar tapado
      }),
    }),
    []
  );

  const hasFlavors = flatOptions.length > 0 || groupOptions.length > 0;

  const shouldOpenModal =
    isMilkshake ||
    isHeladoProduct ||
    isPaletaGeneric ||
    isPaletaDubai ||
    isPaletaClasica ||
    parsedDirectOptions.length > 0 ||
    cafeteriaProductOptions.length > 0;

  const isSimplePasteleriaWithFlavors =
    isPasteleriaOrFood &&
    availableSizes.length <= 1 &&
    allowedCafeteriaExtras.length === 0 &&
    !isMilkshake &&
    cafeteriaProductOptions.length > 0;

  if ((isCafeteria || isCafeItem) && !isSimplePasteleriaWithFlavors) {
    const needsModal =
      isOutOfCupStock ||
      allConfiguredSizes.length > 0 ||
      supportsTemperatureOption ||
      supportsCinnamonOption ||
      isMilkshake ||
      cafeteriaProductOptions.length > 0 ||
      parsedDirectOptions.length > 0 ||
      allowedCafeteriaExtras.length > 0 ||
      Boolean(name_vaso);
    const singlePrice = availableSizes.length > 0 ? availableSizes[0].price : price || 0;

    return (
      <>
        <CardProductStyled
          $accent="#4d0012"
          onClick={() => {
            if (isOutOfCupStock) {
              setWithCinnamon(isCappuccino);
              setOpen(true);
              return;
            }
            if (needsModal) {
              setSelectedSize('');
              setSelectedVariety('');
              setSelectedFlavor(null);
              setSelectedExtraIds([]);
              setWithCinnamon(isCappuccino);
              setVasoName('');
              setHasNote(false);
              setNoteText('');
              setOpen(true);
            } else {
              handleDirectAdd();
            }
          }}
          style={{
            opacity: isOutOfCupStock ? 0.65 : 1,
            position: 'relative',
          }}
          $isElectron={isElectron}
        >
          <div className="left">
            <span className="name">{name}</span>
            <ProductInfoIcon product={productInfoData} size="small" />
            {isOutOfCupStock && (
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  fontWeight: 800,
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fca5a5',
                  padding: '1px 5px',
                  borderRadius: 5,
                  marginTop: 3,
                  width: 'fit-content',
                }}
              >
                Sin vasos
              </span>
            )}
          </div>
        </CardProductStyled>

        {open &&
          createPortal(
            <>
              <Background
                onClick={() => {
                  setSelectedSize('');
                  setSelectedVariety('');
                  setSelectedFlavor(null);
                  setSelectedExtraIds([]);
                  setWithCinnamon(false);
                  setIsExtrasExpanded(false);
                  setVasoName('');
                  setHasNote(false);
                  setNoteText('');
                  setOpen(false);
                }}
              />
              <WindowProductStyled
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCafeteriaSubmit();
                }}
              >
                <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: '1 1 auto', gap: 6 }}>
                    <a
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#1e1e2d',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word',
                      }}
                    >
                      {name}
                    </a>
                    <ProductInfoIcon product={productInfoData} selectedSize={selectedSize} size="normal" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {/* Switch Boolean Caliente / Frío (más grande) */}
                    {supportsTemperatureOption && (
                      <div
                        onClick={() => handleTemperatureChange(selectedTemperature === 'Frío' ? 'Caliente' : 'Frío')}
                        title={`Cambiar a ${selectedTemperature === 'Frío' ? 'Caliente' : 'Frío'}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: selectedTemperature === 'Frío' ? '#e0f2fe' : '#fef2f2',
                          border: `2px solid ${selectedTemperature === 'Frío' ? '#0284c7' : '#991b1b'}`,
                          padding: '3px 8px 3px 10px',
                          borderRadius: 22,
                          cursor: 'pointer',
                          userSelect: 'none',
                          boxShadow: selectedTemperature === 'Frío'
                            ? '0 2px 8px rgba(2,132,199,0.22)'
                            : '0 2px 8px rgba(153,27,27,0.22)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 800,
                            color: selectedTemperature === 'Frío' ? '#0284c7' : '#991b1b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          {selectedTemperature === 'Frío' ? (
                            <Snowflake size={14} strokeWidth={2.4} style={{ color: '#0284c7' }} />
                          ) : (
                            <Flame size={14} strokeWidth={2.4} style={{ color: '#991b1b' }} />
                          )}
                          {selectedTemperature === 'Frío' ? 'Frío' : 'Caliente'}
                        </span>
                        {/* Switch pill visual */}
                        <div
                          style={{
                            width: 32,
                            height: 18,
                            borderRadius: 10,
                            background: selectedTemperature === 'Frío' ? '#0284c7' : '#991b1b',
                            position: 'relative',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              background: '#fff',
                              position: 'absolute',
                              top: 2,
                              left: selectedTemperature === 'Frío' ? 16 : 2,
                              transition: 'left 0.15s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSize('');
                        setSelectedVariety('');
                        setSelectedFlavor(null);
                        setSelectedExtraIds([]);
                        setWithCinnamon(false);
                        setIsExtrasExpanded(false);
                        setVasoName('');
                        setHasNote(false);
                        setNoteText('');
                        setOpen(false);
                      }}
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: 'none',
                        borderRadius: 8,
                        width: 30,
                        height: 30,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                      title="Cerrar ventana"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </Header>

                <div
                  style={{
                    padding: '10px 12px',
                    overflowY: 'auto',
                    flex: '1 1 auto',
                    maxHeight: 'min(480px, calc(86vh - 100px))',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {/* Selección de Tamaño con Gran Protagonismo */}
                  {allConfiguredSizes.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 800,
                            color: '#1e293b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                          }}
                        >
                          Tamaño del vaso <span style={{ color: '#e11d48' }}>*</span>
                        </span>
                        {selectedSize && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#4d0012',
                              background: '#fff0f3',
                              padding: '2px 8px',
                              borderRadius: 6,
                              border: '1px solid rgba(77, 0, 18, 0.1)',
                            }}
                          >
                            {allConfiguredSizes.find((s) => s.size === selectedSize)?.label || selectedSize}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${allConfiguredSizes.length}, 1fr)`,
                          gap: 6,
                        }}
                      >
                        {allConfiguredSizes.map((sz) => {
                          const isSelected = selectedSize === sz.size;
                          const inStock = sz.inStock;
                          const iconSize = sz.size === '8oz' ? 14 : sz.size === '12oz' ? 16 : 18;
                          const CupIcon = selectedTemperature === 'Frío' ? CupSoda : Coffee;
                          const iconColor = !inStock ? '#9ca3af' : isSelected ? '#4d0012' : '#475569';

                          return (
                            <button
                              key={sz.size}
                              type="button"
                              disabled={!inStock}
                              onClick={() => inStock && setSelectedSize(sz.size)}
                              title={
                                !inStock
                                  ? selectedTemperature === 'Frío' && sz.size === '8oz'
                                    ? 'Las bebidas frías no se sirven en 8oz'
                                    : 'Sin stock de vasos para esta medida'
                                  : ''
                              }
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '6px 4px',
                                borderRadius: 10,
                                border: '2px solid',
                                borderColor: !inStock
                                  ? '#e4e4e7'
                                  : isSelected
                                    ? '#4d0012'
                                    : '#e2e8f0',
                                background: !inStock
                                  ? '#f4f4f5'
                                  : isSelected
                                    ? '#fff5f7'
                                    : '#ffffff',
                                boxShadow: isSelected
                                  ? '0 3px 10px rgba(77, 0, 18, 0.15)'
                                  : '0 1px 3px rgba(0, 0, 0, 0.04)',
                                cursor: inStock ? 'pointer' : 'not-allowed',
                                transition: 'all 0.15s ease',
                                opacity: inStock ? 1 : 0.5,
                                outline: 'none',
                                position: 'relative',
                              }}
                            >
                              {/* Fila superior: Ícono y Nombre */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: iconColor,
                                    lineHeight: 1,
                                    transition: 'transform 0.15s ease',
                                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                  }}
                                >
                                  <CupIcon size={iconSize} strokeWidth={2.2} />
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: !inStock ? '#9ca3af' : isSelected ? '#4d0012' : '#1e293b',
                                    textDecoration: inStock ? 'none' : 'line-through',
                                  }}
                                >
                                  {sz.name || sz.label}
                                </span>
                              </div>

                              {/* Onzas (8 oz, 12 oz, 16 oz) */}
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  color: !inStock ? '#a1a1aa' : isSelected ? '#831843' : '#64748b',
                                  marginBottom: 4,
                                }}
                              >
                                {sz.oz || sz.size}
                              </span>

                              {/* Precio destacado */}
                              {sz.price > 0 && (
                                <span
                                  style={{
                                    fontSize: 11.5,
                                    fontWeight: 800,
                                    color: !inStock
                                      ? '#a1a1aa'
                                      : isSelected
                                        ? '#4d0012'
                                        : '#475569',
                                    background: isSelected
                                      ? 'rgba(77, 0, 18, 0.09)'
                                      : '#f1f5f9',
                                    padding: '1px 6px',
                                    borderRadius: 5,
                                    border: isSelected ? '1px solid rgba(77, 0, 18, 0.15)' : '1px solid #e2e8f0',
                                    textDecoration: inStock ? 'none' : 'line-through',
                                    width: '88%',
                                    textAlign: 'center',
                                  }}
                                >
                                  ${sz.price.toLocaleString('es-AR')}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selector opcional de Sabor de Helado para Milkshake */}
                  {isMilkshake && iceCreamFlavorOptions.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <IceCreamCone size={15} strokeWidth={2.2} style={{ color: '#4d0012' }} /> Sabor de helado
                        </span>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: '#64748b',
                            background: '#f1f5f9',
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}
                        >
                          Opcional
                        </span>
                      </div>
                      <SelectStyles
                        placeholder="Ingresá el sabor elegido..."
                        options={iceCreamFlavorOptions}
                        value={selectedFlavor}
                        onChange={(opt) => setSelectedFlavor(opt)}
                        isClearable
                        styles={selectStylesFix}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        menuShouldScrollIntoView={false}
                        noOptionsMessage={() => 'No se encontraron sabores'}
                      />
                    </div>
                  )}

                  {/* Selector de Variedad / Sabor para otros productos de Cafetería (Cookies, Pastelería, etc.) */}
                  {cafeteriaProductOptions.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          opacity: 0.8,
                          display: 'block',
                          marginBottom: 5,
                        }}
                      >
                        Sabor / Variedad <span style={{ color: '#e11d48' }}>*</span>
                      </span>
                      {cafeteriaProductOptions.length <= 24 ? (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                            gap: 6,
                          }}
                        >
                          {cafeteriaProductOptions.map((opt) => {
                            const isSelected = selectedVariety === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setSelectedVariety(opt.value)}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 8,
                                  border: '1.5px solid',
                                  borderColor: isSelected ? '#4d0012' : '#e4e4e7',
                                  background: isSelected ? '#fff5f7' : '#fff',
                                  fontWeight: isSelected ? 700 : 600,
                                  color: isSelected ? '#4d0012' : '#333',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  fontSize: 12,
                                  fontFamily: 'Inter, sans-serif',
                                  transition: 'all 0.15s ease',
                                  outline: 'none',
                                }}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <SelectStyles
                          placeholder="Buscá o elegí la variedad..."
                          options={cafeteriaProductOptions}
                          value={
                            selectedVariety
                              ? { value: selectedVariety, label: selectedVariety }
                              : null
                          }
                          onChange={(opt) => setSelectedVariety(opt?.value || '')}
                          styles={selectStylesFix}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          menuShouldScrollIntoView={false}
                        />
                      )}
                    </div>
                  )}

                  {/* Boolean: Agregar Canela (Exclusivo en Cappuccino, activado por defecto) */}
                  {isCappuccino && supportsCinnamonOption && (
                    <div style={{ marginBottom: 14 }}>
                      <div
                        onClick={() => setWithCinnamon((prev) => !prev)}
                        title={withCinnamon ? 'Quitar canela' : 'Agregar canela'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: '1.5px solid',
                          borderColor: withCinnamon ? '#b45309' : '#e2e8f0',
                          background: withCinnamon ? '#fffbeb' : '#ffffff',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.15s ease',
                          boxShadow: withCinnamon
                            ? '0 2px 8px rgba(180, 83, 9, 0.15)'
                            : '0 1px 2px rgba(0, 0, 0, 0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              background: withCinnamon ? '#fef3c7' : '#f1f5f9',
                              border: `1px solid ${withCinnamon ? '#fde68a' : '#e2e8f0'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: withCinnamon ? '#b45309' : '#64748b',
                              transition: 'all 0.15s ease',
                              flexShrink: 0,
                            }}
                          >
                            <Sparkles size={15} strokeWidth={2.4} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: withCinnamon ? '#92400e' : '#1e293b',
                                lineHeight: 1.2,
                              }}
                            >
                              Agregar canela
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: withCinnamon ? '#b45309' : '#64748b',
                                lineHeight: 1.2,
                              }}
                            >
                              {withCinnamon ? 'Con lluvia de canela (por defecto)' : 'Sin canela'}
                            </span>
                          </div>
                        </div>

                        {/* Switch Pill Toggle */}
                        <div
                          style={{
                            width: 38,
                            height: 22,
                            borderRadius: 11,
                            background: withCinnamon ? '#b45309' : '#cbd5e1',
                            position: 'relative',
                            transition: 'background 0.18s ease',
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              top: 2,
                              left: withCinnamon ? 18 : 2,
                              transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.28)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extras Dinámicos (Colapsable) */}
                  {allowedCafeteriaExtras.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <div
                        onClick={() => setIsExtrasExpanded((prev) => !prev)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: isExtrasExpanded || selectedExtraIds.length > 0 ? '#fff5f7' : '#f8fafc',
                          border: `1.5px solid ${isExtrasExpanded || selectedExtraIds.length > 0 ? '#fbcfe8' : '#e2e8f0'}`,
                          borderRadius: 8,
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span
                            style={{
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: isExtrasExpanded || selectedExtraIds.length > 0 ? '#4d0012' : '#1e293b',
                            }}
                          >
                            Extras
                          </span>
                          {selectedExtraIds.length > 0 && (
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 800,
                                color: '#fff',
                                background: '#4d0012',
                                padding: '1px 6px',
                                borderRadius: 10,
                              }}
                            >
                              {selectedExtraIds.length}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span
                            style={{
                              fontSize: 11,
                              color: isExtrasExpanded || selectedExtraIds.length > 0 ? '#4d0012' : '#64748b',
                              fontWeight: 600,
                            }}
                          >
                            {isExtrasExpanded ? 'Ocultar' : 'Ver opciones'}
                          </span>
                          <ChevronDown
                            size={14}
                            strokeWidth={2.5}
                            style={{
                              color: isExtrasExpanded || selectedExtraIds.length > 0 ? '#4d0012' : '#64748b',
                              display: 'inline-block',
                              transition: 'transform 0.2s ease',
                              transform: isExtrasExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                          />
                        </div>
                      </div>

                      {isExtrasExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
                          {allowedCafeteriaExtras.map((extra) => {
                            const extraPrice = Number(extra.price_extra || 0);
                            const isSelected = selectedExtraIds.includes(extra.id);
                            const inStock = extra.inStock;
                            return (
                              <div
                                key={extra.id}
                                onClick={() => inStock && toggleExtra(extra.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  borderRadius: 8,
                                  border: '1.5px solid',
                                  borderColor: !inStock
                                    ? '#e5e7eb'
                                    : isSelected
                                      ? '#4d0012'
                                      : '#eee',
                                  background: !inStock
                                    ? '#f9fafb'
                                    : isSelected
                                      ? '#fff5f7'
                                      : '#fff',
                                  cursor: inStock ? 'pointer' : 'not-allowed',
                                  opacity: inStock ? 1 : 0.55,
                                  transition: 'all 0.15s ease',
                                  userSelect: 'none',
                                  fontFamily: 'Inter, sans-serif',
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      color: inStock ? '#333' : '#6b7280',
                                      fontSize: 12.5,
                                      textDecoration: inStock ? 'none' : 'line-through',
                                    }}
                                  >
                                    {extra.name}
                                  </span>
                                  {extraPrice > 0 ? (
                                    <span
                                      style={{
                                        fontSize: 11,
                                        color: inStock ? '#888' : '#a1a1aa',
                                        fontWeight: 600,
                                        textDecoration: inStock ? 'none' : 'line-through',
                                      }}
                                    >
                                      +${extraPrice}
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: 11,
                                        color: inStock ? '#16a34a' : '#a1a1aa',
                                        fontWeight: 600,
                                        textDecoration: inStock ? 'none' : 'line-through',
                                      }}
                                    >
                                      Sin costo
                                    </span>
                                  )}
                                </div>

                                {/* Icono booleano tipo checkbox circular */}
                                <div
                                  style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    border: '1.5px solid',
                                    borderColor: !inStock ? '#d1d5db' : isSelected ? '#4d0012' : '#ccc',
                                    background: isSelected && inStock ? '#4d0012' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  {isSelected && inStock && <Check size={12} strokeWidth={3} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nombre en vaso (para cafés clásicos y fríos, no para pastelería) */}
                  {category !== 'pasteleria' && category !== 'Pastelería' && (
                    <div style={{ marginBottom: 18 }}>
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: '#1e293b',
                          display: 'block',
                          marginBottom: 8,
                        }}
                      >
                        Nombre en el vaso (opcional)
                      </span>
                      <input
                        type="text"
                        placeholder="Ej: Juan, Sofi..."
                        value={vasoName}
                        onChange={(e) => setVasoName(e.target.value)}
                        style={{
                          width: '100%',
                          height: 36,
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1.5px solid #e4e4e7',
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      />
                    </div>
                  )}

                  {/* Campo de Aclaración con Checkbox */}
                  <div
                    style={{
                      marginTop: 18,
                      paddingTop: 14,
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => {
                        const next = !hasNote;
                        setHasNote(next);
                        if (!next) setNoteText('');
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: hasNote ? '#4d0012' : '#1e293b',
                        }}
                      >
                        Aclaración
                      </span>
                      <input
                        type="checkbox"
                        checked={hasNote}
                        onChange={(e) => {
                          setHasNote(e.target.checked);
                          if (!e.target.checked) setNoteText('');
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          accentColor: '#4d0012',
                          cursor: 'pointer',
                          width: 16,
                          height: 16,
                        }}
                      />
                    </div>

                    {hasNote && (
                      <input
                        type="text"
                        placeholder="Ej: tibio, sin tapa, poco hielo..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          height: 36,
                          marginTop: 8,
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1.5px solid #4d0012',
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Botón Submit Cafetería */}
                <div
                  style={{
                    padding: '8px 14px',
                    background: '#fafafa',
                    borderTop: '1px solid #eee',
                  }}
                >
                  <button
                    type="submit"
                    disabled={!isCafeteriaValid}
                    style={{
                      width: '100%',
                      height: 40,
                      padding: '8px 12px',
                      borderRadius: 9,
                      background: isCafeteriaValid ? '#4d0012' : '#d4d4d8',
                      color: isCafeteriaValid ? '#fff' : '#71717a',
                      border: 'none',
                      fontWeight: 'bold',
                      fontSize: 14,
                      cursor: isCafeteriaValid ? 'pointer' : 'not-allowed',
                      textAlign: 'center',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isOutOfCupStock
                      ? 'Sin stock de vasos disponibles'
                      : !isSizeValid && !isVarietyValid
                        ? 'Elegí tamaño y variedad'
                        : !isSizeValid
                          ? 'Elegí el tamaño'
                          : !isVarietyValid
                            ? 'Elegí el sabor / variedad'
                            : `Agregar al pedido ($${totalPrice.toLocaleString('es-AR')})`}
                  </button>
                </div>
              </WindowProductStyled>
            </>,
            document.body
          )}
      </>
    );
  }

  return (
    <>
      {!shouldOpenModal ? (
        <CardProductStyled
          $accent={ACCENTS[category]}
          onClick={() => dispatch(addToCart({ name, price, id, category }))}
          $isElectron={isElectron}
        >
          <div className="left">
            <span className="name">{name}</span>
          </div>
        </CardProductStyled>
      ) : (
        <CardProductStyled $accent={ACCENTS[category]} onClick={openModal} $isElectron={isElectron}>
          <div className="left">
            <span className="name">{name}</span>
          </div>
        </CardProductStyled>
      )}

      {open &&
        createPortal(
          <>
            <Background onClick={closeModal} />
            <WindowProductStyled onSubmit={handleSubmit(onSubmit)} $isHelado={!isSingleFlavorSelect}>
              {isSingleFlavorSelect ? (
                <>
                  <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: '1 1 auto' }}>
                      <a
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: '#1e1e2d',
                          letterSpacing: '-0.02em',
                          lineHeight: 1.15,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word',
                        }}
                      >
                        {name}
                      </a>
                      {totalAddedInModal > 0 ? (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            background: '#fff0f3',
                            color: '#4d0012',
                            padding: '3px 8px',
                            borderRadius: 8,
                            border: '1px solid rgba(77, 0, 18, 0.15)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {totalAddedInModal} {totalAddedInModal === 1 ? 'agregado' : 'agregados'}
                        </span>
                      ) : (
                        <Subtitle>Elegí los sabores</Subtitle>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: 'none',
                        borderRadius: 8,
                        width: 28,
                        height: 28,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                      title="Cerrar ventana"
                    >
                      <X size={15} strokeWidth={2.5} />
                    </button>
                  </Header>

                  <BodyScroll>
                    {loadingSabores && !hasFlavors ? (
                      <p style={{ textAlign: 'center', margin: '20px 0', opacity: 0.6 }}>
                        Cargando sabores...
                      </p>
                    ) : (
                      <OptionsGrid $twoCols={getOptions().length > 4}>
                        {getOptions().map((opt) => {
                          const label = typeof opt === 'string' ? opt : opt.label;
                          const count = flavorCounts[label] || 0;

                          return (
                            <OptionBtn
                              type="button"
                              key={label}
                              $isSelected={count > 0}
                              onClick={() => handleFlavorClick(label)}
                            >
                              <span className="label-text">{label}</span>
                              <div className="btn-actions">
                                {count > 0 ? (
                                  <>
                                    <button
                                      type="button"
                                      className="minus-btn"
                                      onClick={(e) => handleFlavorDecrement(e, label)}
                                      title={`Quitar 1 ${label}`}
                                    >
                                      <Minus size={11} strokeWidth={2.5} />
                                    </button>
                                    <span className="count-badge active" title="Sumar otro">
                                      {count}
                                    </span>
                                  </>
                                ) : (
                                  <span className="count-badge empty">
                                    <Plus size={11} strokeWidth={2.5} />
                                  </span>
                                )}
                              </div>
                            </OptionBtn>
                          );
                        })}
                      </OptionsGrid>
                    )}
                  </BodyScroll>

                  {totalAddedInModal > 0 && (
                    <FooterSticky>
                      <BotonAgregar type="button" onClick={closeModal}>
                        Agregar al pedido ({totalAddedInModal})
                      </BotonAgregar>
                    </FooterSticky>
                  )}
                </>
              ) : (
                <>
                  <Title style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: '1 1 auto' }}>
                      <a
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: '#1e1e2d',
                          letterSpacing: '-0.02em',
                          lineHeight: 1.15,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word',
                        }}
                      >
                        {name}
                      </a>
                      {category === 'Helado' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          {/* Círculos indicadores */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            {Array.from({ length: maxSabores }).map((_, idx) => {
                              const isSlotActive = idx < fields.length;
                              const val = watchedSabores?.[idx];
                              const hasSelectedValue = Boolean(
                                typeof val === 'string'
                                  ? val.trim()
                                  : val?.value || val?.label
                              );
                              return (
                                <div
                                  key={idx}
                                  title={`Sabor ${idx + 1} de ${maxSabores}`}
                                  style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    background: hasSelectedValue
                                      ? '#4d0012'
                                      : isSlotActive
                                        ? '#fff5f7'
                                        : '#f1f5f9',
                                    border: isSlotActive ? '2px solid #4d0012' : '2px solid #cbd5e1',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: hasSelectedValue
                                      ? '0 0 0 2px rgba(77, 0, 18, 0.2)'
                                      : 'none',
                                  }}
                                />
                              );
                            })}
                          </div>

                          {/* Contenedor de botones - y + justo al lado de los círculos */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              background: '#f8fafc',
                              padding: '2px 4px',
                              borderRadius: 8,
                              border: '1.5px solid #e2e8f0',
                            }}
                          >
                            <button
                              type="button"
                              disabled={fields.length <= 1}
                              onClick={() => {
                                if (fields.length > 1) {
                                  remove(fields.length - 1);
                                }
                              }}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                                background: fields.length <= 1 ? '#f1f5f9' : '#fff',
                                color: fields.length <= 1 ? '#94a3b8' : '#4d0012',
                                fontWeight: 800,
                                fontSize: 14,
                                cursor: fields.length <= 1 ? 'not-allowed' : 'pointer',
                                opacity: fields.length <= 1 ? 0.45 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: fields.length <= 1 ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                                transition: 'all 0.15s ease',
                              }}
                              title="Quitar un sabor"
                            >
                              <Minus size={13} strokeWidth={2.5} />
                            </button>

                            <button
                              type="button"
                              disabled={fields.length >= maxSabores}
                              onClick={addSabor}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                                background: fields.length >= maxSabores ? '#f1f5f9' : '#fff',
                                color: fields.length >= maxSabores ? '#94a3b8' : '#4d0012',
                                fontWeight: 800,
                                fontSize: 14,
                                cursor: fields.length >= maxSabores ? 'not-allowed' : 'pointer',
                                opacity: fields.length >= maxSabores ? 0.45 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: fields.length >= maxSabores ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                                transition: 'all 0.15s ease',
                              }}
                              title="Agregar otro sabor"
                            >
                              <Plus size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={closeModal}
                        style={{
                          background: '#f1f5f9',
                          color: '#64748b',
                          border: 'none',
                          borderRadius: 8,
                          width: 28,
                          height: 28,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                        }}
                        title="Cerrar ventana"
                      >
                        <X size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  </Title>
                  <BodyScroll>
                    {loadingSabores && !hasFlavors ? (
                      <p style={{ textAlign: 'center', margin: '20px 0', opacity: 0.6 }}>
                        Cargando sabores...
                      </p>
                    ) : (
                      fields.map((field, idx) => (
                        <Field key={field.id}>
                          <LabelRow>
                            <span>Sabor {idx + 1}</span>
                            {idx > 0 && (
                              <RemoveLink type="button" onClick={() => remove(idx)}>
                                Quitar sabor {idx + 1}
                              </RemoveLink>
                            )}
                          </LabelRow>

                          <Controller
                            control={control}
                            name={`sabores.${idx}`}
                            render={({ field }) => (
                              <SelectStyles
                                placeholder="Elegí el sabor"
                                options={getOptions()}
                                value={
                                  typeof field.value === 'string'
                                    ? { value: field.value, label: field.value }
                                    : field.value?.label
                                      ? field.value
                                      : field.value?.value
                                        ? { value: field.value.value, label: field.value.value }
                                        : null
                                }
                                onChange={(option) => field.onChange(option)}
                                styles={selectStylesFix}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                menuShouldScrollIntoView={false}
                              />
                            )}
                          />
                        </Field>
                      ))
                    )}

                    {/* Campo de Nota / Aclaración para armar el pedido con boolean toggle */}
                    <ContentAclaracion style={{ marginTop: 12 }}>
                      <LabelRow
                        style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => {
                          const next = !hasNote;
                          setHasNote(next);
                          if (!next) setNoteText('');
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: hasNote ? '#4d0012' : '#334155',
                          }}
                        >
                          Aclaración
                        </span>
                        <input
                          type="checkbox"
                          checked={hasNote}
                          onChange={(e) => {
                            setHasNote(e.target.checked);
                            if (!e.target.checked) setNoteText('');
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            accentColor: '#4d0012',
                            cursor: 'pointer',
                            width: 16,
                            height: 16,
                          }}
                        />
                      </LabelRow>

                      {hasNote && (
                        <InputDetalle
                          type="text"
                          placeholder="Ej: mitad chocolate, poco dulce..."
                          maxLength={120}
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          autoFocus
                          style={{
                            marginTop: 8,
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1.5px solid #4d0012',
                            fontSize: 13,
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontFamily: 'Inter, sans-serif',
                            background: '#fff',
                          }}
                        />
                      )}
                    </ContentAclaracion>
                  </BodyScroll>

                  <FooterSticky>
                    <BotonAgregar
                      type="submit"
                      disabled={loadingSabores}
                      $isOmitir={isOmitirHeladoHovered}
                      onMouseEnter={() => setIsHoveredSubmit(true)}
                      onMouseLeave={() => setIsHoveredSubmit(false)}
                    >
                      {isOmitirHeladoHovered ? 'Omitir sabores y agregar' : 'Agregar al pedido'}
                    </BotonAgregar>
                  </FooterSticky>
                </>
              )}
            </WindowProductStyled>
          </>,
          document.body
        )}
    </>
  );
}
