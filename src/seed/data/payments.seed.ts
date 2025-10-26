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
  // Payments for reservations
  {
    amount: 50.0,
    date: getRelativeDate(-2),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    reservationIndex: 0,
  },
  {
    amount: 75.0,
    date: getRelativeDate(-1),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    reservationIndex: 1,
  },
  {
    amount: 100.0,
    date: getRelativeDate(0),
    paymentStatus: PaymentStatusEnum.PENDING,
    reservationIndex: 2,
  },
  {
    amount: 60.0,
    date: getRelativeDate(1),
    paymentStatus: PaymentStatusEnum.PENDING,
    reservationIndex: 3,
  },
  // Payments for subscriptions
  {
    amount: 299.99,
    date: new Date('2024-01-01'),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    subscriptionIndex: 0,
  },
  {
    amount: 149.99,
    date: new Date('2024-02-01'),
    paymentStatus: PaymentStatusEnum.COMPLETED,
    subscriptionIndex: 1,
  },
];
