import PocketBase from 'pocketbase';
const pb = new PocketBase('https://railway-production-857d.up.railway.app/');
async function check() {
  await pb.collection('users').authWithPassword('pos@pixelhelados.com', '3UyKkcDwXaSt-RhdLV6X-2OlC9fUei7O');
  const orders = await pb.collection('orders').getList(1, 10, { sort: '-created' });
  orders.items.forEach((o, i) => {
    console.log(`Order ${i+1}: id=${o.id}, num=${o.numeracion}, dir="${o.direccion}", copied=${o.copied}, day=${o.businessDate || o.day}`);
  });
}
check();
