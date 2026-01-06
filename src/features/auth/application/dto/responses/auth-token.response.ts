/**
 * Simple user representation from Auth MS.
 * No complex domain entity needed - users live in Auth MS.
 */
export interface AuthUserInfo {
  id: string;
  email: string;
  name: string;
  roles: Array<{
    name: string;
    permissions: Array<{ name: string }>;
  }>;
}

/**
 * Response containing user and tokens.
 * Now includes accessToken/refreshToken from Auth MS.
 * The 'token' property is kept for backwards compatibility.
 */
export interface AuthTokenResponse {
  user: AuthUserInfo;
  /** @deprecated Use accessToken instead - kept for backwards compatibility */
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}
