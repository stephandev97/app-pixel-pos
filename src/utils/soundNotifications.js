// src/utils/soundNotifications.js
import { notificationAudioDataUri } from '../assets/notificationBase64.js';

let audioInstance = null;
let audioContextInstance = null;
let decodedAudioBuffer = null;
let isDecodingPromise = null;
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
 * Convierte el Data URI en Base64 a ArrayBuffer para la Web Audio API
 */
function dataUriToArrayBuffer(dataUri) {
  const base64 = dataUri.split(',')[1];
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Decodifica y cachea el buffer PCM del archivo MP3 para reproducción instantánea con ganancia
 */
function getDecodedAudioBuffer(ctx) {
  if (decodedAudioBuffer) {
    return Promise.resolve(decodedAudioBuffer);
  }
  if (isDecodingPromise) {
    return isDecodingPromise;
  }

  isDecodingPromise = new Promise((resolve) => {
    try {
      const arrayBuffer = dataUriToArrayBuffer(notificationAudioDataUri);
      ctx.decodeAudioData(
        arrayBuffer.slice(0),
        (decoded) => {
          decodedAudioBuffer = decoded;
          resolve(decoded);
        },
        (err) => {
          console.warn('[Sound] decodeAudioData falló con callback:', err);
          resolve(null);
        }
      );
    } catch (e) {
      console.warn('[Sound] Error decodificando audio buffer:', e);
      resolve(null);
    }
  });

  return isDecodingPromise;
}

/**
 * Reproduce el audio MP3 decodificado con Amplificador de Ganancia (Loudness Booster 3.0x / +9.5 dB)
 * y Compresor Dinámico de Estudio para máxima presencia sin distorsión.
 */
async function playBoostedAudioBuffer() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    const buffer = await getDecodedAudioBuffer(ctx);
    if (!buffer) return false;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // 1) Refuerzo de Ganancia (Loudness Booster: 3.0x de volumen)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(3.0, ctx.currentTime);

    // 2) Compresor Dinámico (Mastering Limiter):
    // Maximiza el volumen percibido ("punch") y previene saturación en parlantes de tablet
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, ctx.currentTime);
    compressor.knee.setValueAtTime(8, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0.002, ctx.currentTime);
    compressor.release.setValueAtTime(0.2, ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(compressor);
    compressor.connect(ctx.destination);

    source.start(0);
    return true;
  } catch (err) {
    console.warn('[Sound] Falló reproducción Web Audio buffer:', err);
    return false;
  }
}

/**
 * Sintetizador de campana armónico potente de alta presencia (D5 a 587Hz -> A5 a 880Hz -> D6 a 1175Hz)
 * Optimizado para cortar el ruido de molinillos, cafeteras y licuadoras.
 */
export function playSynthesizedChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-10, now);
    compressor.knee.setValueAtTime(6, now);
    compressor.ratio.setValueAtTime(10, now);
    compressor.attack.setValueAtTime(0.002, now);
    compressor.release.setValueAtTime(0.25, now);
    compressor.connect(ctx.destination);

    const playTone = (freq, start, duration, gainVal = 0.9, type = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(compressor);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Tono 1: Cuerpo cálido y armónico (D5)
    playTone(587.33, now, 0.45, 0.95, 'sine');
    playTone(587.33 * 2, now, 0.35, 0.45, 'triangle'); // brillo armónico

    // Tono 2: Campana resonante (A5)
    playTone(880.0, now + 0.12, 0.75, 0.95, 'sine');
    playTone(880.0 * 2, now + 0.12, 0.5, 0.4, 'triangle');

    // Tono 3: Destello agudo final (D6)
    playTone(1174.66, now + 0.22, 0.6, 0.6, 'sine');
  } catch (err) {
    console.warn('[Sound] Error en sintetizador Web Audio API:', err);
  }
}

/**
 * Desbloquea el audio en la primera interacción del usuario (tap, touch, click, tecla)
 * y precarga el buffer decodificado en memoria RAM para reproducción instantánea.
 */
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        // Precargar el buffer decodificado en segundo plano
        getDecodedAudioBuffer(ctx).catch(() => {});
      }

      const a = getAudio();
      if (a) {
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
 * Reproduce el sonido de notificación barista con amplificación de volumen (Loudness Booster)
 * @param {string} [orderId] - ID del pedido para evitar repeticiones múltiples
 * @param {boolean} [force=false] - Forzar reproducción sin chequear pantalla (ej: botón de prueba)
 */
export async function playBaristaNotificationSound(orderId = null, force = false) {
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

  // 1) Intentar reproducción amplificada con Web Audio API (Ganancia 3.0x + Compresor)
  try {
    const success = await playBoostedAudioBuffer();
    if (success) {
      return;
    }
  } catch (err) {
    console.warn('[Sound] Error en playBoostedAudioBuffer:', err);
  }

  // 2) Si falló Web Audio buffer, intentar reproducir a través del elemento HTML5 Audio
  let htmlAudioSuccess = false;
  try {
    const audio = getAudio();
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        await playPromise;
        htmlAudioSuccess = true;
      }
    }
  } catch (err) {
    console.warn('[Sound] Error en HTML5 audio play:', err);
  }

  // 3) Fallback infalible: Sintetizador de campana de alta potencia
  if (!htmlAudioSuccess) {
    playSynthesizedChime();
  }
}

/**
 * Helper para botón de prueba explícito
 */
export function testBaristaSound() {
  console.log('[Sound] Probando sonido de notificación Barista con refuerzo de volumen...');
  playBaristaNotificationSound(null, true);
}
