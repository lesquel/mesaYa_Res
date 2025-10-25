export interface MenuSeedData {
  restaurantIndex: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export const menusSeed: MenuSeedData[] = [
  {
    restaurantIndex: 0,
    name: 'Menú Ejecutivo',
    description:
      'Menú completo para almuerzo incluye entrada, plato fuerte y postre',
    price: 12.99,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  },
  {
    restaurantIndex: 0,
    name: 'Menú Vegetariano',
    description: 'Opciones vegetarianas y veganas',
    price: 10.99,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  },
  {
    restaurantIndex: 1,
    name: 'Menú Mediterráneo',
    description: 'Especialidades del mediterráneo',
    price: 18.99,
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
  },
  {
    restaurantIndex: 1,
    name: 'Menú Degustación',
    description: 'Selección del chef con 5 tiempos',
    price: 35.99,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  },
];
