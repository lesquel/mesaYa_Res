export const RESERVATION_EVENT_PUBLISHER = Symbol(
  'RESERVATION_EVENT_PUBLISHER',
);

export type ReservationEventType =
  | 'reservation.created'
  | 'reservation.updated'
  | 'reservation.deleted';

export interface ReservationEventPayload {
  type: ReservationEventType;
  reservationId: string;
  restaurantId: string;
  userId: string;
  occurredAt: Date;
  data?: Record<string, unknown>;
}

export interface ReservationEventPublisherPort {
  publish(event: ReservationEventPayload): Promise<void>;
}
