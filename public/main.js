// electron/main.cjs
const { app, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const log = require('electron-log');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const Jimp = require('jimp');

console.log('process.type =', process.type); // Debe imprimir "browser" en la consola de Electron

log.transports.file.level = 'info';
log.info('🚀 App iniciada - versión', app.getVersion());

app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('force-device-scale-factor', '1'); // lock 100% escala

const isDev = !app.isPackaged;
let win;

// ⚠️ Require defensivo del autoUpdater: solo en proceso principal
let autoUpdater = null;
try {
  if (process && process.type === 'browser') {
    autoUpdater = require('electron-updater').autoUpdater;
  }
} catch (e) {
  // ignorar: en renderer esto revienta; por eso lo protegemos
}

// === ESC/POS helpers ===
const moneyAR = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(n || 0));

function formatTicketText(order, { font = 'B' } = {}) {
  // 58 mm: aprox 32 cols (Font A 12x24) o 42 cols (Font B 9x17)
  const COLS = font === 'A' ? 32 : 42;
  const cut = (s = '') => String(s).slice(0, COLS);
  const hr = '-'.repeat(COLS);
  const padEnd = (l, r) => cut(l + ' '.repeat(Math.max(0, COLS - l.length - r.length)) + r);

  const lines = [];
  // cabecera (ajustá a tu marca)
  lines.push(cut('PIXEL'));
  lines.push(cut(order?.direccion || 'Retiro'));
  lines.push(hr);

  // items
  (order?.items || []).forEach((it) => {
    const qty = Number(it?.quantity ?? it?.qty ?? 1);
    const name = String(it?.name || '').trim();
    lines.push(cut(`${qty} x ${name}`));
    if (Array.isArray(it?.sabores)) {
      it.sabores.filter(Boolean).forEach((s) => lines.push(cut('  • ' + s)));
    }
  });

  lines.push(hr);

  // totales + pago
  const total = Number(order?.total || 0);
  lines.push(padEnd('Total', moneyAR(total)));

  const pago = order?.pago;
  const ef = Number(order?.pagoEfectivo || 0);
  const mp = Number(order?.pagoMp || 0);

  if (pago === 'Transferencia') {
    lines.push(cut('Pago: Transferencia'));
  } else if (pago === 'Mixto') {
    lines.push(padEnd('Efectivo', moneyAR(ef)));
    lines.push(padEnd('MercadoPago', moneyAR(mp)));
    const cambio = ef + mp - total;
    if (cambio > 0) lines.push(padEnd('Cambio', moneyAR(cambio)));
  } else if (!isNaN(Number(pago))) {
    const cash = Number(pago);
    lines.push(padEnd('Efectivo', moneyAR(cash)));
    const cambio = cash - total;
    if (cambio > 0) lines.push(padEnd('Cambio', moneyAR(cambio)));
  }

  lines.push('');
  lines.push(cut('¡Gracias por tu compra!'));
  lines.push('');
  return lines.join('\n');
}

async function printOrderESCPOSElectron(
  order,
  opts = { font: 'B', withLogo: true, openDrawer: false }
) {
  const device = new escpos.USB(); // si tu modelo no aparece por USB, te paso serial/LPT
  const printer = new escpos.Printer(device, { encoding: 'CP437' }); // o 'ISO-8859-1'

  return new Promise((resolve, reject) => {
    device.open(async (err) => {
      if (err) return reject(err);
      try {
        // Logo opcional
        if (opts.withLogo && order?.logoPath) {
          const img = await Jimp.read(order.logoPath);
          // ~384 px máx (48mm útiles * 8 dots/mm)
          img.resize(320, Jimp.AUTO);
          const image = await escpos.Image.load(img.bitmap);
          printer.align('ct').raster(image, 'dhd');
        }

        const body = formatTicketText(order, { font: opts.font });

        printer
          .align('lt')
          .style(opts.font === 'A' ? 'A' : 'B')
          .text(body)
          .newLine();

        if (opts.openDrawer) printer.cashdraw(2); // abre cajón (según pin RJ-11)
        printer.cut('partial'); // corte parcial si lo soporta

        printer.close();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}

// === Canal IPC para imprimir tickets ===
ipcMain.handle('PRINT_TICKET', async (_evt, payload) => {
  const { order, options } = payload || {};
  await printOrderESCPOSElectron(order, options || {});
  return { ok: true };
});

// Preview-only (render te puede pedir el texto “tal cual sale”)
ipcMain.handle('FORMAT_TICKET_TEXT', (_evt, { order, font = 'B' }) => {
  return formatTicketText(order, { font });
});

function createWindow() {
  win = new BrowserWindow({
    width: 556,
    height: 800,
    useContentSize: true,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      // Con este setup podés usar window.require('electron') en el renderer (tu Config.js ya lo hace bien)
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.webContents.setVisualZoomLevelLimits(1, 1);
  win.webContents.on('did-finish-load', () => win.webContents.setZoomFactor(1));

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

app.whenReady().then(async () => {
  createWindow();

  // === IPC SIEMPRE (dev y prod) ===
  ipcMain.handle('check-for-updates', async () => {
    try {
      if (!app.isPackaged || !autoUpdater) {
        return {
          updateAvailable: false,
          version: app.getVersion(),
          dev: true,
          message: 'Actualizaciones solo disponibles en la app empaquetada.',
        };
      }
      const result = await autoUpdater.checkForUpdates();
      return {
        updateAvailable: result.updateInfo?.version !== app.getVersion(),
        version: result.updateInfo?.version,
      };
    } catch (err) {
      log.error('Error en check-for-updates:', err);
      return { error: err.message };
    }
  });

  ipcMain.on('quit-and-install', () => {
    if (!app.isPackaged || !autoUpdater) {
      log.info('quit-and-install ignorado en DEV');
      return;
    }
    log.info('quit-and-install recibido');
    autoUpdater.quitAndInstall();
  });

  // Atajo DevTools
  try {
    globalShortcut.register('CommandOrControl+Shift+D', () => {
      if (!win) return;
      if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools();
      else win.webContents.openDevTools();
    });
    log.info('Atajo DevTools registrado');
  } catch (err) {
    log.error('Error registrando atajo DevTools:', err);
  }

  // Limpiar caché + recarga sin caché (opcional)
  try {
    await win.webContents.session.clearCache();
    win.webContents.reloadIgnoringCache();
  } catch (e) {
    log.error('No se pudo limpiar caché:', e);
  }

  // === AUTO-UPDATER SOLO EN PROD ===
  if (app.isPackaged && autoUpdater) {
    log.info('Inicializando autoUpdater…');
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';
    autoUpdater.allowPrerelease = false;

    autoUpdater.on('checking-for-update', () => log.info('checking-for-update'));
    autoUpdater.on('update-available', (info) => log.info('update-available', info?.version));
    autoUpdater.on('update-not-available', () => log.info('update-not-available'));
    autoUpdater.on('error', (err) => log.error('update-error', err));
    autoUpdater.on('download-progress', (p) => {
      const percent = Math.round(p.percent);
      log.info('download-progress', percent + '%');
      if (win && win.webContents) {
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

    setImmediate(() => {
      log.info('Llamando checkForUpdatesAndNotify…');
      autoUpdater.checkForUpdatesAndNotify();
    });
    setInterval(() => autoUpdater.checkForUpdates(), 30 * 60 * 1000);
  }
});

process.on('uncaughtException', (e) => log.error('uncaughtException:', e));
process.on('unhandledRejection', (e) => log.error('unhandledRejection:', e));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
