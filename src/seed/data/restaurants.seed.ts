import { subscriptionPlanNames } from './subscription-plans.seed';

export interface RestaurantSeedData {
  name: string;
  description: string;
  location: string;
  openTime: string;
  closeTime: string;
  daysOpen: string[];
  totalCapacity: number;
  subscriptionPlanName: string;
  ownerEmail: string;
  active: boolean;
}

const restaurantTemplates = [
  {
    name: 'La Esquina del Sabor',
    description:
      'Restaurante tradicional con cocina ecuatoriana e internacional',
    location: 'Av. Principal 123, Quito',
  },
  {
    name: 'El Jardín Gourmet',
    description: 'Restaurante especializado en comida mediterránea',
    location: 'Calle Flores 456, Guayaquil',
  },
  {
    name: 'Brasa Cocina Urbana',
    description: 'Parrilla urbana con propuesta de autor',
    location: 'Ruta Viva 85, Quito',
  },
  {
    name: 'Nómada Casa de Mar',
    description: 'Marisquería con sabor internacional',
    location: 'Malecón 21, Salinas',
  },
  {
    name: 'Fogón Andino',
    description: 'Cocina andina contemporánea',
    location: 'Av. Amazonas 200, Quito',
  },
  {
    name: 'Cielo Sabor & Arte',
    description: 'Experiencia gastronómica con arte local',
    location: 'La Carolina 14, Quito',
  },
  {
    name: 'Aura Kitchen Club',
    description: 'Bar y cocina creativa nocturna',
    location: 'Av. 9 de Octubre 1100, Guayaquil',
  },
  {
    name: 'Origen Parrilla',
    description: 'Asados premium y cocteles clásicos',
    location: 'Av. América 700, Guayaquil',
  },
  {
    name: 'Mirador Urbano',
    description: 'Rooftop con vista a la ciudad',
    location: 'Centro Histórico, Quito',
  },
  {
    name: 'Ritmo Tropical',
    description: 'Fusión caribeña con ritmos latinos',
    location: 'Av. del Bombero 55, Guayaquil',
  },
];

const weekSchedules = [
  ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
  ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
  ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SUNDAY'],
  ['MONDAY', 'TUESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
  ['MONDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
];

export const restaurantsSeed: RestaurantSeedData[] = restaurantTemplates.map(
  (template, index) => ({
    name: template.name,
    description: template.description,
    location: template.location,
    openTime: index % 2 === 0 ? '10:00' : '11:30',
    closeTime: index % 3 === 0 ? '23:30' : '22:30',
    daysOpen: weekSchedules[index % weekSchedules.length],
    totalCapacity: 60 + index * 4,
    subscriptionPlanName:
      subscriptionPlanNames[index] ?? subscriptionPlanNames[0],
    ownerEmail: `owner${index + 1}@mesaya.com`,
    active: true,
  }),
);
