import { Injectable } from '@nestjs/common';
import { type UserReservatioReaderPort } from '../../application/ports';
import {
  IReservationUserPort,
  type ReservationUserSnapshot,
} from '../../domain/ports';

/**
 * User provider for reservation domain.
 *
 * IMPORTANT: This implementation trusts the userId from the JWT token.
 * We do NOT validate against any local user table because:
 * 1. Users live in Auth MS, not in this service
 * 2. The JWT is already validated by JwtStrategy
 * 3. If the JWT is valid, the user exists in Auth MS
 */
@Injectable()
export class UserTypeOrmReservationProvider
  extends IReservationUserPort
  implements UserReservatioReaderPort
{
  /**
   * Always returns true because we trust the JWT token.
   * If the request has a valid JWT, the user exists.
   */
  async exists(userId: string): Promise<boolean> {
    // We trust the JWT - if we have a userId, the user exists in Auth MS
    return Boolean(userId);
  }

  /**
   * Returns a snapshot assuming the user is active.
   * User status should be checked via Auth MS if needed.
   */
  async loadById(userId: string): Promise<ReservationUserSnapshot | null> {
    if (!userId) {
      return null;
    }

    // We trust the JWT token - user exists and is active
    // If you need to check if user is actually active, call Auth MS
    return {
      userId,
      active: true,
    };
  }
}
