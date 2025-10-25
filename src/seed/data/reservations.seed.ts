export interface ReservationSeedData {
  userEmail: string;
  restaurantIndex: number;
  tableIndex: number;
  reservationTime: string;
  reservationDate: Date;
  numberOfGuests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export const reservationsSeed: ReservationSeedData[] = [
  {
    userEmail: 'user1@mesaya.com',
    restaurantIndex: 0,
    tableIndex: 0,
    reservationTime: '19:00',
    reservationDate: new Date('2025-10-25'),
    numberOfGuests: 4,
    status: 'CONFIRMED',
  },
  {
    userEmail: 'user2@mesaya.com',
    restaurantIndex: 0,
    tableIndex: 2,
    reservationTime: '20:00',
    reservationDate: new Date('2025-10-25'),
    numberOfGuests: 6,
    status: 'CONFIRMED',
  },
  {
    userEmail: 'user3@mesaya.com',
    restaurantIndex: 1,
    tableIndex: 6,
    reservationTime: '19:30',
    reservationDate: new Date('2025-10-26'),
    numberOfGuests: 8,
    status: 'PENDING',
  },
  {
    userEmail: 'user1@mesaya.com',
    restaurantIndex: 1,
    tableIndex: 8,
    reservationTime: '18:00',
    reservationDate: new Date('2025-10-27'),
    numberOfGuests: 4,
    status: 'CONFIRMED',
  },
];
