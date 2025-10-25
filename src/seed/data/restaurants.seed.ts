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

export const restaurantsSeed: RestaurantSeedData[] = [
  {
    name: 'La Esquina del Sabor',
    description:
      'Restaurante tradicional con cocina ecuatoriana e internacional',
    location: 'Av. Principal 123, Quito',
    openTime: '10:00',
    closeTime: '22:00',
    daysOpen: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ],
    totalCapacity: 80,
    subscriptionPlanName: 'Plan Premium',
    ownerEmail: 'owner1@mesaya.com',
    active: true,
  },
  {
    name: 'El Jardín Gourmet',
    description: 'Restaurante especializado en comida mediterránea',
    location: 'Calle Flores 456, Guayaquil',
    openTime: '11:00',
    closeTime: '23:00',
    daysOpen: [
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
    totalCapacity: 60,
    subscriptionPlanName: 'Plan Estándar',
    ownerEmail: 'owner2@mesaya.com',
    active: true,
  },
];
