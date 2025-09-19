export const addFileSaboresToList = (sabores, file) => {
  return [...sabores, ...file];
};

export const addProductToList = (products, product) => {
  const productExist = products.find((item) => item.name === product.name);

  if (productExist) {
    alert('Este producto ya existe');
    window.location.reload();
    return [...products];
  } else return [...products, { ...product }];
};

export const deleteProductToList = (products, id) => {
  const productExist = products.find((item) => item.id === id);

  return products.filter((item) => item.id !== productExist.id);
};

export const editProductExist = (products, product) => {
  const productExist = products.find((item) => item.id === product.id);

  if (productExist) {
    return products.map((item) =>
      item.id === productExist.id ? { ...item, name: product.name, price: product.price } : item
    );
  }
};

export const addListProducts = (products, list) => {
  return [...products, ...list];
};
