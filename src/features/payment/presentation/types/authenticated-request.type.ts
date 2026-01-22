/**
 * Authenticated Request Type
 *
 * Extends Express Request with authenticated user information.
 * Used across payment presentation layer controllers.
 */

import type { Request } from 'express';
import type { CurrentUserVo } from '@features/auth';

/**
 * Represents an Express request with authenticated user data.
 * The user object is populated by JwtAuthGuard after token validation.
 * It contains a CurrentUserVo instance with validated user data.
 */
export interface AuthenticatedRequest extends Request {
  user?: CurrentUserVo;
}
