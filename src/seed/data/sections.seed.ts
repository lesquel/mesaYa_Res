export interface SectionSeedData {
  restaurantIndex: number;
  name: string;
  description: string;
  width: number;
  height: number;
}

export const sectionsSeed: SectionSeedData[] = [
  {
    restaurantIndex: 0,
    name: 'Salón Principal',
    description: 'Área principal del restaurante',
    width: 800,
    height: 600,
  },
  {
    restaurantIndex: 0,
    name: 'Terraza',
    description: 'Área exterior con vista panorámica',
    width: 600,
    height: 400,
  },
  {
    restaurantIndex: 1,
    name: 'Salón VIP',
    description: 'Área exclusiva para eventos especiales',
    width: 500,
    height: 500,
  },
  {
    restaurantIndex: 1,
    name: 'Jardín',
    description: 'Área verde al aire libre',
    width: 700,
    height: 600,
  },
];
