import {
  AuthDomainError,
  AuthErrors,
  AuthErrorCode,
} from '../../domain/errors';

/**
 * Mapea respuestas de proveedor a errores de dominio.
 * Centraliza lógica de traducción de errores.
 */
export class AuthErrorMapper {
  /**
   * Mapea código de error del proveedor a error de dominio.
   */
  static fromProviderError(code: string, _message?: string): AuthDomainError {
    switch (code) {
      case AuthErrorCode.INVALID_CREDENTIALS:
        return AuthErrors.invalidCredentials();
      case AuthErrorCode.EMAIL_ALREADY_IN_USE:
        return AuthErrors.emailAlreadyInUse();
      case AuthErrorCode.USER_NOT_FOUND:
        return AuthErrors.userNotFound();
      case AuthErrorCode.INVALID_REFRESH_TOKEN:
        return AuthErrors.invalidRefreshToken();
      case AuthErrorCode.TOKEN_EXPIRED:
        return AuthErrors.tokenExpired();
      case AuthErrorCode.AUTH_SERVICE_UNAVAILABLE:
        return AuthErrors.authServiceUnavailable();
      default:
        return AuthErrors.authServiceUnavailable();
    }
  }

  /**
   * Mapea excepciones técnicas a errores de dominio.
   */
  static fromException(error: unknown): AuthDomainError {
    if (error instanceof AuthDomainError) {
      return error;
    }

    if (error instanceof Error) {
      if (
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED')
      ) {
        return AuthErrors.authServiceUnavailable();
      }
    }

    return AuthErrors.authServiceUnavailable();
  }
}
