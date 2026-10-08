// src/components/Products/productOptionsConstants.js

export const ACCENTS = {
  Helado: '#111',
  Paletas: '#6b5cff',
  Cafetería: '#4d0012',
  Varios: '#ff9f0a',
  'Consumir en el local': '#0ea5e9',
  Extras: '#16a34a',
  Otros: '#64748b',
};

export const dubai = ['Dubai Negro', 'Dubai Blanco', 'Dubai Nutella'];

export const clasica = [
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

export const tortas = ['Chocotorta', 'Oreo', 'Lemon Pie', 'Cheesecake', 'Tiramisu', 'Brownie'];
export const gio = ['Doble Chocolate', 'American Cookies', 'Frutilla Doble', 'Amargo Vegan'];
export const alfajores = ['Clásico', 'Dark', 'Delicia', 'Patagónico'];
export const smoothies = ['Frutilla', 'Frutilla-Naranja', 'Frutos del Bosque', 'Mango-Maracuyá'];
export const cookies = ['Double', 'Red Malva'];
export const cookiesRellenas = ['Kinder', 'Pistacho', 'Oreo', 'Rasta', 'Franui', 'Salted Caramel'];

export const PRODUCT_OPTIONS = {
  'mini torta': ['Chocotorta', 'Oreo', 'Lemon Pie', 'Cheesecake', 'Tiramisu', 'Brownie'],
  'pote gio': ['Doble Chocolate', 'American Cookies', 'Frutilla Doble', 'Amargo Vegan'],
  'alfajor helado': ['Clásico', 'Dark', 'Delicia', 'Patagónico'],
  smoothie: ['Frutilla', 'Frutilla-Naranja', 'Frutos del Bosque', 'Mango-Maracuyá'],
  cookie: ['Double', 'Red Malva'],
  'cookie rellena': ['Kinder', 'Pistacho', 'Oreo', 'Rasta', 'Franui', 'Salted Caramel'],
};

export const KNOWN_SPECIFIC_FLAVORS = [
  'kinder bueno',
  'kinder',
  'marroc',
  'pistacho',
  'oreo',
  'rasta',
  'franui',
  'salted caramel',
  'caramel',
  'red malva',
  'double',
  'doble chocolate',
  'american cookies',
  'frutilla doble',
  'amargo vegan',
  'lemon pie',
  'cheesecake',
  'tiramisu',
  'brownie',
  'chocotorta',
  'rogel',
  'balcarce',
  'patagonico',
  'marplatense',
  'havanna',
  'maicena',
  'delicia',
  'dark',
  'frutilla naranja',
  'frutilla-naranja',
  'frutos del bosque',
  'mango maracuya',
  'mango-maracuya',
  'maracuya',
  'mango',
  'banana',
  'nutella',
  'lotus',
  'ferrero rocher',
  'ferrero',
  'hello kitty',
  'spiderman',
  'tramontana',
  'praline',
  'rama negro',
  'rama blanco',
];

export const GENERIC_PRODUCT_OPTION_MATCHERS = [
  {
    key: 'cookie rellena',
    test: (name) =>
      /^(cookies?\s+rellenas?|cookies?\s+con\s+relleno)(\s*(x\s*1|\(unidad\)|individual))?$/i.test(name),
  },
  {
    key: 'cookie',
    test: (name) =>
      /^(cookies?|cookies?\s+(simples?|tradicional(es)?|clasicas?|clasicos?))(\s*(x\s*1|\(unidad\)|individual))?$/i.test(name),
  },
  {
    key: 'mini torta',
    test: (name) =>
      /^(mini\s*tortas?|minitortas?|tortas?\s+individual(es)?)(\s*(x\s*1|\(unidad\)|individual))?$/i.test(name),
  },
  {
    key: 'pote gio',
    test: (name) =>
      /^(potes?\s+gio(\s+helado)?|gio)$/i.test(name),
  },
  {
    key: 'alfajor helado',
    test: (name) =>
      /^(alfajores?\s+helados?)(\s*(x\s*1|\(unidad\)|individual))?$/i.test(name),
  },
  {
    key: 'smoothie',
    test: (name) =>
      /^(smoothies?|licuados?)(\s*(x\s*1|\(unidad\)|individual))?$/i.test(name),
  },
  {
    key: 'torta',
    test: (name) =>
      /^(tortas?|porci[oó]n(es)?\s+(de\s+)?tortas?)(\s*(x\s*1|\(unidad\)|individual))?$/i.test(name),
  },
  {
    key: 'alfajor',
    test: (name) =>
      /^(alfajores?|alfajores?\s+(simples?|tradicional(es)?|artesanales?))(\s*(x\s*1|\(unidad\)|individual))?$/i.test(name),
  },
];

export function hasSpecificFlavorInName(normalizedName) {
  if (!normalizedName) return false;
  const clean = normalizedName.trim();
  return KNOWN_SPECIFIC_FLAVORS.some((flavor) => {
    if (clean === flavor) return false;
    const regex = new RegExp(`\\b${flavor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(clean);
  });
}

export function getMatchedProductOptionKey(normalizedName) {
  if (!normalizedName) return null;
  const clean = normalizedName.trim();

  // Si el nombre contiene un sabor específico ya definido (ej: "Cookie Kinder", "Cookie Marroc"), no es genérico
  if (hasSpecificFlavorInName(clean)) {
    return null;
  }

  for (const matcher of GENERIC_PRODUCT_OPTION_MATCHERS) {
    if (matcher.test(clean)) {
      return matcher.key;
    }
  }

  return null;
}
