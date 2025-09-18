// Fetch rango desde PocketBase (TEXT YYYY-MM-DD)
import { pb } from "../lib/pb";

export async function fetchDailyStatsInRange({ startKey, endKey }) {
  // si tu campo `day` es TEXT YYYY-MM-DD, esto funciona:
  const filter = `day >= "${startKey}" && day <= "${endKey}"`;
  return await pb.collection("daily_stats").getFullList({ filter, sort: "+day" });
}

// utils de fecha (negocio): semana y mes
export function getWeekRangeKeys({ from = new Date(), cutoffHour = 3 } = {}) {
  // día de negocio (aplicando cutoff)
  const base = new Date(from);
  if (base.getHours() < cutoffHour) base.setDate(base.getDate() - 1);

  // Lunes como inicio de semana (ajustá si usás otro)
  const day = base.getDay(); // 0=Domingo ... 6=Sábado
  const diffToMonday = (day + 6) % 7; // convierte 0(Dom) en 6, 1(Lun)=0, etc.

  const start = new Date(base);
  start.setDate(base.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return { startKey: fmt(start), endKey: fmt(end) };
}

export function getMonthRangeKeys({ from = new Date(), cutoffHour = 3 } = {}) {
  // ajustamos por cutoff para el "mes de negocio"
  const base = new Date(from);
  if (base.getHours() < cutoffHour) base.setDate(base.getDate() - 1);

  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end   = new Date(base.getFullYear(), base.getMonth() + 1, 0);

  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return { startKey: fmt(start), endKey: fmt(end) };
}

// Aggregadores (re-usa tu lógica de merges)
const nz = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
const safeObj = o => (o && typeof o === 'object' && !Array.isArray(o)) ? {...o} : {};
const mergeMapsSum = (a = {}, b = {}) => {
  const out = {...safeObj(a)};
  for (const [k, v] of Object.entries(safeObj(b))) {
    out[k] = nz(out[k]) + nz(v);
  }
  return out;
};

// Agrega varios documentos daily_stats a un resumen único
export function aggregateDailyDocs(docs = []) {
  return docs.reduce((acc, d) => ({
    revenue:        nz(acc.revenue) + nz(d.revenue),
    ordersCount:    nz(acc.ordersCount) + nz(d.ordersCount),
    itemsCount:     mergeMapsSum(acc.itemsCount,     d.itemsCount),
    revenueByMethod:mergeMapsSum(acc.revenueByMethod,d.revenueByMethod || d.paidByMethod),
    ordersByMode:   mergeMapsSum(acc.ordersByMode,   d.ordersByMode),
    ordersByMethod: mergeMapsSum(acc.ordersByMethod, d.ordersByMethod),
  }), { revenue:0, ordersCount:0, itemsCount:{}, revenueByMethod:{}, ordersByMode:{}, ordersByMethod:{} });
}