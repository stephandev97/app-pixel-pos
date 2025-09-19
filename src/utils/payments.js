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
