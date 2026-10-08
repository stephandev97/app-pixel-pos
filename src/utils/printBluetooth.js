import { BluetoothSerial } from '@ascentio-it/capacitor-bluetooth-serial';
import { Capacitor } from '@capacitor/core';

let connectedDeviceId = null;

export const isAndroid = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

const checkBluetoothEnabled = async () => {
  if (!isAndroid()) return false;
  try {
    const isEnabled = await BluetoothSerial.isEnabled();
    if (!isEnabled) {
      await BluetoothSerial.enable();
      return true; // Esperar a que el usuario active? O asumir que enable() abre el diálogo
    }
    return true;
  } catch (err) {
    console.warn('Error checking/enabling Bluetooth:', err);
    return false;
  }
};

export const scanBluetoothDevices = async () => {
  if (!isAndroid()) return [];
  try {
    await checkBluetoothEnabled();
    const devices = await BluetoothSerial.list();
    return devices;
  } catch (err) {
    console.error('Error scanning Bluetooth:', err);
    // Intento de llamar a discoverUnpaired si list() falla o devuelve vacío (opcional)
    try {
      const unpaired = await BluetoothSerial.discoverUnpaired();
      return unpaired;
    } catch (e) {
      console.error('Error discovering unpaired:', e);
    }
    return [];
  }
};

export const connectToPrinter = async (deviceId) => {
  if (!isAndroid()) return false;
  try {
    const isConnected = await BluetoothSerial.isConnected().catch(() => false);
    if (isConnected) {
      // Si ya está conectado, verificar si es el mismo dispositivo sería ideal, pero el plugin básico a veces no da esa info.
      // Asumimos que si está conectado, es al que queremos o desconectamos primero.
      // Para seguridad, desconectamos y reconectamos.
      await BluetoothSerial.disconnect();
    }

    await BluetoothSerial.connect({ deviceId });
    connectedDeviceId = deviceId;
    return true;
  } catch (err) {
    console.error('Error connecting to printer:', err);
    return false;
  }
};

export const disconnectPrinter = async () => {
  if (!isAndroid()) return;
  try {
    await BluetoothSerial.disconnect();
    connectedDeviceId = null;
  } catch (err) {
    console.error('Error disconnecting:', err);
  }
};

const ensureConnection = async () => {
  // Primero verifica si el plugin dice que está conectado
  const isConnected = await BluetoothSerial.isConnected().catch(() => false);
  if (isConnected) return true;

  // Si no, intenta reconectar usando el ID guardado en memoria (si existe)
  // O recuperarlo de localStorage si el usuario lo guardó ahí (Config.js lo guarda en 'bt_printer_id')
  const savedId = connectedDeviceId || localStorage.getItem('bt_printer_id');
  if (savedId) {
    console.log('Intentando reconexión automática a', savedId);
    return await connectToPrinter(savedId);
  }
  return false;
};

export const printViaBluetooth = async (html) => {
  if (!isAndroid()) return false;

  const connected = await ensureConnection();
  if (!connected) {
    console.error('No se pudo establecer conexión con la impresora.');
    return false;
  }

  try {
    const text = htmlToTextForPrinter(html);
    const encoder = new TextEncoder();
    // \n extra para alimentar papel
    const data = encoder.encode(text + '\n\n\n');
    await BluetoothSerial.write({ data: Array.from(data) });
    return true;
  } catch (err) {
    console.error('Error printing via Bluetooth:', err);
    return false;
  }
};

const htmlToTextForPrinter = (html) => {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  let text = '';

  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();

      if (tag === 'br') {
        text += '\n';
      } else if (tag === 'b' || tag === 'strong') {
        // Negrita simple ESC E n
        const span = document.createElement('span');
        span.innerHTML = node.innerHTML;
        text += '\x1B\x45\x01' + span.textContent + '\x1B\x45\x00';
      } else if (tag === 'center') {
        const lines = node.textContent.split('\n');
        const width = 32;
        lines.forEach((line) => {
          const padding = Math.floor((width - line.length) / 2);
          text += ' '.repeat(Math.max(0, padding)) + line + '\n';
        });
        return;
      } else if (tag === 'hr') {
        text += '-'.repeat(32) + '\n';
      } else {
        for (const child of node.childNodes) {
          processNode(child);
        }
        if (['p', 'div', 'li'].includes(tag)) {
          text += '\n';
        }
      }
    }
  };

  for (const child of temp.childNodes) {
    processNode(child);
  }

  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
};

export const printThermal58 = async (ticketData) => {
  if (!isAndroid()) return false;

  const connected = await ensureConnection();
  if (!connected) {
    console.error('No se pudo establecer conexión con la impresora Thermal58.');
    return false;
  }

  const { items = [], total = 0, direccion = 'Retiro', numeracion = '', pago = {} } = ticketData;

  let text = '';
  // Inicialización ESC @ (reset)
  text += '\x1B\x40';
  // Justificar Centro ESC a 1
  text += '\x1B\x61\x01';
  text += 'PIXEL HELADOS\n';
  // Justificar Izquierda ESC a 0
  text += '\x1B\x61\x00';
  text += '----------------\n';
  text += `Pedido: #${numeracion}\n`;
  text += `${new Date().toLocaleString('es-AR')}\n`;
  text += '----------------\n';

  for (const item of items) {
    const nombre = item.nombre?.substring(0, 18) || '';
    const cantidad = item.cantidad || 1;
    const precio = Number(item.precio || 0);
    const linea = `${cantidad}x ${nombre}`;
    const restante = 32 - linea.length - String(precio).length;
    text += linea + ' '.repeat(Math.max(1, restante)) + precio + '\n';

    if (item.sabores?.length) {
      text += '   (' + item.sabores.join(', ').substring(0, 28) + ')\n';
    }
  }

  text += '----------------\n';
  // Negrita activada
  text += '\x1B\x45\x01';
  text += `TOTAL: $${total}\n`;
  // Negrita desactivada
  text += '\x1B\x45\x00';

  if (pago.efectivo > 0) {
    text += `Efectivo: $${pago.efectivo}\n`;
  }
  if (pago.debito > 0) {
    text += `Débito: $${pago.debito}\n`;
  }
  if (pago.mp > 0) {
    text += `MercadoPago: $${pago.mp}\n`;
  }
  if (pago.cambio > 0) {
    text += `Cambio: $${pago.cambio}\n`;
  }

  text += '----------------\n';
  // Justificar Centro
  text += '\x1B\x61\x01';
  // Fuente doble altura/ancho opcional, por ahora normal
  text += direccion + '\n';
  text += '\n\n\n'; // Feed

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    await BluetoothSerial.write({ data: Array.from(data) });
    return true;
  } catch (err) {
    console.error('Error printing:', err);
    return false;
  }
};
