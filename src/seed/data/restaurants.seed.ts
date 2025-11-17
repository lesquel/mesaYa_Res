import { subscriptionPlanNames } from './subscription-plans.seed';

export interface RestaurantLocationSeed {
  address: string;
  city: string;
  province?: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface RestaurantSeedData {
  name: string;
  description: string;
  location: RestaurantLocationSeed;
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
    location: {
      address: 'Av. Principal 123',
      city: 'Quito',
      province: 'Pichincha',
      country: 'Ecuador',
      latitude: -0.180653,
      longitude: -78.467834,
    },
  },
  {
    name: 'El Jardín Gourmet',
    description: 'Restaurante especializado en comida mediterránea',
    location: {
      address: 'Calle Flores 456',
      city: 'Guayaquil',
      province: 'Guayas',
      country: 'Ecuador',
      latitude: -2.170998,
      longitude: -79.922359,
    },
  },
  {
    name: 'Brasa Cocina Urbana',
    description: 'Parrilla urbana con propuesta de autor',
    location: {
      address: 'Ruta Viva 85',
      city: 'Quito',
      province: 'Pichincha',
      country: 'Ecuador',
      latitude: -0.102629,
      longitude: -78.438101,
    },
  },
  {
    name: 'Nómada Casa de Mar',
    description: 'Marisquería con sabor internacional',
    location: {
      address: 'Malecón 21',
      city: 'Salinas',
      province: 'Santa Elena',
      country: 'Ecuador',
      latitude: -2.214815,
      longitude: -80.968147,
    },
  },
  {
    name: 'Fogón Andino',
    description: 'Cocina andina contemporánea',
    location: {
      address: 'Av. Amazonas 200',
      city: 'Quito',
      province: 'Pichincha',
      country: 'Ecuador',
      latitude: -0.191226,
      longitude: -78.490279,
    },
  },
  {
    name: 'Cielo Sabor & Arte',
    description: 'Experiencia gastronómica con arte local',
    location: {
      address: 'La Carolina 14',
      city: 'Quito',
      province: 'Pichincha',
      country: 'Ecuador',
      latitude: -0.180143,
      longitude: -78.485382,
    },
  },
  {
    name: 'Aura Kitchen Club',
    description: 'Bar y cocina creativa nocturna',
    location: {
      address: 'Av. 9 de Octubre 1100',
      city: 'Guayaquil',
      province: 'Guayas',
      country: 'Ecuador',
      latitude: -2.190556,
      longitude: -79.889085,
    },
  },
  {
    name: 'Origen Parrilla',
    description: 'Asados premium y cocteles clásicos',
    location: {
      address: 'Av. América 700',
      city: 'Guayaquil',
      province: 'Guayas',
      country: 'Ecuador',
      latitude: -2.163987,
      longitude: -79.901389,
    },
  },
  {
    name: 'Mirador Urbano',
    description: 'Rooftop con vista a la ciudad',
    location: {
      address: 'Centro Histórico',
      city: 'Quito',
      province: 'Pichincha',
      country: 'Ecuador',
      latitude: -0.220164,
      longitude: -78.512327,
    },
  },
  {
    name: 'Ritmo Tropical',
    description: 'Fusión caribeña con ritmos latinos',
    location: {
      address: 'Av. del Bombero 55',
      city: 'Guayaquil',
      province: 'Guayas',
      country: 'Ecuador',
      latitude: -2.152808,
      longitude: -79.931017,
    },
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
