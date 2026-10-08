import PocketBase from 'pocketbase';
const pb = new PocketBase('https://pixelpos.pockethost.io'); // I will just assume or I can import from pb
async function run() {
  const { pb } = await import('./src/lib/pb.js');
  const res = await pb.collection('orders').getList(1, 5, { sort: '-created' });
  console.log(JSON.stringify(res.items.map(o => ({ id: o.id, envio: o.envio, envioOpcion: o.envioOpcion, items: o.items })), null, 2));
}
run().catch(console.error);
