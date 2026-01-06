/**
 * Authenticated Request Type
 *
 * Extends Express Request with authenticated user information.
 * Used across payment presentation layer controllers.
 */

import type { Request } from 'express';

/**
 * Represents an Express request with authenticated user data.
 * The user object is populated by JwtAuthGuard after token validation.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    /** User ID (subject claim from JWT) */
    sub: string;
    /** User email */
    email: string;
    /** Optional user role */
    role?: string;
  };
}
