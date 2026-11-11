export const isScheduledOpen = (order) => Boolean(order.scheduledStart) && !['delivered', 'pickedup'].includes(order.progress) && !order.entregado;
export const isWaitingSchedule = (order, now) => isScheduledOpen(order)
  && !['preparing', 'ready', 'dispatched'].includes(order.progress)
  && new Date(order.prepareAt || order.scheduledStart).getTime() > now;
export function scheduleLabel(order) {
  const opts = { timeZone: 'America/Argentina/Buenos_Aires' };
  const start = new Date(order.scheduledStart), end = new Date(order.scheduledEnd);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return '';
  return `${start.toLocaleDateString('es-AR', { ...opts, day: '2-digit', month: '2-digit' })} · ${start.toLocaleTimeString('es-AR', { ...opts, hour: '2-digit', minute: '2-digit' })} a ${end.toLocaleTimeString('es-AR', { ...opts, hour: '2-digit', minute: '2-digit' })} h`;
}
