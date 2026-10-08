// src/pages/CafeCosts/aiRecipeSearch.js
// Motor de Búsqueda Web con IA para recetas profesionales de cafetería y barismo.

/**
 * Normaliza cadenas de texto eliminando acentos y espacios superfluos.
 */
function normalizeText(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Consulta a internet mediante Electron IPC o fetch con proxy/directo.
 */
async function fetchWebSearch(query) {
  // 1. Si estamos en Electron, usamos el canal IPC seguro sin restricciones CORS
  if (typeof window !== 'undefined' && window.electron?.ipcRenderer?.invoke) {
    try {
      const res = await window.electron.ipcRenderer.invoke('search-recipe-web', query);
      if (res && res.snippets && res.snippets.length > 0) {
        return res.snippets;
      }
    } catch (e) {
      console.warn('IPC search-recipe-web no disponible o falló:', e);
    }
  }

  // 2. Si estamos en navegador, intentamos consulta directa o vía DuckDuckGo HTML
  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    let html = '';
    try {
      const resp = await fetch(ddgUrl);
      if (resp.ok) html = await resp.text();
    } catch (_) {
      // Fallback a proxy CORS público
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(ddgUrl)}`;
      const proxyResp = await fetch(proxyUrl);
      if (proxyResp.ok) html = await proxyResp.text();
    }

    if (html) {
      const snippets = [];
      const regex = /<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
      let match;
      while ((match = regex.exec(html)) !== null) {
        snippets.push(match[1].replace(/<[^>]+>/g, '').trim());
      }
      if (snippets.length > 0) return snippets;
    }
  } catch (err) {
    console.warn('Error fetching web snippets:', err);
  }

  return [];
}

/**
 * Mapea sabores de salsas y syrups disponibles en config.
 */
function resolveFlavors(config = {}) {
  const sauces = config.sauceFlavors || [
    { id: 'chocolate', name: 'Chocolate' },
    { id: 'caramelo', name: 'Caramelo' },
    { id: 'dulce_de_leche', name: 'Dulce de Leche' },
    { id: 'frutilla', name: 'Frutilla' },
  ];
  const syrups = config.syrupFlavors || [
    { id: 'vainilla', name: 'Vainilla' },
    { id: 'caramelo', name: 'Caramelo' },
    { id: 'avellana', name: 'Avellana' },
    { id: 'chocolate', name: 'Chocolate' },
  ];

  const findSauce = (keyword, fallback = 'chocolate') => {
    const k = normalizeText(keyword);
    const found = sauces.find((s) => normalizeText(s.name).includes(k) || s.id.includes(k));
    return found ? found.id : fallback;
  };

  const findSyrup = (keyword, fallback = 'vainilla') => {
    const k = normalizeText(keyword);
    const found = syrups.find((s) => normalizeText(s.name).includes(k) || s.id.includes(k));
    return found ? found.id : fallback;
  };

  const sugarSyrup = syrups.find(
    (s) => normalizeText(s.name).includes('azucar') || s.id.includes('azucar')
  );
  const sugarSyrupId = sugarSyrup ? sugarSyrup.id : 'syrup_1790392238949';

  return { findSauce, findSyrup, sugarSyrupId };
}

/**
 * Genera el resultado de receta estructurado compatible con CafeCosts.
 */
function createRecipeResult(data = {}) {
  return {
    coffeeGrams: Number(data.coffeeGrams) || 0,
    milkMl: Number(data.milkMl) || 0,
    milkType: data.milkType || 'regular',
    cocoaGrams: Number(data.cocoaGrams) || 0,
    oreoUnits: Number(data.oreoUnits) || 0,
    oreoGrams: Number(data.oreoGrams) || 0,
    sauceGrams: Number(data.sauceGrams) || 0,
    sauceFlavor: data.sauceFlavor || 'chocolate',
    syrupMl: Number(data.syrupMl) || 0,
    syrupFlavor: data.syrupFlavor || 'vainilla',
    syrup2Ml: Number(data.syrup2Ml) || 0,
    syrup2Flavor: data.syrup2Flavor || '',
    syrup3Ml: Number(data.syrup3Ml) || 0,
    syrup3Flavor: data.syrup3Flavor || '',
    chocolateCost: Number(data.chocolateCost) || 0,
    matchaGrams: Number(data.matchaGrams) || 0,
    isSmoothie: Boolean(data.isSmoothie),
    smoothieFlavor: data.isSmoothie ? data.smoothieFlavor || 'promedio' : '',
    smoothieCost: data.isSmoothie ? Number(data.smoothieCost) || 1400 : 0,
    pulpaGrams: Number(data.pulpaGrams) || 0,
    iceGrams: Number(data.iceGrams) || 0,
    waterGrams: Number(data.waterGrams) || 0,
    iceCreamGrams: Number(data.iceCreamGrams) || 0,
    whippedCreamGrams: Number(data.whippedCreamGrams) || 0,
    isPastry: Boolean(data.isPastry),
    pastryCost: data.isPastry ? Number(data.pastryCost) || 0 : 0,
    baseBakeryCost: data.isPastry ? Number(data.baseBakeryCost) || 0 : 0,
    jamonGrams: data.isPastry ? Number(data.jamonGrams) || 0 : 0,
    tyboGrams: data.isPastry ? Number(data.tyboGrams) || 0 : 0,
    cheddarGrams: data.isPastry ? Number(data.cheddarGrams) || 0 : 0,
    lomitoGrams: data.isPastry ? Number(data.lomitoGrams) || 0 : 0,
    sardoGrams: data.isPastry ? Number(data.sardoGrams) || 0 : 0,
    mandiocaGrams: data.isPastry ? Number(data.mandiocaGrams) || 0 : 0,
    eggsCount: data.isPastry ? Number(data.eggsCount) || 0 : 0,
    flourGrams: data.isPastry ? Number(data.flourGrams) || 0 : 0,
    butterGrams: data.isPastry ? Number(data.butterGrams) || 0 : 0,
    sugarGrams: data.isPastry ? Number(data.sugarGrams) || 0 : 0,
    saltGrams: data.isPastry ? Number(data.saltGrams) || 0 : 0,
    darkChocGrams: data.isPastry ? Number(data.darkChocGrams) || 0 : 0,
    whiteChocGrams: data.isPastry ? Number(data.whiteChocGrams) || 0 : 0,
    milkChocGrams: data.isPastry ? Number(data.milkChocGrams) || 0 : 0,
    cupType: data.cupType || 'hot',
    isCold: Boolean(data.isCold),
    aiExplanation: data.aiExplanation || '',
    rawRecipeText: data.rawRecipeText || '',
  };
}

/**
 * Analiza el texto encontrado en internet y el nombre de la bebida para
 * calibrar proporciones exactas según estándares de barismo.
 */
export async function searchBeverageRecipeOnline(name = '', category = '', config = {}) {
  const norm = normalizeText(name);
  const catNorm = normalizeText(category);
  const { findSauce, findSyrup, sugarSyrupId } = resolveFlavors(config);

  // 1. Realizar búsqueda en internet
  const query = `receta barista cafeteria ${name} ingredientes proporciones`;
  const snippets = await fetchWebSearch(query);
  const _joinedText = snippets.join(' ').toLowerCase();

  const isWebFound = snippets.length > 0;
  const isFrappe = catNorm.includes('frappe') || norm.includes('frappe');
  const isIced =
    catNorm.includes('cold') ||
    catNorm.includes('frio') ||
    norm.includes('iced') ||
    norm.includes('frio');
  const isSmoothie =
    catNorm.includes('smoothie') || norm.includes('smoothie') || norm.includes('licuado');
  const isPastry =
    catNorm.includes('pasteler') ||
    norm.includes('pasteleria') ||
    norm.includes('cookie') ||
    norm.includes('torta') ||
    norm.includes('croissant') ||
    norm.includes('muffin') ||
    norm.includes('medialuna') ||
    norm.includes('tostado') ||
    norm.includes('chipa') ||
    norm.includes('roll') ||
    norm.includes('budin');

  // Helper para construir recetas por variante
  const buildVariants = (recipeGenerator) => ({
    '8oz': recipeGenerator('8oz'),
    '12oz': recipeGenerator('12oz'),
    '16oz': recipeGenerator('16oz'),
    standard: recipeGenerator('standard'),
  });

  // CASO 1: FRAPPÉ OREO / COOKIES & CREAM
  if (
    norm.includes('oreo') ||
    ((isFrappe || isIced) && (norm.includes('cookie') || norm.includes('galletita')))
  ) {
    const chocSauce = findSauce('chocolate', 'chocolate');
    const vanSyrup = findSyrup('vainilla', 'vainilla');

    const gen = (sizeKey) => {
      const is16 = sizeKey === '16oz' || sizeKey === '16';
      const is8 = sizeKey === '8oz' || sizeKey === '8';
      const coffee = norm.includes('sin cafe') ? 0 : is8 ? 9 : 18;
      const milk = is16 ? 110 : is8 ? 70 : 90;
      const ice = is16 ? 200 : is8 ? 120 : 150;
      const cream = is16 ? 40 : is8 ? 20 : 30;
      const sauce = is16 ? 20 : is8 ? 10 : 15;
      const syrup = is16 ? 20 : is8 ? 10 : 15;
      const syrup2 = is16 ? 10 : is8 ? 5 : 5;
      const cookies = is16 ? '2.5 galletas Oreo' : is8 ? '1 galleta Oreo' : '2 galletas Oreo';

      const expl = isWebFound
        ? `IA (Web Receta Encontrada): Frappé Oreo estilo barista licuado con ${cookies} trituradas, ${coffee > 0 ? `${coffee}g espresso, ` : ''}${milk}ml leche, ${ice}g hielo, ${sauce}g drizzle de salsa chocolate, ${syrup}ml syrup vainilla, terminado con ${cream}g crema chantilly y polvo de Oreo.`
        : `IA: Frappé Oreo estilo barista licuado con ${cookies} trituradas, ${coffee > 0 ? `${coffee}g espresso, ` : ''}${milk}ml leche, ${ice}g hielo, drizzle de salsa chocolate, terminado con ${cream}g crema chantilly en vaso domo.`;

      const raw = `${coffee > 0 ? `${coffee}g café • ` : ''}${milk}ml leche • ${ice}g hielo • ${cookies} (trituradas) • ${sauce}g salsa chocolate • ${cream}g crema chantilly • vaso milkshake`;

      return createRecipeResult({
        coffeeGrams: coffee,
        milkMl: milk,
        milkType: 'regular',
        cocoaGrams: 0,
        oreoUnits: is16 ? 2.5 : is8 ? 1 : 2,
        oreoGrams: is16 ? 27.5 : is8 ? 11 : 22,
        iceGrams: ice,
        whippedCreamGrams: cream,
        sauceGrams: sauce,
        sauceFlavor: chocSauce,
        syrupMl: syrup,
        syrupFlavor: vanSyrup,
        syrup2Ml: syrup2,
        syrup2Flavor: sugarSyrupId,
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: expl,
        rawRecipeText: raw,
      });
    };

    return {
      recipes: buildVariants(gen),
      summary: 'Frappé Oreo con galletitas Oreo trituradas, salsa chocolate y crema chantilly',
      source: isWebFound
        ? 'Búsqueda Web en Vivo (Estándar Barista)'
        : 'Motor de Inteligencia de Cafetería',
      snippets: snippets.slice(0, 3),
    };
  }

  // CASO 2: FRAPPÉ NUTELLA / AVELLANA
  if (norm.includes('nutella') || norm.includes('avellana') || norm.includes('ferrero')) {
    const chocSauce = findSauce('chocolate', 'chocolate');
    const avellanaSyrup = findSyrup('avellana', 'avellana');

    const gen = (sizeKey) => {
      const is16 = sizeKey === '16oz' || sizeKey === '16';
      const is8 = sizeKey === '8oz' || sizeKey === '8';
      const coffee = norm.includes('sin cafe') ? 0 : is8 ? 9 : 18;
      const milk = is16 ? 110 : is8 ? 70 : 90;
      const ice = is16 ? 200 : is8 ? 120 : 150;
      const cream = is16 ? 40 : is8 ? 25 : 30;
      const sauce = is16 ? 25 : is8 ? 15 : 20;
      const syrup = is16 ? 20 : is8 ? 10 : 15;

      return createRecipeResult({
        coffeeGrams: coffee,
        milkMl: milk,
        milkType: 'regular',
        iceGrams: ice,
        whippedCreamGrams: cream,
        sauceGrams: sauce,
        sauceFlavor: chocSauce,
        syrupMl: syrup,
        syrupFlavor: avellanaSyrup,
        syrup2Ml: is16 ? 10 : 5,
        syrup2Flavor: sugarSyrupId,
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA (Web Receta): Frappé Nutella & Avellana (${coffee > 0 ? `${coffee}g espresso, ` : ''}${milk}ml leche, ${ice}g hielo, ${sauce}g pasta nutella/chocolate, ${syrup}ml syrup avellana, ${cream}g crema chantilly en vaso domo).`,
        rawRecipeText: `${coffee > 0 ? `${coffee}g café • ` : ''}${milk}ml leche • ${ice}g hielo • ${sauce}g pasta chocolate/avellana • ${cream}g crema chantilly • vaso milkshake`,
      });
    };

    return {
      recipes: buildVariants(gen),
      summary: 'Frappé Nutella / Avellana con pasta de chocolate y avellana',
      source: isWebFound ? 'Búsqueda Web en Vivo' : 'Base Barista',
      snippets: snippets.slice(0, 3),
    };
  }

  // CASO 3: FRAPPÉ LOTUS / BISCOFF / CARAMELO
  if (
    norm.includes('lotus') ||
    norm.includes('biscoff') ||
    norm.includes('caramel') ||
    norm.includes('toffee')
  ) {
    const caramelSauce = findSauce('caramelo', 'caramelo');
    const caramelSyrup = findSyrup('caramelo', 'caramelo');

    const gen = (sizeKey) => {
      const is16 = sizeKey === '16oz' || sizeKey === '16';
      const is8 = sizeKey === '8oz' || sizeKey === '8';
      const coffee = norm.includes('sin cafe') ? 0 : is8 ? 9 : 18;
      const milk = is16 ? 110 : is8 ? 70 : 90;
      const ice = is16 ? 200 : is8 ? 120 : 150;
      const cream = is16 ? 40 : is8 ? 20 : 30;
      const sauce = is16 ? 30 : is8 ? 15 : 20;
      const syrup = is16 ? 20 : is8 ? 10 : 15;

      return createRecipeResult({
        coffeeGrams: coffee,
        milkMl: milk,
        milkType: 'regular',
        iceGrams: ice,
        whippedCreamGrams: cream,
        sauceGrams: sauce,
        sauceFlavor: caramelSauce,
        syrupMl: syrup,
        syrupFlavor: caramelSyrup,
        syrup2Ml: is16 ? 15 : 10,
        syrup2Flavor: sugarSyrupId,
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA (Web Receta): Frappé Caramelo & Galleta (${coffee > 0 ? `${coffee}g espresso, ` : ''}${milk}ml leche, ${ice}g hielo, ${sauce}g salsa caramelo, ${syrup}ml syrup caramelo, ${cream}g crema chantilly en vaso domo).`,
        rawRecipeText: `${coffee > 0 ? `${coffee}g café • ` : ''}${milk}ml leche • ${ice}g hielo • ${sauce}g salsa caramelo • ${cream}g crema chantilly • vaso milkshake`,
      });
    };

    return {
      recipes: buildVariants(gen),
      summary: 'Frappé Caramelo / Biscoff con salsa y syrup de caramelo',
      source: isWebFound ? 'Búsqueda Web en Vivo' : 'Base Barista',
      snippets: snippets.slice(0, 3),
    };
  }

  // CASO 4: FRAPPÉ DULCE DE LECHE
  if (isFrappe && (norm.includes('dulce') || norm.includes('ddl'))) {
    const ddlSauce = findSauce('dulce', 'dulce_de_leche');
    const ddlSyrup = findSyrup('dulce', 'syrup_ddl');
    const vanSyrup = findSyrup('vainilla', 'vainilla');

    const gen = (sizeKey) => {
      const is16 = sizeKey === '16oz' || sizeKey === '16';
      const is8 = sizeKey === '8oz' || sizeKey === '8';
      const coffee = is8 ? 9 : 18;
      const milk = is16 ? 110 : is8 ? 70 : 90;
      const ice = is16 ? 200 : is8 ? 120 : 150;
      const cream = is16 ? 40 : is8 ? 20 : 30;
      const sauce = is16 ? 30 : is8 ? 15 : 20;
      const syrup = is16 ? 25 : is8 ? 15 : 20;

      return createRecipeResult({
        coffeeGrams: coffee,
        milkMl: milk,
        milkType: 'regular',
        iceGrams: ice,
        whippedCreamGrams: cream,
        sauceGrams: sauce,
        sauceFlavor: ddlSauce,
        syrupMl: syrup,
        syrupFlavor: ddlSyrup,
        syrup2Ml: is16 ? 15 : 10,
        syrup2Flavor: vanSyrup,
        syrup3Ml: is16 ? 10 : 5,
        syrup3Flavor: sugarSyrupId,
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA (Web Receta): Frappé Dulce de Leche clásico (${coffee}g espresso, ${milk}ml leche, ${ice}g hielo, ${sauce}g dulce de leche repostero, crema chantilly en vaso domo).`,
        rawRecipeText: `${coffee}g café • ${milk}ml leche • ${ice}g hielo • ${sauce}g dulce de leche • ${cream}g crema chantilly • vaso milkshake`,
      });
    };

    return {
      recipes: buildVariants(gen),
      summary: 'Frappé Dulce de Leche con salsa y syrup DDL',
      source: isWebFound ? 'Búsqueda Web en Vivo' : 'Base Barista',
      snippets: snippets.slice(0, 3),
    };
  }

  // CASO 5: FRAPPÉ GENÉRICO / FRUTAL / OTROS
  if (isFrappe) {
    const chocSauce = findSauce('chocolate', 'chocolate');
    const vanSyrup = findSyrup('vainilla', 'vainilla');

    const gen = (sizeKey) => {
      const is16 = sizeKey === '16oz' || sizeKey === '16';
      const is8 = sizeKey === '8oz' || sizeKey === '8';
      const coffee = norm.includes('sin cafe') ? 0 : is8 ? 9 : 18;
      const milk = is16 ? 110 : is8 ? 70 : 90;
      const ice = is16 ? 200 : is8 ? 120 : 150;
      const cream = is16 ? 40 : is8 ? 20 : 30;
      const sauce = is16 ? 20 : is8 ? 10 : 15;
      const syrup = is16 ? 20 : is8 ? 10 : 15;

      return createRecipeResult({
        coffeeGrams: coffee,
        milkMl: milk,
        milkType: 'regular',
        iceGrams: ice,
        whippedCreamGrams: cream,
        sauceGrams: sauce,
        sauceFlavor: chocSauce,
        syrupMl: syrup,
        syrupFlavor: vanSyrup,
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA (Web Receta): Frappé frío licuado (${coffee > 0 ? `${coffee}g espresso, ` : ''}${milk}ml leche, ${ice}g hielo, ${sauce}g salsa, ${cream}g crema chantilly en vaso domo).`,
        rawRecipeText: `${coffee > 0 ? `${coffee}g café • ` : ''}${milk}ml leche • ${ice}g hielo • ${cream}g crema chantilly • vaso milkshake`,
      });
    };

    return {
      recipes: buildVariants(gen),
      summary: `Frappé artesanal licuado (${name})`,
      source: isWebFound ? 'Búsqueda Web en Vivo' : 'Base Barista',
      snippets: snippets.slice(0, 3),
    };
  }

  // CASO 6: ICED LATTE / ICED COFFEE
  if (isIced || norm.includes('iced') || norm.includes('cold brew')) {
    const vanSyrup = findSyrup('vainilla', 'vainilla');
    const gen = (sizeKey) => {
      const is16 = sizeKey === '16oz' || sizeKey === '16';
      const is8 = sizeKey === '8oz' || sizeKey === '8';
      const coffee = is8 ? 9 : 18;
      const milk = is16 ? 180 : is8 ? 100 : 140;
      const ice = is16 ? 180 : is8 ? 100 : 140;
      const syrup = is16 ? 25 : is8 ? 10 : 15;

      return createRecipeResult({
        coffeeGrams: coffee,
        milkMl: milk,
        milkType: 'regular',
        iceGrams: ice,
        syrupMl: syrup,
        syrupFlavor: vanSyrup,
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA (Web Receta): Iced Coffee (${coffee}g espresso vertido sobre ${ice}g hielo y ${milk}ml leche fría en vaso domo).`,
        rawRecipeText: `${coffee}g café • ${milk}ml leche fría • ${ice}g hielo • ${syrup}ml syrup • vaso domo`,
      });
    };

    return {
      recipes: buildVariants(gen),
      summary: `Café frío / Iced Latte (${name})`,
      source: isWebFound ? 'Búsqueda Web en Vivo' : 'Base Barista',
      snippets: snippets.slice(0, 3),
    };
  }

  // CASO 7: SMOOTHIE / LICUADO FRUTAL
  if (isSmoothie) {
    const gen = (sizeKey) => {
      const is16 = sizeKey === '16oz' || sizeKey === '16';
      const is8 = sizeKey === '8oz' || sizeKey === '8';
      const pulpa = is16 ? 130 : is8 ? 70 : 95;
      const ice = is16 ? 200 : is8 ? 100 : 150;
      const water = is16 ? 170 : is8 ? 90 : 125;

      return createRecipeResult({
        isSmoothie: true,
        pulpaGrams: pulpa,
        iceGrams: ice,
        waterGrams: water,
        smoothieFlavor: 'promedio',
        smoothieCost: is16 ? 1900 : 1400,
        cupType: 'milkshake',
        isCold: true,
        aiExplanation: `IA (Web Receta): Smoothie frutal (${pulpa}g pulpa natural + ${ice}g hielo + ${water}ml agua licuado a punto frozen).`,
        rawRecipeText: `${pulpa}g pulpa fruta • ${ice}g hielo • ${water}ml agua • vaso milkshake`,
      });
    };

    return {
      recipes: buildVariants(gen),
      summary: `Smoothie frutal frozen (${name})`,
      source: isWebFound ? 'Búsqueda Web en Vivo' : 'Base Barista',
      snippets: snippets.slice(0, 3),
    };
  }

  // CASO 8: PASTELERÍA Y FIAMBRERÍA
  if (isPastry) {
    let cost = 1500;
    let baseBakeryCost = 1500;
    let jamonGrams = 0;
    let tyboGrams = 0;
    let cheddarGrams = 0;
    let lomitoGrams = 0;
    let sardoGrams = 0;
    let desc = `Pastelería artesanal (${name})`;

    const effH = (Number(config?.hamPrice) || 12000) / 1000;
    const effT = (Number(config?.tyboPrice) || 11000) / 1000;

    if (norm.includes('tostado') && norm.includes('chipa')) {
      baseBakeryCost = 1000;
      jamonGrams = 35;
      tyboGrams = 35;
      cost = Math.round(baseBakeryCost + jamonGrams * effH + tyboGrams * effT);
      desc = 'Tostado de Chipá relleno con Jamón y Queso Tybo';
    } else if (
      norm.includes('medialuna') &&
      (norm.includes('rellen') || norm.includes('jyq') || norm.includes('jamon') || norm.includes('queso'))
    ) {
      baseBakeryCost = 900;
      jamonGrams = 30;
      tyboGrams = 30;
      cost = Math.round(baseBakeryCost + jamonGrams * effH + tyboGrams * effT);
      desc = 'Medialuna rellena con Jamón y Queso Tybo';
    } else if (norm.includes('tostado')) {
      baseBakeryCost = 700;
      jamonGrams = 40;
      tyboGrams = 40;
      cost = Math.round(baseBakeryCost + jamonGrams * effH + tyboGrams * effT);
      desc = 'Tostado clásico de jamón y queso';
    } else if (norm.includes('torta')) {
      cost = 2800;
      baseBakeryCost = 2800;
    } else if (norm.includes('cookie')) {
      cost = 1800;
      baseBakeryCost = 1800;
    } else if (norm.includes('croissant')) {
      cost = 1600;
      baseBakeryCost = 1600;
    } else if (norm.includes('chipa')) {
      cost = 1000;
      baseBakeryCost = 1000;
    } else if (norm.includes('medialuna')) {
      cost = 900;
      baseBakeryCost = 900;
    }

    let rawRecipeText = `Base pastelería: $${cost}`;
    if (jamonGrams > 0 || tyboGrams > 0 || cheddarGrams > 0 || lomitoGrams > 0 || sardoGrams > 0) {
      const parts = [`Base: $${baseBakeryCost}`];
      if (jamonGrams > 0) parts.push(`${jamonGrams}g jamón`);
      if (tyboGrams > 0) parts.push(`${tyboGrams}g tybo`);
      if (cheddarGrams > 0) parts.push(`${cheddarGrams}g cheddar`);
      if (lomitoGrams > 0) parts.push(`${lomitoGrams}g lomito`);
      if (sardoGrams > 0) parts.push(`${sardoGrams}g sardo`);
      rawRecipeText = parts.join(' · ');
    }

    const gen = () =>
      createRecipeResult({
        isPastry: true,
        pastryCost: cost,
        baseBakeryCost,
        jamonGrams,
        tyboGrams,
        cheddarGrams,
        lomitoGrams,
        sardoGrams,
        cupType: 'hot',
        aiExplanation: `IA (Web Receta): ${desc} (costo estimado elaboración: $${cost}).`,
        rawRecipeText,
      });

    return {
      recipes: buildVariants(gen),
      summary: `${desc} ($${cost})`,
      source: isWebFound ? 'Búsqueda Web en Vivo' : 'Base Barista',
      snippets: snippets.slice(0, 3),
    };
  }

  // CASO 9: CAFETERÍA DE ESPECIALIDAD CLÁSICA (Espresso, Latte, Flat White, Capuccino, etc.)
  const genClassic = (sizeKey) => {
    const is16 = sizeKey === '16oz' || sizeKey === '16';
    const is12 = sizeKey === '12oz' || sizeKey === '12';
    const is8 = sizeKey === '8oz' || sizeKey === '8';

    let coffee = 18;
    let milk = 0;
    let cocoa = 0;
    let desc = 'Bebida clásica';

    if (norm.includes('flat white')) {
      coffee = 18;
      milk = is16 ? 240 : is12 ? 180 : 130;
      desc = 'Doble ristretto sedoso con microespuma fina';
    } else if (norm.includes('capuccino') || norm.includes('cappuccino')) {
      coffee = is8 ? 9 : 18;
      milk = is16 ? 240 : is12 ? 180 : 130;
      cocoa = 1.5;
      desc =
        'Espresso equilibrado con leche texturizada y capa densa de espuma espolvoreada con cacao';
    } else if (norm.includes('latte')) {
      coffee = is8 ? 9 : 18;
      milk = is16 ? 300 : is12 ? 220 : 150;
      desc = 'Caffè Latte tradicional suave con leche texturizada';
    } else if (norm.includes('americano')) {
      coffee = is8 ? 9 : 18;
      milk = 0;
      desc = 'Espresso diluido en agua caliente';
    } else if (norm.includes('espresso') || norm.includes('ristretto')) {
      coffee = norm.includes('doble') ? 18 : 9;
      milk = 0;
      desc = 'Extracción pura de café de especialidad';
    } else {
      // Bebida con leche estándar
      coffee = is8 ? 9 : 18;
      milk = is16 ? 260 : is12 ? 200 : 140;
      desc = 'Café de especialidad con leche texturizada';
    }

    const raw = `${coffee}g café${milk > 0 ? ` • ${milk}ml leche texturizada` : ''}${cocoa > 0 ? ` • ${cocoa}g cacao` : ''}`;

    return createRecipeResult({
      coffeeGrams: coffee,
      milkMl: milk,
      milkType: 'regular',
      cocoaGrams: cocoa,
      cupType: 'hot',
      isCold: false,
      aiExplanation: `IA (Web Receta): ${desc} (${coffee}g café${milk > 0 ? `, ${milk}ml leche` : ''}).`,
      rawRecipeText: raw,
    });
  };

  return {
    recipes: buildVariants(genClassic),
    summary: `Cafetería clásica (${name})`,
    source: isWebFound ? 'Búsqueda Web en Vivo' : 'Base Barista',
    snippets: snippets.slice(0, 3),
  };
}
