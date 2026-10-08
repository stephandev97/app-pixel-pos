import PocketBase from 'pocketbase';

async function fetchProducts() {
  try {
    const pb = new PocketBase('https://railway-production-857d.up.railway.app/');
    
    // Auth
    await pb.admins.authWithPassword('pos@pixelhelados.com', '3UyKkcDwXaSt-RhdLV6X-2OlC9fUei7O');
    
    // Fetch products
    const products = await pb.collection('products').getFullList({
      filter: 'category = "Delivery"'
    });
    
    console.log("PRODUCTS DELIV:");
    products.forEach(p => console.log(JSON.stringify({id: p.id, name: p.name, price: p.price})));
  } catch (err) {
    console.error(err);
  }
}
fetchProducts();
