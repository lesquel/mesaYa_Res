import { Injectable, Inject, Logger } from '@nestjs/common';
import { AUTH_PROVIDER } from '../ports/auth-provider.port';
import type { IAuthProvider } from '../ports/auth-provider.port';
import { SignUpInput } from '../dto/inputs/sign-up.input';
import { LoginInput } from '../dto/inputs/login.input';
import { AuthTokenOutput } from '../dto/outputs/auth-token.output';
import { AuthUserOutput } from '../dto/outputs/auth-user.output';
import { AuthErrorMapper } from './auth-error.mapper';
import { AuthDomainError } from '../../domain/errors';

/**
 * Application Service para autenticación.
 *
 * Responsabilidades:
 * - Orquestar flujos de signup/login/logout
 * - Usar puerto IAuthProvider (agnóstico de transporte)
 * - Mapear DTOs de entrada/salida
 * - Manejar errores de dominio
 *
 * NO depende de:
 * - Kafka, HTTP, o detalles de infraestructura
 * - AuthProxyService directamente
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: IAuthProvider,
  ) {}

  /**
   * Registra un nuevo usuario.
   * @throws AuthDomainError
   */
  async signup(input: SignUpInput): Promise<AuthTokenOutput> {
    try {
      const providerData = await this.authProvider.signUp({
        email: input.email,
        password: input.password,
        firstName: input.getFirstName(),
        lastName: input.getLastName(),
        phone: input.phone,
      });

      return AuthTokenOutput.fromProvider(providerData);
    } catch (error) {
      throw AuthErrorMapper.fromException(error);
    }
  }

  /**
   * Autentica un usuario.
   * @throws AuthDomainError
   */
  async login(input: LoginInput): Promise<AuthTokenOutput> {
    try {
      const providerData = await this.authProvider.login({
        email: input.email,
        password: input.password,
      });

      return AuthTokenOutput.fromProvider(providerData);
    } catch (error) {
      throw AuthErrorMapper.fromException(error);
    }
  }

  /**
   * Obtiene usuario autenticado por ID.
   * @returns null si usuario no existe, nunca lanza.
   */
  async getCurrentUser(userId: string): Promise<AuthUserOutput | null> {
    const userData = await this.authProvider.findUserById(userId);
    return userData ? AuthUserOutput.fromProvider(userData) : null;
  }

  /**
   * Renueva access token.
   * @throws AuthDomainError
   */
  async refreshToken(refreshToken: string): Promise<AuthTokenOutput> {
    try {
      const providerData = await this.authProvider.refreshToken({
        refreshToken,
      });
      return AuthTokenOutput.fromProvider(providerData);
    } catch (error) {
      throw AuthErrorMapper.fromException(error);
    }
  }

  /**
   * Cierra sesión del usuario.
   */
  async logout(userId: string, revokeAll = false): Promise<void> {
    try {
      await this.authProvider.logout({ userId, revokeAll });
    } catch (error) {
      // Logout no debe fallar por error de conexión
      // Solo loguear si falla
      if (error instanceof AuthDomainError) {
        this.logger.warn(`Logout failed for user ${userId}: ${error.message}`);
      } else {
        this.logger.warn(`Logout failed for user ${userId}:`, error);
      }
    }
  }

  /**
   * Genera un token de servicio (API Key) de larga duración.
   * Solo para uso interno de servicios automatizados (n8n, cron jobs, etc).
   * @param userId ID del usuario administrador que solicita el token
   * @throws AuthDomainError si usuario no es admin
   */
  async generateServiceToken(userId: string): Promise<AuthTokenOutput> {
    try {
      const providerData = await this.authProvider.generateServiceToken({ userId });
      return AuthTokenOutput.fromProvider(providerData);
    } catch (error) {
      throw AuthErrorMapper.fromException(error);
    }
  }
}
