import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Bike, Flag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { geocodeAddress, getOrderCoordinates } from '../../lib/geocode';
import { pb } from '../../lib/pb';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const PIN_PATH =
  'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0';

const createMotoElement = () => {
  const el = document.createElement('div');
  el.style.cssText =
    'box-sizing:border-box;width:52px;height:52px;border-radius:999px;background:#780000;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(0,0,0,.3)';
  el.innerHTML = renderToStaticMarkup(
    <Bike size={28} color="#fff" strokeWidth={2.2} style={{ display: 'block', flexShrink: 0 }} />
  );
  return el;
};

const createOrderElement = () => {
  const el = document.createElement('div');
  el.style.cssText = 'width:40px;height:44px;cursor:pointer';
  el.innerHTML =
    `<div style="position:relative;width:40px;height:44px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))">` +
    `<svg width="40" height="44" viewBox="2 1 20 22" fill="#fff" stroke="#780000" stroke-width="1.6" stroke-linejoin="round" style="display:block"><path d="${PIN_PATH}"/></svg>` +
    `<span style="position:absolute;left:0;right:0;top:8px;display:flex;justify-content:center">${renderToStaticMarkup(
      <Flag size={16} color="#780000" fill="#780000" strokeWidth={2} />
    )}</span></div>`;
  return el;
};

const isOpenOrder = (order) =>
  !order.entregado && !['delivered', 'pickedup'].includes(String(order.progress || ''));

export default function DeliveryMap({ deliveryId, latitude, longitude }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const orderMarkersRef = useRef([]);
  const [orders, setOrders] = useState([]);
  const [orderPoints, setOrderPoints] = useState([]);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [longitude, latitude],
      zoom: 15.5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    markerRef.current = new maplibregl.Marker({ element: createMotoElement() })
      .setLngLat([longitude, latitude])
      .addTo(map);
    mapRef.current = map;

    return () => {
      orderMarkersRef.current.forEach((marker) => marker.remove());
      orderMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await pb.collection('orders').getList(1, 40, {
          filter: `deliveryId = "${deliveryId}"`,
          sort: '-created',
        });
        if (active) setOrders(list.items.filter(isOpenOrder));
      } catch (err) {
        console.warn('No se pudieron cargar los pedidos del repartidor:', err);
      }
    };
    load();
    const intervalId = window.setInterval(load, 30000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [deliveryId]);

  useEffect(() => {
    let active = true;
    Promise.all(
      orders.map(async (order) => {
        const address = order.direccion || order.address || '';
        const point = getOrderCoordinates(order) || (await geocodeAddress(address));
        return point ? { id: order.id, number: order.number ?? order.id, address, ...point } : null;
      })
    ).then((points) => {
      if (active) setOrderPoints(points.filter(Boolean));
    });
    return () => {
      active = false;
    };
  }, [orders]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    orderMarkersRef.current.forEach((marker) => marker.remove());
    orderMarkersRef.current = orderPoints.map((point) =>
      new maplibregl.Marker({ element: createOrderElement(), anchor: 'bottom' })
        .setLngLat([point.lon, point.lat])
        .setPopup(
          new maplibregl.Popup({ offset: [0, -40], closeButton: false }).setText(
            `Pedido #${point.number} · ${point.address}`
          )
        )
        .addTo(map)
    );
  }, [orderPoints]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markerRef.current?.setLngLat([longitude, latitude]);
    if (orderPoints.length > 0) {
      const bounds = new maplibregl.LngLatBounds([longitude, latitude], [longitude, latitude]);
      orderPoints.forEach((point) => bounds.extend([point.lon, point.lat]));
      map.fitBounds(bounds, { padding: 90, maxZoom: 16, duration: 800 });
    } else {
      map.easeTo({ center: [longitude, latitude], duration: 800 });
    }
  }, [latitude, longitude, orderPoints]);

  return <div ref={containerRef} style={{ width: '100%', flex: 1, minHeight: 0, background: '#f1f5f9' }} />;
}
