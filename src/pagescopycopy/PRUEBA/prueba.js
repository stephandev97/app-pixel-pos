import { useEffect, useState } from 'react';
import { pb } from '../../lib/pb';

export default function Prueba() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 1) carga inicial
    pb.collection('orders').getFullList({ sort: '-updatedAt' }).then(setOrders);

    // 2) realtime (alta/baja/cambios)
    pb.collection('orders').subscribe('*', (e) => {
      const rec = e.record;
      setOrders(prev => {
        const i = prev.findIndex(o => o.id === rec.id);
        if (i >= 0) {
          const copy = [...prev];
          copy[i] = rec;
          return copy;
        }
        return [rec, ...prev];
      });
    });

    return () => pb.collection('orders').unsubscribe('*');
  }, []);

  const createOrder = async () => {
  try {
    const rec = await pb.collection('orders').create({
      number: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      items: [],
      total: 0,
      status: 'new',
    });
    console.log('CREADO OK:', rec);
  } catch (e) {
    console.error('PB ERROR:', e);
    console.error('PB DATA:', e?.data); // <-- acá dice qué campo está mal
  }
};

  return (
    <div style={{ padding: 16 }}>
      <button onClick={createOrder}>Nuevo pedido</button>
      <ul>
        {orders.map(o => (
          <li key={o.id}>
            {o.number} — ${o.total} — {o.status}
          </li>
        ))}
      </ul>
    </div>
  );
}