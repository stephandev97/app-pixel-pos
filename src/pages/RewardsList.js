import { useEffect, useState } from 'react';
import { pb, ensureServiceAuth } from '../lib/pb';
import { formatPrice } from '../utils/formatPrice';

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

export default function RewardsList() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let abort = false;
    const fetchClaims = async () => {
      try {
        setLoading(true);
        setError('');
        await ensureServiceAuth();
        const list = await pb.collection('reward_claims').getList(1, 200, {
          filter: 'status = "redeemed"',
          sort: '-updated',
          expand: 'reward,client,reward.product',
        });
        if (abort) return;
        const mapped = list.items.map((c) => ({
          id: c.id,
          code: c.code,
          rewardTitle: c.expand?.reward?.title || c.reward || 'Premio',
          pointsCost: c.pointsCost,
          client:
            `${c.expand?.client?.name || ''} ${c.expand?.client?.surname || ''}`.trim() ||
            c.expand?.client?.email ||
            c.expand?.client?.id ||
            '',
          status: c.status,
          updated: c.updated,
          productPrice: c.expand?.reward?.expand?.product?.price,
        }));
        setClaims(mapped);
      } catch (e) {
        if (abort) return;
        setError(e?.message || 'No se pudieron cargar los canjes.');
      } finally {
        if (!abort) setLoading(false);
      }
    };
    fetchClaims();
    return () => {
      abort = true;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fb 0%, #eef2ff 100%)',
        fontFamily: "'Satoshi', sans-serif",
        padding: '20px 16px 28px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gap: 16,
        }}
      >
        <div
          style={{
            background: '#111',
            color: '#fff',
            borderRadius: 18,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
          }}
        >
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>Canjes completados</div>
          </div>
          <div
            style={{
              background: '#fff',
              color: '#111',
              padding: '8px 12px',
              borderRadius: 12,
              fontWeight: 800,
              minWidth: 80,
              textAlign: 'center',
            }}
          >
            {loading ? '...' : claims.length}
          </div>
        </div>

        {loading && (
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 14,
              border: '1px solid #e5e7eb',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            Cargando...
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: 14,
              padding: 14,
              color: '#b91c1c',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !claims.length && (
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 14,
              border: '1px solid #e5e7eb',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              opacity: 0.8,
            }}
          >
            No hay canjes redeemed.
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          }}
        >
          {claims.map((c) => (
            <div
              key={c.id}
              style={{
                position: 'relative',
                borderRadius: 16,
                padding: 16,
                background: '#fff',
                display: 'grid',
                gap: 8,
                boxShadow: '0 16px 36px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background:
                    'radial-gradient(circle at 20% 20%, rgba(17,24,39,0.04), transparent 35%), radial-gradient(circle at 80% 0%, rgba(37,99,235,0.04), transparent 30%)',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{c.rewardTitle}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span
                    style={{
                      padding: '5px 10px',
                      borderRadius: 999,
                      background: '#e0f2fe',
                      color: '#0b3e70',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    {c.code}
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: '#ecfdf3',
                      color: '#166534',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {c.status || 'redeemed'}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.95rem', color: '#1f2937', zIndex: 1 }}>
                Cliente: <strong>{c.client || '-'}</strong>
              </div>
              <div style={{ fontSize: '0.95rem', color: '#1f2937', zIndex: 1 }}>
                Puntos: <strong>{c.pointsCost ?? '-'}</strong>
              </div>
              {c.productPrice != null && (
                <div style={{ fontSize: '0.95rem', color: '#1f2937', zIndex: 1 }}>
                  Precio producto: <strong>{formatPrice(c.productPrice)}</strong>
                </div>
              )}
              <div style={{ fontSize: '0.9rem', color: '#6b7280', zIndex: 1 }}>
                Actualizado: {formatDate(c.updated)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
