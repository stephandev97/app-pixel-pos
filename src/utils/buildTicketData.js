// src/utils/buildTicketData.js
// Compatible con electron/main.cjs -> formatTicketText()
// Campos: direccion, items[{quantity,name,sabores}], total, pago, pagoEfectivo, pagoMp

export function buildTicketData(order) {
  const direccion = order?.direccion || 'Retiro';
  const total = Number(order?.total || 0);

  // -------- Items (igual criterio que tu PrintTicket58) --------
  const rawItems = Array.isArray(order?.items) ? order.items : [];

  const itemsNorm = rawItems.map((it) => {
    const quantity = Number(it?.quantity ?? it?.qty ?? 1);
    const name = String(it?.name || it?.title || it?.label || '')
      .replace(/^\s*envio\s*\d*/i, 'Envío')
      .trim();

    const sabores = Array.isArray(it?.sabores) ? it.sabores.filter(Boolean) : [];

    return { ...it, quantity, name, sabores };
  });

  // agrega Envío si no es retiro y no venía ya (main.js imprime items tal cual) :contentReference[oaicite:2]{index=2}
  const isRetiro =
    String(direccion || '')
      .trim()
      .toLowerCase() === 'retiro';
  const hasEnvio = itemsNorm.some((it) => /envío|envio/i.test(String(it?.name || '')));
  if (!isRetiro && !hasEnvio) {
    itemsNorm.push({ name: 'Envío', quantity: 1, sabores: [] });
  }

  // -------- Pago: SOLO 3 tipos que main.js entiende --------
  const method = String(order?.method ?? '').toLowerCase();

  const pagoEfectivo = Number(order?.pagoEfectivo || 0);
  const pagoMp = Number(order?.pagoMp || 0);

  let pago;

  if (method === 'mixto') {
    pago = 'Mixto';
  } else if (method === 'transferencia') {
    pago = 'Transferencia';
  } else {
    // efectivo: main.js espera número
    // si order.pago ya viene numérico, lo respetamos; si no, usamos pagoEfectivo o total
    const p = order?.pago;
    const isNumeric =
      typeof p === 'number' || (typeof p === 'string' && p.trim() !== '' && !isNaN(Number(p)));

    pago = isNumeric ? Number(p) : pagoEfectivo || total;
  }

  return {
    direccion,
    items: itemsNorm,
    total,
    pago,
    pagoEfectivo,
    pagoMp,
  };
}
