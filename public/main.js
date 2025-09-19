const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 556,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

app.whenReady().then(async () => {
  createWindow();

  // ✅ Updates sólo cuando está empaquetado
  if (app.isPackaged) {
    const { autoUpdater } = require('electron-updater');

    // Opcional: permitir pre-releases si usás “Pre-release” en GitHub
    // autoUpdater.allowPrerelease = true;

    // Mostrar logs básicos en consola
    autoUpdater.logger = require('electron-log');
    autoUpdater.logger.transports.file.level = 'info';

    // Eventos útiles
    autoUpdater.on('checking-for-update', () => console.log('Buscando update...'));
    autoUpdater.on('update-available', (info) => console.log('Update disponible:', info.version));
    autoUpdater.on('update-not-available', () => console.log('Sin updates'));
    autoUpdater.on('error', (err) => console.error('Updater error:', err));
    autoUpdater.on('download-progress', (p) => console.log(`Descargando: ${Math.round(p.percent)}%`));
    autoUpdater.on('update-downloaded', async () => {
      const r = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Reiniciar ahora', 'Luego'],
        defaultId: 0,
        message: 'Hay una nueva versión descargada. ¿Reiniciar para instalarla?'
      });
      if (r.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });

    // 🔎 Buscar y descargar automáticamente
    try {
      await autoUpdater.checkForUpdatesAndNotify();
      // Opcional: volver a chequear cada cierto tiempo (ej. 30 min)
      setInterval(() => autoUpdater.checkForUpdates(), 30 * 60 * 1000);
    } catch (e) {
      console.error('Fallo al chequear updates:', e);
    }
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });