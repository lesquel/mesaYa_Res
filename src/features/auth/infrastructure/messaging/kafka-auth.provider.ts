import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';

import {
  IAuthProvider,
  ProviderTokenData,
  ProviderUserInfo,
} from '../../application/ports/auth-provider.port';
import { AuthDomainError, AuthErrors } from '../../domain/errors';
import {
  KafkaAuthProxyResponse,
  KafkaTokenData,
  KafkaUserData,
} from '../types/kafka-auth.types';

/**
 * Patterns must match the Auth MS message patterns
 */
const AUTH_PATTERNS = {
  SIGN_UP: 'auth.sign-up',
  LOGIN: 'auth.login',
  REFRESH_TOKEN: 'auth.refresh-token',
  LOGOUT: 'auth.logout',
  FIND_USER_BY_ID: 'auth.find-user-by-id',
  FIND_USER_BY_EMAIL: 'auth.find-user-by-email',
} as const;

export const AUTH_KAFKA_CLIENT = Symbol('AUTH_KAFKA_CLIENT');

/**
 * Adapter Kafka que implementa IAuthProvider.
 *
 * Detalles:
 * - Usa request-reply pattern con Kafka
 * - Timeout configurable
 * - Mapea respuestas Kafka a tipos de puerto
 * - Convierte errores Kafka a AuthDomainError
 */
@Injectable()
export class KafkaAuthProvider implements IAuthProvider, OnModuleInit {
  private readonly logger = new Logger(KafkaAuthProvider.name);
  private readonly DEFAULT_TIMEOUT = 10000; // 10 segundos

  constructor(
    @Inject(AUTH_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    Object.values(AUTH_PATTERNS).forEach((pattern) => {
      this.kafkaClient.subscribeToResponseOf(pattern);
    });

    await this.kafkaClient.connect();
    this.logger.log('Connected to Auth MS via Kafka');
  }

  async signUp(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<ProviderTokenData> {
    const response = await this.send<KafkaTokenData>(
      AUTH_PATTERNS.SIGN_UP,
      payload,
    );

    if (!response.success || !response.data) {
      throw this.mapError(response.error);
    }

    return this.mapTokenData(response.data);
  }

  async login(payload: {
    email: string;
    password: string;
  }): Promise<ProviderTokenData> {
    const response = await this.send<KafkaTokenData>(
      AUTH_PATTERNS.LOGIN,
      payload,
    );

    if (!response.success || !response.data) {
      throw this.mapError(response.error);
    }

    return this.mapTokenData(response.data);
  }

  async refreshToken(payload: {
    refreshToken: string;
  }): Promise<ProviderTokenData> {
    const response = await this.send<KafkaTokenData>(
      AUTH_PATTERNS.REFRESH_TOKEN,
      payload,
    );

    if (!response.success || !response.data) {
      throw this.mapError(response.error);
    }

    return this.mapTokenData(response.data);
  }

  async logout(payload: {
    userId: string;
    revokeAll?: boolean;
  }): Promise<void> {
    const response = await this.send<void>(AUTH_PATTERNS.LOGOUT, payload);

    if (!response.success) {
      throw this.mapError(response.error);
    }
  }

  async findUserById(userId: string): Promise<ProviderUserInfo | null> {
    const response = await this.send<KafkaUserData | null>(
      AUTH_PATTERNS.FIND_USER_BY_ID,
      { userId },
    );

    if (!response.success || !response.data) {
      return null;
    }

    return this.mapUserData(response.data);
  }

  async findUserByEmail(email: string): Promise<ProviderUserInfo | null> {
    const response = await this.send<KafkaUserData | null>(
      AUTH_PATTERNS.FIND_USER_BY_EMAIL,
      { email },
    );

    if (!response.success || !response.data) {
      return null;
    }

    return this.mapUserData(response.data);
  }

  /**
   * Envía mensaje a Auth MS con timeout.
   */
  private async send<T>(
    pattern: string,
    payload: unknown,
  ): Promise<KafkaAuthProxyResponse<T>> {
    try {
      const response = await lastValueFrom(
        this.kafkaClient
          .send<KafkaAuthProxyResponse<T>>(pattern, payload)
          .pipe(timeout(this.DEFAULT_TIMEOUT)),
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to send message to Auth MS: ${pattern}`,
        error instanceof Error ? error.stack : error,
      );
      return {
        success: false,
        error: {
          code: 'AUTH_SERVICE_UNAVAILABLE',
          message: 'Auth service is unavailable. Please try again later.',
        },
      };
    }
  }

  /**
   * Mapea error de Kafka a dominio.
   */
  private mapError(error?: { code: string; message: string }): AuthDomainError {
    if (!error) {
      return AuthErrors.authServiceUnavailable();
    }

    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        return AuthErrors.invalidCredentials();
      case 'EMAIL_ALREADY_IN_USE':
        return AuthErrors.emailAlreadyInUse();
      case 'USER_NOT_FOUND':
        return AuthErrors.userNotFound();
      case 'INVALID_REFRESH_TOKEN':
        return AuthErrors.invalidRefreshToken();
      case 'TOKEN_EXPIRED':
        return AuthErrors.tokenExpired();
      case 'AUTH_SERVICE_UNAVAILABLE':
      case 'AUTH_MS_UNREACHABLE':
        return AuthErrors.authServiceUnavailable();
      default:
        return AuthErrors.authServiceUnavailable();
    }
  }

  /**
   * Mapea datos de token de Kafka.
   */
  private mapTokenData(data: KafkaTokenData): ProviderTokenData {
    return {
      user: this.mapUserData(data.user),
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  }

  /**
   * Mapea datos de usuario de Kafka.
   */
  private mapUserData(data: KafkaUserData): ProviderUserInfo {
    return {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles,
    };
  }
}
