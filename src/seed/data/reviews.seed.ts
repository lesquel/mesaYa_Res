export interface ReviewSeedData {
  userEmail: string;
  restaurantIndex: number;
  rating: number;
  comment: string;
  createdAt: Date;
}

export const reviewsSeed: ReviewSeedData[] = [
  {
    userEmail: 'user1@mesaya.com',
    restaurantIndex: 0,
    rating: 5,
    comment: 'Excelente servicio y comida deliciosa. Muy recomendado!',
    createdAt: new Date('2025-10-20'),
  },
  {
    userEmail: 'user2@mesaya.com',
    restaurantIndex: 0,
    rating: 4,
    comment: 'Buena experiencia, el ambiente es acogedor.',
    createdAt: new Date('2025-10-21'),
  },
  {
    userEmail: 'user3@mesaya.com',
    restaurantIndex: 1,
    rating: 5,
    comment: 'La mejor paella que he probado. El chef es un maestro!',
    createdAt: new Date('2025-10-22'),
  },
  {
    userEmail: 'user1@mesaya.com',
    restaurantIndex: 1,
    rating: 4,
    comment: 'Muy buena atención, pero el servicio fue un poco lento.',
    createdAt: new Date('2025-10-23'),
  },
];
