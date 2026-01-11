import Checkbox from '@mui/material/Checkbox';
import { purple, teal } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import uniqid from 'uniqid';

import { pb } from '../../lib/pb';
import { addToCart } from '../../redux/cart/cartSlice';
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
  Skeleton,
  Subtitle,
  Title,
  WindowProductStyled,
} from './styles/CardProductStyled';

const ACCENTS = {
  Helado: '#111',
  Paletas: '#6b5cff',
  Varios: '#ff9f0a',
  'Consumir en el local': '#0ea5e9',
  Extras: '#16a34a',
  Otros: '#64748b',
};

const PRODUCTS_WITH_MODAL = [
  '1/4 kg',
  '1/2 kg',
  '1 kg',
  'paleta clásica',
  'paleta dubai',
  'pote gio',
  'mini torta',
  'alfajor helado',
];

const theme = createTheme({ palette: { primary: teal, secondary: purple } });

function explodeOptionsFromRecords(records = []) {
  const flatRaw = [];
  const grouped = [];

  const toOption = (v) => {
    if (!v) return null;
    if (typeof v === 'string') return { value: v.trim(), label: v.trim() };
    if (typeof v === 'object') {
      const s = v.value ?? v.label ?? v.name ?? v.nombre ?? v.sabor;
      return s ? { value: String(s).trim(), label: String(s).trim() } : null;
    }
    return { value: String(v).trim(), label: String(v).trim() };
  };

  const collect = (raw) => {
    if (!raw) return [];
    let data = raw;

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return [toOption(data)].filter(Boolean);
      }
    }
    if (Array.isArray(data)) return data.map(toOption).filter(Boolean);
    if (typeof data === 'object') return Object.values(data).flatMap(collect);
    return [toOption(data)].filter(Boolean);
  };

  records.forEach((rec) => {
    // por si tenés algún registro “sabor suelto”
    const single = rec.name ?? rec.nombre ?? rec.sabor;
    if (single) flatRaw.push(String(single).trim());

    // y los agrupados en rec.options / rec.opciones / etc.
    const opts = collect(
      rec.options ?? rec.opciones ?? rec.items ?? rec.values ?? rec.list ?? rec.optionsJson
    );
    if (opts.length) {
      grouped.push({ label: rec.label ?? rec.nombre ?? rec.grupo ?? 'Otros', options: opts });
      flatRaw.push(...opts.map((o) => o.label));
    }
  });

  // únicos + ordenados
  const seen = new Set();
  const flat = flatRaw
    .map((s) => String(s).trim())
    .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))
    .map((s) => ({ value: s, label: s }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));

  return { flat, grouped };
}

export default function CardProduct({ name, price, id, category }) {
  const dispatch = useDispatch();
  // --- Sabores desde PB + loading ---
  const [flatOptions, setFlatOptions] = useState([]); // opciones planas (fallback)
  const [groupOptions, setGroupOptions] = useState([]); // opciones agrupadas por grupo
  const [loadingSabores, setLoadingSabores] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      let hasCache = false;

      // 1. Cargar del caché si existe
      try {
        const cachedSabores = localStorage.getItem('cachedSabores');
        if (cachedSabores) {
          const parsed = JSON.parse(cachedSabores);
          const { flat, grouped } = explodeOptionsFromRecords(parsed);
          setFlatOptions(flat);
          setGroupOptions(grouped);
          hasCache = true;
        }
      } catch (e) {
        console.error('Error loading cache:', e);
        localStorage.removeItem('cachedSabores'); // Limpiar caché corrupto
      }

      // 2. Intentar cargar desde la red, solo si no hay caché
      if (!hasCache) {
        setLoadingSabores(true);
      }

      try {
        const list = await pb.collection('sabores').getFullList({
          batch: 200,
          sort: 'label',
        });
        if (!alive) return;

        const { flat, grouped } = explodeOptionsFromRecords(list);
        setFlatOptions(flat);
        setGroupOptions(grouped);

        // Guardar la nueva lista en el caché
        localStorage.setItem('cachedSabores', JSON.stringify(list));
      } catch (e) {
        console.error('PB sabores:', e);
      } finally {
        if (alive) {
          setLoadingSabores(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // --- Apertura/cierre del modal ---
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // aplica en <html> y <body> por compatibilidad
    document.body.classList.toggle('modal-open', open);

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [open]);

  const dubai = ['Dubai Negro', 'Dubai Blanco', 'Dubai Nutella'];
  const clasica = [
    'Pistacho',
    'Kinder Bueno',
    'Oreo',
    'Praliné',
    'Chocotorta',
    'Tramontana',
    'Rama Negro',
    'Rama Blanco',
    'Ferrero Rocher',
    'Hello Kitty',
    'Spiderman',
  ];

  const tortas = ['Chocotorta', 'Oreo', 'Lemon Pie', 'Cheesecake', 'Tiramisu', 'Brownie'];
  const gio = ['Doble Chocolate', 'American Cookies', 'Frutilla Doble', 'Amargo Vegan'];
  const alfajores = ['Clásico', 'Dark', 'Delicia', 'Patagónico'];
  const smoothies = ['Naranja-Frutilla', 'Frutos del Bosque'];

  const PRODUCT_OPTIONS = {
    'mini torta': ['Chocotorta', 'Oreo', 'Lemon Pie', 'Cheesecake', 'Tiramisu', 'Brownie'],
    'pote gio': ['Doble Chocolate', 'American Cookies', 'Frutilla Doble', 'Amargo Vegan'],
    'alfajor helado': ['Clásico', 'Dark', 'Delicia', 'Patagónico'],
    smoothie: ['Naranja-Frutilla', 'Frutos del Bosque'],
  };

  const tortasOptions = tortas.map((t) => ({ value: t, label: t }));

  // Máximo de sabores por producto (ajustá si querés otras reglas)
  const maxSabores = name === '1 kg' ? 4 : 3;
  // Máximo de sabores por producto
  const isPaleta = category === 'Paletas';

  const normalizedName = (name || '').toLowerCase();

  const productWithOptionsKey = Object.keys(PRODUCT_OPTIONS).find((key) =>
    normalizedName.includes(key)
  );

  const hasCustomOptions = Boolean(productWithOptionsKey);

  const getOptions = () => {
    if (hasCustomOptions) {
      return PRODUCT_OPTIONS[productWithOptionsKey].map((o) => ({
        value: o,
        label: o,
      }));
    }

    const nm = normalizedName;

    if (nm.includes('dubai')) {
      return dubai.map((s) => ({ value: s, label: s }));
    }

    if (nm.includes('clásica') || nm.includes('clasica')) {
      return clasica.map((s) => ({ value: s, label: s }));
    }

    return groupOptions.length ? groupOptions : flatOptions;
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

  // Al abrir, reseteo a 1 sabor
  const openModal = () => {
    replace([{ value: '' }]);
    reset((curr) => ({ ...curr, usarDetalle: false, detalle: '' }));
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  // Evito duplicados y vacíos
  const onSubmit = ({ sabores, usarDetalle, detalle }) => {
    const lista = (sabores || [])
      .map((s) => (typeof s === 'string' ? s : s?.value))
      .filter(Boolean);

    if (!lista.length || !lista[0]) {
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
    const payload =
      usarDetalle && detalle?.trim()
        ? { name, id: uid, price, sabores: lista, category, listdetalle: detalle.trim() }
        : { name, id: uid, price, sabores: lista, category };

    dispatch(addToCart(payload));
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
        minHeight: 40,
        fontFamily: 'Satoshi, sans-serif',
      }),
      singleValue: (base) => ({
        ...base,
        color: '#111', // ← texto seleccionado visible
        fontWeight: 700,
        fontFamily: 'Satoshi, sans-serif',
      }),
      input: (base) => ({
        ...base,
        color: '#111',
        fontFamily: 'Satoshi, sans-serif', // ← caret / texto al tipear
      }),
      placeholder: (base) => ({
        ...base,
        color: '#9aa3b2', // ← placeholder gris legible
        fontWeight: 500,
        fontFamily: 'Satoshi, sans-serif',
      }),
      option: (base, state) => ({
        ...base,
        color: '#111',
        background: state.isFocused ? '#eef2ff' : '#fff',
        fontFamily: 'Satoshi, sans-serif', // hover suave
      }),
      menu: (base) => ({
        ...base,
        zIndex: 9999,
        fontFamily: 'Satoshi, sans-serif', // evita quedar tapado
      }),
    }),
    []
  );

  const hasFlavors = flatOptions.length > 0 || groupOptions.length > 0;

  const shouldOpenModal = PRODUCTS_WITH_MODAL.includes(normalizedName);

  return (
    <ThemeProvider theme={theme}>
      {!shouldOpenModal ? (
        <CardProductStyled
          $accent={ACCENTS[category]}
          onClick={() => dispatch(addToCart({ name, price, id, category }))}
        >
          <div className="left">
            <span className="name">{name}</span>
          </div>
        </CardProductStyled>
      ) : (
        <CardProductStyled $accent={ACCENTS[category]} onClick={openModal}>
          <div className="left">
            <span className="name">{name}</span>
          </div>
        </CardProductStyled>
      )}

      {open && (
        <>
          <Background onClick={closeModal} />
          <WindowProductStyled onSubmit={handleSubmit(onSubmit)}>
            {isPaleta || hasCustomOptions ? (
              <>
                <Header>
                  <a>{name}</a>
                  <Subtitle>Elegí el sabor</Subtitle>
                </Header>

                <BodyScroll>
                  {loadingSabores && !hasFlavors ? (
                    <p style={{ textAlign: 'center', margin: '20px 0', opacity: 0.6 }}>
                      Cargando sabores...
                    </p>
                  ) : (
                    <OptionsGrid>
                      {getOptions().map((opt) => {
                        const label = typeof opt === 'string' ? opt : opt.label;
                        const slug = (s) =>
                          String(s)
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '');
                        const sku = `${id}__${slug(label)}`;
                        return (
                          <OptionBtn
                            type="button"
                            key={label}
                            onClick={() => {
                              dispatch(
                                addToCart({
                                  id: sku, // 👈 ID estable por sabor
                                  sku, // opcional
                                  name: `${name}`, // base visible
                                  price,
                                  category,
                                  sabores: [label], // sabor elegido
                                })
                              );
                              closeModal();
                            }}
                          >
                            {label}
                          </OptionBtn>
                        );
                      })}
                    </OptionsGrid>
                  )}
                </BodyScroll>
              </>
            ) : (
              <>
                <Title>
                  <a>{name}</a>
                  {category === 'Helado' && (
                    <BotonCompraLocal
                      onClick={() => {
                        dispatch(addToCart({ name, id: uniqid(), price, category }));
                        closeModal();
                      }}
                    >
                      Retiro por el local
                    </BotonCompraLocal>
                  )}
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

                  {fields.length < maxSabores && (
                    <GhostPill type="button" onClick={addSabor}>
                      + Agregar otro sabor ({fields.length}/{maxSabores})
                    </GhostPill>
                  )}

                  <ContentAclaracion>
                    <LabelRow>
                      <span>Aclaración</span>
                      <Controller
                        control={control}
                        name="usarDetalle"
                        render={({ field: f }) => (
                          <Checkbox
                            checked={!!f.value}
                            onChange={(e) => f.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </LabelRow>

                    {watch('usarDetalle') && (
                      <InputDetalle
                        type="text"
                        placeholder="Ej: mitad americana"
                        maxLength={100}
                        {...register('detalle')}
                      />
                    )}
                  </ContentAclaracion>
                </BodyScroll>

                <FooterSticky>
                  <BotonAgregar type="submit" disabled={loadingSabores}>
                    Agregar al pedido
                  </BotonAgregar>
                </FooterSticky>
              </>
            )}
          </WindowProductStyled>
        </>
      )}
    </ThemeProvider>
  );
}
