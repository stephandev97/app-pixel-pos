import { locateByCrossStreets, parseAddressParts } from './crossStreets';

const CACHE_KEY = 'pixel-pos-geocode-v2';
const CITY = 'Marcos Paz, Buenos Aires, Argentina';
const GOOGLE_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
const memory = new Map();
let queue = Promise.resolve();

// Mismo catálogo base utilizado por la PWA. Se excluyen barrios para que el
// selector proponga calles reales; la altura escrita se conserva aparte.
const LOCAL_STREETS = [
  'San Martín', 'Rivadavia', 'Dr. Marcos Paz', 'Belgrano', 'Avellaneda', 'Sarmiento',
  '9 de Julio', '25 de Mayo', 'Independencia', 'Carlos Pellegrini', 'Piedras', 'Moreno',
  'Mitre', 'Bartolomé Mitre', 'Alem', 'Leandro N. Alem', 'Alsina', 'Adolfo Alsina',
  'Saavedra', 'Cornelio Saavedra', 'Balcarce', 'Alberdi', 'Juan Bautista Alberdi',
  'Urquiza', 'Justo José de Urquiza', 'Laprida', 'Francisco Laprida', 'Lavalle',
  'Juan Lavalle', 'Tucumán', 'Mendoza', 'Catamarca', 'La Rioja', 'Libertad',
  'Monteagudo', 'Centenario', '12 de Octubre', "D'Andrea", 'Feijóo', 'Añoranzas',
  'El Palenque', 'Acceso Zabala', 'Zabala', 'Ruta 40', 'Agüero', 'Buenos Aires',
  'Chacabuco', 'Chile', 'Colón', 'Corrientes', 'Deán Funes', 'Don Bosco', 'Dorrego',
  'España', 'Estrada', 'José Manuel de Estrada', 'Francia', 'Garay', 'Juan de Garay',
  'General Paz', 'Güemes', 'Guido Spano', 'Italia', 'Jujuy', 'Juncal', 'Las Heras',
  'Maipú', 'Malvinas Argentinas', 'Misiones', 'Neuquén', 'Paso', 'Juan José Paso',
  'Perón', 'Juan Domingo Perón', 'Quintana', 'Manuel Quintana', 'República', 'Salta',
  'San Juan', 'San Luis', 'Santa Fe', 'Suipacha', 'Viamonte', 'Zapiola', 'Pje. Aguilar',
  'Roberto Marciano', 'Alberto Marciano',
  ...Array.from({ length: 15 }, (_, index) => `Calle ${index + 1}`),
];

// Entradas especiales verificadas, iguales a las utilizadas por la PWA.
const SPECIAL_PLACES = [
  {
    id: 'special:el-moro',
    mainText: 'El Moro (Entrada)',
    secondaryText: 'Ruta 40 km 52,5',
    fullText: 'El Moro (Entrada), Ruta 40 km 52,5, Marcos Paz',
    lat: -34.8141473,
    lon: -58.8601244,
    preferredZoneId: 'zona-3',
    match: (value) => /\b(?:el\s+)?moro\b|country\s+(?:el\s+)?moro|club\s+de\s+campo\s+(?:el\s+)?moro|\bharas\b/i.test(value),
  },
  {
    id: 'special:la-sofia',
    mainText: 'La Sofía (Entrada)',
    secondaryText: 'Ernesto Juan Grand 57',
    fullText: 'La Sofía (Entrada), Ernesto Juan Grand 57, Marcos Paz',
    lat: -34.803163,
    lon: -58.845696,
    preferredZoneId: 'zona-2',
    match: (value) => /\b(?:la\s+)?sof[ií]a\b|barrio\s+(?:privado\s+)?(?:la\s+)?sof[ií]a|country\s+la\s+sof[ií]a/i.test(value),
  },
  {
    id: 'special:la-renata-29',
    mainText: 'La Renata 29',
    secondaryText: 'Libertad y José C. Paz',
    fullText: 'La Renata 29, Libertad y José C. Paz, Marcos Paz',
    lat: -34.7822359,
    lon: -58.8468249,
    preferredZoneId: 'zona-1',
    match: (value) => /\b(?:la\s+)?renata\s*29\b|libertad\s+y\s+jose\s+c/i.test(normalizeText(value)),
  },
  {
    id: 'special:la-renata',
    mainText: 'La Renata (Entrada)',
    secondaryText: 'Libertad 502',
    fullText: 'La Renata (Entrada), Libertad 502, Marcos Paz',
    lat: -34.7659465,
    lon: -58.8280474,
    preferredZoneId: 'zona-2',
    match: (value) => /\b(?:la\s+)?renata\b|libertad\s+50[0-9]|libertad\s+52[0-9]/i.test(normalizeText(value)),
  },
  {
    id: 'special:gomeria-beto',
    mainText: 'Gomería Beto',
    secondaryText: 'Juan Domingo Perón y Facundo Quiroga',
    fullText: 'Gomería Beto, Juan Domingo Perón y Facundo Quiroga, Marcos Paz',
    lat: -34.7525648,
    lon: -58.8130163,
    preferredZoneId: 'zona-3',
    match: (value) => {
      const text = normalizeText(value);
      return /\bgomeria\s+beto\b|\bbeto\b/.test(text) ||
        (/\b(?:juan )?domingo peron\b/.test(text) && /\bfacundo quiroga\b/.test(text));
    },
  },
];

const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeStore = (key, value) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...readStore(), [key]: value }));
  } catch {
    // Sin almacenamiento disponible: solo cache en memoria.
  }
};

const isValid = (lat, lon) =>
  Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\bpje\.?\b/g, 'pasaje')
    .replace(/\b(?:avenida|avda|av)\.?\s+/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const extractRequestedHeight = (value) => {
  let clean = String(value || '').trim();
  clean = clean.replace(
    /^(?:9 de julio|25 de mayo|12 de octubre|calle\s+\d+|ruta(?:\s+provincial)?\s+\d+)\b/i,
    ''
  );
  const numbers = clean.match(/\b\d+[a-z]?\b/gi);
  return numbers?.length ? numbers[numbers.length - 1].toLowerCase() : '';
};

const isGenericCityResult = (street) => {
  const clean = normalizeText(street);
  if (/\b(?:dr|dra|doctor|doctora) marcos paz\b/.test(clean)) return false;
  return /^(?:calle )?marcos paz(?: \d+)?$/.test(clean);
};

const findLocalStreets = (value, limit = 6) => {
  const { street } = parseAddressParts(value);
  const target = normalizeText(street || value);
  if (!target) return [];
  const starts = [];
  const contains = [];
  LOCAL_STREETS.forEach((candidate) => {
    const normalized = normalizeText(candidate);
    if (normalized.startsWith(target)) starts.push(candidate);
    else if (target.length >= 2 && normalized.includes(target)) contains.push(candidate);
  });
  return [...starts, ...contains].slice(0, limit);
};

const getStreetSecondaryText = (street) => {
  const normalized = normalizeText(street);
  if (/\broberto marciano\b/.test(normalized)) return 'Barrio Bautista · Marcos Paz';
  if (/\balberto marciano\b/.test(normalized)) return 'Barrio Gándara · Marcos Paz';
  return 'Marcos Paz';
};

const isKnownMarcianoStreet = (street) =>
  /^(?:roberto|alberto) marciano(?: \d+[a-z]?)?$/.test(normalizeText(street));

const makeLocalSuggestion = (street, requestedHeight) => {
  const mainText = [street, requestedHeight].filter(Boolean).join(' ');
  return {
    id: `local:${normalizeText(mainText)}`,
    label: `${mainText}, Marcos Paz`,
    mainText,
    secondaryText: getStreetSecondaryText(street),
    trustedStreetPreview: isKnownMarcianoStreet(mainText),
    fullText: `${mainText}, Marcos Paz`,
    houseNumber: requestedHeight,
    requestedHeight,
    lat: null,
    lon: null,
    source: 'local',
  };
};

const findSpecialSuggestions = (value) => {
  const matches = SPECIAL_PLACES.filter((place) => place.match(value));
  const wantsRenata29 = /\b29\b/.test(value);
  matches.sort((a, b) => {
    if (wantsRenata29) {
      if (a.id === 'special:la-renata-29') return -1;
      if (b.id === 'special:la-renata-29') return 1;
    } else {
      if (a.id === 'special:la-renata') return -1;
      if (b.id === 'special:la-renata') return 1;
    }
    return 0;
  });
  return matches.map((place) => ({
    ...place,
    label: place.fullText,
    houseNumber: '',
    requestedHeight: '',
    source: 'special',
    isSpecial: true,
  }));
};

async function searchGoogleAddresses(value) {
  if (!GOOGLE_KEY || GOOGLE_KEY === 'your_google_maps_api_key_here') return [];
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE_KEY },
      body: JSON.stringify({
        input: /marcos\s+paz/i.test(value) ? value : `${value}, Marcos Paz`,
        includedRegionCodes: ['ar'],
        includedPrimaryTypes: ['street_address', 'route', 'subpremise', 'premise', 'intersection'],
        locationRestriction: {
          circle: {
            center: { latitude: -34.7828, longitude: -58.8375 },
            radius: 14000,
          },
        },
      }),
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const requestedHeight = extractRequestedHeight(value);
    return (payload.suggestions || []).flatMap((item) => {
      const prediction = item.placePrediction;
      if (!prediction) return [];
      let mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text || '';
      mainText = mainText.replace(/,\s*Marcos Paz.*/i, '').trim();
      if (!mainText || isGenericCityResult(mainText) || /^barrio\b/i.test(mainText)) return [];
      const parsed = parseAddressParts(mainText);
      const houseNumber = parsed.number || requestedHeight;
      if (requestedHeight && !parsed.number) mainText = `${parsed.street || mainText} ${requestedHeight}`;
      const exactGoogleAddress = Boolean(parsed.number);
      return [{
        id: exactGoogleAddress ? prediction.placeId : `local:${normalizeText(mainText)}`,
        placeId: exactGoogleAddress ? prediction.placeId : null,
        label: `${mainText}, Marcos Paz`,
        mainText,
        secondaryText: getStreetSecondaryText(mainText),
        trustedStreetPreview: isKnownMarcianoStreet(mainText),
        fullText: `${mainText}, Marcos Paz`,
        houseNumber,
        requestedHeight,
        lat: null,
        lon: null,
        source: exactGoogleAddress ? 'google' : 'local',
      }];
    });
  } catch {
    return [];
  }
}

const formatNominatimSuggestion = (row, requestedHeight) => {
  const address = row?.address || {};
  let street =
    address.road ||
    address.pedestrian ||
    address.residential ||
    address.footway ||
    address.path ||
    '';
  let houseNumber = String(address.house_number || '').trim();
  // Algunas respuestas traen "2058, Avellaneda" sólo en display_name.
  if (!houseNumber) {
    const firstPart = String(row?.display_name || '').split(',')[0].trim();
    if (/^\d+[a-z]?$/i.test(firstPart)) houseNumber = firstPart;
  }
  if (!street || isGenericCityResult(street)) return null;

  if (/\b(?:dr|dra|doctor|doctora)\.?\s+marcos\s+paz\b/i.test(street)) {
    street = 'Dr. Marcos Paz';
  }

  const mainText = [street, houseNumber].filter(Boolean).join(' ');
  return {
    id: String(row.place_id || `${row.lat}-${row.lon}`),
    label: `${mainText}, Marcos Paz`,
    mainText,
    secondaryText: getStreetSecondaryText(street),
    trustedStreetPreview: isKnownMarcianoStreet(mainText),
    fullText: `${mainText}, Marcos Paz`,
    houseNumber,
    requestedHeight,
    lat: Number(row.lat),
    lon: Number(row.lon),
    sourceType: String(row.type || ''),
  };
};

export function getOrderCoordinates(order) {
  const source = [order?.coordinates, order?.location?.coordinates, order?.geoDetails?.coordinates].find(
    (value) => value && typeof value === 'object'
  );
  if (source) {
    const lat = Number(source.lat ?? source.latitude);
    const lon = Number(source.lon ?? source.lng ?? source.longitude);
    if (isValid(lat, lon)) return { lat, lon };
  }
  const match = String(order?.pagoDetalle || '').match(/[?&]q=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i);
  if (match) {
    const lat = Number(match[1]);
    const lon = Number(match[2]);
    if (isValid(lat, lon)) return { lat, lon };
  }
  return null;
}

const fetchNominatim = async (address) => {
  const { street, number } = parseAddressParts(address);
  const clean = street ? `${street}${number ? ` ${number}` : ''}` : address;
  const query = /marcos\s+paz/i.test(address) ? clean : `${clean}, ${CITY}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1&countrycodes=ar`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
  if (!res.ok) return null;
  const data = await res.json();
  const first = Array.isArray(data) ? data[0] : null;
  const lat = Number(first?.lat);
  const lon = Number(first?.lon);
  return first && isValid(lat, lon) ? { lat, lon } : null;
};

export async function searchAddresses(address, limit = 5) {
  const value = String(address || '').trim();
  if (value.length < 2) return [];
  const { street, number } = parseAddressParts(value);
  const clean = street ? `${street}${number ? ` ${number}` : ''}` : value;
  const query = /marcos\s+paz/i.test(value) ? clean : `${clean}, ${CITY}`;
  const commonParams = {
    format: 'json',
    addressdetails: '1',
    limit: '12',
    countrycodes: 'ar',
    viewbox: '-58.98,-34.68,-58.70,-34.90',
    bounded: '1',
  };
  const makeUrl = (params) => {
    const search = new URLSearchParams({ ...params, ...commonParams });
    return `https://nominatim.openstreetmap.org/search?${search.toString()}`;
  };
  const freeformUrl = makeUrl({ q: query });
  const structuredUrl = street && number
    ? makeUrl({
        street: `${number} ${street}`,
        city: 'Marcos Paz',
        state: 'Buenos Aires',
        country: 'Argentina',
      })
    : null;
  const requestedHeight = extractRequestedHeight(value);
  const googlePromise = searchGoogleAddresses(value);
  try {
    let response = await fetch(structuredUrl || freeformUrl, {
      headers: { 'Accept-Language': 'es' },
    });
    let rows = response.ok ? await response.json() : [];
    if (structuredUrl && (!Array.isArray(rows) || rows.length === 0)) {
      response = await fetch(freeformUrl, { headers: { 'Accept-Language': 'es' } });
      rows = response.ok ? await response.json() : [];
    }
    const remoteSuggestions = (Array.isArray(rows) ? rows : [])
      .map((row) => formatNominatimSuggestion(row, requestedHeight))
      .filter((row) => row?.mainText && isValid(row.lat, row.lon))
      .map((row) => ({ ...row, source: 'nominatim' }));
    const googleSuggestions = await googlePromise;
    const localSuggestions = findLocalStreets(value, 6).map((name) =>
      makeLocalSuggestion(name, requestedHeight)
    );
    const specialSuggestions = findSpecialSuggestions(value);
    const specialIds = new Set(specialSuggestions.map((item) => item.id));
    const normalizedSearch = normalizeText(street || value);
    const searchesMarcosPazAvenue = /\b(?:avenida |av |doctor |dr )*marcos paz\b/.test(normalizedSearch);
    const isUnrequestedMarcosPazAvenue = (row) => {
      if (searchesMarcosPazAvenue) return false;
      const mainText = normalizeText(row.mainText || '');
      return /^(?:(?:avenida|av|doctor|dr) )+marcos paz(?: \d+[a-z]?)?$/.test(mainText);
    };
    const isUnwantedMarcianoSuggestion = (row) => {
      const mainText = normalizeText(row.mainText || '');
      if (!/\bmarciano\b/.test(mainText)) return false;
      return !isKnownMarcianoStreet(mainText);
    };
    const isUnwantedBastanchuriSuggestion = (row) => {
      const mainText = normalizeText(row.mainText || '');
      return (
        /^bastanchuri(?: \d+[a-z]?)?$/.test(mainText) ||
        /^marcos paz y (?:n )?bastanchuri$/.test(mainText) ||
        /^(?:n )?bastanchuri y marcos paz$/.test(mainText)
      );
    };
    const isDuplicateJuanAguerSuggestion = (row) =>
      /^(?:calle|c) juan aguer(?: \d+[a-z]?)?$/.test(normalizeText(row.mainText || ''));
    const duplicatesSpecialPlace = (row) => {
      if (row.isSpecial) return false;
      const text = normalizeText(`${row.mainText || ''} ${row.fullText || ''}`);
      if (
        specialIds.has('special:el-moro') &&
        (/\b(?:el )?moro\b|\bharas\b/.test(text) || /\bruta 40 km 52 5\b/.test(text))
      ) return true;
      if (
        specialIds.has('special:la-sofia') &&
        (/\b(?:la )?sofia\b/.test(text) || /\bernesto juan grand 57\b/.test(text))
      ) return true;
      if (
        (specialIds.has('special:la-renata') || specialIds.has('special:la-renata-29')) &&
        (/\b(?:la )?renata\b/.test(text) ||
          /\blibertad 502\b/.test(text) ||
          /\blibertad y jose c paz\b/.test(text))
      ) return true;
      if (
        specialIds.has('special:gomeria-beto') &&
        (/\bgomeria beto\b|\bbeto\b/.test(text) ||
          (/\b(?:juan )?domingo peron\b/.test(text) && /\bfacundo quiroga\b/.test(text)))
      ) return true;
      return false;
    };
    const seen = new Set();
    const suggestions = [
      ...specialSuggestions,
      ...googleSuggestions,
      ...remoteSuggestions,
      ...localSuggestions,
    ]
      .filter((row) => !isUnwantedMarcianoSuggestion(row))
      .filter((row) => !isUnwantedBastanchuriSuggestion(row))
      .filter((row) => !isDuplicateJuanAguerSuggestion(row))
      .filter((row) => !isUnrequestedMarcosPazAvenue(row))
      .filter((row) => !duplicatesSpecialPlace(row))
      .filter((row) => {
        const key = normalizeText(row.mainText);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const exactA = requestedHeight && String(a.houseNumber).toLowerCase() === requestedHeight ? 1 : 0;
        const exactB = requestedHeight && String(b.houseNumber).toLowerCase() === requestedHeight ? 1 : 0;
        if (exactA !== exactB) return exactB - exactA;
        if (Boolean(a.houseNumber) !== Boolean(b.houseNumber)) return a.houseNumber ? -1 : 1;
        return 0;
      });

    // Como en la PWA, si se escribió una altura y existe una coincidencia
    // exacta, se ocultan las variantes genéricas de la misma calle.
    const visibleSuggestions = requestedHeight
      ? suggestions.filter(
          (row) => row.isSpecial || String(row.houseNumber || '').toLowerCase() === requestedHeight
        )
      : suggestions;
    return visibleSuggestions.slice(0, Math.max(1, Math.min(6, limit)));
  } catch {
    return findLocalStreets(value, limit).map((name) => makeLocalSuggestion(name, requestedHeight));
  }
}

export async function resolveAddressSuggestion(suggestion) {
  if (!suggestion) return null;
  if (
    suggestion.lat !== null &&
    suggestion.lat !== undefined &&
    suggestion.lon !== null &&
    suggestion.lon !== undefined &&
    isValid(Number(suggestion.lat), Number(suggestion.lon))
  ) {
    return { lat: Number(suggestion.lat), lon: Number(suggestion.lon) };
  }
  if (suggestion.source === 'google' && suggestion.placeId && GOOGLE_KEY) {
    try {
      const response = await fetch(`https://places.googleapis.com/v1/places/${suggestion.placeId}`, {
        headers: {
          'X-Goog-Api-Key': GOOGLE_KEY,
          'X-Goog-FieldMask': 'id,formattedAddress,location',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const lat = Number(data.location?.latitude);
        const lon = Number(data.location?.longitude);
        if (isValid(lat, lon)) return { lat, lon, formattedAddress: data.formattedAddress };
      }
    } catch {
      // Continúa con el mismo fallback textual que utiliza la PWA.
    }
  }
  return geocodeAddress(suggestion.fullText || suggestion.mainText);
}

export function geocodeAddress(address) {
  const key = String(address || '').trim().toLowerCase();
  if (!key || key === 'retiro') return Promise.resolve(null);
  if (memory.has(key)) return Promise.resolve(memory.get(key));
  const stored = readStore()[key];
  if (stored) {
    memory.set(key, stored);
    return Promise.resolve(stored);
  }

  // Nominatim permite 1 consulta por segundo: se encolan.
  const task = queue.then(async () => {
    try {
      const point = (await locateByCrossStreets(address)) || (await fetchNominatim(address));
      memory.set(key, point);
      if (point) writeStore(key, point);
      await new Promise((resolve) => setTimeout(resolve, 1100));
      return point;
    } catch {
      return null;
    }
  });
  queue = task.catch(() => null);
  return task;
}
