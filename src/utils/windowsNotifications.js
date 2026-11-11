/**
 * Muestra una notificación nativa del sistema cuando llega un pedido desde la app.
 * En navegador, Android y Linux no hace nada: esos entornos no exponen el IPC de Electron.
 */
export function notifyWindowsOfAppOrder(order) {
  if (
    typeof window === 'undefined' ||
    window.electron?.process?.platform !== 'win32' ||
    !window.electron?.ipcRenderer?.invoke
  ) {
    return;
  }

  const orderCode = order?.id ? String(order.id).slice(-6).toUpperCase() : '';
  const address = String(order?.address || order?.direccion || '').trim();
  const total = Number(order?.total || 0);
  const details = [
    orderCode ? `Pedido App #${orderCode}` : 'Pedido nuevo desde la app',
    address,
    total > 0 ? `$${total.toLocaleString('es-AR')}` : '',
  ].filter(Boolean);

  window.electron.ipcRenderer
    .invoke('show-app-order-notification', {
      title: 'Nuevo pedido de la app',
      body: details.join('\n'),
    })
    .catch((error) => console.warn('[Notifications] No se pudo mostrar la notificación:', error));
}
