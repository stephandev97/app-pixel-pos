// Nombre de la collection de pedidos en PocketBase según el modo actual.
// En Modo Prueba el POS lee (y actualiza) la collection `orders_test` en lugar de `orders`.
export const ORDERS_COLLECTION = 'orders';
export const ORDERS_TEST_COLLECTION = 'orders_test';

// Se lee de localStorage (lo escribe `toggleTestMode` en actionsSlice) para poder usarlo
// desde thunks, componentes y utilidades sin depender del store (evita imports circulares).
export const isTestModeActive = () => {
  try {
    return typeof window !== 'undefined' && localStorage.getItem('is_test_mode') === 'true';
  } catch {
    return false;
  }
};

export const getOrdersCollectionName = () =>
  isTestModeActive() ? ORDERS_TEST_COLLECTION : ORDERS_COLLECTION;

export const isTestOrdersCollection = (name = getOrdersCollectionName()) =>
  name === ORDERS_TEST_COLLECTION;
