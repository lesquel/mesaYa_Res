import { restaurantsSeed } from './restaurants.seed';

export interface SectionSeedData {
  restaurantIndex: number;
  name: string;
  description: string;
  width: number;
  height: number;
}

const sectionTemplates = [
  {
    name: 'Salón Principal',
    description: 'Área principal del restaurante',
    width: 800,
    height: 600,
  },
  {
    name: 'Terraza',
    description: 'Área exterior con vista panorámica',
    width: 620,
    height: 420,
  },
  {
    name: 'Lounge',
    description: 'Espacio íntimo para grupos pequeños',
    width: 500,
    height: 360,
  },
];

export const sectionsSeed: SectionSeedData[] = restaurantsSeed.flatMap(
  (restaurant, restaurantIndex) =>
    sectionTemplates.map((template) => ({
      restaurantIndex,
      name: `${restaurant.name} ${template.name}`,
      description: template.description,
      width: template.width + restaurantIndex * 6,
      height: template.height + restaurantIndex * 4,
    })),
);
