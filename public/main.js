// public/main.js
const { app, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const log = require('electron-log');

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
    win.loadURL(
      `file://${path.join(__dirname, '../build/index.html')}?v=${Date.now()}`
    );
  }
}

// ======================================================
// IPC impresión (SILENT + 48mm + estilos)
// ======================================================
ipcMain.handle('print-ticket', async (_e, html) => {
  return new Promise(async (resolve, reject) => {
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
                width: 48000,   // 48mm
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

      await printWin.loadURL(
        'data:text/html;charset=utf-8,' + encodeURIComponent(html)
      );
    } catch (err) {
      reject(err);
    }
  });
});

// ======================================================
// App ready
// ======================================================
app.whenReady().then(() => {
  log.info('🚀 App iniciada', app.getVersion());

  createWindow();

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
