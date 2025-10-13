export const BOOKING_EVENT_PUBLISHER = Symbol('BOOKING_EVENT_PUBLISHER');

export type BookingEventType =
  | 'booking.created'
  | 'booking.updated'
  | 'booking.deleted';

export interface BookingEventPayload {
  type: BookingEventType;
  bookingId: string;
  restaurantId: string;
  userId: string;
  occurredAt: Date;
  data?: Record<string, unknown>;
}

export interface BookingEventPublisherPort {
  publish(event: BookingEventPayload): Promise<void>;
}
