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
    userEmail: 'user4@mesaya.com',
    restaurantIndex: 2,
    rating: 5,
    comment: 'Los cocteles brindan un viaje de sabores.',
    createdAt: new Date('2025-10-23'),
  },
  {
    userEmail: 'user5@mesaya.com',
    restaurantIndex: 3,
    rating: 4,
    comment: 'Ambiente cálido y música en vivo todos los viernes.',
    createdAt: new Date('2025-10-24'),
  },
  {
    userEmail: 'user6@mesaya.com',
    restaurantIndex: 4,
    rating: 5,
    comment: 'Postres increíbles y presentación impecable.',
    createdAt: new Date('2025-10-25'),
  },
  {
    userEmail: 'user7@mesaya.com',
    restaurantIndex: 5,
    rating: 5,
    comment: 'Perfecto para eventos corporativos con atención vip.',
    createdAt: new Date('2025-10-26'),
  },
  {
    userEmail: 'user8@mesaya.com',
    restaurantIndex: 6,
    rating: 4,
    comment: 'Los cortes a la parrilla son memorables.',
    createdAt: new Date('2025-10-27'),
  },
  {
    userEmail: 'user9@mesaya.com',
    restaurantIndex: 7,
    rating: 5,
    comment: 'Servicio impecable y menú de autor.',
    createdAt: new Date('2025-10-28'),
  },
  {
    userEmail: 'user10@mesaya.com',
    restaurantIndex: 8,
    rating: 4,
    comment: 'Vista panorámica inigualable para cenas románticas.',
    createdAt: new Date('2025-10-29'),
  },
  {
    userEmail: 'user4@mesaya.com',
    restaurantIndex: 9,
    rating: 5,
    comment: 'Ritmos tropicales y sabores del caribe impresionante.',
    createdAt: new Date('2025-10-30'),
  },
  {
    userEmail: 'user5@mesaya.com',
    restaurantIndex: 2,
    rating: 4,
    comment: 'Cócteles creativos pero con mucha personalidad.',
    createdAt: new Date('2025-10-31'),
  },
  {
    userEmail: 'user6@mesaya.com',
    restaurantIndex: 3,
    rating: 4,
    comment: 'Lugar ideal para compartir y celebrar.',
    createdAt: new Date('2025-11-01'),
  },
  {
    userEmail: 'user7@mesaya.com',
    restaurantIndex: 4,
    rating: 5,
    comment: 'Servicio atento y recomendaciones acertadas.',
    createdAt: new Date('2025-11-02'),
  },
];
