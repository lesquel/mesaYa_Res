import { Injectable } from '@nestjs/common';
import { type UserReviewReaderPort } from '../../../../application/ports';
import { type ReviewUserPort } from '../../../../domain/ports';

/**
 * User provider for review domain.
 *
 * IMPORTANT: This implementation trusts the userId from the JWT token.
 * We do NOT validate against any local user table because:
 * 1. Users live in Auth MS, not in this service
 * 2. The JWT is already validated by JwtStrategy
 * 3. If the JWT is valid, the user exists in Auth MS
 */
@Injectable()
export class UserTypeOrmReviewProvider
  implements UserReviewReaderPort, ReviewUserPort
{
  /**
   * Always returns true because we trust the JWT token.
   * If the request has a valid JWT, the user exists.
   */
  async exists(userId: string): Promise<boolean> {
    // We trust the JWT - if we have a userId, the user exists in Auth MS
    return Boolean(userId);
  }
}
