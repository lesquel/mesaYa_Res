import { AuthUser } from '../../../domain/entities/auth-user.entity';

/**
 * Response containing user and tokens.
 * Now includes accessToken/refreshToken from Auth MS.
 * The 'token' property is kept for backwards compatibility.
 */
export interface AuthTokenResponse {
  user: AuthUser;
  /** @deprecated Use accessToken instead - kept for backwards compatibility */
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}
