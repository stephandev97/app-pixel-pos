// src/utils/soundNotifications.js
import notificationSound from '../assets/notification.mp3';
import { isAndroid } from './printBluetooth';

let audioInstance = null;
let lastPlayedOrderId = null;
let lastPlayedTime = 0;

function getAudio() {
  if (typeof window === 'undefined') return null;
  if (!audioInstance) {
    try {
      audioInstance = new Audio(notificationSound);
      audioInstance.preload = 'auto';
    } catch (err) {
      console.warn('Error inicializando Audio:', err);
    }
  }
  return audioInstance;
}

// Desbloquear audio en el primer toque de pantalla para sortear restricciones de autoplay
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const a = getAudio();
      if (a) {
        a.load();
      }
    } catch {}
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { once: true, passive: true });
  window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
}

export function isBaristaSoundEnabled() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('barista_sound_enabled') !== 'false';
}

export function setBaristaSoundEnabled(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('barista_sound_enabled', enabled ? 'true' : 'false');
}

export function isAndroidPlatform() {
  if (typeof window === 'undefined') return false;
  return (
    isAndroid() ||
    (typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent || ''))
  );
}

/**
 * Reproduce el sonido de notificación si es Android o si está en la pantalla Barista
 * @param {string} [orderId] - ID del pedido para evitar repeticiones múltiples
 * @param {boolean} [force=false] - Forzar reproducción sin chequear plataforma (ej: para botón de prueba)
 */
export function playBaristaNotificationSound(orderId = null, force = false) {
  if (!force && !isBaristaSoundEnabled()) return;

  const isAndroidDev = isAndroidPlatform();

  // Si no se fuerza, sólo debe sonar en Android o si está en la comanda barista
  if (!force && !isAndroidDev) {
    // Si es la PC de caja en pantalla principal, no hacemos sonar la campana
    const isBaristaScreen =
      typeof window !== 'undefined' &&
      (window.location.hash?.includes('barista') ||
        localStorage.getItem('current_screen') === 'barista' ||
        document.body.classList.contains('barista-active'));
    if (!isBaristaScreen) return;
  }

  const now = Date.now();
  if (orderId && orderId === lastPlayedOrderId && now - lastPlayedTime < 5000) {
    return; // Ya sonó para esta misma comanda en los últimos 5 segundos
  }

  if (orderId) {
    lastPlayedOrderId = orderId;
    lastPlayedTime = now;
  }

  try {
    const audio = getAudio();
    if (audio) {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          console.warn('Reproducción de audio bloqueada o falló:', err);
        });
      }
    }
  } catch (err) {
    console.warn('Error al reproducir notificación barista:', err);
  }
}
