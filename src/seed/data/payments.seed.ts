import { PaymentStatusEnum } from '@features/payment/domain/enums';

export interface PaymentSeedData {
  amount: number;
  date: Date;
  paymentStatus: PaymentStatusEnum;
  reservationIndex?: number;
  subscriptionIndex?: number;
}

// Helper function to get a date relative to now
const getRelativeDate = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

export const paymentsSeed: PaymentSeedData[] = [
  {
    amount: 55.0,
    date: getRelativeDate(-5),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    reservationIndex: 0,
  },
  {
    amount: 70.0,
    date: getRelativeDate(-4),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    reservationIndex: 1,
  },
  {
    amount: 95.0,
    date: getRelativeDate(-3),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    reservationIndex: 2,
  },
  {
    amount: 65.0,
    date: getRelativeDate(-2),
    paymentStatus: PaymentStatusEnum.PENDING,
    reservationIndex: 3,
  },
  {
    amount: 45.0,
    date: getRelativeDate(-1),
    paymentStatus: PaymentStatusEnum.PENDING,
    reservationIndex: 4,
  },
  {
    amount: 80.0,
    date: getRelativeDate(0),
    paymentStatus: PaymentStatusEnum.PENDING,
    reservationIndex: 5,
  },
  {
    amount: 249.99,
    date: new Date('2024-03-05'),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    subscriptionIndex: 2,
  },
  {
    amount: 149.99,
    date: new Date('2024-04-10'),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    subscriptionIndex: 3,
  },
  {
    amount: 199.0,
    date: new Date('2024-05-15'),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    subscriptionIndex: 4,
  },
  {
    amount: 59.99,
    date: new Date('2024-06-20'),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    subscriptionIndex: 5,
  },
  {
    amount: 320.0,
    date: new Date('2024-07-25'),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    subscriptionIndex: 6,
  },
  {
    amount: 120.0,
    date: new Date('2024-08-30'),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    subscriptionIndex: 7,
  },
];
