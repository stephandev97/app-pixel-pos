// public/main.js
const { app, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
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
// App ready
// ======================================================
app.whenReady().then(() => {
  log.info('🚀 App iniciada', app.getVersion());

  createWindow();

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
