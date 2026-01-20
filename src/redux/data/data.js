export const heladoCrema = [
  { value: 'Americana', label: 'Americana' },
  { value: 'Vainilla', label: 'Vainilla' },
  { value: 'Granizado', label: 'Granizado' },
  { value: 'Crema del Cielo', label: 'Crema del Cielo' },
  { value: 'Mousse de Limón', label: 'Mousse de Limón' },
  { value: 'Lemon Pie', label: 'Lemon Pie' },
  { value: 'Tramontana', label: 'Tramontana' },
  { value: 'Banana Split', label: 'Banana Split' },
  { value: 'Frutilla a la Crema', label: 'Frutilla a la Crema' },
  { value: 'Frutilla Cadbury', label: 'Frutilla Cadbury' },
  { value: 'Crema Oreo', label: 'Crema Oreo' },
  { value: 'Mantecol', label: 'Flan con Dulce de Leche' },
  { value: 'Menta Granizada', label: 'Menta Granizada' },
  { value: 'Mascarpone con frutos rojos', label: 'Mascarpone con frutos rojos' },
  { value: 'Frutos del Bosque', label: 'Frutos del Bosque' },
  { value: 'Tiramisú', label: 'Tiramisú' },
  { value: 'Sambayón', label: 'Sambayón' },
  { value: 'Pistacho', label: 'Pistacho' },
  { value: 'Capitán del Espacio', label: 'Capitán del Espacio' },
  { value: 'Coffee Caramel', label: 'Coffee Caramel' },
  { value: 'Snickers', label: 'Snickers' },
  { value: 'Kinder Bueno', label: 'Kinder Bueno' },
];

export const heladoChocolate = [
  { value: 'Chocolate Tradicional', label: 'Chocolate Tradicional' },
  { value: 'Chocolate Dark', label: 'Chocolate Dark' },
  { value: 'Chocolate con Almendras', label: 'Chocolate con Almendras' },
  { value: 'Marroc', label: 'Marroc' },
  { value: 'Chocolate Tentación', label: 'Chocolate Tentación' },
  { value: 'Ferrero Rocher', label: 'Ferrero Rocher' },
  { value: 'Havanna Mar del Plata', label: 'Havanna Mar del Plata' },
  { value: 'Chocolate Blanco en Rama', label: 'Chocolate Blanco en Rama' },
  { value: 'Chocolate Dubai', label: 'Chocolate Dubai ' },
  { value: 'Chocolate Pixel', label: 'Chocolate Pixel' },
];

export const heladoDulceDeLeche = [
  { value: 'Dulce de Leche Tradicional', label: 'Dulce de Leche Tradicional' },
  { value: 'Dulce de Leche Bombón', label: 'Dulce de Leche Bombón' },
  { value: 'Dulce de Leche Granizado', label: 'Dulce de Leche Granizado' },
  { value: 'Dulce de Leche Marquise', label: 'Dulce de Leche Marquise' },
  { value: 'Super Dulce de Leche', label: 'Super Dulce de Leche' },
  { value: 'Dulce Choco en Rama', label: 'Dulce Choco en Rama' },
];

export const heladoNatural = [
  { value: 'Limón al Agua', label: 'Limón al Agua' },
  { value: 'Frutilla al Agua', label: 'Frutilla al Agua' },
  { value: 'Frambuesa', label: 'Frambuesa' },
];

export const groupedOptionsHelado = [
  {
    label: 'Crema',
    options: heladoCrema,
  },
  {
    label: 'Chocolate',
    options: heladoChocolate,
  },
  {
    label: 'Dulce de Leche',
    options: heladoDulceDeLeche,
  },
  {
    label: 'Natural',
    options: heladoNatural,
  },
];

export const options = [
  {
    label: 'Group 1',
    options: [
      { label: 'Group 1, option 1', value: 'value_1' },
      { label: 'Group 1, option 2', value: 'value_2' },
    ],
  },
  { label: 'A root option', value: 'value_3' },
  { label: 'Another root option', value: 'value_4' },
];
