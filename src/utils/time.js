const rtf = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' });

export function relativeTimeFrom(timestampMs) {
  const now = Date.now();
  const diff = Math.floor((timestampMs - now) / 1000); // segundos negativos
  const abs = Math.abs(diff);

  if (abs < 60)  return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 604800) return rtf.format(Math.round(diff / 86400), 'day');
  return new Date(timestampMs).toLocaleDateString(); // si es más viejo
}