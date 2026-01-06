import { Injectable } from '@nestjs/common';
import { type OwnerReaderPort } from '../../../../application/ports';
import { IRestaurantOwnerPort } from '../../../../domain/ports/restaurant-owner.port';

/**
 * Owner provider for restaurant domain.
 *
 * IMPORTANT: This implementation trusts the ownerId from the JWT token.
 * We do NOT validate against any local user table because:
 * 1. Users live in Auth MS, not in this service
 * 2. The JWT is already validated by JwtStrategy
 * 3. If the JWT is valid, the user exists in Auth MS
 */
@Injectable()
export class OwnerTypeOrmProvider
  implements OwnerReaderPort, IRestaurantOwnerPort
{
  /**
   * Always returns true because we trust the JWT token.
   * If the request has a valid JWT, the user exists.
   */
  async exists(ownerId: string): Promise<boolean> {
    // We trust the JWT - if we have an ownerId, the owner exists in Auth MS
    return Boolean(ownerId);
  }
}
