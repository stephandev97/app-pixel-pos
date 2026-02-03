export function detectPayment(pago, fallbackRevenue) {
  // Ej: pago puede venir 12000 (number) o "Transferencia" (string)
  const isFiniteNumber = (v) =>
    typeof v === 'number'
      ? Number.isFinite(v)
      : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v));

  if (isFiniteNumber(pago)) {
    const num = Number(pago);
    return {
      method: 'efectivo',
      paidAmount: num, // lo que te entregaron en cash
      revenueAmount: Number(fallbackRevenue || 0), // lo facturado por la orden
    };
  }

  // string "transferencia" (ignora mayúsculas)
  if (String(pago).toLowerCase().includes('transferencia')) {
    return {
      method: 'transferencia',
      paidAmount: Number(fallbackRevenue || 0), // asumimos te transfirieron el total
      revenueAmount: Number(fallbackRevenue || 0),
    };
  }

  // default / desconocido
  return {
    method: 'otro',
    paidAmount: Number(fallbackRevenue || 0),
    revenueAmount: Number(fallbackRevenue || 0),
  };
}

export function parseMixtoDetalle(txt) {
  if (typeof txt !== 'string') return { ef: 0, mp: 0 };
  const mEf = txt.match(/EF\s*\$?\s*([\d.,]+)/i);
  const mMp = txt.match(/MP\s*\$?\s*([\d.,]+)/i);
  const toNum = (s) => Number(String(s).replace(/[^\d.-]/g, '')) || 0;
  return {
    ef: mEf ? toNum(mEf[1]) : 0,
    mp: mMp ? toNum(mMp[1]) : 0,
  };
}

export function getOrderCashNet(o) {
  const method = String(o?.method || '').toLowerCase();
  const pago = o?.pago;
  const total = Number(o?.total || 0);
  const cambio = Number(o?.cambio || 0);
  const pagoEf = Number(o?.pagoEfectivo || 0);
  const pagoMp = Number(o?.pagoMp || 0);
  const detalle = String(o?.pagoDetalle || '');

  if (method === 'transferencia' || method === 'debito') return 0;

  if (method === 'mixto' || (typeof pago === 'string' && pago.toLowerCase().includes('mixto'))) {
    let ef = pagoEf;
    let mp = pagoMp;
    if (!ef || !mp) {
      const parsed = parseMixtoDetalle(detalle);
      if (!ef) ef = parsed.ef;
      if (!mp) mp = parsed.mp;
    }
    const rest = Math.max(0, total - mp);
    const efNet = Math.max(0, Math.min(ef, rest));
    return efNet;
  }

  let cashGiven = typeof pago === 'number' ? Number(pago || 0) : Number(o?.pagoEfectivo || 0);
  if (cambio > 0) {
    cashGiven = Math.max(0, cashGiven - cambio);
  }
  return Math.max(0, Math.min(cashGiven, total));
}
