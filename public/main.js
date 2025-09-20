const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

let win; // 👈 referencia global

function createWindow() {
  win = new BrowserWindow({
    width: 556,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000'); // CRA/Vite dev server
    win.webContents.openDevTools();
  } else {
    // OJO: este archivo vive en /public; por eso apuntamos a ../build
    win.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

app.whenReady().then(async () => {
  createWindow();

  // Limpiar caché y recargar SIN caché (ahora win existe)
  try {
    await win.webContents.session.clearCache();
    win.webContents.reloadIgnoringCache();
  } catch (e) {
    const log = require('electron-log');
    log.error('No se pudo limpiar caché:', e);
  }

  // Auto-updates solo cuando está empaquetado
  if (app.isPackaged) {
    const { autoUpdater } = require('electron-updater');

    const log = require('electron-log');
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';

    // IMPORTANTE si tu release en GitHub está como Pre-release:
    autoUpdater.allowPrerelease = true; // quítalo si publicás releases normales
    autoUpdater.autoDownload = true; // explícito, aunque ya es true por defecto

    autoUpdater.on('checking-for-update', () => log.info('checking-for-update'));
    autoUpdater.on('update-available', (info) => log.info('update-available', info?.version));
    autoUpdater.on('update-not-available', () => log.info('update-not-available'));
    autoUpdater.on('error', (err) => log.error('update-error', err));
    autoUpdater.on('download-progress', (p) =>
      log.info('download-progress', Math.round(p.percent) + '%')
    );

    autoUpdater.on('update-downloaded', async () => {
      const r = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Reiniciar ahora', 'Luego'],
        defaultId: 0,
        message: 'Hay una nueva versión descargada. ¿Reiniciar para instalarla?',
      });
      if (r.response === 0) autoUpdater.quitAndInstall();
    });

    // Hacer el primer check apenas todo está listo
    setImmediate(async () => {
      try {
        await autoUpdater.checkForUpdatesAndNotify();
      } catch (e) {
        log.error('Fallo al chequear updates:', e);
      }
    });
    // Y luego cada 30'
    setInterval(() => autoUpdater.checkForUpdates(), 30 * 60 * 1000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
