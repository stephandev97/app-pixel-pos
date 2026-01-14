// electron/main.js
const { app, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const log = require('electron-log');

app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

if (process.platform === 'win32') {
  app.disableHardwareAcceleration();
}

// ======================================================
// Config básica
// ======================================================
const isDev = !app.isPackaged;
let win = null;

// Forzar escala 100% (clave para tickets / UI)
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', '1');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}
// ======================================================
// AutoUpdater (solo proceso principal)
// ======================================================
let autoUpdater = null;
try {
  if (process.type === 'browser') {
    autoUpdater = require('electron-updater').autoUpdater;
  }
} catch {
  autoUpdater = null;
}

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
    win.loadURL(
      `file://${path.join(__dirname, '../build/index.html')}?v=${Date.now()}`
    );
  }
}

// ======================================================
// IPC simples (sin impresión)
// ======================================================
ipcMain.handle('check-for-updates', async () => {
  try {
    if (!app.isPackaged || !autoUpdater) {
      return {
        updateAvailable: false,
        version: app.getVersion(),
        dev: true,
        message: 'Actualizaciones solo en app empaquetada.',
      };
    }

    const result = await autoUpdater.checkForUpdates();
    return {
      updateAvailable: result.updateInfo?.version !== app.getVersion(),
      version: result.updateInfo?.version,
    };
  } catch (err) {
    log.error('check-for-updates error:', err);
    return { error: err.message };
  }
});

ipcMain.on('quit-and-install', () => {
  if (!app.isPackaged || !autoUpdater) return;
  autoUpdater.quitAndInstall();
});

ipcMain.handle('print-ticket', async (e, html) => {
  console.log('[MAIN] print-ticket recibido');

  return new Promise(async (resolve, reject) => {
    const printWin = new BrowserWindow({
      show: false,
      width: 200,
      height: 600,
      webPreferences: {
        offscreen: true,
      },
    });

    const styledHtml = `
<!DOCTYPE html>
<html>
  <head>
    <base href="file://${path.join(__dirname, '../build/')}/" />
    <style>
      @page { margin: 0; }
      html, body {
        width: 48mm;
        margin: 0;
        padding: 0;
        background: white;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    </style>
  </head>
  ${html}
</html>
`;

    try {
      // 1) Registramos el listener ANTES de cargar
      printWin.webContents.once('did-finish-load', async () => {
        try {
          await printWin.webContents.executeJavaScript('document.fonts.ready');

          await printWin.webContents.setZoomFactor(1);
          await printWin.webContents.executeJavaScript(`document.body.style.zoom = "100%"`);


          printWin.webContents.print(
            {
              silent: true,
              printBackground: true,
              margins: { marginType: 'none' },

              // 👇 ESTO ES LA CLAVE
              pageSize: {
                width: 48000,   // micrones → 48mm
                height: 200000  // 200mm (ticket largo)
              },

              scaleFactor: 100
            },
            (success, error) => {
              console.log('[MAIN] print result:', success, error);
              printWin.destroy();
              if (!success) reject(error);
              else resolve(true);
            }
          );
        } catch (err) {
          console.error('[MAIN] print error', err);
          printWin.destroy();
          reject(err);
        }
      });

      // 2) Recién ahora cargamos el HTML
      await printWin.loadURL(
        'data:text/html;charset=utf-8,' + encodeURIComponent(styledHtml)
      );
    } catch (e) {
      console.error('[MAIN] loadURL error', e);
      reject(e);
    }
  });
});



// ======================================================
// App ready
// ======================================================
app.whenReady().then(async () => {
  log.info('🚀 App iniciada - versión', app.getVersion());

  createWindow();

  // Atajo DevTools
  try {
    globalShortcut.register('CommandOrControl+Shift+D', () => {
      if (!win) return;
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      } else {
        win.webContents.openDevTools();
      }
    });
  } catch (e) {
    log.error('Error registrando atajo DevTools:', e);
  }

  // AutoUpdater SOLO en producción
  if (app.isPackaged && autoUpdater) {
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';

    autoUpdater.on('checking-for-update', () => log.info('checking-for-update'));
    autoUpdater.on('update-available', (info) => log.info('update-available', info?.version));
    autoUpdater.on('update-not-available', () => log.info('update-not-available'));
    autoUpdater.on('error', (err) => log.error('update-error', err));

    autoUpdater.on('download-progress', (p) => {
      const percent = Math.round(p.percent);
      if (win?.webContents) {
        win.webContents.send('update-download-progress', percent);
      }
    });

    autoUpdater.on('update-downloaded', async () => {
      const r = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Reiniciar ahora', 'Luego'],
        defaultId: 0,
        message: 'Hay una nueva versión descargada. ¿Reiniciar para instalarla?',
      });
      if (r.response === 0) autoUpdater.quitAndInstall();
    });

    setImmediate(() => autoUpdater.checkForUpdatesAndNotify());
    setInterval(() => autoUpdater.checkForUpdates(), 30 * 60 * 1000);
  }
});

// ======================================================
// Cierres y errores
// ======================================================
process.on('uncaughtException', (e) => log.error('uncaughtException:', e));
process.on('unhandledRejection', (e) => log.error('unhandledRejection:', e));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
