import type { ReservartionProps } from './reservation-props.interface';

export type UpdateReservationProps = Partial<
  Omit<ReservartionProps, 'userId' | 'restaurantId' | 'tableId' | 'createdAt'>
>;
