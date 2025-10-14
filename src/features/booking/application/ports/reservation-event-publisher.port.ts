export const BOOKING_EVENT_PUBLISHER = Symbol('BOOKING_EVENT_PUBLISHER');

export type ReservationEventType =
  | 'reservation.created'
  | 'reservation.updated'
  | 'reservation.deleted';

export interface ReservationEventPayload {
  type: ReservationEventType;
  bookingId: string;
  restaurantId: string;
  userId: string;
  occurredAt: Date;
  data?: Record<string, unknown>;
}

export interface ReservationEventPublisherPort {
  publish(event: ReservationEventPayload): Promise<void>;
}
