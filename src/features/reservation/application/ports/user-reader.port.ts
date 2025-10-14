export const USER_RESERVATION_READER = Symbol('USER_RESERVATION_READER');

export interface UserReservatioReaderPort {
  exists(userId: string): Promise<boolean>;
}
