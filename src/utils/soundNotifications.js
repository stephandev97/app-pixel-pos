// src/utils/soundNotifications.js
import { notificationAudioDataUri } from '../assets/notificationBase64';

let audioInstance = null;
let audioContextInstance = null;
let lastPlayedOrderId = null;
let lastPlayedTime = 0;
let isBaristaScreenActiveFlag = false;

/**
 * Retorna true si la app se ejecuta dentro de Electron (PC de Caja)
 */
export function isElectronHost() {
  return typeof window !== 'undefined' && Boolean(window.electron?.ipcRenderer);
}

/**
 * Obtiene o inicializa la instancia de Audio HTML5 usando el Data URI en Base64
 */
function getAudio() {
  if (typeof window === 'undefined') return null;
  if (!audioInstance) {
    try {
      audioInstance = new Audio(notificationAudioDataUri);
      audioInstance.preload = 'auto';
      audioInstance.volume = 1.0;
    } catch (err) {
      console.warn('[Sound] Error inicializando HTML Audio:', err);
    }
  }
  return audioInstance;
}

/**
 * Obtiene o inicializa el AudioContext para la Web Audio API
 */
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioContextInstance) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      try {
        audioContextInstance = new AudioCtx();
      } catch (err) {
        console.warn('[Sound] Error creando AudioContext:', err);
      }
    }
  }
  return audioContextInstance;
}

/**
 * Sintetizador de campana / chime armónico de doble tono como respaldo infalible
 * (Tono D5 a 587.33 Hz seguido de A5 a 880.00 Hz)
 */
export function playSynthesizedChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const playTone = (freq, start, duration, gainVal = 0.4) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Tono 1: agudo claro
    playTone(587.33, now, 0.4, 0.35);
    // Tono 2: campana resonante
    playTone(880.0, now + 0.12, 0.65, 0.4);
  } catch (err) {
    console.warn('[Sound] Error en sintetizador Web Audio API:', err);
  }
}

/**
 * Desbloquea el audio en la primera interacción del usuario (tap, touch, click, tecla)
 * para cumplir la política de Autoplay en Android WebView y navegadores modernos.
 */
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const a = getAudio();
      if (a) {
        // Ejecución breve y silenciosa para autorizar el elemento en el WebView
        a.volume = 0.01;
        const p = a.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            a.pause();
            a.currentTime = 0;
            a.volume = 1.0;
          }).catch(() => {
            a.volume = 1.0;
          });
        }
      }
    } catch {}

    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('touchend', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('touchend', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

export function isBaristaSoundEnabled() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('barista_sound_enabled') !== 'false';
}

export function setBaristaSoundEnabled(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('barista_sound_enabled', enabled ? 'true' : 'false');
}

/**
 * Registra si la pantalla Barista está activa actualmente en este dispositivo
 */
export function setBaristaScreenActive(active) {
  isBaristaScreenActiveFlag = Boolean(active);
  if (typeof document !== 'undefined') {
    if (active) {
      document.body.classList.add('barista-active');
    } else {
      document.body.classList.remove('barista-active');
    }
  }
}

export function isBaristaScreenActive() {
  return (
    isBaristaScreenActiveFlag ||
    (typeof document !== 'undefined' && document.body.classList.contains('barista-active'))
  );
}

/**
 * Reproduce el sonido de notificación barista
 * @param {string} [orderId] - ID del pedido para evitar repeticiones múltiples
 * @param {boolean} [force=false] - Forzar reproducción sin chequear pantalla (ej: botón de prueba)
 */
export function playBaristaNotificationSound(orderId = null, force = false) {
  if (!force && !isBaristaSoundEnabled()) {
    return;
  }

  // Si no se fuerza:
  // Si estamos en la PC de caja (Electron) y NO estamos en la pantalla barista,
  // no hacemos sonar la campana para no interrumpir al cajero mientras cobra.
  if (!force && isElectronHost() && !isBaristaScreenActive()) {
    return;
  }

  // En dispositivos clientes (Tablet Android) o cuando se está viendo la comanda Barista,
  // siempre debe sonar.
  const now = Date.now();
  if (orderId && orderId === lastPlayedOrderId && now - lastPlayedTime < 4000) {
    return;
  }

  if (orderId) {
    lastPlayedOrderId = orderId;
    lastPlayedTime = now;
  }

  // 1) Intentar reproducir el MP3 en Base64
  let playSuccess = false;
  try {
    const audio = getAudio();
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            playSuccess = true;
          })
          .catch((err) => {
            console.warn('[Sound] Reproducción HTML5 bloqueada, ejecutando sintetizador fallback:', err);
            playSynthesizedChime();
          });
        return;
      }
      playSuccess = true;
    }
  } catch (err) {
    console.warn('[Sound] Error al reproducir audio HTML5:', err);
  }

  // 2) Fallback inmediato si HTML5 no estuvo disponible
  if (!playSuccess) {
    playSynthesizedChime();
  }
}

/**
 * Helper para botón de prueba explícito
 */
export function testBaristaSound() {
  console.log('[Sound] Probando sonido de notificación Barista...');
  playBaristaNotificationSound(null, true);
}
