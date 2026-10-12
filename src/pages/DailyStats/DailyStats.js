import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { CupSoda } from 'lucide-react';
import { useDispatch } from 'react-redux';

import { pb } from '../../lib/pb';
import { toggleConfig, toggleDailyStats } from '../../redux/actions/actionsSlice';
import { formatPrice } from '../../utils/formatPrice';
import { getSmoothieFlavor } from '../../components/Orders/baristaRecipesData';
import {
  aggregateDailyDocs,
  fetchDailyStatsInRange,
  getMonthRangeKeys,
  getWeekRangeKeys,
} from '../../utils/statsRanges'; // ajustá rutas
import {
  ButtonPage,
  Container,
  ContainerPages,
  IconButton,
  TitlePage,
} from '../Config/ConfigStyles';

const nz = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const sumObj = (o) => Object.values(o || {}).reduce((a, b) => a + (Number(b) || 0), 0);

function formatPrettyDate(ymd) {
  if (!ymd) return '-';
  const [y, m, d] = ymd.split('-').map((n) => parseInt(n, 10));
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatMonthPeriodLabel(range) {
  // range.startKey = "YYYY-MM-DD"
  const [y, m] = range.startKey.split('-').map((n) => parseInt(n, 10));
  const dateObj = new Date(y, m - 1, 1);
  // "septiembre de 2025" → "Septiembre 2025"
  const raw = dateObj.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const pretty = raw.replace(' de ', ' ');
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

export default function DailyStats() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]); // lista de días
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null); // detalle día
  const [view, setView] = useState('days'); // "days" | "week" | "month"
  const [cursor, setCursor] = useState(new Date()); // fecha base para navegar semana/mes
  const [flavorsList, setFlavorsList] = useState([]); // <-- NUEVO ESTADO
  const [loadingFlavors, setLoadingFlavors] = useState(false); // <-- NUEVO ESTADO
  const [dailyOrders, setDailyOrders] = useState([]); // <-- órdenes cargadas del período
  const [showOrdersList, setShowOrdersList] = useState(false); // toggle para expandir lista de pedidos

  const flavorsMap = {};

  const goBackToConfig = () => {
    dispatch(toggleDailyStats(false));
    dispatch(toggleConfig(true));
  };

  // carga lista de días (como ya tenías)
  useEffect(() => {
    (async () => {
      try {
        const list = await pb.collection('daily_stats').getFullList({ sort: '-day' });
        setRows(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -------- RESÚMENES (semana/mes) --------
  const weeklyRange = useMemo(() => getWeekRangeKeys({ from: cursor, cutoffHour: 3 }), [cursor]);
  const monthlyRange = useMemo(() => getMonthRangeKeys({ from: cursor, cutoffHour: 3 }), [cursor]);

  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);

  useEffect(() => {
    if (view !== 'week') return;
    (async () => {
      try {
        const docs = await fetchDailyStatsInRange(weeklyRange);
        setWeekly({ docs, agg: aggregateDailyDocs(docs), range: weeklyRange });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [view, weeklyRange.startKey, weeklyRange.endKey]);

  useEffect(() => {
    if (view !== 'month') return;
    (async () => {
      try {
        const docs = await fetchDailyStatsInRange(monthlyRange);
        setMonthly({ docs, agg: aggregateDailyDocs(docs), range: monthlyRange });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [view, monthlyRange.startKey, monthlyRange.endKey]);

  useEffect(() => {
    if (!detail) {
      setFlavorsList({ top: [], bottom: [] });
      setDailyOrders([]);
      setShowOrdersList(false);
      return;
    }

    (async () => {
      setLoadingFlavors(true);
      try {
        let filter = '';

        // Si es un resumen (semana/mes), usamos el rango de fechas que ya calculaste
        if (detail.__summary === 'week' && weekly?.range) {
          filter = `businessDate >= "${weekly.range.startKey}" && businessDate <= "${weekly.range.endKey}"`;
        } else if (detail.__summary === 'month' && monthly?.range) {
          filter = `businessDate >= "${monthly.range.startKey}" && businessDate <= "${monthly.range.endKey}"`;
        } else {
          // Si es un día individual
          filter = `businessDate = "${detail.day}"`;
        }

        const orders = await pb.collection('orders').getFullList({ filter, sort: '-created' });
        setDailyOrders(orders);

        const counts = {};
        orders.forEach((order) => {
          const items = Array.isArray(order.items) ? order.items : [];
          items.forEach((item) => {
            // Procesamos sabores individuales o breakdown
            if (item.saboresBreakdown && typeof item.saboresBreakdown === 'object') {
              Object.entries(item.saboresBreakdown).forEach(([sabor, count]) => {
                const clean = String(sabor || '').replace(/^\d+\s*x\s*/i, '').trim();
                if (clean) counts[clean] = (counts[clean] || 0) + (Number(count) || 1);
              });
            } else if (Array.isArray(item.sabores)) {
              item.sabores.forEach((sabor) => {
                const clean = String(sabor || '').replace(/^\d+\s*x\s*/i, '').trim();
                if (clean) counts[clean] = (counts[clean] || 0) + (Number(item.quantity) || 1);
              });
            }
          });
        });

        // Sabores menos vendidos (solo potes de helado 1/4, 1/2, 1kg)
        const countsPotes = {};
        orders.forEach((order) => {
          const items = Array.isArray(order.items) ? order.items : [];
          items.forEach((item) => {
            // Solo procesar sabores de potes de helado (1/4, 1/2, 1kg)
            const isPote =
              item.name?.toLowerCase().includes('pote') ||
              item.name?.toLowerCase().includes('1/4') ||
              item.name?.toLowerCase().includes('1/2') ||
              item.name?.toLowerCase().includes('1kg') ||
              item.name?.toLowerCase().includes('1 kg');

            if (isPote && Array.isArray(item.sabores)) {
              item.sabores.forEach((sabor) => {
                const clean = String(sabor || '').replace(/^\d+\s*x\s*/i, '').trim();
                if (clean) {
                  countsPotes[clean] = (countsPotes[clean] || 0) + (Number(item.quantity) || 1);
                }
              });
            }
          });
        });

        const sorted = Object.entries(counts)
          .map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty);

        const sortedPotes = Object.entries(countsPotes)
          .map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty);

        setFlavorsList({ top: sorted, bottom: sortedPotes });
      } catch (e) {
        console.error('Error al obtener sabores:', e);
      } finally {
        setLoadingFlavors(false);
      }
    })();
  }, [detail, weekly?.range, monthly?.range]); // Dependencias para que refresque al cambiar de periodo

  // Desglose enriquecido con medida de vaso y extras a partir de las órdenes cargadas
  const richItemsList = useMemo(() => {
    if (!detail) return [];

    if (dailyOrders && dailyOrders.length > 0) {
      const map = {};
      dailyOrders.forEach((order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((it) => {
          const baseName = (it.name || 'Producto').trim();
          const itLower = baseName.toLowerCase();
          const isSm =
            itLower.includes('smoothie') || String(it.category || '').toLowerCase().includes('smoothie');
          const smFl = isSm ? getSmoothieFlavor(it) : '';
          const sz = isSm ? '12oz' : (it.size || it.medida || '');
          const exList = [];
          if (Array.isArray(it.extras)) {
            it.extras.forEach((ex) => {
              if (ex) exList.push(String(ex).replace(/\s*\(\+?\$?\d+\)/g, '').trim());
            });
          }
          if ((it.canela || it.withCinnamon) && !exList.some((e) => /canela/i.test(e))) exList.push('Canela');
          if (it.leche_almendras && !exList.some((e) => /almendra/i.test(e))) exList.push('Leche Almendras');
          if (it.extra_shot && !exList.some((e) => /shot/i.test(e))) exList.push('Extra Shot');

          const key = `${baseName}__${sz}__${smFl}__${exList.sort().join('|')}`;
          if (!map[key]) {
            map[key] = {
              name: baseName,
              size: sz,
              smoothieFlavor: smFl,
              extras: exList,
              qty: 0,
            };
          }
          map[key].qty += Number(it.quantity || it.qty || 1) || 1;
        });
      });

      return Object.values(map).sort((a, b) => b.qty - a.qty);
    }

    const itemsMap = detail?.itemsCount || {};
    return Object.entries(itemsMap)
      .map(([rawKey, qty]) => {
        let name = rawKey;
        let size = '';
        let extras = [];
        let smoothieFlavor = '';

        const extrasMatch = name.match(/\[\+\s*([^\]]+)\]/);
        if (extrasMatch) {
          extras = extrasMatch[1]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          name = name.replace(/\[\+\s*([^\]]+)\]/, '').trim();
        }

        const sizeMatch = name.match(/\((\d+oz|mini|plus|ultra)\)/i);
        if (sizeMatch) {
          size = sizeMatch[1];
          name = name.replace(/\((\d+oz|mini|plus|ultra)\)/i, '').trim();
        }

        if (name.toLowerCase().includes('smoothie')) {
          if (!size) size = '12oz';
          const smParts = name.split(' - ');
          if (smParts.length > 1) {
            smoothieFlavor = smParts[1].trim();
            name = smParts[0].trim();
          }
        }

        return { name, qty: nz(qty), size, extras, smoothieFlavor };
      })
      .sort((a, b) => b.qty - a.qty);
  }, [detail, dailyOrders]);

  // --------- RENDER ---------
  if (loading) {
    return (
      <Container>
        <TitlePage>
          <a>Daily Stats</a>
        </TitlePage>
        <ContainerPages>
          <ButtonPage>
            <div style={{ padding: 16, textAlign: 'center', width: '100%' }}>Cargando…</div>
          </ButtonPage>
        </ContainerPages>
      </Container>
    );
  }

  const rowLine = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  };
  const rowLabel = { opacity: 0.7 };
  const rowValue = { textAlign: 'right', flexShrink: 0 };

  // ---- Tabs header ----
  const Tabs = (
    <div style={{ display: 'flex', gap: 8, margin: '6px 0 10px' }}>
      {['days', 'week', 'month'].map((k) => (
        <button
          key={k}
          onClick={() => {
            setDetail(null);
            setView(k);
          }}
          style={{
            padding: '6px 10px',
            borderRadius: 10,
            border: '1px solid #ddd',
            cursor: 'pointer',
            background: view === k ? '#111' : '#fff',
            color: view === k ? '#fff' : '#111',
          }}
        >
          {k === 'days' ? 'Días' : k === 'week' ? 'Semanal' : 'Mensual'}
        </button>
      ))}
      {(view === 'week' || view === 'month') && (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={() =>
              setCursor(
                new Date(
                  cursor.getFullYear(),
                  cursor.getMonth(),
                  cursor.getDate() - (view === 'week' ? 7 : 30)
                )
              )
            }
            style={{
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid #ddd',
              cursor: 'pointer',
            }}
          >
            ← Anterior
          </button>
          <button
            onClick={() => setCursor(new Date())}
            style={{
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid #ddd',
              cursor: 'pointer',
            }}
          >
            Hoy
          </button>
          <button
            onClick={() =>
              setCursor(
                new Date(
                  cursor.getFullYear(),
                  cursor.getMonth(),
                  cursor.getDate() + (view === 'week' ? 7 : 30)
                )
              )
            }
            style={{
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid #ddd',
              cursor: 'pointer',
            }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );

  // ---- LISTA (DÍAS) ----
  if (!detail && view === 'days') {
    return (
      <Container>
        <TitlePage>
          <a>Daily Stats</a>
        </TitlePage>
        <ContainerPages>
          <ButtonPage onClick={goBackToConfig}>
            <IconButton>
              <ChevronLeft />
            </IconButton>
            <a>Volver a Config</a>
          </ButtonPage>

          {Tabs}

          {rows.map((d) => {
            const fecha = d.day;
            const pedidos = nz(d.ordersCount);
            const total = nz(d.revenue);
            return (
              <ButtonPage
                key={d.id}
                onClick={() => setDetail(d)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}
              >
                <div style={{ display: 'grid', gap: 8, flex: 1, minWidth: 0 }}>
                  <div style={rowLine}>
                    <span style={rowLabel}>Fecha</span>
                    <strong style={rowValue}>{formatPrettyDate(fecha)}</strong>
                  </div>
                  <div style={rowLine}>
                    <span style={rowLabel}>Cantidad de pedidos</span>
                    <strong style={rowValue}>{pedidos}</strong>
                  </div>
                  <div style={rowLine}>
                    <span style={rowLabel}>Total</span>
                    <strong style={rowValue}>{formatPrice(total)}</strong>
                  </div>
                </div>
                <span style={{ flexShrink: 0 }}>
                  <ChevronRight />
                </span>
              </ButtonPage>
            );
          })}
        </ContainerPages>
      </Container>
    );
  }

  // ---- RESUMEN SEMANAL ----
  if (view === 'week' && weekly?.agg && !detail) {
    const { agg, range } = weekly;
    const periodLabel = `Semana ${range.startKey} — ${range.endKey}`;
    return (
      <Container>
        <TitlePage>
          <a>Daily Stats</a>
        </TitlePage>
        <ContainerPages>
          <ButtonPage onClick={goBackToConfig}>
            <IconButton>
              <ChevronLeft />
            </IconButton>
            <a>Volver a Config</a>
          </ButtonPage>
          {Tabs}

          {/* Tarjeta simple del resumen */}
          <ButtonPage
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}
            onClick={() => setDetail({ ...agg, day: periodLabel, __summary: 'week' })}
          >
            <div style={{ display: 'grid', gap: 8, flex: 1, minWidth: 0 }}>
              <div style={rowLine}>
                <span style={rowLabel}>Periodo</span>
                <strong style={rowValue}>{periodLabel}</strong>
              </div>
              <div style={rowLine}>
                <span style={rowLabel}>Cantidad de pedidos</span>
                <strong style={rowValue}>{agg.ordersCount}</strong>
              </div>
              <div style={rowLine}>
                <span style={rowLabel}>Total</span>
                <strong style={rowValue}>{formatPrice(agg.revenue)}</strong>
              </div>
            </div>
            <span style={{ flexShrink: 0 }}>
              <ChevronRight />
            </span>
          </ButtonPage>
        </ContainerPages>
      </Container>
    );
  }

  // Guardas de carga/“sin datos” para semana
  if (view === 'week' && weekly?.agg && !detail) {
    return (
      <Container>
        <TitlePage>
          <a>Daily Stats</a>
        </TitlePage>
        <ContainerPages>
          <ButtonPage onClick={goBackToConfig}>
            <IconButton>
              <ChevronLeft />
            </IconButton>
            <a>Volver a Config</a>
          </ButtonPage>
          {Tabs}
          <ButtonPage style={{ width: '100%' }}>
            <div style={{ padding: 16, width: '100%', textAlign: 'center' }}>
              {weekly ? 'Sin datos en esta semana' : 'Cargando semana…'}
            </div>
          </ButtonPage>
        </ContainerPages>
      </Container>
    );
  }

  // ---- RESUMEN MENSUAL ----
  if (view === 'month' && monthly?.agg && !detail) {
    const { agg, range } = monthly;
    const periodLabel = formatMonthPeriodLabel(range);

    return (
      <Container>
        <TitlePage>
          <a>Daily Stats</a>
        </TitlePage>
        <ContainerPages>
          <ButtonPage onClick={goBackToConfig}>
            <IconButton>
              <ChevronLeft />
            </IconButton>
            <a>Volver a Config</a>
          </ButtonPage>

          {Tabs}

          <ButtonPage
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}
            onClick={() => setDetail({ ...agg, day: periodLabel, __summary: 'month' })}
          >
            <div style={{ display: 'grid', gap: 8, flex: 1, minWidth: 0 }}>
              <div style={rowLine}>
                <span style={rowLabel}>Periodo</span>
                <strong style={rowValue}>{periodLabel}</strong>
              </div>
              <div style={rowLine}>
                <span style={rowLabel}>Pedidos</span>
                <strong style={rowValue}>{agg.ordersCount}</strong>
              </div>
              <div style={rowLine}>
                <span style={rowLabel}>Total</span>
                <strong style={rowValue}>{formatPrice(agg.revenue)}</strong>
              </div>
            </div>
            <span style={{ flexShrink: 0 }}>
              <ChevronRight />
            </span>
          </ButtonPage>
        </ContainerPages>
      </Container>
    );
  }

  if (view === 'month' && monthly?.agg && !detail) {
    return (
      <Container>
        <TitlePage>
          <a>Daily Stats</a>
        </TitlePage>
        <ContainerPages>
          <ButtonPage onClick={goBackToConfig}>
            <IconButton>
              <ChevronLeft />
            </IconButton>
            <a>Volver a Config</a>
          </ButtonPage>
          {Tabs}
          <ButtonPage style={{ width: '100%' }}>
            <div style={{ padding: 16, width: '100%', textAlign: 'center' }}>
              {monthly ? 'Sin datos en este mes' : 'Cargando mes…'}
            </div>
          </ButtonPage>
        </ContainerPages>
      </Container>
    );
  }

  if (!detail) {
    // Si llegamos acá, es porque no estamos en "days" (ya manejado arriba),
    // o no hay resumen seleccionado todavía.
    return null;
  }

  // ---- DETALLE (día / semana / mes) ----
  const fecha = detail.day;
  const pedidos = nz(detail.ordersCount);

  const revByMethod = detail.revenueByMethod || detail.paidByMethod || {};
  const totalDia = nz(detail.revenue || sumObj(revByMethod));
  const montoEf = nz(revByMethod.efectivo);
  const montoTr = nz(revByMethod.transferencia);
  const byMode = detail.ordersByMode || {};
  const cantRetiro = nz(byMode.retiro);
  const cantDelivery = nz(byMode.delivery);
  const cantLocal = nz(byMode.local);

  return (
    <Container>
      <TitlePage>
        <a>{detail.__summary ? 'Detalle del resumen' : 'Detalle del día'}</a>
      </TitlePage>
      <ContainerPages>
        <ButtonPage onClick={() => setDetail(null)}>
          <IconButton>
            <ChevronLeft />
          </IconButton>
          <a>Volver</a>
        </ButtonPage>

        <ButtonPage style={{ display: 'flex', alignItems: 'stretch', width: '100%' }}>
          <div style={{ display: 'grid', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={rowLine}>
              <span style={rowLabel}>{detail.__summary ? 'Periodo' : 'Fecha'}</span>
              <strong style={rowValue}>{detail.__summary ? fecha : formatPrettyDate(fecha)}</strong>
            </div>

            <div style={rowLine}>
              <span style={rowLabel}>Pedidos</span>
              <strong style={rowValue}>{pedidos}</strong>
            </div>

            {/* Items vendidos con especificación de medida, sabor y extras */}
            <div style={{ display: 'grid', gap: 6, width: '100%' }}>
              <div style={rowLine}>
                <span style={rowLabel}>Items vendidos</span>
                <strong style={rowValue}>{richItemsList.reduce((a, b) => a + b.qty, 0)}</strong>
              </div>
              {richItemsList.map((it, idx) => (
                <div key={idx} style={{ ...rowLine, paddingLeft: 12, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 500, color: '#111' }}>{it.name}</span>
                    {it.size && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#334155',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '1px 6px',
                          borderRadius: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <CupSoda size={10} strokeWidth={2.4} /> {it.size}
                      </span>
                    )}
                    {it.extras && it.extras.map((ex, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#b45309',
                          background: '#fffbeb',
                          border: '1px solid #fef3c7',
                          padding: '1px 6px',
                          borderRadius: 4,
                        }}
                      >
                        + {ex}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>x{it.qty}</span>
                </div>
              ))}
            </div>

            {/* --- SECCIÓN NUEVA: SABORES MÁS VENDIDOS --- */}
            <div
              style={{
                display: 'grid',
                gap: 6,
                width: '100%',
                marginTop: 10,
                borderTop: '1px solid #eee',
                paddingTop: 10,
              }}
            >
              <div style={rowLine}>
                <span style={{ ...rowLabel, color: '#d35400', fontWeight: 'bold' }}>
                  Sabores más vendidos
                </span>
                {loadingFlavors && <small style={{ color: '#aaa' }}>Calculando...</small>}
              </div>

              {flavorsList.top && flavorsList.top.length > 0
                ? flavorsList.top.slice(0, 10).map(
                    (
                      f // Muestra los top 10 para no saturar
                    ) => (
                      <div key={f.name} style={{ ...rowLine, paddingLeft: 12 }}>
                        <span style={{ fontWeight: 400, fontSize: '0.9em', color: '#b4b4b4' }}>
                          {f.name}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.9em' }}>{f.qty}</span>
                      </div>
                    )
                  )
                : !loadingFlavors && (
                    <span style={{ paddingLeft: 12, opacity: 0.5, fontSize: '0.8em' }}>
                      Sin datos de sabores en este período
                    </span>
                  )}

              {/* --- SABORES MENOS VENDIDOS (POTES) --- */}
              {flavorsList.bottom && flavorsList.bottom.length > 0 && (
                <div style={{ marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10 }}>
                  <div style={rowLine}>
                    <span style={{ ...rowLabel, color: '#7f8c8d', fontWeight: 'bold' }}>
                      Sabores menos vendidos (potes)
                    </span>
                  </div>
                  {flavorsList.bottom
                    .slice(-5)
                    .reverse()
                    .map((f) => (
                      <div key={f.name} style={{ ...rowLine, paddingLeft: 12 }}>
                        <span style={{ fontWeight: 400, fontSize: '0.9em', color: '#b4b4b4' }}>
                          {f.name}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.9em' }}>{f.qty}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Take away / Delivery / Local */}
            <div style={{ display: 'grid', gap: 6, width: '100%' }}>
              <div style={rowLine}>
                <span style={rowLabel}>Take away</span>
                <strong style={rowValue}>{cantRetiro}</strong>
              </div>
              <div style={rowLine}>
                <span style={rowLabel}>Delivery</span>
                <strong style={rowValue}>{cantDelivery}</strong>
              </div>
              {cantLocal > 0 && (
                <div style={rowLine}>
                  <span style={rowLabel}>En el local</span>
                  <strong style={rowValue}>{cantLocal}</strong>
                </div>
              )}
            </div>

            {/* Métodos de pago */}
            <div style={{ display: 'grid', gap: 6, width: '100%' }}>
              <div style={rowLine}>
                <span style={rowLabel}>Efectivo</span>
                <strong style={rowValue}>{formatPrice(montoEf)}</strong>
              </div>
              <div style={rowLine}>
                <span style={rowLabel}>Transferencia</span>
                <strong style={rowValue}>{formatPrice(montoTr)}</strong>
              </div>
            </div>

            <hr style={{ opacity: 0.15, border: 'none', height: 1, background: '#000' }} />

            <div style={rowLine}>
              <span style={rowLabel}>Total {detail.__summary ? 'del período' : 'del día'}</span>
              <strong style={{ ...rowValue, fontSize: 20 }}>{formatPrice(totalDia)}</strong>
            </div>

            {/* --- SECCIÓN NUEVA: PEDIDOS DEL DÍA CON MEDIDA DE VASO Y EXTRAS --- */}
            {dailyOrders && dailyOrders.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  width: '100%',
                  marginTop: 12,
                  borderTop: '1px solid #eee',
                  paddingTop: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowOrdersList((prev) => !prev)}
                >
                  <span style={{ ...rowLabel, color: '#111', fontWeight: 'bold' }}>
                    📋 Pedidos del período ({dailyOrders.length})
                  </span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: '#4f46e5',
                      fontWeight: 700,
                      background: '#eef2ff',
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {showOrdersList ? 'Ocultar pedidos ▲' : 'Ver pedidos ▼'}
                  </span>
                </div>

                {showOrdersList && (
                  <div style={{ display: 'grid', gap: 10, marginTop: 4 }}>
                    {dailyOrders.map((ord, idx) => {
                      const ordNum = ord.numeracion ?? ord.id?.slice(0, 5) ?? idx + 1;
                      const ordItems = Array.isArray(ord.items) ? ord.items : [];
                      const dir = String(ord.direccion || 'Retiro').trim();

                      return (
                        <div
                          key={ord.id || idx}
                          style={{
                            background: '#fafafa',
                            border: '1px solid #e4e4e7',
                            borderRadius: 12,
                            padding: '10px 12px',
                            display: 'grid',
                            gap: 6,
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 900, fontSize: '0.88rem', color: '#111' }}>
                                #{ordNum}
                              </span>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555' }}>
                                {ord.name || dir}
                              </span>
                              {ord.hora && (
                                <span style={{ fontSize: '0.72rem', color: '#888' }}>
                                  ({ord.hora})
                                </span>
                              )}
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#111' }}>
                              {formatPrice(ord.total || 0)}
                            </span>
                          </div>

                          {/* Lista de productos de la orden */}
                          <div style={{ display: 'grid', gap: 4, paddingLeft: 4 }}>
                            {ordItems.map((item, itemIdx) => {
                              const itName = item.name || 'Producto';
                              const itNL = itName.toLowerCase();
                              const isSm = itNL.includes('smoothie') || String(item.category || '').toLowerCase().includes('smoothie');
                              const sz = isSm ? '12oz' : (item.size || item.medida || '');
                              const exList = [];
                              if (Array.isArray(item.extras)) {
                                item.extras.forEach((ex) => {
                                  if (ex) exList.push(String(ex).replace(/\s*\(\+?\$?\d+\)/g, '').trim());
                                });
                              }
                              if ((item.canela || item.withCinnamon) && !exList.some((e) => /canela/i.test(e))) exList.push('Canela');
                              if (item.leche_almendras && !exList.some((e) => /almendra/i.test(e))) exList.push('Leche Almendras');
                              if (item.extra_shot && !exList.some((e) => /shot/i.test(e))) exList.push('Extra Shot');
                              const sab = Array.isArray(item.sabores) ? item.sabores.filter(Boolean) : [];

                              return (
                                <div key={itemIdx} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, fontSize: '0.78rem' }}>
                                  <span style={{ fontWeight: 700, color: '#111' }}>
                                    {Number(item.quantity || 1)}× {itName}
                                  </span>

                                  {/* Medida de vaso */}
                                  {sz && (
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        color: '#334155',
                                        background: '#f1f5f9',
                                        border: '1px solid #cbd5e1',
                                        padding: '1px 5px',
                                        borderRadius: 4,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 2,
                                      }}
                                    >
                                      <CupSoda size={10} strokeWidth={2.4} /> {sz}
                                    </span>
                                  )}

                                  {/* Extras */}
                                  {exList.map((ex, i) => (
                                    <span
                                      key={i}
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: '#b45309',
                                        background: '#fffbeb',
                                        border: '1px solid #fef3c7',
                                        padding: '1px 5px',
                                        borderRadius: 4,
                                      }}
                                    >
                                      + {ex}
                                    </span>
                                  ))}

                                  {/* Vaso */}
                                  {item.vaso && (
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: '#7e22ce',
                                        background: '#faf5ff',
                                        border: '1px solid #f3e8ff',
                                        padding: '1px 5px',
                                        borderRadius: 4,
                                      }}
                                    >
                                      Vaso: "{item.vaso}"
                                    </span>
                                  )}

                                  {/* Sabores de helado */}
                                  {!isSm && sab.length > 0 && (
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: '#047857',
                                        background: '#ecfdf5',
                                        border: '1px solid #a7f3d0',
                                        padding: '1px 5px',
                                        borderRadius: 4,
                                      }}
                                    >
                                      🍨 {sab.join(' + ')}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </ButtonPage>
      </ContainerPages>
    </Container>
  );
}
