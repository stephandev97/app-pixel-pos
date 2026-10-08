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
      '8oz': {
        glass: 'Vaso Domo 8oz',
        ingredients: [
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
          { name: 'Leche fría', amount: '70ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '100g', icon: 'ice' },
          { name: 'Salsa de Chocolate', amount: '10g', icon: 'sauce' },
          { name: 'Syrup de Vainilla', amount: '10ml (1 pump)', icon: 'syrup' },
          { name: 'Galletitas Oreo', amount: '1.5 u', icon: 'cookie' },
          { name: 'Crema Chantilly', amount: '25g', icon: 'cream' },
          { name: 'Oreo decoración', amount: '1 u (tope)', icon: 'cookie' },
        ],
        steps: [
          'En la licuadora colocar: 100g de hielo, 70ml de leche fría, 10g salsa de chocolate, 10ml (1 pump) syrup de vainilla y 1.5 galletitas Oreo troceadas.',
          'Extraer 1 shot de espresso y agregarlo a la licuadora.',
          'Licuar a potencia media-alta por 20 segundos hasta consistencia frozen homogénea sin trozos de hielo.',
          'Dibujar espirales de salsa de chocolate en las paredes internas del vaso domo.',
          'Servir el frappé, coronar con crema chantilly (25g), 1 galletita Oreo entera arriba y lluvia de migas.',
          'Cerrar con tapa domo y sorbete grueso.',
        ],
      },
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
      '8oz': {
        glass: 'Vaso Domo 8oz',
        ingredients: [
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
          { name: 'Leche fría', amount: '70ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '100g', icon: 'ice' },
          { name: 'Salsa Dulce de Leche', amount: '10g', icon: 'sauce' },
          { name: 'Syrup Dulce de Leche', amount: '15ml (1.5 pumps)', icon: 'syrup' },
          { name: 'Syrup de Vainilla', amount: '8ml (~1 pump)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '25g', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar: 100g de hielo, 70ml de leche fría, 10g salsa de dulce de leche, 15ml (1.5 pumps) syrup DDL y 8ml (~1 pump) syrup vainilla.',
          'Extraer 1 shot de espresso y agregarlo a la licuadora.',
          'Licuar por 20 segundos a potencia media-alta.',
          'Decorar las paredes internas del vaso domo 8oz con hilos de salsa de dulce de leche.',
          'Servir el frappé, coronar con crema chantilly (25g) y lluvia de salsa de dulce de leche.',
          'Cerrar con tapa domo y sorbete grueso.',
        ],
      },
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
      '8oz': {
        glass: 'Vaso Domo 8oz',
        ingredients: [
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
          { name: 'Leche fría', amount: '70ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '100g', icon: 'ice' },
          { name: 'Salsa de Pistacho', amount: '15g', icon: 'sauce' },
          { name: 'Syrup de Pistacho', amount: '10ml (1 pump)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '25g', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar: 100g hielo, 70ml leche fría, 15g salsa de pistacho y 10ml (1 pump) syrup de pistacho.',
          'Extraer 1 shot de espresso y agregarlo a la mezcla.',
          'Licuar por 20 segundos a potencia media-alta.',
          'Decorar paredes internas del vaso domo 8oz con salsa de pistacho.',
          'Servir el frappé, coronar con crema chantilly (25g) y salsa de pistacho.',
          'Cerrar con tapa domo y sorbete grueso.',
        ],
      },
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
      '8oz': {
        glass: 'Vaso Domo 8oz',
        ingredients: [
          { name: 'Café Espresso', amount: '9g (1 shot)', icon: 'coffee' },
          { name: 'Leche fría', amount: '70ml', icon: 'milk' },
          { name: 'Hielo en rolito', amount: '100g', icon: 'ice' },
          { name: 'Salsa de Chocolate', amount: '6g', icon: 'sauce' },
          { name: 'Syrup de Chocolate', amount: '15ml (1.5 pumps)', icon: 'syrup' },
          { name: 'Crema Chantilly', amount: '25g', icon: 'cream' },
        ],
        steps: [
          'En la licuadora colocar: 100g hielo, 70ml leche fría, 6g salsa chocolate y 15ml (1.5 pumps) syrup chocolate.',
          'Extraer 1 shot de espresso y agregarlo a la licuadora.',
          'Licuar por 20 segundos a potencia alta.',
          'Decorar vaso domo con salsa de chocolate, servir y coronar con crema chantilly y líneas de chocolate.',
          'Cerrar con tapa domo y sorbete.',
        ],
      },
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
    glass: 'Vaso Milkshake / Domo',
    sizes: {
      '12oz': {
        glass: 'Vaso 12oz',
        ingredients: [
          { name: 'Pulpa de fruta concentrada', amount: '95g', icon: 'fruit' },
          { name: 'Hielo en rolito', amount: '150g', icon: 'ice' },
          { name: 'Agua purificada fría', amount: '125ml', icon: 'water' },
        ],
        steps: [
          'En el vaso licuador colocar 150g de hielo, 95g de pulpa de fruta concentrada y 125ml de agua fría.',
          'Licuar a velocidad máxima por 25-30 segundos hasta textura frozen brillante sin trozos de hielo.',
          'Servir de inmediato en vaso frío con tapa domo y sorbete grueso.',
        ],
      },
      '16oz': {
        glass: 'Vaso 16oz',
        ingredients: [
          { name: 'Pulpa de fruta concentrada', amount: '130g', icon: 'fruit' },
          { name: 'Hielo en rolito', amount: '200g', icon: 'ice' },
          { name: 'Agua purificada fría', amount: '170ml', icon: 'water' },
        ],
        steps: [
          'Colocar en licuadora: 200g de hielo, 130g de pulpa de fruta y 170ml de agua purificada fría.',
          'Licuar a velocidad máxima por 30 segundos hasta consistencia smoothie brillante y homogénea.',
          'Verter en el vaso domo de 16oz, cerrar con tapa y servir con sorbete ancho.',
        ],
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

  const rawSize = (item.size || '').toLowerCase();
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

  const isDbFrappe = dbProd?.category === 'frappe' || dbProd?.category === 'frio';
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

  const master = masterKey ? MASTER_RECIPES[masterKey] : null;

  let ingredients = [];
  let steps = [];
  let glass = isFrappe ? 'Vaso Domo con tapa' : 'Vaso / Taza según tamaño';

  if (master) {
    let sizeData = null;

    if (isCold && !master.isFrappe && master.coldOverride) {
      sizeData = master.coldOverride[activeSize] || master.coldOverride['12oz'] || master.sizes[activeSize];
    } else {
      sizeData = master.sizes[activeSize] || master.sizes['12oz'] || master.sizes['8oz'] || master.sizes['16oz'];
    }

    if (sizeData) {
      ingredients = sizeData.ingredients || [];
      steps = sizeData.steps || [];
      if (sizeData.glass) glass = sizeData.glass;
    }
  }

  const dbRecipeField = activeSize === '8oz' ? dbProd?.recipe8oz : activeSize === '16oz' ? dbProd?.recipe16oz : dbProd?.recipe12oz;

  if (ingredients.length === 0 && dbRecipeField) {
    ingredients = parseDbRecipeLines(dbRecipeField);
  }

  // Asegurar formato con pumps en todos los syrups
  ingredients = ingredients.map((ing) => ({
    ...ing,
    amount: formatSyrupWithPumps(ing.amount, ing.name),
  }));

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

  const finalExtras = Array.isArray(item.extras) ? [...item.extras] : [];
  if (hasCanela && !finalExtras.some((e) => /canela/i.test(e))) {
    finalExtras.push('Canela');
  }

  return {
    productName: rawName,
    activeSize,
    sizeLabel: item.size || sizeLabel,
    isFrappe,
    isCold,
    typeLabel: isFrappe ? '🍧 Frappé / Frozen' : isCold ? '🧊 Café Frío' : '☕ Café Caliente',
    glass,
    ingredients,
    steps,
    extras: finalExtras,
    vaso: item.vaso || '',
    note: item.note || '',
  };
}
