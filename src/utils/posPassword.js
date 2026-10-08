// src/utils/posPassword.js
import { pb } from '../lib/pb';

const DEFAULT_PIN = '1905';
const STORAGE_KEY = 'pos_config_password';
const RECORD_ID_KEY = 'pos_config_password_record_id';

/**
 * Obtiene la clave guardada en localStorage o el valor por defecto si no existe.
 */
export function getCachedPosPassword() {
  if (typeof window === 'undefined') return DEFAULT_PIN;
  const cached = localStorage.getItem(STORAGE_KEY);
  return cached && cached.trim() !== '' ? cached.trim() : DEFAULT_PIN;
}

/**
 * Sincroniza y descarga la última clave configurada en PocketBase.
 * Si falla la conexión o no hay internet, devuelve la última clave guardada en localStorage.
 */
export async function fetchLatestPosPassword() {
  try {
    const records = await pb.collection('password_config_pos').getFullList({
      sort: '-updated',
      requestKey: null,
    });

    if (records && records.length > 0) {
      const record = records[0];
      const pinStr = String(record.pass);
      if (pinStr && pinStr.trim() !== '') {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, pinStr.trim());
          localStorage.setItem(RECORD_ID_KEY, record.id);
        }
        return pinStr.trim();
      }
    }
  } catch (err) {
    console.warn('[posPassword] Modo offline o sin conexión. Usando clave en caché:', err?.message || err);
  }

  return getCachedPosPassword();
}

/**
 * Actualiza la clave del POS.
 * Guarda en localStorage y además intenta sincronizarla con la colección password_config_pos en PocketBase.
 */
export async function updatePosPassword(newPin) {
  const pinClean = String(newPin).trim();
  const pinNumber = Number(pinClean);

  if (!pinClean || isNaN(pinNumber)) {
    throw new Error('La clave debe ser un número válido.');
  }

  // Guardar siempre en caché local
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, pinClean);
  }

  // Intentar sincronizar con PocketBase
  try {
    let recordId = typeof window !== 'undefined' ? localStorage.getItem(RECORD_ID_KEY) : null;

    if (!recordId) {
      const records = await pb.collection('password_config_pos').getFullList({
        sort: '-updated',
        requestKey: null,
      });
      if (records && records.length > 0) {
        recordId = records[0].id;
        if (typeof window !== 'undefined') {
          localStorage.setItem(RECORD_ID_KEY, recordId);
        }
      }
    }

    if (recordId) {
      await pb.collection('password_config_pos').update(
        recordId,
        { pass: pinNumber },
        { requestKey: null }
      );
    } else {
      const created = await pb.collection('password_config_pos').create(
        { pass: pinNumber },
        { requestKey: null }
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(RECORD_ID_KEY, created.id);
      }
    }

    return { success: true, synced: true, pass: pinClean };
  } catch (err) {
    console.warn('[posPassword] Clave actualizada localmente, pero falló la sincronización con PocketBase:', err?.message || err);
    return { success: true, synced: false, pass: pinClean, offline: true };
  }
}
