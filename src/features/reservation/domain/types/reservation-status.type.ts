export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'NO_SHOW';

export const RESERVATION_STATUSES: readonly ReservationStatus[] = [
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'CANCELLED',
  'CHECKED_IN',
  'COMPLETED',
  'NO_SHOW',
];

export function isReservationStatus(value: unknown): value is ReservationStatus {
  if (typeof value !== 'string') {
    return false;
  }
  return RESERVATION_STATUSES.includes(value.toUpperCase() as ReservationStatus);
}
