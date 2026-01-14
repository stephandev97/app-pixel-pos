// src/pages/DailyStats.js
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { useDispatch } from 'react-redux';

import { pb } from '../../lib/pb';
import { toggleConfig, toggleDailyStats } from '../../redux/actions/actionsSlice';
import { formatPrice } from '../../utils/formatPrice';
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
      setFlavorsList([]);
      return;
    }

    (async () => {
      setLoadingFlavors(true);
      try {
        let filter = "";

        // Si es un resumen (semana/mes), usamos el rango de fechas que ya calculaste
        if (detail.__summary === 'week' && weekly?.range) {
          filter = `businessDate >= "${weekly.range.startKey}" && businessDate <= "${weekly.range.endKey}"`;
        } else if (detail.__summary === 'month' && monthly?.range) {
          filter = `businessDate >= "${monthly.range.startKey}" && businessDate <= "${monthly.range.endKey}"`;
        } else {
          // Si es un día individual
          filter = `businessDate = "${detail.day}"`;
        }

        const orders = await pb.collection('orders').getFullList({ filter });

        const counts = {};
        orders.forEach(order => {
          const items = Array.isArray(order.items) ? order.items : [];
          items.forEach(item => {
            // Procesamos el array de sabores de cada item
            if (Array.isArray(item.sabores)) {
              item.sabores.forEach(sabor => {
                // Sumamos por cada vez que aparece el sabor
                counts[sabor] = (counts[sabor] || 0) + 1;
              });
            }
          });
        });

        const sorted = Object.entries(counts)
          .map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty);

        setFlavorsList(sorted);
      } catch (e) {
        console.error("Error al obtener sabores:", e);
      } finally {
        setLoadingFlavors(false);
      }
    })();
  }, [detail, weekly?.range, monthly?.range]); // Dependencias para que refresque al cambiar de periodo

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
  const itemsMap = detail.itemsCount || {};
  const itemsList = Object.entries(itemsMap)
    .map(([name, qty]) => ({ name, qty: nz(qty) }))
    .sort((a, b) => b.qty - a.qty);

  const revByMethod = detail.revenueByMethod || detail.paidByMethod || {};
  const totalDia = nz(detail.revenue || sumObj(revByMethod));
  const montoEf = nz(revByMethod.efectivo);
  const montoTr = nz(revByMethod.transferencia);
  const byMode = detail.ordersByMode || {};
  const cantRetiro = nz(byMode.retiro);
  const cantDelivery = nz(byMode.delivery);

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

            {/* Items vendidos (label con total) + filas con font-weight menor */}
            <div style={{ display: 'grid', gap: 6, width: '100%' }}>
              <div style={rowLine}>
                <span style={rowLabel}>Items vendidos</span>
                <strong style={rowValue}>{itemsList.reduce((a, b) => a + b.qty, 0)}</strong>
              </div>
              {itemsList.map((it) => (
                <div key={it.name} style={{ ...rowLine, paddingLeft: 12 }}>
                  <span style={{ fontWeight: 400, opacity: 0.85 }}>{it.name}</span>
                  <span style={{ fontWeight: 500 }}>x{it.qty}</span>
                </div>
              ))}
            </div>

            {/* --- SECCIÓN NUEVA: SABORES MÁS VENDIDOS --- */}
            <div style={{ display: 'grid', gap: 6, width: '100%', marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10 }}>
              <div style={rowLine}>
                <span style={{ ...rowLabel, color: '#d35400', fontWeight: 'bold' }}>
                  Sabores más vendidos
                </span>
                {loadingFlavors && <small style={{ color: '#aaa' }}>Calculando...</small>}
              </div>

              {flavorsList.length > 0 ? (
                flavorsList.slice(0, 10).map((f) => ( // Muestra los top 10 para no saturar
                  <div key={f.name} style={{ ...rowLine, paddingLeft: 12 }}>
                    <span style={{ fontWeight: 400, fontSize: '0.9em', color: '#b4b4b4' }}>{f.name}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9em' }}>{f.qty}</span>
                  </div>
                ))
              ) : !loadingFlavors && (
                <span style={{ paddingLeft: 12, opacity: 0.5, fontSize: '0.8em' }}>
                  Sin datos de sabores en este período
                </span>
              )}
            </div>


            {/* Take away / Delivery */}
            <div style={{ display: 'grid', gap: 6, width: '100%' }}>
              <div style={rowLine}>
                <span style={rowLabel}>Take away</span>
                <strong style={rowValue}>{cantRetiro}</strong>
              </div>
              <div style={rowLine}>
                <span style={rowLabel}>Delivery</span>
                <strong style={rowValue}>{cantDelivery}</strong>
              </div>
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
          </div>
        </ButtonPage>
      </ContainerPages>
    </Container>
  );
}
