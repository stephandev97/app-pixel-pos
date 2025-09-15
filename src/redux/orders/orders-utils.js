export const addPedidoToOrders = (orders, pedido) => {
    const orderExist = orders.length;
  
    if (orderExist >= 1) {
      return [...orders, {...pedido, num: orderExist + 1} ]
    }
  
    return [...orders, { ...pedido, num: 1}];
  };
  
  export const removeOrder = (orders, id) => {
    const orderToRemove = orders.find(order => order.id === id);

    return orders.filter(order => order.id !== orderToRemove.id)

  };
  
  export const resetShippingCost = (cartItems, shippingCost) => {
    if (cartItems.length === 1 && cartItems[0].quantity === 1) {
      return 0;
    }
  
    return shippingCost;
  };

  export const minNumOrder = (orders, id) => {
    const orderFind = orders.find(order => order.id === id)

    return orders.map(order => 
      order.num >= orderFind.num ? 
        {...order, num: order.num - 1} 
        : order 
    )
  }

  export const toggleCheck = (orders, id) => {
    const orderToEdit = orders.find(order => order.id === id)

    return orders.map(order =>
      order.id === orderToEdit.id ? 
        { ...order, check: !order.check }
        : order
    )
  }