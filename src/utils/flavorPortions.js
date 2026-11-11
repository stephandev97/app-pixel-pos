// Conserva los datos originales: solo transforma la representación visual.
export function formatFlavorPortions(flavors = []) {
  if (!Array.isArray(flavors)) return [];
  const counts = new Map();
  for (const raw of flavors) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const match = raw.trim().match(/^(.*?)\s*\(x(\d+)\)$/i);
    const name = (match ? match[1] : raw).trim();
    const count = match ? Number(match[2]) : 1;
    if (count > 0) counts.set(name, (counts.get(name) || 0) + count);
  }
  const quantities = [...counts.values()];
  if (counts.size <= 1 || quantities.every((count) => count === quantities[0])) return [...counts.keys()];
  const minimum = Math.min(...quantities);
  const total = quantities.reduce((sum, count) => sum + count, 0);
  return [...counts].map(([name, count]) => {
    if (count * 3 === total * 2) return `${name} (2/3)`;
    if (count * 2 === total) return `${name} (Mitad)`;
    return count > minimum ? `${name} (Más)` : name;
  });
}
