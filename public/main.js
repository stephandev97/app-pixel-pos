// public/main.js
const { app, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const os = require('os');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server || WebSocket.WebSocketServer;
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Evita bugs raros de Chromium en Linux
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.setAppUserModelId('com.pixelhelados.pos');

// Optimización de renderizado GPU y fluidez
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('disable-gpu-sandbox');
}

const isDev = !app.isPackaged;
let win = null;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  log.warn('Ya hay otra instancia de la app corriendo. Cerrando esta instancia...');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

// ======================================================
// Crear ventana principal
// ======================================================
function createWindow() {
  const iconPath = isDev
    ? path.join(__dirname, '../assets/icon.ico')
    : path.join(__dirname, 'favicon.ico');

  win = new BrowserWindow({
    width: 550,
    height: 800,
    useContentSize: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: false, // Custom title bar
    // titleBarStyle hidden/overlay removed to avoid native controls
  });

  win.webContents.setVisualZoomLevelLimits(1, 1);
  win.webContents.on('did-finish-load', () => {
    win.webContents.setZoomFactor(1);
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadURL(`file://${path.join(__dirname, '../build/index.html')}?v=${Date.now()}`);
  }

  win.on('closed', () => {
    win = null;
    app.quit();
  });
}
// ======================================================
// Window Controls
// ======================================================
ipcMain.handle('minimize-window', () => {
  if (win) win.minimize();
});

ipcMain.handle('close-window', () => {
  if (win) {
    try {
      win.destroy();
    } catch {
      void 0;
    }
    win = null;
  }
  app.quit();
});

// ======================================================
// Búsqueda Web con IA para Recetas de Cafetería
// ======================================================
ipcMain.handle('search-recipe-web', async (_e, query) => {
  try {
    const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetchFn(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) return { snippets: [] };
    const html = await res.text();
    const snippets = [];
    const regex = /<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      snippets.push(match[1].replace(/<[^>]+>/g, '').trim());
    }
    return { snippets };
  } catch (err) {
    log.warn('Error en search-recipe-web:', err);
    return { snippets: [] };
  }
});

// ======================================================
// IPC impresión (SILENT + 48mm + estilos)
// ======================================================
ipcMain.handle('print-ticket', async (_e, html) => {
  return new Promise((resolve, reject) => {
    const printWin = new BrowserWindow({
      show: false,
      width: 200,
      height: 600,
      webPreferences: {
        offscreen: true,
      },
    });

    try {
      printWin.webContents.once('did-finish-load', async () => {
        try {
          await printWin.webContents.executeJavaScript('document.fonts.ready');
          await printWin.webContents.setZoomFactor(1);

          printWin.webContents.print(
            {
              silent: true,
              printBackground: true,
              margins: { marginType: 'none' },
              pageSize: {
                width: 48000, // 48mm
                height: 200000, // ticket largo
              },
              scaleFactor: 100,
            },
            (success, error) => {
              printWin.destroy();
              if (!success) reject(error);
              else resolve(true);
            }
          );
        } catch (err) {
          printWin.destroy();
          reject(err);
        }
      });

      let fontStyle = '';
      try {
        const fontPath = isDev
          ? path.join(__dirname, 'fonts', 'Inter.ttf')
          : path.join(__dirname, '../build/fonts/Inter.ttf');
        const fontBuf = fs.readFileSync(fontPath);
        const dataUri = 'data:font/ttf;base64,' + fontBuf.toString('base64');
        fontStyle =
          "<style>@font-face{font-family:Inter;src:url('" +
          dataUri +
          "');font-weight:100 900;font-style:normal;font-display:swap;}html,body{font-family:Inter,sans-serif;}</style>";
      } catch {
        void 0;
      }

      const baseHref = isDev
        ? 'http://localhost:3000/'
        : 'file://' + path.join(__dirname, '../build/') + '/';
      const baseTag = '<base href="' + baseHref + '">';
      let augmentedHtml = html;
      if (/<head[^>]*>/i.test(augmentedHtml)) {
        augmentedHtml = augmentedHtml.replace(/<head([^>]*)>/i, '<head$1>' + baseTag + fontStyle);
      } else {
        augmentedHtml =
          '<!DOCTYPE html><html><head>' +
          baseTag +
          fontStyle +
          '</head><body>' +
          augmentedHtml +
          '</body></html>';
      }

      printWin
        .loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(augmentedHtml))
        .catch((err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
});

// ======================================================
// Actualizaciones (electron-updater)
// ======================================================
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

let updateReady = false;

const performQuitAndInstall = () => {
  log.info('🔄 Ejecutando autoUpdater.quitAndInstall()...');
  // Desactivar autoInstallOnAppQuit para evitar doble invocación
  autoUpdater.autoInstallOnAppQuit = false;
  setImmediate(() => {
    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (err) {
      log.error('Error durante autoUpdater.quitAndInstall:', err);
      app.quit();
    }
  });
};

autoUpdater.on('download-progress', (p) => {
  try {
    win?.webContents?.send('update-progress', Math.round(p?.percent ?? 0));
  } catch {
    void 0;
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('✅ Actualización descargada:', info);
  updateReady = true;
  try {
    win?.webContents?.send('update-ready');

    dialog
      .showMessageBox({
        type: 'info',
        title: 'Actualización Disponible',
        message:
          'Una nueva versión de la aplicación ha sido descargada. ¿Deseas reiniciar la aplicación para instalarla ahora?',
        buttons: ['Reiniciar e Instalar', 'Más tarde'],
        defaultId: 0,
        cancelId: 1,
      })
      .then((result) => {
        if (result.response === 0) {
          log.info('Usuario aceptó reiniciar e instalar desde el diálogo.');
          performQuitAndInstall();
        }
      })
      .catch((err) => {
        log.error('Error en showMessageBox de actualización:', err);
      });
  } catch (err) {
    log.error('Error in update-downloaded handler:', err);
  }
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    const info = result?.updateInfo;
    if (info && info.version && info.version !== app.getVersion()) {
      return { updateAvailable: true, version: info.version };
    }
    return { updateAvailable: false };
  } catch (e) {
    return { error: e?.message || String(e) };
  }
});

ipcMain.on('quit-and-install', () => {
  log.info('Evento IPC quit-and-install recibido (on)');
  if (updateReady) {
    performQuitAndInstall();
  } else {
    autoUpdater
      .downloadUpdate()
      .then(() => performQuitAndInstall())
      .catch((err) => {
        log.error('Error al descargar update antes de instalar:', err);
        app.quit();
      });
  }
});

ipcMain.handle('quit-and-install', () => {
  log.info('Evento IPC quit-and-install recibido (handle)');
  if (updateReady) {
    performQuitAndInstall();
  } else {
    autoUpdater
      .downloadUpdate()
      .then(() => performQuitAndInstall())
      .catch((err) => {
        log.error('Error al descargar update antes de instalar:', err);
        app.quit();
      });
  }
  return true;
});

// ======================================================
// Servidor de Sincronización LAN (Caja PC -> Tablet Barista)
// ======================================================
const LAN_PORT = 8085;
let lanHttpServer = null;
let lanWss = null;
let lanOrdersCache = [];

function getLanIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    const lowerName = name.toLowerCase();
    const isVirtual =
      lowerName.includes('radmin') ||
      lowerName.includes('vpn') ||
      lowerName.includes('virtual') ||
      lowerName.includes('vmware') ||
      lowerName.includes('vbox') ||
      lowerName.includes('wsl') ||
      lowerName.includes('pseudo') ||
      lowerName.includes('teredo') ||
      lowerName.includes('tailscale') ||
      lowerName.includes('zerotier');

    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const isRadminIp = iface.address.startsWith('26.');
        const isVirtualAdapter = isVirtual || isRadminIp;
        const isRecommended =
          !isVirtualAdapter &&
          (iface.address.startsWith('192.168.') ||
            iface.address.startsWith('10.') ||
            iface.address.startsWith('172.'));

        ips.push({
          name,
          address: iface.address,
          isVirtual: isVirtualAdapter,
          isRecommended,
        });
      }
    }
  }

  // Ordenar: primero las recomendadas (Ethernet/Wi-Fi reales)
  ips.sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    if (!a.isVirtual && b.isVirtual) return -1;
    if (a.isVirtual && !b.isVirtual) return 1;
    return 0;
  });

  return ips;
}

function broadcastLan(data, excludeWs = null) {
  if (!lanWss) return;
  const payload = JSON.stringify(data);
  lanWss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        log.warn('Error enviando mensaje a cliente LAN:', err);
      }
    }
  });
}

function startLanServer() {
  try {
    lanHttpServer = http.createServer((req, res) => {
      // CORS headers para permitir peticiones desde la WebView de Android / Navegador
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;

      if (pathname === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'ok',
            name: 'pixel-pos-lan-server',
            port: LAN_PORT,
            ips: getLanIps(),
            version: app.getVersion(),
            connectedClients: lanWss ? lanWss.clients.size : 0,
          })
        );
        return;
      }

      if (pathname === '/api/orders/today' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            orders: lanOrdersCache,
          })
        );
        return;
      }

      if (pathname === '/api/orders/barista-status' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const { id, baristaDone } = data;
            if (id) {
              const existing = lanOrdersCache.find((o) => o.id === id);
              if (existing) {
                existing.baristaDone = Boolean(baristaDone);
              }
              win?.webContents?.send('lan-barista-status', { id, baristaDone: Boolean(baristaDone) });
              broadcastLan({ type: 'BARISTA_STATUS', id, baristaDone: Boolean(baristaDone) });
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
          }
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    lanWss = new WebSocketServer({ server: lanHttpServer });

    lanWss.on('connection', (ws, req) => {
      const clientIp = req.socket.remoteAddress;
      log.info(`[LAN Server] Cliente conectado desde: ${clientIp}`);

      // Enviar bienvenida y órdenes actuales al nuevo cliente conectado
      try {
        ws.send(
          JSON.stringify({
            type: 'CONNECTED',
            orders: lanOrdersCache,
            ips: getLanIps(),
          })
        );
      } catch (e) {
        log.warn('[LAN Server] Error al enviar saludo inicial:', e);
      }

      // Notificar al renderer de Electron sobre el cambio en cantidad de clientes
      win?.webContents?.send('lan-clients-updated', lanWss.clients.size);

      ws.on('message', (msgStr) => {
        try {
          const data = JSON.parse(msgStr.toString());
          if (data.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG' }));
            return;
          }

          if (data.type === 'BARISTA_STATUS') {
            const { id, baristaDone } = data;
            if (id) {
              const existing = lanOrdersCache.find((o) => o.id === id);
              if (existing) {
                existing.baristaDone = Boolean(baristaDone);
              }
              win?.webContents?.send('lan-barista-status', { id, baristaDone: Boolean(baristaDone) });
              broadcastLan({ type: 'BARISTA_STATUS', id, baristaDone: Boolean(baristaDone) }, ws);
            }
          }
        } catch (err) {
          log.warn('[LAN Server] Error procesando mensaje de cliente:', err);
        }
      });

      ws.on('close', () => {
        log.info(`[LAN Server] Cliente desconectado: ${clientIp}`);
        win?.webContents?.send('lan-clients-updated', lanWss ? lanWss.clients.size : 0);
      });

      ws.on('error', (err) => {
        log.warn('[LAN Server] Error en socket de cliente:', err);
      });
    });

    lanHttpServer.listen(LAN_PORT, '0.0.0.0', () => {
      log.info(`[LAN Server] Servidor local iniciado en puerto ${LAN_PORT}`);
    });

    lanHttpServer.on('error', (err) => {
      log.error('[LAN Server] Error en servidor HTTP/WS:', err);
    });
  } catch (err) {
    log.error('[LAN Server] No se pudo inicializar servidor LAN:', err);
  }
}

// IPC Handlers para Sincronización LAN
ipcMain.handle('get-lan-server-info', () => {
  const ips = getLanIps();
  const rec = ips.find((i) => i.isRecommended)?.address || (ips[0]?.address ?? '');
  return {
    running: Boolean(lanHttpServer && lanHttpServer.listening),
    port: LAN_PORT,
    ips,
    recommendedIp: rec,
    clientCount: lanWss ? lanWss.clients.size : 0,
  };
});

ipcMain.handle('open-firewall-port', async () => {
  log.info('[LAN Server] Solicitando apertura de firewall en puerto 8085...');
  try {
    const { exec } = require('child_process');
    // Ejecuta el comando de firewall con elevación UAC en Windows
    const cmd = `powershell -NoProfile -Command "Start-Process cmd -ArgumentList '/c netsh advfirewall firewall add rule name=\\\"PixelPOS LAN Sync\\\" dir=in action=allow protocol=TCP localport=8085 profile=any & timeout /t 3' -Verb RunAs"`;
    exec(cmd);
    return { ok: true };
  } catch (err) {
    log.error('[LAN Server] Error abriendo firewall:', err);
    return { ok: false, error: String(err) };
  }
});

ipcMain.on('lan-sync-orders-cache', (_e, orders) => {
  if (Array.isArray(orders)) {
    lanOrdersCache = orders;
  }
});

ipcMain.on('lan-broadcast-new-order', (_e, order) => {
  if (!order) return;
  const idx = lanOrdersCache.findIndex(
    (o) => (o.id && o.id === order.id) || (order.clientCreatedAt && o.clientCreatedAt === order.clientCreatedAt)
  );
  if (idx >= 0) {
    lanOrdersCache[idx] = { ...lanOrdersCache[idx], ...order };
  } else {
    lanOrdersCache.unshift(order);
  }
  broadcastLan({ type: 'NEW_ORDER', order });
});

ipcMain.on('lan-broadcast-update-order', (_e, order) => {
  if (!order) return;
  const idx = lanOrdersCache.findIndex(
    (o) => (o.id && o.id === order.id) || (order.clientCreatedAt && o.clientCreatedAt === order.clientCreatedAt)
  );
  if (idx >= 0) {
    lanOrdersCache[idx] = { ...lanOrdersCache[idx], ...order };
  } else {
    lanOrdersCache.unshift(order);
  }
  broadcastLan({ type: 'UPDATE_ORDER', order });
});

ipcMain.on('lan-broadcast-delete-order', (_e, { id }) => {
  if (!id) return;
  lanOrdersCache = lanOrdersCache.filter((o) => o.id !== id);
  broadcastLan({ type: 'DELETE_ORDER', id });
});

// ======================================================
// App ready
// ======================================================
app.whenReady().then(() => {
  log.info('🚀 App iniciada', app.getVersion());

  createWindow();
  startLanServer();

  // Chequear actualizaciones cada 10 minutos
  setInterval(
    () => {
      try {
        log.info('🔄 Buscando actualizaciones (intervalo 10m)...');
        autoUpdater.checkForUpdates().catch((err) => {
          log.error('Error buscando actualizaciones en intervalo:', err);
        });
      } catch (e) {
        log.error('Error iniciando chequeo de actualizaciones:', e);
      }
    },
    10 * 60 * 1000
  );

  // Buscar actualizaciones al iniciar también
  try {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 5000); // Esperar 5s para no bloquear inicio
  } catch {
    void 0;
  }

  // Atajo DevTools
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (!win) return;
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools();
    }
  });

  // Atajos para recargar la ventana en desarrollo
  globalShortcut.register('CommandOrControl+R', () => {
    if (win) win.webContents.reloadIgnoringCache();
  });
  globalShortcut.register('F5', () => {
    if (win) win.webContents.reloadIgnoringCache();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
