// src/components/Orders/baristaRecipesData.js
// Fichero maestro de recetas técnicas, ingredientes exactos y pasos de preparación para Baristas

export const MASTER_RECIPES = {
  // ==========================================
  // FRAPPÉS & BEBIDAS FROZEN
  // ==========================================
  'frappe oreo': {
    name: 'Frappé Oreo',
    category: 'frappe',
    isFrappe: true,
    isCold: true,
    glass: 'Vaso Domo con tapa domo',
    sizes: {
      '12oz': {
        glass: 'Vaso Domo 12oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (1 shot)', icon: 'coffee' },
          { name: 'Leche fría', amount: '90ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
          { name: 'Salsa de Chocolate', amount: '15g', icon: 'sauce' },
          { name: 'Syrup de Vainilla', amount: '15ml (1.5 pumps)', icon: 'syrup' },
          { name: 'Syrup de Azúcar', amount: '5ml (1/2 pump)', icon: 'syrup' },
          { name: 'Galletitas Oreo', amount: '2 u', icon: 'cookie' },
          { name: 'Crema Chantilly', amount: '30g', icon: 'cream' },
          { name: 'Oreo decoración', amount: '1 u (tope)', icon: 'cookie' },
        ],
        steps: [
          'En la licuadora colocar: 150g de hielo, 90ml de leche fría, 15g salsa de chocolate, 15ml (1.5 pumps) syrup de vainilla, 5ml (1/2 pump) syrup de azúcar y 2 galletitas Oreo troceadas.',
          'Extraer 1 shot de espresso concentrado y añadirlo a la licuadora.',
          'Licuar por 25 segundos hasta textura frappé cremosa y homogénea.',
          'Decorar las paredes internas del vaso domo 12oz con abundantes hilos de salsa de chocolate.',
          'Servir el frappé, montar copo de crema chantilly (30g), clavar 1 galletita Oreo entera y espolvorear migas.',
          'Cerrar con tapa domo y sorbete grueso.',
        ],
      },
      '16oz': {
        glass: 'Vaso Domo 16oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche fría', amount: '110ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '200g', icon: 'ice' },
          { name: 'Salsa de Chocolate', amount: '20g', icon: 'sauce' },
          { name: 'Syrup de Vainilla', amount: '20ml (2 pumps)', icon: 'syrup' },
          { name: 'Syrup de Azúcar', amount: '10ml (1 pump)', icon: 'syrup' },
          { name: 'Galletitas Oreo', amount: '3 u', icon: 'cookie' },
          { name: 'Crema Chantilly', amount: '40g', icon: 'cream' },
          { name: 'Oreo decoración', amount: '1 u (tope)', icon: 'cookie' },
        ],
        steps: [
          'En la licuadora colocar: 200g de hielo, 110ml de leche fría, 20g salsa de chocolate, 20ml (2 pumps) syrup de vainilla, 10ml (1 pump) syrup de azúcar y 3 galletitas Oreo troceadas.',
          'Extraer espresso doble y agregarlo a la licuadora.',
          'Licuar por 25-30 segundos a potencia máxima hasta textura frozen espesa sin cristales duros.',
          'Bañar con abundante salsa de chocolate las paredes internas del vaso domo 16oz.',
          'Llenar el vaso con el frappé, coronar con torre de crema chantilly (40g), 1 Oreo entera y lluvia de galletita.',
          'Colocar tapa domo transparente y sorbete ancho para frappé.',
        ],
      },
    },
  },

  'frappe dulce de leche': {
    name: 'Frappé Dulce de Leche',
    category: 'frappe',
    isFrappe: true,
    isCold: true,
    glass: 'Vaso Domo con tapa domo',
    sizes: {
      '12oz': {
        glass: 'Vaso Domo 12oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (1 shot)', icon: 'coffee' },
          { name: 'Leche fría', amount: '90ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
          { name: 'Salsa Dulce de Leche', amount: '10g', icon: 'sauce' },
          { name: 'Syrup Dulce de Leche', amount: '20ml (2 pumps)', icon: 'syrup' },
          { name: 'Syrup de Vainilla', amount: '10ml (1 pump)', icon: 'syrup' },
          { name: 'Syrup de Azúcar', amount: '10ml (1 pump)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '30g', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar: 150g de hielo, 90ml de leche fría, 10g salsa de dulce de leche, 20ml (2 pumps) syrup DDL, 10ml (1 pump) syrup vainilla y 10ml (1 pump) syrup azúcar.',
          'Extraer 1 shot de espresso concentrado y añadirlo a la licuadora.',
          'Licuar por 25 segundos a potencia alta hasta consistencia frappé suave y densa.',
          'Dibujar espirales de salsa de dulce de leche en las paredes internas del vaso domo 12oz.',
          'Servir la mezcla, coronar con copo de crema chantilly (30g) y rematar con zigzag de salsa de dulce de leche arriba.',
          'Colocar tapa domo y sorbete grueso.',
        ],
      },
      '16oz': {
        glass: 'Vaso Domo 16oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche fría', amount: '110ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '200g', icon: 'ice' },
          { name: 'Salsa Dulce de Leche', amount: '30g', icon: 'sauce' },
          { name: 'Syrup Dulce de Leche', amount: '25ml (2.5 pumps)', icon: 'syrup' },
          { name: 'Syrup de Vainilla', amount: '15ml (1.5 pumps)', icon: 'syrup' },
          { name: 'Syrup de Azúcar', amount: '10ml (1 pump)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '40g', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar: 200g de hielo, 110ml de leche fría, 30g salsa de dulce de leche, 25ml (2.5 pumps) syrup DDL, 15ml (1.5 pumps) syrup vainilla y 10ml (1 pump) syrup azúcar.',
          'Extraer espresso doble e incorporarlo a la licuadora.',
          'Licuar por 25-30 segundos hasta emulsión perfecta sin cristales de hielo.',
          'Bañar generosamente las paredes internas del vaso domo 16oz con salsa de dulce de leche.',
          'Servir el frappé, montar copo alto de crema chantilly (40g) y decorar con abundantes hilos de dulce de leche.',
          'Cerrar con tapa domo y sorbete ancho.',
        ],
      },
    },
  },

  'frappe pistacho': {
    name: 'Frappé Pistacho',
    category: 'frappe',
    isFrappe: true,
    isCold: true,
    glass: 'Vaso Domo con tapa domo',
    sizes: {
      '12oz': {
        glass: 'Vaso Domo 12oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (1 shot)', icon: 'coffee' },
          { name: 'Leche fría', amount: '90ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
          { name: 'Salsa de Pistacho', amount: '20g', icon: 'sauce' },
          { name: 'Syrup de Pistacho', amount: '15ml (1.5 pumps)', icon: 'syrup' },
          { name: 'Syrup de Azúcar', amount: '10ml (1 pump)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '30g', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar: 150g hielo, 90ml leche fría, 20g pasta/salsa de pistacho, 15ml (1.5 pumps) syrup pistacho y 10ml (1 pump) syrup azúcar.',
          'Extraer 1 shot de espresso concentrado y agregarlo a la licuadora.',
          'Licuar por 25 segundos hasta consistencia cremosa frozen homogénea.',
          'Decorar las paredes internas del vaso domo 12oz con salsa de pistacho.',
          'Servir el frappé, coronar con crema chantilly (30g), hilos de salsa de pistacho y pistacho picado.',
          'Colocar tapa domo y sorbete grueso.',
        ],
      },
      '16oz': {
        glass: 'Vaso Domo 16oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche fría', amount: '110ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '200g', icon: 'ice' },
          { name: 'Salsa de Pistacho', amount: '25g', icon: 'sauce' },
          { name: 'Syrup de Pistacho', amount: '20ml (2 pumps)', icon: 'syrup' },
          { name: 'Syrup de Azúcar', amount: '15ml (1.5 pumps)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '40g', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar: 200g hielo, 110ml leche fría, 25g salsa de pistacho, 20ml (2 pumps) syrup pistacho y 15ml (1.5 pumps) syrup azúcar.',
          'Extraer espresso doble e incorporarlo a la licuadora.',
          'Licuar por 25-30 segundos a velocidad máxima hasta lograr textura bien cremosa.',
          'Decorar generosamente el interior del vaso domo 16oz con salsa de pistacho.',
          'Servir la preparación, montar copo de crema chantilly (40g) y bañar con salsa de pistacho.',
          'Cerrar con tapa domo y sorbete grueso.',
        ],
      },
    },
  },

  'frappe mocca': {
    name: 'Frappé Mocca',
    category: 'frappe',
    isFrappe: true,
    isCold: true,
    glass: 'Vaso Domo con tapa domo',
    sizes: {
      '12oz': {
        glass: 'Vaso Domo 12oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (1 shot)', icon: 'coffee' },
          { name: 'Leche fría', amount: '90ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
          { name: 'Salsa de Chocolate', amount: '8g', icon: 'sauce' },
          { name: 'Syrup de Chocolate', amount: '20ml (2 pumps)', icon: 'syrup' },
          { name: 'Syrup de Azúcar', amount: '10ml (1 pump)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '30g', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar: 150g hielo, 90ml leche fría, 8g salsa chocolate, 20ml (2 pumps) syrup chocolate y 10ml (1 pump) syrup azúcar.',
          'Extraer 1 espresso concentrado y agregarlo a la licuadora.',
          'Licuar a velocidad alta por 25 segundos hasta textura frappé homogénea.',
          'Dibujar espirales de salsa de chocolate en las paredes del vaso domo 12oz.',
          'Servir el frappé, coronar con crema chantilly (30g) y decoración con salsa de chocolate.',
          'Tapar con domo y colocar sorbete grueso.',
        ],
      },
      '16oz': {
        glass: 'Vaso Domo 16oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche fría', amount: '110ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '200g', icon: 'ice' },
          { name: 'Salsa de Chocolate', amount: '10g', icon: 'sauce' },
          { name: 'Syrup de Chocolate', amount: '25ml (2.5 pumps)', icon: 'syrup' },
          { name: 'Syrup de Azúcar', amount: '15ml (1.5 pumps)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '40g', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar: 200g hielo, 110ml leche, 10g salsa chocolate, 25ml (2.5 pumps) syrup chocolate y 15ml (1.5 pumps) syrup azúcar.',
          'Extraer espresso doble y agregarlo a la licuadora.',
          'Licuar por 25-30 segundos hasta punto frappé consistente.',
          'Salsear las paredes del vaso domo 16oz con salsa de chocolate.',
          'Servir la mezcla, montar copo de crema chantilly (40g) y terminar con salsa de chocolate.',
          'Cerrar con tapa domo y sorbete ancho.',
        ],
      },
    },
  },

  'frappe mocca blanco': {
    name: 'Frappé Mocca Blanco',
    category: 'frappe',
    isFrappe: true,
    isCold: true,
    glass: 'Vaso Domo con tapa domo',
    sizes: {
      '12oz': {
        glass: 'Vaso Domo 12oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (1 shot)', icon: 'coffee' },
          { name: 'Leche fría', amount: '90ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
          { name: 'Syrup Chocolate Blanco', amount: '25ml (2.5 pumps)', icon: 'syrup' },
          { name: 'Syrup de Azúcar', amount: '10ml (1 pump)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '30g', icon: 'cream' },
          { name: 'Salsa Chocolate Blanco', amount: 'Decoración', icon: 'sauce' },
        ],
        steps: [
          'En la licuadora colocar: 150g hielo, 90ml leche fría, 25ml (2.5 pumps) syrup chocolate blanco y 10ml (1 pump) syrup de azúcar.',
          'Extraer shot de espresso concentrado y agregarlo a la licuadora.',
          'Licuar a velocidad alta por 25 segundos hasta consistencia frappé cremosa.',
          'Decorar las paredes internas del vaso 12oz con salsa de chocolate blanco.',
          'Servir en el vaso domo, coronar con crema chantilly (30g) y líneas de chocolate blanco arriba.',
          'Cerrar con tapa domo y sorbete.',
        ],
      },
      '16oz': {
        glass: 'Vaso Domo 16oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche fría', amount: '110ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '200g', icon: 'ice' },
          { name: 'Syrup Chocolate Blanco', amount: '35ml (3.5 pumps)', icon: 'syrup' },
          { name: 'Syrup de Azúcar', amount: '15ml (1.5 pumps)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '40g', icon: 'cream' },
          { name: 'Salsa Chocolate Blanco', amount: 'Decoración', icon: 'sauce' },
        ],
        steps: [
          'En la licuadora colocar: 200g hielo, 110ml leche, 35ml (3.5 pumps) syrup chocolate blanco y 15ml (1.5 pumps) syrup azúcar.',
          'Extraer espresso doble e incorporarlo a la licuadora.',
          'Licuar durante 25-30 segundos hasta textura densa frappé.',
          'Decorar el interior del vaso 16oz con salsa de chocolate blanco.',
          'Servir el frappé, montar copo de crema chantilly (40g) y bañar con hilos de salsa blanca.',
          'Tapar y entregar con sorbete grueso.',
        ],
      },
    },
  },

  milkshake: {
    name: 'Milkshake',
    category: 'frio',
    isFrappe: true,
    isCold: true,
    glass: 'Vaso Domo con tapa domo',
    sizes: {
      '12oz': {
        glass: 'Vaso Domo 12oz',
        ingredients: [
          { name: 'Helado artesanal', amount: '120g', icon: 'icecream' },
          { name: 'Leche fría', amount: '120ml', icon: 'milk' },
          { name: 'Salsa Chocolate/DDL', amount: '25g', icon: 'sauce' },
          { name: 'Crema Chantilly', amount: 'Opcional (25g)', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar 120g de helado y 120ml de leche entera fría.',
          'Licuar por 15 a 20 segundos a velocidad moderada (no sobrebatir para mantener cremosidad y cuerpo).',
          'Salsear en espiral las paredes del vaso domo 12oz con 25g de salsa correspondiente.',
          'Servir el batido en el vaso, coronar opcionalmente con crema chantilly y toppings.',
          'Colocar tapa domo y sorbete grueso.',
        ],
      },
      '16oz': {
        glass: 'Vaso Domo 16oz',
        ingredients: [
          { name: 'Helado artesanal', amount: '180g', icon: 'icecream' },
          { name: 'Leche fría', amount: '160ml', icon: 'milk' },
          { name: 'Salsa Chocolate/DDL', amount: '35g', icon: 'sauce' },
          { name: 'Crema Chantilly', amount: 'Opcional (35g)', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar 180g de helado artesanal y 160ml de leche bien fría.',
          'Licuar durante 18-20 segundos hasta textura suave, densa y espumosa.',
          'Decorar las paredes internas del vaso domo 16oz con 35g de salsa.',
          'Servir el milkshake en el vaso y coronar opcionalmente con crema chantilly y toppings.',
          'Tapar y servir con sorbete ancho.',
        ],
      },
    },
  },

  smoothie: {
    name: 'Smoothie',
    category: 'frio',
    isFrappe: true,
    isCold: true,
    glass: 'Vaso Domo 12oz',
    pumpRule: '5 pumps aprox para 100gr (~20g por disparo)',
    sizes: {
      '12oz': {
        glass: 'Vaso Domo 12oz',
        ingredients: [
          { name: 'Pulpa de fruta concentrada', amount: '95g (~5 pumps)', icon: 'fruit' },
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
          { name: 'Agua purificada fría', amount: '125ml', icon: 'water' },
        ],
        steps: [
          'En el vaso licuador colocar 150g de hielo, 95g (~5 pumps aprox) de pulpa de fruta concentrada y 125ml de agua purificada fría.',
          'Licuar a velocidad máxima por 25-30 segundos hasta consistencia smoothie brillante y homogénea.',
          'Servir de inmediato en vaso domo 12oz frío con tapa domo y sorbete grueso.',
        ],
        tip: 'Dosificación de pulpa: 5 pumps aprox equivalen a 100g de pulpa (1 pump ≈ 20g).',
      },
    },
  },

  // ==========================================
  // CAFETERÍA CLÁSICA Y ESPECIALIDAD (HOT & COLD)
  // ==========================================
  latte: {
    name: 'Latte',
    category: 'clasico',
    isFrappe: false,
    sizes: {
      '8oz': {
        glass: 'Taza 8oz / Vaso Térmico 8oz',
        ingredients: [
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '150ml', icon: 'milk' },
          { name: 'Microespuma', amount: '0.5cm', icon: 'foam' },
        ],
        steps: [
          'Extraer 1 shot de espresso directamente en la taza o vaso térmico.',
          'Vaporizar 150ml de leche fresca a 65°C con microespuma sedosa y fina (0.5cm).',
          'Verter la leche texturizada sobre el espresso integrando suavemente desde el centro (opcional: arte latte).',
        ],
      },
      '12oz': {
        glass: 'Taza 12oz / Vaso Térmico 12oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '220ml', icon: 'milk' },
          { name: 'Microespuma', amount: '0.5cm', icon: 'foam' },
        ],
        steps: [
          'Extraer espresso doble (36g líquido) en la taza o vaso de 12oz.',
          'Vaporizar 220ml de leche fresca a 65°C logrando microespuma brillante y elástica.',
          'Verter la leche sobre el espresso integrando suavemente (opcional: diseño arte latte).',
        ],
      },
      '16oz': {
        glass: 'Vaso Térmico 16oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '300ml', icon: 'milk' },
          { name: 'Microespuma', amount: '0.5cm', icon: 'foam' },
        ],
        steps: [
          'Extraer espresso doble en el vaso térmico de 16oz.',
          'Vaporizar 300ml de leche fresca hasta 65°C con textura sedosa.',
          'Verter la leche lentamente en el centro integrando completamente y colocar tapa térmica.',
        ],
      },
    },
    coldOverride: {
      '8oz': {
        glass: 'Vaso 8oz con hielo',
        ingredients: [
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
          { name: 'Leche fría', amount: '100ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '100g', icon: 'ice' },
        ],
        steps: [
          'Llenar el vaso con 100g de hielo en rolito.',
          'Verter 100ml de leche fría sobre el hielo.',
          'Extraer 1 shot de espresso y verterlo despacio por encima del hielo para lograr efecto degradado.',
          'Servir con sorbete.',
        ],
      },
      '12oz': {
        glass: 'Vaso Domo 12oz con hielo',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche fría', amount: '140ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
        ],
        steps: [
          'Llenar el vaso domo con 150g de cubos de hielo.',
          'Añadir 140ml de leche fría dejando espacio arriba.',
          'Extraer espresso doble y verterlo lentamente sobre los hielos para mantener las capas separadas (leche abajo, café arriba).',
          'Colocar tapa domo y sorbete.',
        ],
      },
      '16oz': {
        glass: 'Vaso Domo 16oz con hielo',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche fría', amount: '180ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '200g', icon: 'ice' },
        ],
        steps: [
          'Llenar vaso domo 16oz con 200g de hielo en rolito y 180ml de leche fría.',
          'Extraer espresso doble y verterlo suavemente sobre la superficie con hielo.',
          'Tapar y servir con sorbete.',
        ],
      },
    },
  },

  cappuccino: {
    name: 'Cappuccino',
    category: 'clasico',
    isFrappe: false,
    sizes: {
      '8oz': {
        glass: 'Taza Cappuccino 8oz',
        ingredients: [
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
          { name: 'Leche vaporizada', amount: '120ml', icon: 'milk' },
          { name: 'Espuma densa', amount: '1.5cm', icon: 'foam' },
          { name: 'Cacao amargo', amount: 'Lluvia', icon: 'spice' },
        ],
        steps: [
          'Extraer 1 shot de espresso en taza de cappuccino.',
          'Vaporizar 120ml de leche fría generando espuma espesa y cremosa hasta 65°C (1.5cm).',
          'Verter la leche empujando la espuma en el centro para formar el clásico domo blanco.',
          'Espolvorear con cacao amargo o canela a gusto.',
        ],
      },
      '12oz': {
        glass: 'Taza 12oz / Vaso Térmico 12oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche vaporizada', amount: '180ml', icon: 'milk' },
          { name: 'Espuma densa', amount: '1.5cm', icon: 'foam' },
          { name: 'Cacao amargo', amount: 'Lluvia', icon: 'spice' },
        ],
        steps: [
          'Extraer espresso doble en la taza o vaso de 12oz.',
          'Vaporizar 180ml de leche generando abundante espuma densa y aterciopelada a 65°C.',
          'Verter la leche empujando una buena capa de espuma en la parte superior.',
          'Finalizar con lluvia de cacao puro en polvo.',
        ],
      },
      '16oz': {
        glass: 'Vaso Térmico 16oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche vaporizada', amount: '240ml', icon: 'milk' },
          { name: 'Espuma densa', amount: '2cm', icon: 'foam' },
          { name: 'Cacao amargo', amount: 'Lluvia', icon: 'spice' },
        ],
        steps: [
          'Extraer espresso doble en vaso térmico 16oz.',
          'Vaporizar 240ml de leche para lograr 2cm de espuma densa y suave.',
          'Verter coronando con la espuma, espolvorear cacao amargo y tapar.',
        ],
      },
    },
  },

  'flat white': {
    name: 'Flat White',
    category: 'clasico',
    isFrappe: false,
    sizes: {
      '8oz': {
        glass: 'Taza de cerámica 8oz / Vaso vidrio',
        ingredients: [
          { name: 'Café Ristretto', amount: '18g (doble corto)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '120ml', icon: 'milk' },
          { name: 'Microespuma', amount: 'Plana (<0.5cm)', icon: 'foam' },
        ],
        steps: [
          'Extraer ristretto doble corto (extracción corta de 25g de máxima dulzura) en la taza.',
          'Vaporizar 120ml de leche con microespuma sedosa y plana (sin espuma gruesa).',
          'Integrar la leche sobre el ristretto desde altura baja manteniendo la superficie totalmente plana y brillante.',
        ],
      },
      '12oz': {
        glass: 'Taza 12oz',
        ingredients: [
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '200ml', icon: 'milk' },
          { name: 'Microespuma', amount: 'Plana (<0.5cm)', icon: 'foam' },
        ],
        steps: [
          'Extraer espresso doble (18g in / 36g out) en la taza.',
          'Vaporizar 200ml de leche con microespuma plana y sedosa.',
          'Verter e integrar logrando homogeneidad total entre café y leche con superficie plana.',
        ],
      },
    },
  },

  'caramel macchiato': {
    name: 'Caramel Macchiato',
    category: 'clasico',
    isFrappe: false,
    sizes: {
      '8oz': {
        glass: 'Taza 8oz / Vaso Térmico 8oz',
        ingredients: [
          { name: 'Syrup de Vainilla', amount: '10ml (1 pump)', icon: 'syrup' },
          { name: 'Leche vaporizada', amount: '140ml', icon: 'milk' },
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
          { name: 'Salsa de Caramelo', amount: '10g (rejilla)', icon: 'sauce' },
        ],
        steps: [
          'Colocar 10ml (1 pump) de syrup de vainilla en el fondo de la taza.',
          'Vaporizar 140ml de leche con buena capa de espuma cremosa y servir sobre el syrup dejando 2cm arriba.',
          'Extraer 1 shot de espresso y verterlo lentamente en el centro para "marcar" la leche a través de la espuma.',
          'Dibujar una rejilla clásica con salsa de caramelo sobre la espuma.',
        ],
      },
      '12oz': {
        glass: 'Taza 12oz / Vaso Térmico 12oz',
        ingredients: [
          { name: 'Syrup de Vainilla', amount: '15ml (1.5 pumps)', icon: 'syrup' },
          { name: 'Leche vaporizada', amount: '210ml', icon: 'milk' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Salsa de Caramelo', amount: '15g (rejilla)', icon: 'sauce' },
        ],
        steps: [
          'Servir 15ml (1.5 pumps) de syrup de vainilla en la base del vaso/taza.',
          'Vaporizar 210ml de leche a 65°C y volcarla en el vaso hasta casi el tope.',
          'Extraer espresso doble y verterlo despacio en el centro para marcar la leche.',
          'Dibujar una cuadrícula/rejilla con salsa de caramelo sobre la superficie.',
        ],
      },
      '16oz': {
        glass: 'Vaso Térmico 16oz',
        ingredients: [
          { name: 'Syrup de Vainilla', amount: '20ml (2 pumps)', icon: 'syrup' },
          { name: 'Leche vaporizada', amount: '280ml', icon: 'milk' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Salsa de Caramelo', amount: '20g (rejilla)', icon: 'sauce' },
        ],
        steps: [
          'Colocar 20ml (2 pumps) de syrup de vainilla en la base y agregar 280ml de leche vaporizada.',
          'Extraer espresso doble y verterlo lentamente en el centro.',
          'Decorar con abundante rejilla de salsa de caramelo y tapar.',
        ],
      },
    },
    coldOverride: {
      '12oz': {
        glass: 'Vaso Domo 12oz con hielo',
        ingredients: [
          { name: 'Syrup de Vainilla', amount: '15ml (1.5 pumps)', icon: 'syrup' },
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
          { name: 'Leche fría', amount: '140ml', icon: 'milk' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Salsa de Caramelo', amount: '15g (rejilla)', icon: 'sauce' },
        ],
        steps: [
          'Servir 15ml (1.5 pumps) de syrup de vainilla en el fondo del vaso transparente de 12oz.',
          'Llenar el vaso con 150g de cubos de hielo y agregar 140ml de leche fría.',
          'Extraer espresso doble y verterlo lentamente sobre los cubos de hielo superiores para que flote en capa separada.',
          'Decorar la parte superior con un diseño en rejilla de salsa de caramelo.',
          'Servir con tapa domo y sorbete.',
        ],
      },
      '16oz': {
        glass: 'Vaso Domo 16oz con hielo',
        ingredients: [
          { name: 'Syrup de Vainilla', amount: '20ml (2 pumps)', icon: 'syrup' },
          { name: 'Hielo en rolito', amount: '200g', icon: 'ice' },
          { name: 'Leche fría', amount: '180ml', icon: 'milk' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Salsa de Caramelo', amount: '20g (rejilla)', icon: 'sauce' },
        ],
        steps: [
          'Colocar 20ml (2 pumps) de syrup de vainilla en la base, 200g de hielo y 180ml de leche fría.',
          'Extraer espresso doble y verterlo suavemente sobre los hielos superiores.',
          'Dibujar rejilla de salsa de caramelo en la cima, tapar y entregar con sorbete.',
        ],
      },
    },
  },

  mocca: {
    name: 'Mocca',
    category: 'clasico',
    isFrappe: false,
    sizes: {
      '8oz': {
        glass: 'Taza 8oz / Vaso Térmico 8oz',
        ingredients: [
          { name: 'Salsa de Chocolate', amount: '5g', icon: 'sauce' },
          { name: 'Syrup de Chocolate', amount: '20ml (2 pumps)', icon: 'syrup' },
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '140ml', icon: 'milk' },
        ],
        steps: [
          'Colocar 5g de salsa y 20ml (2 pumps) de syrup de chocolate en el fondo de la taza.',
          'Extraer el shot de espresso directamente encima y revolver con cuchara para disolver el chocolate.',
          'Vaporizar 140ml de leche a 65°C y verterla sobre la mezcla chocolatada.',
          'Opcional: espolvorear cacao o salsear chocolate.',
        ],
      },
      '12oz': {
        glass: 'Taza 12oz / Vaso Térmico 12oz',
        ingredients: [
          { name: 'Salsa de Chocolate', amount: '8g', icon: 'sauce' },
          { name: 'Syrup de Chocolate', amount: '30ml (3 pumps)', icon: 'syrup' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '210ml', icon: 'milk' },
        ],
        steps: [
          'Colocar salsa de chocolate (8g) y 30ml (3 pumps) de syrup de chocolate en el vaso.',
          'Extraer espresso doble encima y revolver hasta integrar.',
          'Vaporizar 210ml de leche a 65°C y verterla suavemente.',
          'Opcional: coronar con crema chantilly y líneas de chocolate.',
        ],
      },
      '16oz': {
        glass: 'Vaso Térmico 16oz',
        ingredients: [
          { name: 'Salsa de Chocolate', amount: '10g', icon: 'sauce' },
          { name: 'Syrup de Chocolate', amount: '40ml (4 pumps)', icon: 'syrup' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '280ml', icon: 'milk' },
        ],
        steps: [
          'Dosificar salsa (10g) y 40ml (4 pumps) de syrup de chocolate en la base.',
          'Extraer espresso doble caliente encima y disolver bien.',
          'Vaporizar 280ml de leche fresca, verter integrando y tapar.',
        ],
      },
    },
    coldOverride: {
      '12oz': {
        glass: 'Vaso Domo 12oz con hielo',
        ingredients: [
          { name: 'Salsa de Chocolate', amount: '20g', icon: 'sauce' },
          { name: 'Leche fría', amount: '130ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Crema Chantilly', amount: 'Opcional (30g)', icon: 'cream' },
        ],
        steps: [
          'Decorar las paredes y base del vaso 12oz con salsa de chocolate.',
          'Llenar con 150g de hielo en rolito y 130ml de leche fría.',
          'Extraer espresso doble y verterlo sobre el hielo.',
          'Opcional: coronar con crema chantilly y líneas de chocolate. Servir con sorbete.',
        ],
      },
      '16oz': {
        glass: 'Vaso Domo 16oz con hielo',
        ingredients: [
          { name: 'Salsa de Chocolate', amount: '30g', icon: 'sauce' },
          { name: 'Leche fría', amount: '170ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '200g', icon: 'ice' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
        ],
        steps: [
          'Decorar vaso con salsa de chocolate, llenar con hielo y leche fría.',
          'Extraer espresso doble y verterlo por encima del hielo. Servir con sorbete.',
        ],
      },
    },
  },

  'mocca blanco': {
    name: 'Mocca Blanco',
    category: 'clasico',
    isFrappe: false,
    sizes: {
      '8oz': {
        glass: 'Taza 8oz / Vaso Térmico 8oz',
        ingredients: [
          { name: 'Syrup Chocolate Blanco', amount: '20ml (2 pumps)', icon: 'syrup' },
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '140ml', icon: 'milk' },
        ],
        steps: [
          'Colocar 20ml (2 pumps) de syrup de chocolate blanco en la base.',
          'Extraer 1 shot de espresso encima y disolver bien.',
          'Vaporizar 140ml de leche a 65°C y verter integrando suavemente.',
        ],
      },
      '12oz': {
        glass: 'Taza 12oz / Vaso Térmico 12oz',
        ingredients: [
          { name: 'Syrup Chocolate Blanco', amount: '30ml (3 pumps)', icon: 'syrup' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '210ml', icon: 'milk' },
        ],
        steps: [
          'Colocar 30ml (3 pumps) de syrup de chocolate blanco en la base.',
          'Extraer 2 shots de espresso doble encima y mezclar.',
          'Vaporizar 210ml de leche a 65°C y verter la leche texturizada en el centro.',
        ],
      },
      '16oz': {
        glass: 'Vaso Térmico 16oz',
        ingredients: [
          { name: 'Syrup Chocolate Blanco', amount: '40ml (4 pumps)', icon: 'syrup' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
          { name: 'Leche texturizada', amount: '280ml', icon: 'milk' },
        ],
        steps: [
          'Colocar 40ml (4 pumps) de syrup de chocolate blanco en la base.',
          'Extraer espresso doble encima y mezclar.',
          'Vaporizar 280ml de leche, verter y tapar.',
        ],
      },
    },
  },

  americano: {
    name: 'Americano',
    category: 'clasico',
    isFrappe: false,
    sizes: {
      '8oz': {
        glass: 'Taza 8oz / Vaso Térmico 8oz',
        ingredients: [
          { name: 'Agua caliente', amount: '150ml (90°C)', icon: 'water' },
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
        ],
        steps: [
          'Servir primero 150ml de agua caliente (90°C) en la taza.',
          'Extraer 1 shot de espresso directamente sobre el agua caliente para conservar la crema dorada superior.',
        ],
      },
      '12oz': {
        glass: 'Taza 12oz / Vaso Térmico 12oz',
        ingredients: [
          { name: 'Agua caliente', amount: '220ml (90°C)', icon: 'water' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
        ],
        steps: [
          'Colocar 220ml de agua caliente a 90°C en el vaso o taza.',
          'Extraer 2 shots de espresso doble directamente sobre el agua.',
        ],
      },
      '16oz': {
        glass: 'Vaso Térmico 16oz',
        ingredients: [
          { name: 'Agua caliente', amount: '300ml (90°C)', icon: 'water' },
          { name: 'Café Espresso', amount: '18g (2-3 shots)', icon: 'coffee' },
        ],
        steps: [
          'Colocar 300ml de agua caliente en el vaso térmico de 16oz.',
          'Extraer los shots de espresso sobre el agua caliente y tapar.',
        ],
      },
    },
    coldOverride: {
      '8oz': {
        glass: 'Vaso 8oz con hielo',
        ingredients: [
          { name: 'Hielo en rolito', amount: '100g', icon: 'ice' },
          { name: 'Agua fría', amount: '120ml', icon: 'water' },
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
        ],
        steps: [
          'Colocar 100g de hielo en el vaso y añadir 120ml de agua fría.',
          'Extraer 1 shot de espresso y verterlo por encima del hielo. Servir con sorbete.',
        ],
      },
      '12oz': {
        glass: 'Vaso 12oz con hielo',
        ingredients: [
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
          { name: 'Agua fría', amount: '180ml', icon: 'water' },
          { name: 'Café Espresso', amount: '18g (2 shots)', icon: 'coffee' },
        ],
        steps: [
          'Llenar el vaso con 150g de hielo y 180ml de agua fría.',
          'Extraer 2 shots de espresso doble y verter sobre el hielo. Servir con sorbete.',
        ],
      },
      '16oz': {
        glass: 'Vaso 16oz con hielo',
        ingredients: [
          { name: 'Hielo en rolito', amount: '200g', icon: 'ice' },
          { name: 'Agua fría', amount: '240ml', icon: 'water' },
          { name: 'Café Espresso', amount: '18g (2-3 shots)', icon: 'coffee' },
        ],
        steps: [
          'Llenar el vaso de 16oz con 200g de hielo y 240ml de agua fría.',
          'Extraer los shots de espresso y verterlos sobre el hielo. Servir con sorbete.',
        ],
      },
    },
  },

  'chocolate caliente': {
    name: 'Chocolate Caliente',
    category: 'caliente',
    isFrappe: false,
    sizes: {
      '8oz': {
        glass: 'Taza 8oz / Vaso Térmico 8oz',
        ingredients: [
          { name: 'Leche entera', amount: '180ml', icon: 'milk' },
          { name: 'Cacao barista', amount: '17g', icon: 'chocolate' },
        ],
        steps: [
          'En jarra de acero disolver 17g de cacao en un chorrito de leche.',
          'Agregar los 180ml de leche totales y vaporizar a 70°C hasta consistencia espesa y cremosa.',
          'Servir en taza o vaso térmico.',
        ],
      },
      '12oz': {
        glass: 'Taza 12oz / Vaso Térmico 12oz',
        ingredients: [
          { name: 'Leche entera', amount: '260ml', icon: 'milk' },
          { name: 'Cacao barista', amount: '24g', icon: 'chocolate' },
        ],
        steps: [
          'En la jarra disolver 24g de cacao en un chorro de leche.',
          'Sumar los 260ml de leche totales y vaporizar a 70°C hasta que espese y tome brillo.',
          'Servir en taza o vaso de 12oz.',
        ],
      },
      '16oz': {
        glass: 'Vaso Térmico 16oz',
        ingredients: [
          { name: 'Leche entera', amount: '340ml', icon: 'milk' },
          { name: 'Cacao barista', amount: '32g', icon: 'chocolate' },
        ],
        steps: [
          'Disolver 32g de cacao en la leche y vaporizar a 70-75°C hasta espesor chocolatoso.',
          'Servir de inmediato en vaso térmico de 16oz y tapar.',
        ],
      },
    },
  },

  espresso: {
    name: 'Espresso',
    category: 'clasico',
    isFrappe: false,
    sizes: {
      '8oz': {
        glass: 'Taza de espresso (70ml)',
        ingredients: [
          { name: 'Café molienda fina', amount: '9g', icon: 'coffee' },
          { name: 'Extracción líquida', amount: '18-20ml', icon: 'water' },
        ],
        steps: [
          'Extraer 1 shot de espresso (ratio 1:2 en 25-28 segundos para obtener 18-20ml con crema avellanada espesa).',
          'Acompañar con un pequeño vaso de agua con gas / soda.',
        ],
      },
    },
  },
};

function normalizeStr(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Convierte cantidades de syrup a formato de pumps (1 pump = aprox 10ml)
export function formatSyrupWithPumps(amount, name) {
  if (!amount || typeof amount !== 'string') return amount;
  const isSyrup = (name || '').toLowerCase().includes('syrup');
  if (!isSyrup) return amount;
  if (amount.toLowerCase().includes('pump')) return amount;

  const match = amount.match(/^(\d+(?:\.\d+)?)\s*ml$/i);
  if (match) {
    const ml = parseFloat(match[1]);
    const pumps = ml / 10;
    let pumpStr = '';
    if (pumps === 0.5) pumpStr = '1/2 pump';
    else if (pumps === 1) pumpStr = '1 pump';
    else if (pumps === 0.8) pumpStr = '~1 pump';
    else if (Number.isInteger(pumps)) pumpStr = `${pumps} pumps`;
    else pumpStr = `${pumps} pumps`;

    return `${amount} (${pumpStr})`;
  }
  return amount;
}

// Convierte cantidades de pulpa de fruta a formato de pumps (5 pumps aprox para 100g -> 1 pump ≈ 20g)
export function formatFruitWithPumps(amount, name) {
  if (!amount || typeof amount !== 'string') return amount;
  const isFruit =
    (name || '').toLowerCase().includes('pulpa') ||
    (name || '').toLowerCase().includes('smoothie') ||
    (name || '').toLowerCase().includes('fruta');
  if (!isFruit) return amount;
  if (amount.toLowerCase().includes('pump')) return amount;

  const match = amount.match(/^(\d+(?:\.\d+)?)\s*g$/i);
  if (match) {
    const grams = parseFloat(match[1]);
    const pumps = Math.round((grams / 20) * 10) / 10;
    let pumpStr = '';
    if (pumps <= 1) pumpStr = '~1 pump';
    else if (pumps >= 4.5 && pumps <= 5.5) pumpStr = '~5 pumps';
    else pumpStr = `~${pumps} pumps`;

    return `${amount} (${pumpStr})`;
  }
  return amount;
}

// Detecta el sabor de un smoothie a partir de cualquier propiedad del ítem
export function getSmoothieFlavor(item) {
  if (!item) return '';
  if (item.sabor && typeof item.sabor === 'string' && item.sabor.trim()) return item.sabor.trim();
  if (item.flavor && typeof item.flavor === 'string' && item.flavor.trim()) return item.flavor.trim();
  if (item.smoothieFlavor && typeof item.smoothieFlavor === 'string' && item.smoothieFlavor.trim()) {
    return item.smoothieFlavor.trim();
  }

  if (Array.isArray(item.sabores) && item.sabores.length > 0) {
    const clean = item.sabores
      .map((s) => (typeof s === 'string' ? s : s?.label || s?.name || ''))
      .filter(Boolean);
    if (clean.length > 0) return clean.join(' + ');
  }

  if (item.listdetalle && typeof item.listdetalle === 'string') {
    const m = item.listdetalle.match(/(?:sabor|gusto):\s*([^·,|]+)/i);
    if (m) return m[1].trim();
  }

  if (item.note && typeof item.note === 'string') {
    const m = item.note.match(/(?:sabor|gusto):\s*([^·,|]+)/i);
    if (m) return m[1].trim();
  }

  const n = normalizeStr(item.name || '');
  const known = [
    'frutilla-naranja',
    'frutos del bosque',
    'mango-maracuya',
    'mango-maracuyá',
    'maracuya',
    'maracuyá',
    'frutilla',
    'mango',
    'naranja',
    'banana',
    'durazno',
    'arandanos',
    'arándanos',
  ];
  for (const k of known) {
    if (n.includes(normalizeStr(k))) {
      return k.charAt(0).toUpperCase() + k.slice(1);
    }
  }
  return '';
}

/**
 * Detecta el sabor / variedad de una cookie a partir de cualquier propiedad del ítem
 * (sabores, sabor, flavor, variety, saboresBreakdown, listdetalle, note, o el nombre).
 */
export function getCookieFlavor(item) {
  if (!item) return '';
  if (typeof item !== 'object') {
    const str = String(item).trim();
    const strNorm = normalizeStr(str);
    const known = [
      'kinder bueno',
      'kinder',
      'marroc',
      'pistacho',
      'nutella',
      'oreo',
      'rasta',
      'franui',
      'salted caramel',
      'caramel',
      'double',
      'red malva',
      'lotus',
      'ferrero rocher',
      'ferrero',
    ];
    for (const k of known) {
      if (strNorm.includes(k)) {
        return k.charAt(0).toUpperCase() + k.slice(1);
      }
    }
    return '';
  }

  // 1. Array de sabores (el formato estándar de PocketBase y del POS)
  if (Array.isArray(item.sabores) && item.sabores.length > 0) {
    const clean = item.sabores
      .map((s) => (typeof s === 'string' ? s : s?.label || s?.name || ''))
      .filter(Boolean);
    if (clean.length > 0 && clean[0].trim()) {
      return clean[0].trim();
    }
  }

  // 2. Propiedades sabor / flavor / variety
  if (typeof item.sabor === 'string' && item.sabor.trim()) return item.sabor.trim();
  if (typeof item.flavor === 'string' && item.flavor.trim()) return item.flavor.trim();
  if (typeof item.variety === 'string' && item.variety.trim()) return item.variety.trim();

  // 3. Objeto saboresBreakdown (ej: {"Pistacho": 1})
  if (item.saboresBreakdown && typeof item.saboresBreakdown === 'object') {
    const keys = Object.keys(item.saboresBreakdown);
    if (keys.length > 0 && keys[0].trim()) return keys[0].trim();
  }

  // 4. Buscar en listdetalle o note si tiene formato "Sabor: X" o "Gusto: X"
  const rawNote =
    (typeof item.listdetalle === 'string' && item.listdetalle) ||
    (typeof item.note === 'string' && item.note) ||
    '';
  if (rawNote) {
    const m = rawNote.match(/(?:sabor|gusto):\s*([^·,|]+)/i);
    if (m && m[1].trim()) return m[1].trim();
  }

  // 5. Sabores conocidos contenidos en el nombre del producto
  const rawName = String(item.name || item.title || '').trim();
  const nameNorm = normalizeStr(rawName);
  const knownFlavors = [
    'Kinder Bueno',
    'Kinder',
    'Marroc',
    'Pistacho',
    'Nutella',
    'Oreo',
    'Rasta',
    'Franui',
    'Salted Caramel',
    'Double',
    'Red Malva',
    'Lotus',
    'Ferrero Rocher',
    'Ferrero',
  ];
  for (const kf of knownFlavors) {
    if (nameNorm.includes(normalizeStr(kf))) {
      return kf;
    }
  }

  return '';
}

/**
 * Formatea el nombre visible de un ítem para comanda, tickets y checkout,
 * asegurando que si es un frappé lleve la palabra "Frappe" delante
 * (ej. "Frappe Pistacho", "Frappe Oreo", "Frappe Dulce de Leche"),
 * y si es una cookie lleve "Cookie [Sabor]" (ej. "Cookie Pistacho", "Cookie Nutella").
 */
export function getFormattedDrinkName(item) {
  if (!item) return '';
  const name = typeof item === 'string' ? item : item.name || item.title || item.label || '';
  if (!name) return '';
  const cat = typeof item === 'object' ? String(item.category || '').toLowerCase() : '';
  const norm = normalizeStr(name);

  // Si ya contiene Frappe o Frappé en el nombre, devolver tal cual
  if (/frapp[eé]/i.test(name)) return name;

  // Detección y formateo de Cookies:
  // "que no diga por ejemplo cookie rellena y especifique sabor debajo.
  //  sino que diga cookie pistacho por ejemplo. cookie nutella y etc"
  if (norm.includes('cookie') || norm.includes('galletita') || cat.includes('cookie')) {
    const ckFlavor = typeof item === 'object' ? getCookieFlavor(item) : '';
    if (ckFlavor) {
      const cleanFlavor = ckFlavor.charAt(0).toUpperCase() + ckFlavor.slice(1);
      return `Cookie ${cleanFlavor}`;
    }
    const cleanedCookieName = name
      .replace(/cookies?\s+rellenas?/i, 'Cookie')
      .replace(/cookies?\s+con\s+relleno/i, 'Cookie')
      .replace(/cookies?\s+simples?/i, 'Cookie')
      .replace(/cookies?\s+tradicional(es)?/i, 'Cookie')
      .trim();
    if (cleanedCookieName && cleanedCookieName.toLowerCase() !== 'cookie') {
      return cleanedCookieName;
    }
    return name;
  }

  // Si es pastelería, comida o helado tradicional, no es frappé
  if (
    cat.includes('pasteler') ||
    cat === 'helado' ||
    cat === 'paletas' ||
    norm.includes('croissant') ||
    norm.includes('budin') ||
    norm.includes('medialuna') ||
    norm.includes('tostado') ||
    norm.includes('roll') ||
    norm.includes('sandwich') ||
    norm.includes('panini') ||
    norm.includes('muffin') ||
    norm.includes('chipa')
  ) {
    return name;
  }

  // Si es un smoothie
  if (norm.includes('smoothie')) {
    const smFl = typeof item === 'object' ? getSmoothieFlavor(item) : '';
    if (smFl && !norm.includes(normalizeStr(smFl))) {
      return `Smoothie ${smFl}`;
    }
    return name;
  }

  // Detección de frappé
  const isFrappe =
    cat === 'frappe' ||
    item?.isFrappe ||
    (cat === 'frio' && (norm.includes('oreo') || norm.includes('pistacho') || norm.includes('dulce de leche') || norm.includes('mocca'))) ||
    norm === 'pistacho' ||
    norm === 'oreo' ||
    (norm === 'dulce de leche' && (cat.includes('frio') || cat.includes('frappe'))) ||
    (norm.includes('mocca') && cat === 'frappe');

  if (isFrappe) {
    if (norm === 'dulce de leche') {
      return 'Frappe Dulce de Leche';
    }
    return `Frappe ${name}`;
  }

  return name;
}

/**
 * Extrae y limpia notas u observaciones reales escritas por el cajero/cliente,
 * descartando redundancias sintéticas que ya se muestran en badges
 * (como "Sabor: ...", "Sin café", "Con café", "Leche Almendras", extras, etc.)
 */
export function getCleanItemNote(item) {
  if (!item) return '';

  const rawNote =
    (typeof item.note === 'string' && item.note.trim()) ||
    (typeof item.observaciones === 'string' && item.observaciones.trim()) ||
    (typeof item.observacion === 'string' && item.observacion.trim()) ||
    (typeof item.listdetalle === 'string' && item.listdetalle.trim()) ||
    '';

  if (!rawNote) return '';

  // Dividir por delimitadores habituales
  const parts = rawNote
    .split(/[·|\n;]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const cleanParts = parts.filter((part) => {
    const norm = part
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    // Descartar redundancias sintéticas que ya tienen badge propio
    if (/^(?:sabor|gusto)\s*:\s*/i.test(norm)) return false;
    if (/^sin\s*caf/i.test(norm)) return false;
    if (/^con\s*caf/i.test(norm)) return false;
    if (/^leche\s*(?:de\s*)?almendras?/i.test(norm)) return false;
    if (/^extra\s*shot/i.test(norm)) return false;
    if (/^crema(?:\s*chantilly)?$/i.test(norm)) return false;
    if (/^canela$/i.test(norm)) return false;

    // Descartar si es exactamente el sabor del smoothie o de la cookie ya mostrada en el título
    if (item.smoothieFlavor && norm === item.smoothieFlavor.toLowerCase()) return false;
    const ckFl = getCookieFlavor(item);
    if (ckFl && norm === ckFl.toLowerCase()) return false;
    if (item.sabor && norm === String(item.sabor).toLowerCase()) return false;
    if (Array.isArray(item.sabores)) {
      const isSabor = item.sabores.some((s) => {
        const sNorm = (typeof s === 'string' ? s : s?.label || s?.name || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();
        return sNorm && norm === sNorm;
      });
      if (isSabor) return false;
    }

    // Descartar si coincide con algún extra del array
    if (Array.isArray(item.extras)) {
      const isExtra = item.extras.some((ex) => {
        const exClean = String(ex).replace(/\s*\(\+?\$?\d+\)/g, '').toLowerCase().trim();
        return exClean && norm === exClean;
      });
      if (isExtra) return false;
    }

    return true;
  });

  return cleanParts.join(' · ').trim();
}

/**
 * Limpia el texto de medida de un ítem para evitar redundancias con badges de temperatura.
 * Por ejemplo: "Plus (12oz) · Frío" -> "Plus (12oz)"
 *              "plus 12oz frio" -> "Plus 12oz"
 *              "12oz Frío" -> "12oz"
 *              "Frío" -> "" (no es una medida de vaso válida)
 */
export function getCleanSizeLabel(size) {
  if (!size || typeof size !== 'string') return '';
  let s = size.trim();
  // Quitar "(Única medida)"
  s = s.replace(/\s*\(Única medida\)/gi, '');
  // Quitar temperatura al final o con separadores
  s = s.replace(/[\s·\-,/|]+(?:fr[ií]o|caliente|iced|cold|hot)\b/gi, '');
  // Quitar temperatura al inicio o con separadores
  s = s.replace(/\b(?:fr[ií]o|caliente|iced|cold|hot)[\s·\-,/|]*/gi, '');
  // Limpiar caracteres separadores sobrantes al inicio/final
  s = s.replace(/^[\s·\-,/|]+|[\s·\-,/|]+$/g, '').trim();
  // Si sólo era temperatura (o quedó vacío)
  if (!s || /^(?:fr[ií]o|caliente|iced|cold|hot)$/i.test(s)) {
    return '';
  }
  // Normalizar mayúscula inicial si venía en minúsculas (ej. "plus 12oz" -> "Plus 12oz")
  if (/^[a-z]/.test(s)) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }
  return s;
}

/**
 * Retorna la configuración de color, contraste y descriptor para la medida del vaso.
 * Diseñado específicamente para reducir errores en barra (color-coding + descriptor textual + alerta en 16oz).
 */
export function getSizeBadgeInfo(rawSize) {
  if (!rawSize) return null;
  const clean = getCleanSizeLabel(rawSize);
  if (!clean) return null;

  const lower = clean.toLowerCase();

  // 16oz / Grande / XL / Maxi / Ultra
  if (
    lower.includes('16oz') ||
    lower.includes('16 oz') ||
    /\b16\b/.test(lower) ||
    lower.includes('grande') ||
    lower.includes('maxi') ||
    lower.includes('ultra') ||
    lower.includes('xl')
  ) {
    return {
      key: '16oz',
      size: '16oz',
      name: 'GRANDE',
      label: '16oz · GRANDE',
      shortLabel: '16oz GRANDE',
      badgeText: '16oz · GRANDE',
      color: '#581c87', // Púrpura profundo de alto contraste
      bg: '#f3e8ff',    // Lila suave
      border: '#a855f7', // Violeta brillante (alerta)
      glow: '0 2px 7px rgba(168, 85, 247, 0.32)',
      isLarge: true,
    };
  }

  // 8oz / Chico / Pocillo / Cortado / Mini
  if (
    lower.includes('8oz') ||
    lower.includes('8 oz') ||
    /\b8\b/.test(lower) ||
    lower.includes('chico') ||
    lower.includes('small') ||
    lower.includes('mini') ||
    lower.includes('pocillo')
  ) {
    return {
      key: '8oz',
      size: '8oz',
      name: 'CHICO',
      label: '8oz · CHICO',
      shortLabel: '8oz CHICO',
      badgeText: '8oz · CHICO',
      color: '#065f46', // Verde bosque / menta
      bg: '#d1fae5',    // Menta pastel
      border: '#34d399', // Verde esmeralda
      glow: '0 1px 4px rgba(52, 211, 153, 0.25)',
      isSmall: true,
    };
  }

  // 12oz / Mediano / Estándar / Plus
  if (
    lower.includes('12oz') ||
    lower.includes('12 oz') ||
    /\b12\b/.test(lower) ||
    lower.includes('mediano') ||
    lower.includes('medium') ||
    lower.includes('plus') ||
    lower.includes('estandar') ||
    lower.includes('estándar')
  ) {
    return {
      key: '12oz',
      size: '12oz',
      name: 'MEDIANO',
      label: '12oz · MEDIANO',
      shortLabel: '12oz MEDIANO',
      badgeText: '12oz · MEDIANO',
      color: '#1d4ed8', // Azul cobalto
      bg: '#dbeafe',    // Azul pastel
      border: '#60a5fa', // Azul
      glow: '0 1px 4px rgba(96, 165, 250, 0.25)',
      isMedium: true,
    };
  }

  return {
    key: 'other',
    size: clean,
    name: clean.toUpperCase(),
    label: clean,
    shortLabel: clean,
    badgeText: clean,
    color: '#334155',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    glow: 'none',
  };
}

function parseDbRecipeLines(rawText) {
  if (!rawText) return [];
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return lines
    .filter((line) => !line.toLowerCase().startsWith('vaso '))
    .map((line) => {
      const match = line.match(/^([\d]+[a-zA-Z%°]+|[\d]+(?:\.[\d]+)?(?:\s*[a-zA-Z]+)?)\s+(.*)$/);
      if (match) {
        return {
          amount: match[1].trim(),
          name: match[2].trim(),
        };
      }
      return {
        amount: '',
        name: line,
      };
    });
}

export function getBaristaRecipe(item, cafeteriaProducts = []) {
  if (!item) return null;

  const rawName = item.name || '';
  const normName = normalizeStr(rawName);

  const sizeCandidate = String(
    item.size || item.medida || item.sizeLabel || item.activeSize || ''
  ).toLowerCase();
  let rawSize = sizeCandidate;
  if (!rawSize) {
    const matchName = String(item.name || '').match(/\b(8|12|16)\s*oz\b/i);
    if (matchName) rawSize = matchName[0].toLowerCase();
  }
  let activeSize = '12oz';
  let sizeLabel = 'Plus (12oz)';

  if (rawSize.includes('8') || rawSize.includes('mini')) {
    activeSize = '8oz';
    sizeLabel = 'Mini (8oz)';
  } else if (rawSize.includes('16') || rawSize.includes('ultra')) {
    activeSize = '16oz';
    sizeLabel = 'Ultra (16oz)';
  } else {
    activeSize = '12oz';
    sizeLabel = 'Plus (12oz)';
  }

  const isColdExplicit = Boolean(
    item.isCold ||
    item.temperature === 'Frío' ||
    normName.includes('frio') ||
    normName.includes('iced') ||
    rawSize.includes('frio')
  );

  const dbProd = (cafeteriaProducts || []).find((p) => {
    const pNorm = normalizeStr(p.name);
    return pNorm === normName || pNorm.includes(normName) || normName.includes(pNorm);
  });

  const isItemCatFrappe = item?.category === 'frappe' || String(item?.category || '').toLowerCase() === 'frappe' || Boolean(item?.isFrappe);
  const isDbFrappe = dbProd?.category === 'frappe' || dbProd?.category === 'frio' || isItemCatFrappe;
  const isNameFrappe =
    normName.includes('frappe') ||
    normName.includes('oreo') ||
    normName.includes('smoothie') ||
    normName.includes('milkshake') ||
    (isDbFrappe && (normName.includes('dulce de leche') || normName.includes('pistacho') || normName.includes('mocca')));

  const isFrappe = Boolean(isDbFrappe || isNameFrappe);
  const isCold = Boolean(isColdExplicit || isFrappe);

  let masterKey = null;

  if (isFrappe) {
    if (normName.includes('oreo')) masterKey = 'frappe oreo';
    else if (normName.includes('pistacho')) masterKey = 'frappe pistacho';
    else if (normName.includes('dulce de leche') || normName.includes('ddl')) masterKey = 'frappe dulce de leche';
    else if (normName.includes('mocca blanco') || normName.includes('chocolate blanco')) masterKey = 'frappe mocca blanco';
    else if (normName.includes('mocca')) masterKey = 'frappe mocca';
    else if (normName.includes('milkshake')) masterKey = 'milkshake';
    else if (normName.includes('smoothie')) masterKey = 'smoothie';
  }

  if (!masterKey) {
    if (normName.includes('caramel macchiato')) masterKey = 'caramel macchiato';
    else if (normName.includes('flat white')) masterKey = 'flat white';
    else if (normName.includes('cappuccino') || normName.includes('capuchino')) masterKey = 'cappuccino';
    else if (normName.includes('mocca blanco')) masterKey = 'mocca blanco';
    else if (normName.includes('mocca')) masterKey = 'mocca';
    else if (normName.includes('latte')) masterKey = 'latte';
    else if (normName.includes('americano')) masterKey = 'americano';
    else if (normName.includes('chocolate')) masterKey = 'chocolate caliente';
    else if (normName.includes('espresso') || normName.includes('ristretto')) masterKey = 'espresso';
  }

  let master = masterKey ? MASTER_RECIPES[masterKey] : null;

  // Para smoothie, la medida es fija de 12oz de momento
  if (masterKey === 'smoothie') {
    activeSize = '12oz';
    sizeLabel = '12oz';
  }

  let ingredients = [];
  let steps = [];
  let glass = isFrappe ? 'Vaso Domo con tapa' : 'Vaso / Taza según tamaño';

  // 1. Revisar si hay recetas personalizadas guardadas en dev / localStorage (SOLO para la medida exacta activa)
  const customRecipes = getCustomBaristaRecipes();
  const customDrink = masterKey ? customRecipes[masterKey] : null;
  let customSizeData = null;

  if (customDrink) {
    if (
      isCold &&
      customDrink.coldOverride &&
      customDrink.coldOverride[activeSize]
    ) {
      customSizeData = customDrink.coldOverride[activeSize];
    } else if (
      !isCold &&
      customDrink.sizes &&
      customDrink.sizes[activeSize]
    ) {
      customSizeData = customDrink.sizes[activeSize];
    }
  }

  if (customSizeData) {
    ingredients = customSizeData.ingredients
      ? customSizeData.ingredients.map((i) => ({ ...i }))
      : [];
    steps = customSizeData.steps ? [...customSizeData.steps] : [];
    if (customSizeData.glass) glass = customSizeData.glass;
  } else if (master) {
    let sizeData = null;

    if (isCold && !master.isFrappe && master.coldOverride) {
      sizeData =
        master.coldOverride[activeSize] ||
        master.coldOverride['12oz'] ||
        master.sizes[activeSize];
    } else {
      sizeData =
        master.sizes[activeSize] ||
        master.sizes['12oz'] ||
        master.sizes['8oz'] ||
        master.sizes['16oz'];
    }

    if (sizeData) {
      ingredients = sizeData.ingredients ? [...sizeData.ingredients] : [];
      steps = sizeData.steps ? [...sizeData.steps] : [];
      if (sizeData.glass) glass = sizeData.glass;
    }
  }

  const dbRecipeField = activeSize === '8oz' ? dbProd?.recipe8oz : activeSize === '16oz' ? dbProd?.recipe16oz : dbProd?.recipe12oz;

  if (ingredients.length === 0 && dbRecipeField) {
    ingredients = parseDbRecipeLines(dbRecipeField);
  }

  // Asegurar formato con pumps en todos los syrups y pulpas
  ingredients = ingredients.map((ing) => ({
    ...ing,
    amount: formatFruitWithPumps(formatSyrupWithPumps(ing.amount, ing.name), ing.name),
  }));

  // Personalización específica para Smoothie
  const isSmoothie = masterKey === 'smoothie' || normName.includes('smoothie');
  const smoothieFlavor = isSmoothie ? getSmoothieFlavor(item) : '';

  if (isSmoothie) {
    if (smoothieFlavor) {
      ingredients = ingredients.map((ing) => {
        if ((ing.name || '').toLowerCase().includes('pulpa')) {
          return {
            ...ing,
            name: `Pulpa de ${smoothieFlavor}`,
            amount: '95g (~5 pumps)',
          };
        }
        return ing;
      });

      steps = steps.map((st) =>
        st.replace(/pulpa de fruta concentrada/gi, `pulpa de fruta (${smoothieFlavor})`)
      );
    }
  }

  if (steps.length === 0) {
    if (isFrappe) {
      steps = [
        'En la licuadora colocar el hielo, la leche, los jarabes/salsas y el café espresso.',
        'Licuar por 20-25 segundos hasta textura frozen cremosa sin grumos de hielo.',
        'Salsear las paredes del vaso domo y servir la preparación.',
        'Coronar con crema chantilly, decoración y tapa domo con sorbete.',
      ];
    } else if (isCold) {
      steps = [
        'Llenar el vaso con hielo y agregar la leche fría o agua con los syrups requeridos.',
        'Extraer el espresso y verterlo sobre el hielo para crear el degradado visual.',
        'Decorar si corresponde y servir con sorbete.',
      ];
    } else {
      steps = [
        'Extraer el espresso directamente en la taza o vaso térmico.',
        'Vaporizar la leche a 65°C cuidando la textura de la microespuma.',
        'Verter la leche texturizada integrando suavemente con el café.',
      ];
    }
  }

  if (dbRecipeField && dbRecipeField.toLowerCase().includes('vaso')) {
    const vMatch = dbRecipeField.split('\n').find((l) => l.toLowerCase().startsWith('vaso'));
    if (vMatch) {
      glass = vMatch.trim();
    }
  }

  // Si el pedido especifica Canela (vía booleano o adicional), reflejarlo prioritariamente en la receta
  const hasCanela =
    Boolean(item.canela || item.withCinnamon) ||
    (Array.isArray(item.extras) && item.extras.some((e) => /canela/i.test(e)));

  if (hasCanela) {
    let spiceFound = false;
    ingredients = ingredients.map((ing) => {
      const n = (ing.name || '').toLowerCase();
      if (n.includes('cacao') || n.includes('canela')) {
        spiceFound = true;
        return { ...ing, name: 'Canela molida', amount: 'Lluvia (pedido)', icon: 'spice' };
      }
      return ing;
    });
    if (!spiceFound) {
      ingredients.push({ name: 'Canela molida', amount: 'Lluvia (pedido)', icon: 'spice' });
    }

    steps = steps.map((st) => {
      if (st.toLowerCase().includes('espolvorear') || st.toLowerCase().includes('cacao')) {
        return 'Espolvorear la superficie con lluvia de canela molida.';
      }
      return st;
    });
  }

  // Detección de Leche de Almendras (vegetal)
  const hasAlmendras = Boolean(
    item.hasAlmendras ||
    item.leche_almendras ||
    item.withAlmondMilk ||
    (Array.isArray(item.extras) && item.extras.some((e) => /almendra/i.test(String(e)))) ||
    (typeof item.name === 'string' && /almendra/i.test(item.name)) ||
    (typeof item.note === 'string' && /almendra/i.test(item.note)) ||
    (typeof item.listdetalle === 'string' && /almendra/i.test(item.listdetalle))
  );

  if (hasAlmendras) {
    let replacedAny = false;
    ingredients = ingredients.map((ing) => {
      const n = (ing.name || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      // Sustituir cualquier ingrediente de leche tradicional por Leche de Almendras (vegetal)
      // Excluyendo dulce de leche
      if (n.includes('leche') && !n.includes('dulce de leche') && !n.includes('almendra')) {
        replacedAny = true;
        return {
          ...ing,
          name: 'Leche de Almendras (vegetal)',
          icon: 'milk',
        };
      }
      return ing;
    });

    if (!replacedAny) {
      const normN = (rawName || '').toLowerCase();
      if (!normN.includes('espresso') && !normN.includes('americano') && !normN.includes('smoothie')) {
        ingredients.push({
          name: 'Leche de Almendras (vegetal)',
          amount: 'Según medida',
          icon: 'milk',
        });
      }
    }

    // Actualizar los pasos de preparación para especificar Leche de Almendras
    steps = steps.map((st) => {
      if (typeof st !== 'string') return st;
      return st
        .replace(/leche\s+fr[ií]a/gi, 'leche de almendras fría')
        .replace(/leche\s+entera/gi, 'leche de almendras')
        .replace(/la\s+leche\s+texturizada/gi, 'la leche de almendras texturizada')
        .replace(/la\s+leche\s+a\s*65/gi, 'la leche de almendras (cuidar temp máx 60-65°C)')
        .replace(/vaporizar\s+la\s+leche/gi, 'vaporizar la leche de almendras (60-65°C)')
        .replace(/chorrito\s+de\s+leche/gi, 'chorrito de leche de almendras')
        .replace(/chorro\s+de\s+leche/gi, 'chorro de leche de almendras')
        .replace(/totales\s+de\s+leche/gi, 'totales de leche de almendras')
        .replace(/leche\s+totales/gi, 'leche de almendras totales')
        .replace(/en\s+la\s+leche\s+y/gi, 'en la leche de almendras y');
    });
  }

  // Detección de "Sin Café" (pedido explícito o modificador para frappés u otras bebidas)
  const isSinCafe = Boolean(
    item.sinCafe ||
    item.withoutCoffee ||
    item.isSinCafe ||
    (Array.isArray(item.extras) && item.extras.some((e) => /sin\s*caf/i.test(String(e)))) ||
    (typeof item.name === 'string' && /sin\s*caf/i.test(item.name)) ||
    (typeof item.note === 'string' && /sin\s*caf/i.test(item.note)) ||
    (typeof item.listdetalle === 'string' && /sin\s*caf/i.test(item.listdetalle))
  );

  if (isSinCafe) {
    // 1. Filtrar ingredientes de espresso / café
    ingredients = ingredients.filter((ing) => {
      const n = (ing.name || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (
        n.includes('espresso') ||
        n.includes('ristretto') ||
        n.includes('shot de cafe') ||
        (n.includes('cafe') && !n.includes('salsa') && !n.includes('syrup') && !n.includes('licor'))
      ) {
        return false;
      }
      return true;
    });

    // 2. Filtrar y limpiar pasos que mencionan la extracción o adición del café espresso
    steps = steps
      .filter((st) => {
        if (typeof st !== 'string') return true;
        const normSt = st
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        if (/extraer.*(?:espresso|shot|cafe)/i.test(normSt)) return false;
        if (/a[ñn]adir.*(?:espresso|shot de cafe)/i.test(normSt) && !normSt.includes('hielo') && !normSt.includes('leche')) return false;
        if (/incorporar.*(?:espresso|shot de cafe)/i.test(normSt) && !normSt.includes('hielo') && !normSt.includes('leche')) return false;
        return true;
      })
      .map((st) => {
        if (typeof st !== 'string') return st;
        return st
          .replace(/\s*,?\s*y\s*(?:el\s*)?(?:café|cafe)?\s*espresso(?:\s*concentrado|\s*doble)?/gi, '')
          .replace(/\s*,?\s*y\s*(?:el\s*)?shot\s*de\s*(?:café|cafe|espresso)/gi, '')
          .replace(/\s*,?\s*más\s*(?:el\s*)?(?:café|cafe)?\s*espresso/gi, '');
      });
  }

  const finalExtras = Array.isArray(item.extras) ? [...item.extras] : [];
  if (hasCanela && !finalExtras.some((e) => /canela/i.test(e))) {
    finalExtras.push('Canela');
  }
  if (hasAlmendras && !finalExtras.some((e) => /almendra/i.test(e))) {
    finalExtras.push('Leche Almendras');
  }
  if (isSinCafe && !finalExtras.some((e) => /sin\s*caf/i.test(e))) {
    finalExtras.push('Sin café');
  }

  const isMilkDrink = Boolean(
    hasAlmendras ||
    isFrappe ||
    normName.includes('latte') ||
    normName.includes('flat white') ||
    normName.includes('cappuccino') ||
    normName.includes('capuchino') ||
    normName.includes('mocca') ||
    normName.includes('mocha') ||
    normName.includes('macchiato') ||
    normName.includes('cortado') ||
    normName.includes('lagrima') ||
    normName.includes('con leche') ||
    normName.includes('chocolate') ||
    normName.includes('submarino') ||
    normName.includes('milkshake') ||
    ingredients.some((ing) => {
      const iname = (ing.name || '').toLowerCase();
      return iname.includes('leche') && !iname.includes('dulce de leche');
    })
  ) && !normName.includes('espresso') && !normName.includes('americano') && !isSmoothie;

  // Tamaños disponibles para la bebida (oculta medidas no disponibles/usadas)
  let availableSizes = [];
  if (isSmoothie) {
    availableSizes = ['12oz'];
  } else if (masterKey === 'espresso') {
    availableSizes = ['8oz'];
  } else if (masterKey === 'flat white') {
    availableSizes = ['8oz', '12oz'];
  } else if (isFrappe) {
    availableSizes = ['12oz', '16oz'];
  } else if (dbProd) {
    if (Number(dbProd.price_8oz) > 0 || (dbProd.recipe8oz && dbProd.recipe8oz.trim())) {
      availableSizes.push('8oz');
    }
    if (Number(dbProd.price_12oz) > 0 || (dbProd.recipe12oz && dbProd.recipe12oz.trim())) {
      availableSizes.push('12oz');
    }
    if (Number(dbProd.price_16oz) > 0 || (dbProd.recipe16oz && dbProd.recipe16oz.trim())) {
      availableSizes.push('16oz');
    }
  }

  if (availableSizes.length === 0) {
    const raw = master?.sizes ? Object.keys(master.sizes) : ['8oz', '12oz', '16oz'];
    availableSizes = isFrappe ? raw.filter((s) => s !== '8oz') : raw;
  }
  if (availableSizes.length === 0) {
    availableSizes = ['12oz'];
  }

  let finalProductName = rawName;
  if (isSmoothie && smoothieFlavor && !rawName.toLowerCase().includes(smoothieFlavor.toLowerCase())) {
    finalProductName = `Smoothie ${smoothieFlavor}`;
  } else {
    finalProductName = getFormattedDrinkName({
      name: rawName,
      category: item.category || dbProd?.category,
      isFrappe,
    });
  }

  return {
    productName: finalProductName,
    masterKey,
    activeSize,
    sizeLabel: isSmoothie ? '12oz' : getCleanSizeLabel(item.size || item.medida) || sizeLabel,
    availableSizes,
    isFrappe,
    isCold,
    isSmoothie,
    isSinCafe,
    flavor: smoothieFlavor,
    pumpRule: isSmoothie ? '5 pumps aprox para 100gr (~20g por disparo)' : undefined,
    typeLabel: isSmoothie
      ? '🍓 Smoothie Frozen'
      : isFrappe
      ? isSinCafe
        ? hasAlmendras ? '🍧 Frappé (Sin café · Almendras)' : '🍧 Frappé (Sin café)'
        : hasAlmendras ? '🍧 Frappé (Almendras)' : '🍧 Frappé / Frozen'
      : isCold
      ? isSinCafe
        ? hasAlmendras ? '🧊 Frío (Sin café · Almendras)' : '🧊 Frío (Sin café)'
        : hasAlmendras ? '🧊 Café Frío (Almendras)' : '🧊 Café Frío'
      : isSinCafe
      ? hasAlmendras ? '☕ Caliente (Sin café · Almendras)' : '☕ Caliente (Sin café)'
      : hasAlmendras ? '☕ Café Caliente (Almendras)' : '☕ Café Caliente',
    glass,
    ingredients,
    steps,
    extras: finalExtras,
    hasAlmendras,
    isMilkDrink,
    vaso: item.vaso || '',
    note: item.note || '',
    observaciones: item.observaciones || '',
    listdetalle: item.listdetalle || '',
    isCustom: Boolean(customSizeData),
    dbProdId: dbProd?.id || null,
  };
}

// =========================================================================
// GESTIÓN Y PERSISTENCIA DE RECETAS PERSONALIZADAS (SOLO DEV / ADMIN)
// =========================================================================

export function getCustomBaristaRecipes() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('barista_custom_recipes_v1');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error leyendo barista_custom_recipes_v1:', e);
    return {};
  }
}

export function saveCustomBaristaRecipe({
  masterKey,
  size,
  glass,
  ingredients,
  steps,
  pumpRule,
  isCold = false,
  dbProdId = null,
}) {
  if (typeof window === 'undefined' || !masterKey) return false;
  try {
    const current = getCustomBaristaRecipes();
    if (!current[masterKey]) current[masterKey] = {};

    const recipePayload = {
      glass: glass || '',
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      steps: Array.isArray(steps) ? steps : [],
      pumpRule: pumpRule || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (isCold) {
      if (!current[masterKey].coldOverride) current[masterKey].coldOverride = {};
      current[masterKey].coldOverride[size] = recipePayload;
    } else {
      if (!current[masterKey].sizes) current[masterKey].sizes = {};
      current[masterKey].sizes[size] = recipePayload;
    }

    localStorage.setItem('barista_custom_recipes_v1', JSON.stringify(current));
    window.dispatchEvent(
      new CustomEvent('barista-recipes-updated', { detail: { masterKey, size, isCold } })
    );

    // Sincronizar en PocketBase (en background si hay conexión a internet)
    if (typeof window !== 'undefined' && window.navigator?.onLine) {
      import('../../lib/pb')
        .then(({ pb }) => {
          if (!pb) return;
          const recipeLines = (recipePayload.ingredients || [])
            .map((i) => `${i.amount || ''} ${i.name || ''}`.trim())
            .filter(Boolean)
            .join('\n');

          const updateObj = {};
          if (size === '8oz') updateObj.recipe8oz = recipeLines;
          else if (size === '16oz') updateObj.recipe16oz = recipeLines;
          else updateObj.recipe12oz = recipeLines;

          if (dbProdId) {
            pb.collection('products_cafeteria').update(dbProdId, updateObj).catch((e) => {
              console.warn('PB sync warning for custom recipe:', e?.message);
            });
          }
        })
        .catch(() => {});
    }

    return true;
  } catch (err) {
    console.error('Error guardando receta personalizada:', err);
    return false;
  }
}

export function resetCustomBaristaRecipe(masterKey, size, isCold = false) {
  if (typeof window === 'undefined' || !masterKey) return false;
  try {
    const current = getCustomBaristaRecipes();
    if (current[masterKey]) {
      if (isCold && current[masterKey].coldOverride && current[masterKey].coldOverride[size]) {
        delete current[masterKey].coldOverride[size];
        if (Object.keys(current[masterKey].coldOverride).length === 0) {
          delete current[masterKey].coldOverride;
        }
      } else if (!isCold && current[masterKey].sizes && current[masterKey].sizes[size]) {
        delete current[masterKey].sizes[size];
        if (Object.keys(current[masterKey].sizes).length === 0) {
          delete current[masterKey].sizes;
        }
      }
      if (Object.keys(current[masterKey]).length === 0) {
        delete current[masterKey];
      }
      localStorage.setItem('barista_custom_recipes_v1', JSON.stringify(current));
      window.dispatchEvent(
        new CustomEvent('barista-recipes-updated', { detail: { masterKey, size, isCold } })
      );
    }
    return true;
  } catch (err) {
    console.error('Error restaurando receta original:', err);
    return false;
  }
}

export function hasCustomBaristaRecipe(masterKey, size, isCold = false) {
  const current = getCustomBaristaRecipes();
  if (!current[masterKey]) return false;
  if (isCold && current[masterKey].coldOverride && current[masterKey].coldOverride[size]) return true;
  if (!isCold && current[masterKey].sizes && current[masterKey].sizes[size]) return true;
  return false;
}

export function hasAnyCustomBaristaRecipeForDrink(masterKey) {
  const current = getCustomBaristaRecipes();
  if (!current || !masterKey) return false;
  return Boolean(current[masterKey]);
}

export function resetAllCustomBaristaRecipesForDrink(masterKey) {
  if (typeof window === 'undefined' || !masterKey) return false;
  try {
    const current = getCustomBaristaRecipes();
    if (current[masterKey]) {
      delete current[masterKey];
      localStorage.setItem('barista_custom_recipes_v1', JSON.stringify(current));
      window.dispatchEvent(
        new CustomEvent('barista-recipes-updated', { detail: { masterKey, resetDrink: true } })
      );
    }
    return true;
  } catch (err) {
    console.error('Error restaurando recetas de la bebida a predeterminadas de IA:', err);
    return false;
  }
}

export function resetAllCustomBaristaRecipes() {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem('barista_custom_recipes_v1');
    window.dispatchEvent(
      new CustomEvent('barista-recipes-updated', { detail: { resetAll: true } })
    );
    return true;
  } catch (err) {
    console.error('Error reseteando todas las recetas a la predeterminada de la IA:', err);
    return false;
  }
}

// Obtiene la receta oficial predeterminada de la IA directamente de MASTER_RECIPES
export function getMasterAIRecipe(masterKey, size = '12oz', isCold = false) {
  const master = MASTER_RECIPES[masterKey];
  if (!master) return null;

  let sizeData = null;
  if (isCold && !master.isFrappe && master.coldOverride) {
    sizeData = master.coldOverride[size] || master.coldOverride['12oz'] || master.sizes[size];
  } else {
    sizeData = master.sizes[size] || master.sizes['12oz'] || master.sizes['8oz'] || master.sizes['16oz'];
  }

  if (!sizeData) return null;

  return {
    glass: sizeData.glass || master.glass || 'Vaso / Taza según tamaño',
    ingredients: (sizeData.ingredients || []).map((i) => ({ ...i })),
    steps: [...(sizeData.steps || [])],
    pumpRule: master.pumpRule,
  };
}

// =========================================================================
// ESCALADO Y ADAPTACIÓN COMPARATIVA DE RECETAS ENTRE MEDIDAS
// =========================================================================

/**
 * Obtiene el factor y texto comparativo de volumen entre dos tamaños (ej. '12oz' a '16oz')
 */
export function getVolumeRatio(fromSize = '12oz', toSize = '16oz') {
  const parseOz = (s) => {
    const m = String(s || '').match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 12;
  };
  const fromNum = parseOz(fromSize);
  const toNum = parseOz(toSize);
  if (fromNum <= 0 || toNum <= 0) {
    return { factor: 1, percentDiff: 0, label: '1.0x (mismo volumen)', fromNum: 12, toNum: 12 };
  }

  const factor = toNum / fromNum;
  const percentDiff = Math.round((factor - 1) * 100);
  const label =
    percentDiff > 0
      ? `${factor.toFixed(2)}x (+${percentDiff}% volumen)`
      : percentDiff < 0
      ? `${factor.toFixed(2)}x (${percentDiff}% volumen)`
      : '1.0x (mismo volumen)';

  return { factor, percentDiff, label, fromNum, toNum };
}

/**
 * Escala inteligentemente cantidades numéricas con unidades de cafetería (ml, g, pumps, shots, u)
 */
export function scaleAmountString(amountStr, factor) {
  if (!amountStr || typeof amountStr !== 'string') return amountStr;
  if (!factor || factor === 1) return amountStr;

  // Si no hay dígitos numéricos (ej. "Lluvia", "Decoración", "A gusto"), devolver tal cual
  if (!/\d/.test(amountStr)) return amountStr;

  return amountStr.replace(/(\d+(?:[.,]\d+)?)\s*([a-zA-ZáéíóúÁÉÍÓÚ°]+)?/g, (match, numStr, unit) => {
    const num = parseFloat(numStr.replace(',', '.'));
    if (isNaN(num)) return match;

    // Si es cm (microespuma), no alterar
    if (unit && unit.toLowerCase() === 'cm') {
      return match;
    }

    const scaled = num * factor;
    let roundedNum;
    const lowerUnit = (unit || '').toLowerCase();

    if (lowerUnit === 'ml' || lowerUnit === 'g' || lowerUnit === 'gr') {
      if (scaled >= 100) {
        roundedNum = Math.round(scaled / 10) * 10;
      } else if (scaled >= 20) {
        roundedNum = Math.round(scaled / 5) * 5;
      } else if (scaled >= 5) {
        roundedNum = Math.round(scaled);
      } else {
        roundedNum = Math.round(scaled * 10) / 10;
      }
    } else if (
      lowerUnit === 'pump' ||
      lowerUnit === 'pumps' ||
      lowerUnit === 'disparo' ||
      lowerUnit === 'disparos'
    ) {
      roundedNum = Math.round(scaled * 2) / 2; // pasos de 0.5 pump
    } else if (lowerUnit === 'shot' || lowerUnit === 'shots') {
      roundedNum = Math.max(1, Math.round(scaled)); // mínimo 1 shot
    } else if (lowerUnit === 'u' || lowerUnit === 'unid' || lowerUnit === 'unidades') {
      roundedNum = Math.max(1, Math.round(scaled));
    } else {
      if (scaled >= 50) {
        roundedNum = Math.round(scaled / 5) * 5;
      } else if (scaled >= 10) {
        roundedNum = Math.round(scaled);
      } else {
        roundedNum = Math.round(scaled * 10) / 10;
      }
    }

    const finalNumStr = Number.isInteger(roundedNum) ? String(roundedNum) : String(roundedNum);
    return unit ? `${finalNumStr}${unit}` : finalNumStr;
  });
}

/**
 * Adapta una receta técnica completa desde una medida de origen a una medida de destino
 */
export function adaptRecipeFromSize({
  masterKey,
  productName,
  sourceSize = '12oz',
  targetSize = '16oz',
  isCold = false,
  cafeteriaProducts = [],
}) {
  if (!masterKey || !sourceSize || !targetSize) return null;

  // 1. Obtener la receta fuente (usando la receta personalizada activa si fue editada, o la maestra)
  const dummySourceItem = {
    name: productName || masterKey,
    size: sourceSize,
    isCold,
  };
  const sourceRecipe = getBaristaRecipe(dummySourceItem, cafeteriaProducts);
  if (!sourceRecipe) return null;

  // 2. Calcular la proporción de volumen
  const { factor, percentDiff, label } = getVolumeRatio(sourceSize, targetSize);

  // 3. Escalar los ingredientes
  const scaledIngredients = (sourceRecipe.ingredients || []).map((ing) => {
    return {
      name: ing.name || '',
      amount: scaleAmountString(ing.amount || '', factor),
      icon: ing.icon,
    };
  });

  // 4. Adaptar el vaso (reemplazar la mención de sourceSize por targetSize)
  let adaptedGlass = sourceRecipe.glass || 'Vaso / Taza según tamaño';
  const sizeRegex = new RegExp(`\\b${sourceSize}\\b`, 'gi');
  if (sizeRegex.test(adaptedGlass)) {
    adaptedGlass = adaptedGlass.replace(sizeRegex, targetSize);
  } else {
    adaptedGlass = adaptedGlass.replace(/\d+\s*oz/gi, targetSize);
  }

  // 5. Adaptar los pasos (reemplazar la mención del tamaño anterior en las instrucciones)
  const adaptedSteps = (sourceRecipe.steps || []).map((st) => {
    if (typeof st !== 'string') return st;
    return st.replace(new RegExp(`\\b${sourceSize}\\b`, 'gi'), targetSize);
  });

  // 6. Regla de dosificación adaptada
  let adaptedPumpRule = sourceRecipe.pumpRule || '';
  if (adaptedPumpRule && factor !== 1) {
    adaptedPumpRule = scaleAmountString(adaptedPumpRule, factor);
  }

  return {
    sourceSize,
    targetSize,
    factor,
    percentDiff,
    ratioLabel: label,
    glass: adaptedGlass,
    ingredients: scaledIngredients,
    steps: adaptedSteps,
    pumpRule: adaptedPumpRule,
  };
}


