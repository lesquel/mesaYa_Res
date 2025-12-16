/**
 * Error codes del dominio de autenticación.
 * Independiente de infraestructura (Kafka, HTTP, etc)
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  AUTH_SERVICE_UNAVAILABLE = 'AUTH_SERVICE_UNAVAILABLE',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
}

/**
 * Error de dominio para autenticación.
 * Todos los errores en Auth convergen a este.
 */
export class AuthDomainError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AuthDomainError';
  }
}

/**
 * Predefinidos para uso en servicios
 */
export const AuthErrors = {
  invalidCredentials: () =>
    new AuthDomainError(
      AuthErrorCode.INVALID_CREDENTIALS,
      'Invalid email or password',
      401,
    ),
  emailAlreadyInUse: () =>
    new AuthDomainError(
      AuthErrorCode.EMAIL_ALREADY_IN_USE,
      'Email is already registered',
      400,
    ),
  userNotFound: () =>
    new AuthDomainError(AuthErrorCode.USER_NOT_FOUND, 'User not found', 404),
  authServiceUnavailable: () =>
    new AuthDomainError(
      AuthErrorCode.AUTH_SERVICE_UNAVAILABLE,
      'Auth service is unavailable. Please try again later.',
      503,
    ),
  invalidRefreshToken: () =>
    new AuthDomainError(
      AuthErrorCode.INVALID_REFRESH_TOKEN,
      'Refresh token is invalid or expired',
      401,
    ),
  tokenExpired: () =>
    new AuthDomainError(AuthErrorCode.TOKEN_EXPIRED, 'Token has expired', 401),
} as const;
