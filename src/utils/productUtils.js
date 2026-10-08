export function explodeOptionsFromRecords(records = []) {
    const flatRaw = [];
    const grouped = [];

    const toOption = (v) => {
        if (!v) return null;
        if (typeof v === 'string') return { value: v.trim(), label: v.trim() };
        if (typeof v === 'object') {
            const s = v.value ?? v.label ?? v.name ?? v.nombre ?? v.sabor;
            return s ? { value: String(s).trim(), label: String(s).trim() } : null;
        }
        return { value: String(v).trim(), label: String(v).trim() };
    };

    const collect = (raw) => {
        if (!raw) return [];
        let data = raw;

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch {
                return [toOption(data)].filter(Boolean);
            }
        }
        if (Array.isArray(data)) return data.map(toOption).filter(Boolean);
        if (typeof data === 'object') return Object.values(data).flatMap(collect);
        return [toOption(data)].filter(Boolean);
    };

    records.forEach((rec) => {
        // por si tenés algún registro “sabor suelto”
        const single = rec.name ?? rec.nombre ?? rec.sabor;
        if (single) flatRaw.push(String(single).trim());

        // y los agrupados en rec.options / rec.opciones / etc.
        const opts = collect(
            rec.options ?? rec.opciones ?? rec.items ?? rec.values ?? rec.list ?? rec.optionsJson
        );
        if (opts.length) {
            const seenGroupOpts = new Set();
            const sortedOpts = opts
                .filter((o) => o && o.label && !seenGroupOpts.has(o.label.toLowerCase()) && seenGroupOpts.add(o.label.toLowerCase()))
                .sort((a, b) => (a.label || '').localeCompare(b.label || '', 'es', { sensitivity: 'base' }));

            grouped.push({ label: rec.label ?? rec.nombre ?? rec.grupo ?? 'Otros', options: sortedOpts });
            flatRaw.push(...sortedOpts.map((o) => o.label));
        }
    });

    // únicos + ordenados
    const seen = new Set();
    const flat = flatRaw
        .map((s) => String(s).trim())
        .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))
        .map((s) => ({ value: s, label: s }))
        .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));

    return { flat, grouped };
}
