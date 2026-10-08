// src/components/Orders/ordersUtils.js

/**
 * Limpia y normaliza el texto escaneado por lectores de códigos QR o barras.
 * Permite caracteres alfanuméricos y elimina espacios o caracteres de control innecesarios.
 */
export function normalizeScan(raw) {
  if (!raw) return '';
  return raw.trim();
}
