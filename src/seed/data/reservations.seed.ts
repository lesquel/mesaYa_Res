export interface ReservationSeedData {
  userEmail: string;
  restaurantIndex: number;
  tableIndex: number;
  reservationTime: string;
  reservationDate: Date;
  numberOfGuests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

// Helper function to get a future date
const getFutureDate = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

export const reservationsSeed: ReservationSeedData[] = [
  {
    userEmail: 'user1@mesaya.com',
    restaurantIndex: 0,
    tableIndex: 0,
    reservationTime: '19:00',
    reservationDate: getFutureDate(2),
    numberOfGuests: 4,
    status: 'CONFIRMED',
  },
  {
    userEmail: 'user2@mesaya.com',
    restaurantIndex: 0,
    tableIndex: 3,
    reservationTime: '20:00',
    reservationDate: getFutureDate(3),
    numberOfGuests: 6,
    status: 'CONFIRMED',
  },
  {
    userEmail: 'user3@mesaya.com',
    restaurantIndex: 1,
    tableIndex: 6,
    reservationTime: '19:30',
    reservationDate: getFutureDate(4),
    numberOfGuests: 8,
    status: 'PENDING',
  },
  {
    userEmail: 'user4@mesaya.com',
    restaurantIndex: 2,
    tableIndex: 10,
    reservationTime: '18:00',
    reservationDate: getFutureDate(5),
    numberOfGuests: 5,
    status: 'CONFIRMED',
  },
  {
    userEmail: 'user5@mesaya.com',
    restaurantIndex: 3,
    tableIndex: 15,
    reservationTime: '20:30',
    reservationDate: getFutureDate(6),
    numberOfGuests: 6,
    status: 'PENDING',
  },
  {
    userEmail: 'user6@mesaya.com',
    restaurantIndex: 4,
    tableIndex: 21,
    reservationTime: '19:15',
    reservationDate: getFutureDate(7),
    numberOfGuests: 4,
    status: 'CONFIRMED',
  },
  {
    userEmail: 'user7@mesaya.com',
    restaurantIndex: 5,
    tableIndex: 24,
    reservationTime: '18:45',
    reservationDate: getFutureDate(8),
    numberOfGuests: 7,
    status: 'CONFIRMED',
  },
  {
    userEmail: 'user8@mesaya.com',
    restaurantIndex: 6,
    tableIndex: 30,
    reservationTime: '21:00',
    reservationDate: getFutureDate(9),
    numberOfGuests: 2,
    status: 'CANCELLED',
  },
  {
    userEmail: 'user9@mesaya.com',
    restaurantIndex: 7,
    tableIndex: 33,
    reservationTime: '19:30',
    reservationDate: getFutureDate(10),
    numberOfGuests: 4,
    status: 'CONFIRMED',
  },
  {
    userEmail: 'user10@mesaya.com',
    restaurantIndex: 8,
    tableIndex: 40,
    reservationTime: '20:45',
    reservationDate: getFutureDate(11),
    numberOfGuests: 10,
    status: 'PENDING',
  },
  {
    userEmail: 'user2@mesaya.com',
    restaurantIndex: 9,
    tableIndex: 45,
    reservationTime: '19:00',
    reservationDate: getFutureDate(12),
    numberOfGuests: 8,
    status: 'CONFIRMED',
  },
  {
    userEmail: 'user3@mesaya.com',
    restaurantIndex: 5,
    tableIndex: 12,
    reservationTime: '17:30',
    reservationDate: getFutureDate(13),
    numberOfGuests: 3,
    status: 'CONFIRMED',
  },
];
