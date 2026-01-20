export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumSignificantDigits: (price + '').replace('.', '').length,
  }).format(price);
};
