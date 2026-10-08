import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CATALOG = [
  // Cafetería Caliente y Fría
  {
    id: 'latte',
    matches: (n) => n.includes('latte'),
    desc: 'Café espresso combinado con leche texturizada al vapor y una fina capa de crema.',
    contains: ['Café espresso', 'Leche texturizada'],
  },
  {
    id: 'cappuccino',
    matches: (n) => n.includes('cappuccino') || n.includes('capuchino'),
    desc: 'Café espresso con partes equilibradas de leche texturizada y abundante espuma cremosa.',
    contains: ['Café espresso', 'Leche texturizada', 'Espuma cremosa'],
  },
  {
    id: 'caramel_macchiato',
    matches: (n) => n.includes('caramel') || n.includes('macchiato'),
    desc: 'Café espresso con leche texturizada al vapor, un toque de vainilla y salsa de caramelo.',
    contains: ['Café espresso', 'Leche texturizada', 'Syrup de vainilla', 'Salsa de caramelo'],
  },
  {
    id: 'mocca_blanco',
    matches: (n) => (n.includes('mocca') || n.includes('mocha')) && n.includes('blanco'),
    desc: 'Café espresso combinado con dulce chocolate blanco y leche cremosa texturizada.',
    contains: ['Café espresso', 'Leche texturizada', 'Chocolate blanco'],
  },
  {
    id: 'mocca',
    matches: (n) => n.includes('mocca') || n.includes('mocha'),
    desc: 'Café espresso combinado con chocolate, leche vaporizada cremosa y salsa de chocolate.',
    contains: ['Café espresso', 'Leche texturizada', 'Chocolate', 'Salsa de chocolate'],
  },
  {
    id: 'americano',
    matches: (n) => n.includes('americano'),
    desc: 'Café espresso rebajado con agua caliente para un sabor balanceado, limpio y suave.',
    contains: ['Café espresso', 'Agua caliente'],
  },
  {
    id: 'flat_white',
    matches: (n) => n.includes('flat white'),
    desc: 'Doble shot de espresso intenso con una fina y sedosa capa de microespuma de leche.',
    contains: ['Doble espresso', 'Microespuma de leche'],
  },
  {
    id: 'espresso',
    matches: (n) => n.includes('espresso'),
    desc: 'Tiro de café espresso concentrado, aromático y con rica crema dorada.',
    contains: ['Café espresso 100% arábica'],
  },
  {
    id: 'chocolate_caliente',
    matches: (n) => n.includes('chocolate caliente'),
    desc: 'Bebida dulce y reconfortante preparada con cacao puro y leche vaporizada cremosa.',
    contains: ['Cacao puro', 'Leche cremosa caliente'],
  },

  // Frappés y Bebidas Frías
  {
    id: 'dulce_de_leche',
    matches: (n) => n.includes('dulce de leche'),
    desc: 'Frappé helado de café y dulce de leche, coronado con crema chantilly y salsa de dulce de leche.',
    contains: ['Café espresso', 'Dulce de leche', 'Leche', 'Crema chantilly', 'Hielo'],
  },
  {
    id: 'oreo',
    matches: (n) => n.includes('oreo'),
    desc: 'Frappé helado de café licuado con galletitas Oreo trituradas, chocolate y crema chantilly.',
    contains: ['Café espresso', 'Galletitas Oreo', 'Leche', 'Salsa de chocolate', 'Crema chantilly', 'Hielo'],
  },
  {
    id: 'frappe_pistacho',
    matches: (n) => n.includes('pistacho') && !n.includes('alfajor') && !n.includes('pote'),
    desc: 'Frappé helado gourmet de café con salsa y syrup de pistacho, coronado con crema chantilly.',
    contains: ['Café espresso', 'Salsa de pistacho', 'Syrup de pistacho', 'Crema chantilly', 'Hielo'],
  },
  {
    id: 'milkshake',
    matches: (n) => n.includes('milkshake'),
    desc: 'Batido cremoso elaborado a base de helado artesanal a elección, leche y salsa de chocolate.',
    contains: ['Helado artesanal', 'Leche', 'Salsa de chocolate'],
  },
  {
    id: 'smoothie',
    matches: (n) => n.includes('smoothie'),
    desc: 'Licuado refrescante a base de pulpa de frutas naturales y hielo batido.',
    contains: ['Pulpa de fruta natural', 'Hielo'],
  },

  // Pastelería y Tostados
  {
    id: 'roll_canela',
    matches: (n) => n.includes('roll') && n.includes('canela'),
    desc: 'Roll esponjoso de masa hojaldrada con canela aromática y suave glaseado.',
    contains: ['Masa hojaldrada', 'Canela aromática', 'Glaseado'],
  },
  {
    id: 'pan_chocolate',
    matches: (n) => n.includes('pan') && n.includes('chocolate'),
    desc: 'Pain au chocolat clásico de masa hojaldrada con manteca y chocolate semiamargo.',
    contains: ['Masa hojaldrada con manteca', 'Chocolate semiamargo'],
  },
  {
    id: 'medialuna',
    matches: (n) => n.includes('medialuna'),
    desc: 'Medialuna artesanal de manteca, suave, hojaldrada y con almíbar tradicional.',
    contains: ['Masa hojaldrada de manteca', 'Almíbar'],
  },
  {
    id: 'croissant',
    matches: (n) => n.includes('croissant'),
    desc: 'Croissant francés hojaldrado, ligero y crujiente con puro sabor a manteca.',
    contains: ['Masa hojaldrada de manteca'],
  },
  {
    id: 'budin_limon',
    matches: (n) => n.includes('budin') && n.includes('limon'),
    desc: 'Porción de budín húmedo y esponjoso con sabor a limón natural y fino glasé.',
    contains: ['Budín de limón natural', 'Glasé de limón'],
  },
  {
    id: 'budin_banana',
    matches: (n) => n.includes('budin') && n.includes('banana'),
    desc: 'Porción de budín húmedo y aromático de banana artesanal.',
    contains: ['Budín de banana artesanal'],
  },
  {
    id: 'cookie_kinder',
    matches: (n) => n.includes('cookie') && n.includes('kinder'),
    desc: 'Galleta horneada con trozos y crema de chocolate Kinder.',
    contains: ['Galleta horneada', 'Chocolate Kinder'],
  },
  {
    id: 'cookie_marroc',
    matches: (n) => n.includes('cookie') && n.includes('marroc'),
    desc: 'Galleta horneada con trozos y praliné estilo Marroc.',
    contains: ['Galleta horneada', 'Bocadito Marroc'],
  },
  {
    id: 'cookie_rellena',
    matches: (n) => n.includes('cookie') && n.includes('rellen'),
    desc: 'Galleta horneada crocante por fuera con corazón dulce y relleno cremoso.',
    contains: ['Galleta horneada', 'Centro relleno cremoso'],
  },
  {
    id: 'cookie',
    matches: (n) => n.includes('cookie'),
    desc: 'Galleta horneada artesanal con chips de chocolate.',
    contains: ['Galleta horneada', 'Chips de chocolate'],
  },
  {
    id: 'tostado_chipa',
    matches: (n) => n.includes('tostado') && n.includes('chipa'),
    desc: 'Sándwich prensado caliente en pan de chipá de queso, con jamón cocido y queso derretido.',
    contains: ['Pan de chipá de queso', 'Jamón cocido', 'Queso fundido'],
  },
  {
    id: 'tostado_miga',
    matches: (n) => n.includes('tostado') && n.includes('miga'),
    desc: 'Tostado clásico en pan de miga suave, tostado y dorado con jamón y queso derretido.',
    contains: ['Pan de miga', 'Jamón cocido', 'Queso fundido'],
  },
  {
    id: 'tostado_general',
    matches: (n) => n.includes('tostado'),
    desc: 'Sándwich tostado crujiente con jamón cocido y queso derretido.',
    contains: ['Jamón cocido', 'Queso fundido'],
  },
  {
    id: 'chipa',
    matches: (n) => n.includes('chipa'),
    desc: 'Bocaditos tradicionales de almidón de mandioca y abundante queso, horneados al punto justo.',
    contains: ['Almidón de mandioca', 'Selección de quesos'],
  },
  {
    id: 'pan_queso',
    matches: (n) => n.includes('pan de queso') || n.includes('pan queso'),
    desc: 'Panecillo tierno y esponjoso horneado con queso seleccionado.',
    contains: ['Masa tierna horneada', 'Queso'],
  },

  // Pastelería adicional
  {
    id: 'alfajor',
    matches: (n) => n.includes('alfajor'),
    desc: 'Alfajor artesanal relleno de dulce de leche.',
    contains: ['Tapas artesanales', 'Dulce de leche'],
  },
  {
    id: 'torta',
    matches: (n) => n.includes('torta') || n.includes('porcion'),
    desc: 'Porción de torta artesanal con capas suaves y relleno cremoso.',
    contains: ['Bizcochuelo artesanal', 'Relleno dulce'],
  },
];

function cleanIngredientName(raw) {
  if (!raw) return null;
  let s = raw
    .replace(/\d+(\.\d+)?\s*(g|ml|l|kg|oz|cdas?|unidades?|unit)/gi, '')
    .replace(/(vaso\s+\w+|licuar.*|decorar.*|costo.*|standard)/gi, '')
    .replace(/[•\-\*]/g, '')
    .trim();
  if (!s || s.length < 2) return null;
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s;
}

export default function ProductInfoIcon({
  product = {},
  size = 'small', // 'small' | 'normal'
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, alignRight: false, placeAbove: false });
  const btnRef = useRef(null);
  const popoverRef = useRef(null);

  const {
    name = '',
    category = '',
    isCafeteria = false,
    description = '',
    descripcion = '',
    recipe8oz = '',
    recipe12oz = '',
    recipe16oz = '',
  } = product;

  // El icono de info es EXCLUSIVO para la sección y productos de Cafetería.
  // En la sección de Helados (Helado, Paletas, Varios, etc.) no se muestra ningún icono de info.
  const isHeladoProduct =
    !isCafeteria ||
    category === 'Helado' ||
    category === 'Paletas' ||
    category === 'Varios' ||
    category === 'Consumir en el local' ||
    category === 'Extras' ||
    category === 'Otros';

  // Accents removal: normalized without combining diacritical marks
  const normalized = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // 1. Direct explicit description from PocketBase record (if set by user/admin)
  const directDesc = (description || descripcion || '').trim();

  // 2. Predefined friendly description & ingredients from catalog
  const matched = CATALOG.find((item) => item.matches(normalized)) || null;

  let displayDesc = directDesc || matched?.desc || '';
  let displayContains = matched?.contains ? [...matched.contains] : [];

  // 3. Fallback: if not in curated list, extract ingredients from recipe without grams/ml
  if (!displayDesc || displayContains.length === 0) {
    const rawLines = (recipe12oz || recipe8oz || recipe16oz || '').split('\n');
    const autoIngredients = rawLines.map(cleanIngredientName).filter(Boolean);
    if (displayContains.length === 0 && autoIngredients.length > 0) {
      displayContains = autoIngredients;
    }
  }

  // If there's still no description, set a category-aware description (never call pasteleria "bebida")
  if (!displayDesc) {
    const isDrink =
      category === 'clasico' ||
      category === 'frappe' ||
      category === 'frio' ||
      category === 'cafeteria' ||
      category === 'Bebidas';
    if (displayContains.length > 0) {
      displayDesc = isDrink
        ? 'Bebida preparada artesanalmente con ingredientes de primera calidad.'
        : 'Producto artesanal elaborado con ingredientes seleccionados de primera calidad.';
    }
  }

  // Only show info icon for cafeteria products and if there is real, useful content
  const hasContent = !isHeladoProduct && Boolean(displayDesc || displayContains.length > 0);

  const updatePosition = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const alignRight = window.innerWidth - rect.left < 270;
    const placeAbove = window.innerHeight - rect.bottom < 220;

    setCoords({
      top: placeAbove ? rect.top - 8 : rect.bottom + 8,
      left: Math.max(10, rect.left - 4),
      right: Math.max(10, window.innerWidth - rect.right - 4),
      alignRight,
      placeAbove,
    });
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isClicked) {
      setIsOpen(false);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isClicked) {
      setIsClicked(false);
      setIsOpen(false);
    } else {
      updatePosition();
      setIsClicked(true);
      setIsOpen(true);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isClicked) return;
    const handleClickOutside = (e) => {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setIsClicked(false);
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isClicked]);

  // Update position on scroll/resize if open
  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => {
      updatePosition();
    };
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen]);

  if (!hasContent) {
    return null;
  }

  const btnSize = size === 'small' ? 18 : 22;
  const iconSize = size === 'small' ? 11 : 13;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        position: 'relative',
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        title="Ver descripción y contenido"
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: '50%',
          border: '1.5px solid ' + (isOpen ? '#4d0012' : '#cbd5e1'),
          background: isOpen ? '#4d0012' : '#f8fafc',
          color: isOpen ? '#ffffff' : '#64748b',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
          boxShadow: isOpen
            ? '0 2px 6px rgba(77, 0, 18, 0.25)'
            : '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: coords.top,
              transform: coords.placeAbove ? 'translateY(-100%)' : 'none',
              left: coords.alignRight ? 'auto' : coords.left,
              right: coords.alignRight ? coords.right : 'auto',
              width: 255,
              maxWidth: 'calc(100vw - 20px)',
              background: '#ffffff',
              borderRadius: 12,
              border: '1.5px solid #fbcfe8',
              boxShadow:
                '0 12px 30px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08)',
              padding: '11px 13px',
              zIndex: 999999,
              fontFamily: 'Inter, sans-serif',
              animation: 'tooltipFade 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'auto',
            }}
          >
            {/* Header del Tooltip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
                marginBottom: 7,
                paddingBottom: 6,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {name}
                </span>
                {category && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#4d0012',
                      background: '#fff0f3',
                      padding: '1px 5px',
                      borderRadius: 4,
                      textTransform: 'capitalize',
                      flexShrink: 0,
                    }}
                  >
                    {category}
                  </span>
                )}
              </div>

              {isClicked && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsClicked(false);
                    setIsOpen(false);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 'bold',
                    padding: 0,
                    lineHeight: 1,
                  }}
                  title="Cerrar"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pequeña descripción de lo que es */}
            {displayDesc && (
              <p
                style={{
                  fontSize: 11.5,
                  color: '#475569',
                  lineHeight: 1.45,
                  margin: '0 0 8px 0',
                }}
              >
                {displayDesc}
              </p>
            )}

            {/* Lo que contiene en etiquetas separadas */}
            {displayContains.length > 0 && (
              <div style={{ marginTop: displayDesc ? 6 : 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#4d0012',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    marginBottom: 5,
                  }}
                >
                  Contiene:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {displayContains.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: '#334155',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '2px 7px',
                        borderRadius: 6,
                        lineHeight: 1.3,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
