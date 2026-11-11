import { pb } from './pb';

const CACHE_KEY = 'pixel_delivery_config_v1';
let runtimeConfig = null;

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  } catch {
    return null;
  }
};

const saveCache = (config) => {
  runtimeConfig = config;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config));
  } catch {
    // El POS puede seguir usando la copia en memoria.
  }
};

export const getCachedDeliveryConfig = () => runtimeConfig || readCache();

const toCoordinatePair = (value) => {
  if (Array.isArray(value) && value.length >= 2) {
    const pair = [Number(value[0]), Number(value[1])];
    return pair.every(Number.isFinite) ? pair : null;
  }
  if (typeof value === 'string') {
    const parts = value.trim().split(/[\s,]+/).map(Number);
    return parts.length >= 2 && parts.slice(0, 2).every(Number.isFinite)
      ? parts.slice(0, 2)
      : null;
  }
  return null;
};

export async function loadDeliveryConfig() {
  try {
    const response = await pb.send('/api/pixel/delivery-config', {
      method: 'GET',
      requestKey: null,
    });
    const config = response?.config || null;
    if (config?.zones?.length) saveCache(config);
    return config?.zones?.length ? config : getCachedDeliveryConfig();
  } catch (error) {
    console.warn('[Delivery] No se pudo actualizar la configuraciÃ³n; se usa la copia local.', error);
    return getCachedDeliveryConfig();
  }
}

function isPointInRing(point, ring) {
  if (!Array.isArray(ring) || ring.length < 3) return false;
  const normalizedRing = ring.map(toCoordinatePair).filter(Boolean);
  if (normalizedRing.length < 3) return false;
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = normalizedRing.length - 1; i < normalizedRing.length; j = i++) {
    const [xi, yi] = normalizedRing[i];
    const [xj, yj] = normalizedRing[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function isPointInPolygon(point, coordinates) {
  if (!Array.isArray(coordinates) || !coordinates.length) return false;
  if (Array.isArray(coordinates[0]?.[0]?.[0])) {
    return coordinates.some((polygon) =>
      isPointInRing(point, polygon[0]) && !polygon.slice(1).some((hole) => isPointInRing(point, hole))
    );
  }
  if (Array.isArray(coordinates[0]?.[0])) {
    return isPointInRing(point, coordinates[0]) &&
      !coordinates.slice(1).some((hole) => isPointInRing(point, hole));
  }
  return isPointInRing(point, coordinates);
}

function distanceToSegmentKm(point, start, end) {
  const startPair = toCoordinatePair(start);
  const endPair = toCoordinatePair(end);
  if (!startPair || !endPair) return Infinity;
  const kmLat = 110.574;
  const kmLng = 111.32 * Math.cos((point[1] * Math.PI) / 180);
  const [x, y] = [point[0] * kmLng, point[1] * kmLat];
  const [x1, y1] = [startPair[0] * kmLng, startPair[1] * kmLat];
  const [x2, y2] = [endPair[0] * kmLng, endPair[1] * kmLat];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / length)) : 0;
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function distanceToPolygonKm(point, coordinates) {
  let minimum = Infinity;
  const rings = Array.isArray(coordinates?.[0]?.[0]?.[0])
    ? coordinates.map((polygon) => polygon[0])
    : [Array.isArray(coordinates?.[0]?.[0]) ? coordinates[0] : coordinates];
  rings.forEach((ring) => {
    for (let index = 0; Array.isArray(ring) && index < ring.length; index += 1) {
      minimum = Math.min(
        minimum,
        distanceToSegmentKm(point, ring[index], ring[(index + 1) % ring.length])
      );
    }
  });
  return minimum;
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findDeliveryZone(lat, lon, config = getCachedDeliveryConfig()) {
  const zones = Array.isArray(config?.zones) ? config.zones : [];
  if (!zones.length || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return null;
  const point = [Number(lon), Number(lat)];
  const matches = zones
    .filter((zone) => zone?.coordinates && isPointInPolygon(point, zone.coordinates))
    .sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  if (matches.length) return matches[0];

  // La misma tolerancia de 150 m que utiliza la PWA para veredas y esquinas.
  const nearbyZone = zones.find(
    (zone) => zone?.coordinates && distanceToPolygonKm(point, zone.coordinates) <= 0.15
  );
  if (nearbyZone) return nearbyZone;

  // Igual que la PWA: si se usan las zonas radiales predeterminadas, aplicar
  // sus límites por distancia aunque PocketBase haya serializado el polígono.
  const storeLat = Number(config?.storeLocation?.lat);
  const storeLon = Number(config?.storeLocation?.lng ?? config?.storeLocation?.lon);
  if (Number.isFinite(storeLat) && Number.isFinite(storeLon)) {
    const distance = calculateDistanceKm(Number(lat), Number(lon), storeLat, storeLon);
    const radialZones = zones
      .filter((zone) => Number.isFinite(Number(zone?.maxKm)) && Number(zone.maxKm) > 0)
      .sort((a, b) => Number(a.maxKm) - Number(b.maxKm));
    const radialMatch = radialZones.find((zone) => distance <= Number(zone.maxKm));
    if (radialMatch) return radialMatch;
  }

  return null;
}
