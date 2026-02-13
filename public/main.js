// public/main.js
const { app, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Evita bugs raros de Chromium en Linux
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

if (process.platform === 'win32') {
  app.disableHardwareAcceleration();
}

const isDev = !app.isPackaged;
let win = null;

// ======================================================
// Crear ventana principal
// ======================================================
function createWindow() {
  win = new BrowserWindow({
    width: 556,
    height: 800,
    useContentSize: true,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
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
}

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
          "');font-weight:100 900;font-style:normal;font-display:swap;}html,body,*{font-family:Inter,sans-serif;}</style>";
      } catch { void 0; }

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
autoUpdater.on('download-progress', (p) => {
  try {
    win?.webContents?.send('update-progress', p?.percent ?? 0);
  } catch { void 0; }
});
autoUpdater.on('update-downloaded', () => {
  updateReady = true;
  try {
    win?.webContents?.send('update-ready');
    // Instalar inmediatamente como solicitado
    autoUpdater.quitAndInstall();
  } catch { void 0; }
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    const info = result?.updateInfo;
    if (info && info.version && info.version !== app.getVersion()) {
      // autoDownload está activo, así que no es necesario llamar a downloadUpdate explícitamente,
      // pero lo dejamos por si acaso o para feedback inmediato en chequeo manual
      return { updateAvailable: true, version: info.version };
    }
    return { updateAvailable: false };
  } catch (e) {
    return { error: e?.message || String(e) };
  }
});

ipcMain.on('quit-and-install', () => {
  try {
    if (updateReady) {
      autoUpdater.quitAndInstall();
    } else {
      autoUpdater
        .downloadUpdate()
        .then(() => {
          try {
            autoUpdater.quitAndInstall();
          } catch {
            app.quit();
          }
        })
        .catch(() => app.quit());
    }
  } catch {
    app.quit();
  }
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
  } catch { void 0; }

  // Atajo DevTools
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (!win) return;
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
