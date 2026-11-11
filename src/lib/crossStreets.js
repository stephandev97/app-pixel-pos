const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const CITY = 'Marcos Paz, Buenos Aires';
const VIEWBOX = '-58.95,-34.70,-58.70,-34.85';
const STREET_PREFIX = '(?:calle|avenida|avda|av|pasaje|pje|diagonal)';
const CROSS_MARKER = '(?:e\\/|entre\\s+calles|entre|esquina\\s+con|esquina|esq)';
const MAX_GAP_METERS = 60;
const MAX_EXTENSION_METERS = 500;
const REQUEST_GAP_MS = 1100;

const stripPrefix = (value) => value.replace(new RegExp(`^${STREET_PREFIX}\\.?\\s+`, 'i'), '').trim();

const cleanStreetName = (value) =>
  stripPrefix(
    String(value || '')
      .replace(/\b(?:piso|dpto|depto|dto|departamento|timbre|casa|lote|mza|manzana|pb)\b.*$/i, ' ')
      .replace(/[^\p{L}\d\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );

/**
 * Separa una dirección como "San Martín 500 (e/ Belgrano y Moreno)" en
 * calle, número y calles transversales. Soporta "e/", "entre", "esq." y "esquina".
 */
export function parseAddressParts(rawAddress) {
  const text = String(rawAddress || '').trim();
  if (!text) return { street: '', number: '', crossStreets: [] };

  let crossText = '';
  let main = text;

  const parenthesized = text.match(new RegExp(`\\(\\s*${CROSS_MARKER}\\.?\\s*([^)]+?)\\s*\\)`, 'i'));
  if (parenthesized) {
    crossText = parenthesized[1];
    main = text.replace(parenthesized[0], ' ');
  } else {
    const inline = text.match(new RegExp(`(?:^|[\\s,;-])${CROSS_MARKER}\\.?\\s+(.+)$`, 'i'));
    if (inline) {
      crossText = inline[1];
      main = text.slice(0, inline.index);
    }
  }

  const crossStreets = crossText
    .split(/\s+y\s+|\s+e\s+|\s*[/&,]\s*|\s+-\s+/i)
    .map(cleanStreetName)
    .filter((name) => name.length >= 3 && !/^\d+$/.test(name))
    .slice(0, 2);

  const cleanedMain = main.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const match = cleanedMain.match(/^(.+?)\s+(\d+)\b/);
  const street = cleanStreetName(match ? match[1] : cleanedMain.replace(/\d+/g, ''));

  return { street, number: match ? match[2] : '', crossStreets };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const linesCache = new Map();
let lastRequestAt = 0;

// Devuelve las polilíneas [[lon, lat], ...] de todos los tramos de una calle
async function fetchStreetLines(name) {
  const key = name.toLowerCase();
  if (linesCache.has(key)) return linesCache.get(key);

  const wait = REQUEST_GAP_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();

  const url =
    `${NOMINATIM_URL}?q=${encodeURIComponent(`${name}, ${CITY}`)}` +
    `&format=json&limit=10&countrycodes=ar&polygon_geojson=1&viewbox=${VIEWBOX}&bounded=1`;
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
    if (!res.ok) return [];
    const data = await res.json();
    const lines = [];
    (Array.isArray(data) ? data : []).forEach((item) => {
      if (item.class !== 'highway') return;
      const geometry = item.geojson;
      if (geometry?.type === 'LineString') lines.push(geometry.coordinates);
      if (geometry?.type === 'MultiLineString') lines.push(...geometry.coordinates);
    });
    if (lines.length > 0) linesCache.set(key, lines);
    return lines;
  } catch {
    return [];
  }
}

const metersBetween = (a, b) => {
  const dLat = (b[1] - a[1]) * 111320;
  const dLon = (b[0] - a[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180);
  return Math.hypot(dLat, dLon);
};

function segmentIntersection(p1, p2, p3, p4) {
  const d1x = p2[0] - p1[0];
  const d1y = p2[1] - p1[1];
  const d2x = p4[0] - p3[0];
  const d2y = p4[1] - p3[1];
  const denom = d1x * d2y - d1y * d2x;
  if (denom === 0) return null;
  const t = ((p3[0] - p1[0]) * d2y - (p3[1] - p1[1]) * d2x) / denom;
  const u = ((p3[0] - p1[0]) * d1y - (p3[1] - p1[1]) * d1x) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return [p1[0] + t * d1x, p1[1] + t * d1y];
}

const lineIntersection = (p1, d1, p2, d2) => {
  const denom = d1[0] * d2[1] - d1[1] * d2[0];
  if (Math.abs(denom) < 1e-12) return null;
  const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / denom;
  return [p1[0] + t * d1[0], p1[1] + t * d1[1]];
};

// Dirección local de la calle en un vértice (según sus tramos vecinos)
const directionAt = (line, index) => {
  const from = line[Math.max(index - 1, 0)];
  const to = line[Math.min(index + 1, line.length - 1)];
  return [to[0] - from[0], to[1] - from[1]];
};

// Cruce entre dos conjuntos de calles: intersección exacta de tramos o, si Nominatim
// devolvió tramos que no llegan a cruzarse, prolongación recta de los más cercanos
function findCrossing(linesA, linesB) {
  for (const a of linesA) {
    for (const b of linesB) {
      for (let i = 0; i < a.length - 1; i += 1) {
        for (let j = 0; j < b.length - 1; j += 1) {
          const hit = segmentIntersection(a[i], a[i + 1], b[j], b[j + 1]);
          if (hit) return { lon: hit[0], lat: hit[1] };
        }
      }
    }
  }

  let best = null;
  for (const a of linesA) {
    for (const b of linesB) {
      a.forEach((pa, i) => {
        b.forEach((pb, j) => {
          const gap = metersBetween(pa, pb);
          if (!best || gap < best.gap) best = { gap, pa, pb, da: directionAt(a, i), db: directionAt(b, j) };
        });
      });
    }
  }
  if (!best) return null;
  if (best.gap <= MAX_GAP_METERS) {
    return { lon: (best.pa[0] + best.pb[0]) / 2, lat: (best.pa[1] + best.pb[1]) / 2 };
  }

  const hit = lineIntersection(best.pa, best.da, best.pb, best.db);
  if (!hit) return null;
  if (metersBetween(hit, best.pa) > MAX_EXTENSION_METERS || metersBetween(hit, best.pb) > MAX_EXTENSION_METERS) {
    return null;
  }
  return { lon: hit[0], lat: hit[1] };
}

/**
 * Ubica la dirección usando sus entre calles: punto medio entre los dos cruces
 * (o el cruce único si es esquina). Devuelve null si no se puede resolver.
 */
export async function locateByCrossStreets(rawAddress) {
  const { street, crossStreets } = parseAddressParts(rawAddress);
  if (!street || crossStreets.length === 0) return null;

  const streetLines = await fetchStreetLines(street);
  if (streetLines.length === 0) return null;

  const points = [];
  for (const cross of crossStreets) {
    const crossLines = await fetchStreetLines(cross);
    const point = crossLines.length > 0 ? findCrossing(streetLines, crossLines) : null;
    if (point) points.push(point);
  }
  if (points.length === 0) return null;

  return {
    lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    lon: points.reduce((sum, point) => sum + point.lon, 0) / points.length,
  };
}
