import { useEffect, useState } from 'react';
import { removeOrderById, upsertOrder } from '../redux/orders/ordersSlice';
import { isBaristaOrder } from './cafeStockSync';
import { playBaristaNotificationSound } from './soundNotifications';

const LAN_IP_KEY = 'pixel_lan_server_ip';
const DEFAULT_PORT = 8085;

let reduxDispatch = null;
let activeWs = null;
let reconnectTimer = null;
let listeners = new Set();
let isConnectedState = false;
let clientCountState = 0;
let serverInfoState = null;

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function isElectronHost() {
  return typeof window !== 'undefined' && Boolean(window.electron?.ipcRenderer);
}

export function getSavedLanServerIp() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LAN_IP_KEY) || '';
}

export function saveLanServerIp(ip) {
  const clean = (ip || '').trim().replace(/^https?:\/\//i, '').replace(/^ws:\/\//i, '').replace(/:\d+$/, '');
  if (typeof window !== 'undefined') {
    if (clean) {
      localStorage.setItem(LAN_IP_KEY, clean);
    } else {
      localStorage.removeItem(LAN_IP_KEY);
    }
  }
  notifyListeners();
  if (!isElectronHost()) {
    connectLanClient();
  }
  return clean;
}

// -------------------------------------------------------------
// Probar conexión a una IP dada
// -------------------------------------------------------------
export async function testLanConnection(targetIp) {
  const host = (targetIp || getSavedLanServerIp() || '').trim().replace(/^https?:\/\//i, '').replace(/^ws:\/\//i, '').replace(/:\d+$/, '');
  if (!host) {
    return { ok: false, error: 'Dirección IP no especificada' };
  }

  const url = `http://${host}:${DEFAULT_PORT}/api/status`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }
    return { ok: false, error: `Servidor respondió con código ${res.status}` };
  } catch (err) {
    return { ok: false, error: err.name === 'AbortError' ? 'Tiempo de espera agotado' : 'No se pudo conectar con la IP' };
  }
}

// -------------------------------------------------------------
// Inicialización global con Redux store dispatch
// -------------------------------------------------------------
export function initLanSync(dispatch) {
  reduxDispatch = dispatch;

  if (isElectronHost()) {
    // Modo Servidor (PC de Caja)
    window.electron.ipcRenderer.invoke('get-lan-server-info')
      .then((info) => {
        serverInfoState = info;
        notifyListeners();
      })
      .catch((e) => console.warn('Error obteniendo info servidor LAN:', e));

    window.electron.ipcRenderer.on('lan-clients-updated', (_e, count) => {
      clientCountState = count;
      notifyListeners();
    });

    window.electron.ipcRenderer.on('lan-barista-status', (_e, { id, baristaDone }) => {
      if (reduxDispatch && id) {
        reduxDispatch(upsertOrder({ id, baristaDone: Boolean(baristaDone) }));
        if (baristaDone) {
          localStorage.setItem(`barista-prepared-${id}`, 'true');
        } else {
          localStorage.removeItem(`barista-prepared-${id}`);
        }
      }
    });
  } else {
    // Modo Cliente (Tablet Android / Navegador)
    connectLanClient();
  }
}

// -------------------------------------------------------------
// Conexión del cliente WebSocket (Tablet)
// -------------------------------------------------------------
export function connectLanClient() {
  if (isElectronHost()) return;
  if (activeWs) {
    try {
      activeWs.close();
    } catch {}
    activeWs = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  const host = getSavedLanServerIp();
  if (!host) {
    isConnectedState = false;
    notifyListeners();
    return;
  }

  const wsUrl = `ws://${host}:${DEFAULT_PORT}`;
  try {
    const ws = new WebSocket(wsUrl);
    activeWs = ws;

    ws.onopen = () => {
      console.log(`[LAN Client] Conectado exitosamente a ${wsUrl}`);
      isConnectedState = true;
      notifyListeners();

      // Solicitar órdenes del día por HTTP para asegurar sincronización completa inicial
      fetch(`http://${host}:${DEFAULT_PORT}/api/orders/today`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.ok && Array.isArray(data.orders) && reduxDispatch) {
            data.orders.forEach((o) => {
              reduxDispatch(upsertOrder(o));
            });
          }
        })
        .catch((e) => console.warn('[LAN Client] Error descargando órdenes iniciales:', e));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (!reduxDispatch) return;

        if (msg.type === 'CONNECTED') {
          if (Array.isArray(msg.orders)) {
            msg.orders.forEach((o) => reduxDispatch(upsertOrder(o)));
          }
        } else if (msg.type === 'NEW_ORDER' || msg.type === 'UPDATE_ORDER') {
          if (msg.order) {
            reduxDispatch(upsertOrder(msg.order));
            if (msg.type === 'NEW_ORDER' && isBaristaOrder(msg.order)) {
              playBaristaNotificationSound(msg.order.id);
            }
          }
        } else if (msg.type === 'DELETE_ORDER') {
          if (msg.id) {
            reduxDispatch(removeOrderById({ id: msg.id }));
          }
        } else if (msg.type === 'BARISTA_STATUS') {
          const { id, baristaDone } = msg;
          if (id) {
            reduxDispatch(upsertOrder({ id, baristaDone: Boolean(baristaDone) }));
            if (baristaDone) {
              localStorage.setItem(`barista-prepared-${id}`, 'true');
            } else {
              localStorage.removeItem(`barista-prepared-${id}`);
            }
          }
        }
      } catch (err) {
        console.warn('[LAN Client] Error parseando mensaje WebSocket:', err);
      }
    };

    ws.onclose = () => {
      isConnectedState = false;
      notifyListeners();
      // Reintentar en 3 segundos
      reconnectTimer = setTimeout(() => {
        connectLanClient();
      }, 3000);
    };

    ws.onerror = () => {
      isConnectedState = false;
      notifyListeners();
      try {
        ws.close();
      } catch {}
    };
  } catch (e) {
    console.warn('[LAN Client] No se pudo instanciar WebSocket:', e);
    isConnectedState = false;
    notifyListeners();
    reconnectTimer = setTimeout(() => {
      connectLanClient();
    }, 4000);
  }
}

// -------------------------------------------------------------
// Emisores de eventos
// -------------------------------------------------------------
export function sendLanBaristaStatus(id, baristaDone) {
  if (!id) return;

  if (isElectronHost()) {
    // Estamos en la PC: Electron ya hace broadcast al actualizar
    return;
  }

  // Estamos en la Tablet: enviar por WebSocket si está abierto
  if (activeWs && activeWs.readyState === WebSocket.OPEN) {
    try {
      activeWs.send(JSON.stringify({ type: 'BARISTA_STATUS', id, baristaDone: Boolean(baristaDone) }));
      return;
    } catch {}
  }

  // Fallback por HTTP POST si WS no estaba listo
  const host = getSavedLanServerIp();
  if (host) {
    fetch(`http://${host}:${DEFAULT_PORT}/api/orders/barista-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, baristaDone: Boolean(baristaDone) }),
    }).catch(() => {});
  }
}

export function broadcastLanOrder(order, action = 'new') {
  if (isElectronHost()) {
    const channel =
      action === 'delete'
        ? 'lan-broadcast-delete-order'
        : action === 'update'
          ? 'lan-broadcast-update-order'
          : 'lan-broadcast-new-order';
    try {
      window.electron.ipcRenderer.send(channel, order);
    } catch (e) {
      console.warn('Error emitiendo orden a Electron LAN:', e);
    }
  }
}

export function syncLanOrdersCache(orders) {
  if (isElectronHost() && Array.isArray(orders)) {
    try {
      window.electron.ipcRenderer.send('lan-sync-orders-cache', orders);
    } catch {}
  }
}

// -------------------------------------------------------------
// React Hook para componentes
// -------------------------------------------------------------
export function useLanSync() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    listeners.add(update);
    return () => listeners.delete(update);
  }, []);

  return {
    isServer: isElectronHost(),
    serverInfo: serverInfoState,
    isConnected: isElectronHost() ? true : isConnectedState,
    clientCount: clientCountState,
    serverIp: getSavedLanServerIp(),
    setServerIp: saveLanServerIp,
    testConnection: testLanConnection,
    reconnect: connectLanClient,
  };
}
