const normalizeLabel = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export function parseProductStock(rawStock) {
  if (!rawStock) return {};
  if (typeof rawStock === 'string') {
    try {
      const parsed = JSON.parse(rawStock);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof rawStock === 'object' && !Array.isArray(rawStock) ? rawStock : {};
}

export function getProductOptionNames(rawOptions) {
  if (!rawOptions) return [];
  let options = rawOptions;
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options);
    } catch {
      options = options.split(/[\n,;]+/);
    }
  }
  if (!Array.isArray(options) && typeof options === 'object') {
    options = options.options || options.opciones || options.items || Object.values(options);
  }
  if (!Array.isArray(options)) return [];
  return options
    .map((option) =>
      typeof option === 'string'
        ? option.trim()
        : String(option?.name ?? option?.nombre ?? option?.label ?? option?.value ?? '').trim()
    )
    .filter(Boolean);
}

export function normalizeProductStock(rawStock, optionNames = []) {
  const parsed = parseProductStock(rawStock);
  const storedOptions = parsed.options && typeof parsed.options === 'object'
    ? parsed.options
    : {};
  const options = {};

  optionNames.forEach((name) => {
    const match = Object.entries(storedOptions).find(
      ([storedName]) => normalizeLabel(storedName) === normalizeLabel(name)
    );
    options[name] = match?.[1] !== false;
  });
  Object.entries(storedOptions).forEach(([name, available]) => {
    if (!Object.keys(options).some((key) => normalizeLabel(key) === normalizeLabel(name))) {
      options[name] = available !== false;
    }
  });

  return { available: parsed.available !== false, options };
}

export function isProductAvailable(rawStock) {
  return parseProductStock(rawStock).available !== false;
}

export function isProductOptionAvailable(rawStock, optionName) {
  const parsed = parseProductStock(rawStock);
  if (parsed.available === false) return false;
  return isProductOptionFlagAvailable(rawStock, optionName);
}

export function isProductOptionFlagAvailable(rawStock, optionName) {
  const parsed = parseProductStock(rawStock);
  const match = Object.entries(parsed.options || {}).find(
    ([name]) => normalizeLabel(name) === normalizeLabel(optionName)
  );
  return match?.[1] !== false;
}

export function buildNextProductStock(rawStock, rawOptions, optionName, available) {
  const next = normalizeProductStock(rawStock, getProductOptionNames(rawOptions));
  if (optionName) next.options[optionName] = Boolean(available);
  else next.available = Boolean(available);
  return next;
}
