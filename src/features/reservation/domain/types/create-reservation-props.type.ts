import type { ReservartionProps } from './reservation-props.interface';

export type CreateReservationProps = Omit<
  ReservartionProps,
  'createdAt' | 'updatedAt' | 'status'
>;
