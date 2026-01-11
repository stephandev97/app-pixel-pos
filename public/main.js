// electron/main.js
const { app, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const log = require('electron-log');

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
      nodeIntegration: true,
      contextIsolation: false,
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
    win.loadFile(path.join(__dirname, '../build/index.html'));
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
