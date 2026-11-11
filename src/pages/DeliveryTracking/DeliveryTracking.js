import { Bike, Check, MapPin, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { pb } from '../../lib/pb';
import DeliveryMap from './DeliveryMap';

const ONLINE_MS = 3 * 60 * 1000;
const FIELDS =
  'id,name,username,email,role,deliveryActive,deliveryLat,deliveryLon,deliveryLocationAt';

function getLabel(user) {
  return (
    String(user.name || '').trim() ||
    String(user.username || '').trim() ||
    String(user.email || '').trim() ||
    user.id
  );
}

function isDeliveryUser(user) {
  return String(user.role || '').trim().toLowerCase() === 'delivery';
}

function parseCoordinate(value, min, max) {
  if (value == null || value === '') return null;
  const normalized = typeof value === 'string' ? value.trim().replace(',', '.') : value;
  const coordinate = Number(normalized);
  return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max
    ? coordinate
    : null;
}

function getSeen(user, now) {
  const latitude = parseCoordinate(user.deliveryLat, -90, 90);
  const longitude = parseCoordinate(user.deliveryLon, -180, 180);
  if (latitude === null || longitude === null) {
    const missing = [
      latitude === null ? 'latitud' : null,
      longitude === null ? 'longitud' : null,
    ].filter(Boolean);
    const missingText = missing.join(' y ');
    return {
      hasPosition: false,
      online: false,
      text: `Sin ubicación: ${missing.length > 1 ? 'faltan' : 'falta'} ${missingText}`,
    };
  }
  if (latitude === 0 && longitude === 0) {
    return { hasPosition: false, online: false, text: 'Sin ubicación' };
  }

  const rawDate = user.deliveryLocationAt;
  const at = rawDate
    ? new Date(typeof rawDate === 'string' ? rawDate.replace(' ', 'T') : rawDate)
    : null;
  const hasValidDate = at && !Number.isNaN(at.getTime());
  if (!hasValidDate) {
    return { hasPosition: true, online: false, text: 'Fecha de ubicación no disponible', latitude, longitude };
  }

  const diff = Math.max(now - at.getTime(), 0);
  const minutes = Math.floor(diff / 60000);
  let text = 'Ahora';
  if (minutes >= 1 && minutes < 60) text = `Hace ${minutes} min`;
  else if (minutes >= 60) text = `Hace ${Math.floor(minutes / 60)} h`;
  return { hasPosition: true, online: diff <= ONLINE_MS, text, latitude, longitude };
}

export default function DeliveryTracking() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [mapUserId, setMapUserId] = useState('');
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const list = await pb.collection('users').getFullList({
        fields: FIELDS,
        filter: 'role = "delivery"',
        sort: 'name',
      });
      setUsers(list);
      setError('');
    } catch (err) {
      console.error('Error cargando repartidores:', err);
      setError('No se pudieron cargar los repartidores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    let unsubscribe;
    let active = true;

    // Los cambios se aplican en vivo; el sondeo es solo un respaldo si falla la suscripción
    pb.collection('users')
      .subscribe('*', ({ action, record }) => {
        if (!active || !record) return;
        setUsers((prev) => {
          const current = prev.find((user) => user.id === record.id);
          const rest = prev.filter((user) => user.id !== record.id);
          if (action === 'delete' || !isDeliveryUser(record)) return rest;
          const updated = current ? { ...current, ...record } : record;
          return [...rest, updated].sort((a, b) => getLabel(a).localeCompare(getLabel(b)));
        });
      })
      .then((stop) => {
        if (active) unsubscribe = stop;
        else stop();
      })
      .catch(() => {});

    const pollId = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 60000);
    const tickId = window.setInterval(() => setNow(Date.now()), 30000);

    return () => {
      active = false;
      window.clearInterval(pollId);
      window.clearInterval(tickId);
      if (unsubscribe) unsubscribe();
    };
  }, [load]);

  const toggleActive = async (user) => {
    if (busyId) return;
    const next = !user.deliveryActive;
    setBusyId(user.id);
    setError('');
    setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, deliveryActive: next } : item)));
    try {
      await pb.collection('users').update(user.id, { deliveryActive: next }, { fields: 'id' });
    } catch (err) {
      console.error('Error actualizando repartidor:', err);
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, deliveryActive: !next } : item))
      );
      setError('No se pudo actualizar el repartidor. Revisá los permisos de la colección users.');
    } finally {
      setBusyId('');
    }
  };

  const mapUser = users.find((user) => user.id === mapUserId);
  const mapSeen = mapUser ? getSeen(mapUser, now) : null;

  return (
    <div style={{ height: '100%', overflowY: 'auto', boxSizing: 'border-box', padding: 20 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12,
            marginBottom: 6,
            textAlign: 'left',
          }}
        >
          <Bike size={28} color="#780000" />
          <h1 style={{ margin: 0, fontSize: 24 }}>Seguimiento de repartidores</h1>
        </header>
        <p
          style={{
            margin: '0 0 18px',
            color: '#64748b',
            fontSize: 14,
            lineHeight: 1.5,
            textAlign: 'left',
          }}
        >
          Consultá la última ubicación y activá quiénes pueden asignarse a un pedido.
        </p>

        {error && (
          <p role="alert" style={{ color: '#b91c1c', margin: '0 0 14px', fontSize: 14 }}>
            {error}
          </p>
        )}
        {loading && <p style={{ color: '#64748b' }}>Cargando…</p>}
        {!loading && users.length === 0 && !error && (
          <p style={{ color: '#64748b' }}>No hay cuentas disponibles.</p>
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          {users.map((user) => {
            const seen = getSeen(user, now);
            const active = Boolean(user.deliveryActive);
            return (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  minHeight: 76,
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: '#fff',
                  border: `1px solid ${active ? '#86efac' : '#e2e8f0'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,.05)',
                }}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  aria-label={`${active ? 'Desactivar' : 'Activar'} ${getLabel(user)}`}
                  title={active ? 'Activo: tocá para desactivar' : 'Inactivo: tocá para activar'}
                  disabled={busyId === user.id}
                  onClick={() => toggleActive(user)}
                  style={{
                    flexShrink: 0,
                    width: 64,
                    display: 'grid',
                    placeItems: 'center',
                    border: 0,
                    borderRight: `1px solid ${active ? '#86efac' : '#e2e8f0'}`,
                    cursor: busyId === user.id ? 'wait' : 'pointer',
                    color: active ? '#fff' : '#94a3b8',
                    background: active ? '#15803d' : '#f1f5f9',
                  }}
                >
                  <Check size={26} strokeWidth={3} />
                </button>

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      overflowWrap: 'anywhere',
                      textAlign: 'left',
                    }}
                  >
                    {getLabel(user)}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginTop: 6,
                      fontSize: 13,
                      color: '#64748b',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 999,
                        background: seen.online ? '#22c55e' : '#cbd5e1',
                      }}
                    />
                    <span>{seen.online ? 'En línea' : seen.hasPosition ? 'Última ubicación' : ''}</span>
                    <span>{seen.text}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMapUserId(user.id)}
                  disabled={!seen.hasPosition}
                  aria-label={`Ver ubicación de ${getLabel(user)} en el mapa`}
                  title={seen.hasPosition ? 'Ver en mapa' : 'Sin ubicación disponible'}
                  style={{
                    flexShrink: 0,
                    width: 64,
                    display: 'grid',
                    placeItems: 'center',
                    border: 0,
                    borderLeft: '1px solid #e2e8f0',
                    cursor: seen.hasPosition ? 'pointer' : 'not-allowed',
                    color: seen.hasPosition ? '#780000' : '#cbd5e1',
                    background: seen.hasPosition ? '#fff5f5' : '#f8fafc',
                  }}
                >
                  <MapPin size={26} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {mapUser && mapSeen?.hasPosition && (
        <div
          role="presentation"
          onClick={() => setMapUserId('')}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200000,
            display: 'grid',
            placeItems: 'center',
            padding: 16,
            boxSizing: 'border-box',
            background: 'rgba(15, 23, 42, .62)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-map-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(100%, 900px)',
              height: 'min(82vh, 700px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 18,
              background: '#fff',
              boxShadow: '0 24px 70px rgba(0,0,0,.3)',
            }}
          >
            <header
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '14px 18px',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h2 id="delivery-map-title" style={{ margin: 0, fontSize: 18 }}>
                  {getLabel(mapUser)}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5, color: '#64748b', fontSize: 13 }}>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      flexShrink: 0,
                      borderRadius: 999,
                      background: mapSeen.online ? '#22c55e' : '#cbd5e1',
                    }}
                  />
                  {mapSeen.online ? 'En línea' : 'Última ubicación'} · {mapSeen.text}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setMapUserId('')}
                  aria-label="Cerrar mapa"
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 38,
                    height: 38,
                    border: '1px solid #e2e8f0',
                    borderRadius: 9,
                    background: '#fff',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </header>
            <DeliveryMap
              key={mapUser.id}
              deliveryId={mapUser.id}
              latitude={mapSeen.latitude}
              longitude={mapSeen.longitude}
            />
          </section>
        </div>
      )}
    </div>
  );
}
