export const addItemToCart = (cartItems, product) => {
  const productInCart = cartItems.find((item) => {
    if (item.id !== product.id) return false;
    const s1 = Array.isArray(item.sabores) ? item.sabores.join(',') : (item.sabores || '');
    const s2 = Array.isArray(product.sabores) ? product.sabores.join(',') : (product.sabores || '');
    return s1 === s2;
  });

  if (productInCart) {
    return cartItems.map((item) =>
      item === productInCart ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    );
  }

  return [...cartItems, { ...product, quantity: 1 }];
};

export const removeItemFromCart = (cartItems, id) => {
  return cartItems.filter((item) => item.id !== id);
};

export const resetShippingCost = (cartItems, shippingCost) => {
  if (cartItems.length === 1 && cartItems[0].quantity === 1) {
    return 0;
  }

  return shippingCost;
};

export const AddNewProduct = (cartItems, product) => {
  return [...cartItems, { ...product }];
};
