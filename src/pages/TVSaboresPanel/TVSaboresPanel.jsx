import { useEffect, useMemo, useState } from 'react';
import { pb } from '../../lib/pb';

function groupByCategory(items) {
  const map = new Map();
  for (const it of items) {
    const cat = (it.category || 'Sin categoría').trim();
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(it);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'es'))
    .map(([category, list]) => ({
      category,
      list: list.sort((x, y) => (x.name || '').localeCompare(y.name || '', 'es')),
    }));
}

export default function TvSaboresPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [screens, setScreens] = useState([])
  const [savingScreenId, setSavingScreenId] = useState(null)


  // ✅ accordion: categoría abierta (una sola)
  const [openCategory, setOpenCategory] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await pb.collection('tv_sabores').getFullList({
        sort: 'category,name',
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  const loadScreens = async () => {
    try {
      const data = await pb.collection('tv_screens').getFullList({
        sort: 'device_id,display_index',
      })
      setScreens(data)
    } catch (e) {
      console.error('Error cargando tv_screens', e)
    }
  }

  useEffect(() => {
    load()
    loadScreens()

    let unsub1 = null
    let unsub2 = null

      ; (async () => {
        try {
          unsub1 = await pb.collection('tv_sabores').subscribe('*', () => load())
          unsub2 = await pb.collection('tv_screens').subscribe('*', () => loadScreens())
        } catch { }
      })()

    return () => {
      unsub1?.()
      unsub2?.()
    }
  }, [])

  const updateScreenUrl = async (screen, url) => {
    setSavingScreenId(screen.id)
    try {
      await pb.collection('tv_screens').update(screen.id, { url })
    } catch (e) {
      alert('No se pudo guardar la URL')
    } finally {
      setSavingScreenId(null)
    }
  }

  const grouped = useMemo(() => groupByCategory(items), [items]);

  const toggleSpent = async (record) => {
    const nextSpent = !record.spent;
    setSavingId(record.id);

    setItems((prev) => prev.map((x) => (x.id === record.id ? { ...x, spent: nextSpent } : x)));

    try {
      await pb.collection('tv_sabores').update(record.id, { spent: nextSpent });
    } catch (err) {
      setItems((prev) => prev.map((x) => (x.id === record.id ? { ...x, spent: record.spent } : x)));
      console.error(err);
      alert('No pude actualizar el sabor (PB).');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando sabores…</div>;

  return (
    <div
      style={{
        padding: 16,
        height: '100%',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      }}
    >
      <h2 style={{ margin: 0, marginBottom: 12 }}>Lista Sabores TV</h2>

      {grouped.map(({ category, list }) => {
        const isOpen = openCategory === category;

        return (
          <div key={category} style={{ marginBottom: 12 }}>
            {/* ✅ Header clickable */}
            <button
              onClick={() => setOpenCategory(isOpen ? null : category)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 12px',
                borderRadius: 14,
                border: '1px solid rgba(0,0,0,0.06)',
                background: 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                fontFamily: 'Satoshi',
              }}
              title="Abrir/cerrar categoría"
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    textTransform: 'capitalize',
                  }}
                >
                  {category}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.6 }}>{list.length}</span>
              </div>

              {/* flechita */}
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  opacity: 0.55,
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 120ms ease',
                }}
              >
                ›
              </span>
            </button>

            {/* ✅ Body collapsible */}
            {isOpen && (
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {list.map((it) => {
                  const disabled = !!it.spent;
                  const busy = savingId === it.id;

                  return (
                    <div
                      key={it.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        opacity: busy ? 0.75 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontWeight: 700 }}>{it.name}</span>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>
                          {disabled ? 'Desactivado en TV' : 'Activo en TV'}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleSpent(it)}
                        disabled={busy}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: '1px solid rgba(0,0,0,0.08)',
                          background: disabled ? 'rgba(255,70,70,0.18)' : 'rgba(70,255,140,0.18)',
                          cursor: busy ? 'not-allowed' : 'pointer',
                          fontWeight: 800,
                          minWidth: 120,
                          fontFamily: 'Satoshi',
                        }}
                        title="spent=true significa desactivado"
                      >
                        {disabled ? 'Activar' : 'Desactivar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <hr style={{ margin: '28px 0', opacity: 0.2 }} />

      <h2 style={{ marginBottom: 12 }}>Pantallas TV (URLs)</h2>

      <div style={{ display: 'grid', gap: 10 }}>
        {screens.map((screen) => {
          const busy = savingScreenId === screen.id

          return (
            <div
              key={screen.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 4fr 1fr',
                gap: 8,
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.55)',
              }}
            >
              <span style={{ opacity: 0.7, width: "20px" }}>
                #{screen.display_index}
              </span>

              <input
                defaultValue={screen.url}
                disabled={busy}
                onBlur={(e) => {
                  if (e.target.value !== screen.url) {
                    updateScreenUrl(screen, e.target.value)
                  }
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.15)',
                  width: '300px',
                }}
              />

              <span style={{ fontSize: 12, opacity: 0.6 }}>
                {busy ? 'Guardando…' : 'OK'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  );
}
