import PocketBase from 'pocketbase';
import { PB_CONFIG } from './pb-config.js';

// Compatibilidad CRA (process.env.REACT_APP_*) y Vite (import.meta.env.VITE_*)
const ENV = (typeof import.meta !== 'undefined' ? import.meta.env : {}) || {};
const PROC = typeof process !== 'undefined' ? process.env || {} : {};

const PB_URL = ENV.VITE_PB_URL || PROC.REACT_APP_PB_URL || ENV.REACT_APP_PB_URL || PB_CONFIG.URL;

export const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

// (opcional) login si vas a usar usuarios
export async function login(email, password) {
  return pb.collection('users').authWithPassword(email, password);
}

const SERVICE_EMAIL =
  ENV.VITE_PB_SERVICE_EMAIL ||
  PROC.REACT_APP_PB_SERVICE_EMAIL ||
  ENV.REACT_APP_PB_SERVICE_EMAIL ||
  PB_CONFIG.SERVICE.EMAIL;
const SERVICE_PASS =
  ENV.VITE_PB_SERVICE_PASS ||
  PROC.REACT_APP_PB_SERVICE_PASS ||
  ENV.REACT_APP_PB_SERVICE_PASS ||
  PB_CONFIG.SERVICE.PASS;
const SERVICE_COLLECTION =
  ENV.VITE_PB_SERVICE_COLLECTION ||
  PROC.REACT_APP_PB_SERVICE_COLLECTION ||
  ENV.REACT_APP_PB_SERVICE_COLLECTION ||
  PB_CONFIG.SERVICE.COLLECTION;

async function authAsAdmin(email, pass) {
  return pb.collection('_superusers').authWithPassword(email, pass);
}

async function authAsCollection(collection, email, pass) {
  return pb.collection(collection).authWithPassword(email, pass);
}

/**
 * Garantiza sesi��n v��lida con el usuario de servicio (admin o user).
 * Usa variables *_PB_SERVICE_EMAIL y *_PB_SERVICE_PASS con prefijo VITE_ o REACT_APP_.
 * Lanza error con mensaje claro si falta config o falla login.
 */
export async function ensureServiceAuth() {
  if (!SERVICE_EMAIL || !SERVICE_PASS) {
    throw new Error('missing-service-env');
  }

  const currentEmail = pb?.authStore?.model?.email || pb?.authStore?.model?.username || null;
  if (pb.authStore.isValid && currentEmail === SERVICE_EMAIL) return pb.authStore.model;

  // 1) probar admin; si la ruta no existe (404), saltar a user
  try {
    const adminAuth = await authAsAdmin(SERVICE_EMAIL, SERVICE_PASS);
    return adminAuth?.admin || adminAuth;
  } catch (adminErr) {
    if (adminErr?.status && adminErr.status !== 404) {
      // si es otro error, registrarlo pero seguimos con user
      console.warn('[pb] auth admin fall��, se intenta como collection', adminErr);
    }
  }

  // 2) probar en la collection indicada (default users)
  let lastErr = null;
  const collectionsToTry = [SERVICE_COLLECTION];
  if (!collectionsToTry.includes('clients')) collectionsToTry.push('clients');

  for (const coll of collectionsToTry) {
    try {
      const userAuth = await authAsCollection(coll, SERVICE_EMAIL, SERVICE_PASS);
      return userAuth?.record || userAuth;
    } catch (e) {
      lastErr = e;
    }
  }

  console.error('[pb] No se pudo autenticar usuario de servicio', { lastErr });
  const err = new Error('service-auth-failed');
  err.userErr = lastErr;
  throw err;
}
