export const USER_BOOKING_READER = Symbol('USER_BOOKING_READER');

export interface UserBookingReaderPort {
  exists(userId: string): Promise<boolean>;
}
