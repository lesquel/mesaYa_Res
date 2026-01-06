import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom, timeout } from 'rxjs';

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

export interface AuthProxyResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface SignUpPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface LogoutPayload {
  userId: string;
  revokeAll?: boolean;
}

export interface AuthTokenData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export const AUTH_KAFKA_CLIENT = Symbol('AUTH_KAFKA_CLIENT');

@Injectable()
export class AuthProxyService implements OnModuleInit {
  private readonly logger = new Logger(AuthProxyService.name);
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds

  constructor(
    @Inject(AUTH_KAFKA_CLIENT)
    private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to response topics for request-reply pattern
    Object.values(AUTH_PATTERNS).forEach((pattern) => {
      this.authClient.subscribeToResponseOf(pattern);
    });

    await this.authClient.connect();
    this.logger.log('Connected to Auth MS via Kafka');
  }

  async signUp(
    payload: SignUpPayload,
  ): Promise<AuthProxyResponse<AuthTokenData>> {
    return this.send<AuthTokenData>(AUTH_PATTERNS.SIGN_UP, payload);
  }

  async login(
    payload: LoginPayload,
  ): Promise<AuthProxyResponse<AuthTokenData>> {
    return this.send<AuthTokenData>(AUTH_PATTERNS.LOGIN, payload);
  }

  async refreshToken(
    payload: RefreshTokenPayload,
  ): Promise<AuthProxyResponse<AuthTokenData>> {
    return this.send<AuthTokenData>(AUTH_PATTERNS.REFRESH_TOKEN, payload);
  }

  async logout(payload: LogoutPayload): Promise<AuthProxyResponse<void>> {
    return this.send<void>(AUTH_PATTERNS.LOGOUT, payload);
  }

  async findUserById(
    userId: string,
  ): Promise<AuthProxyResponse<AuthUserData | null>> {
    return this.send<AuthUserData | null>(AUTH_PATTERNS.FIND_USER_BY_ID, {
      userId,
    });
  }

  async findUserByEmail(
    email: string,
  ): Promise<AuthProxyResponse<AuthUserData | null>> {
    return this.send<AuthUserData | null>(AUTH_PATTERNS.FIND_USER_BY_EMAIL, {
      email,
    });
  }

  private async send<T>(
    pattern: string,
    payload: unknown,
  ): Promise<AuthProxyResponse<T>> {
    try {
      const response = await lastValueFrom(
        this.authClient
          .send<AuthProxyResponse<T>>(pattern, payload)
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
          code: 'AUTH_MS_UNREACHABLE',
          message: 'Auth service is unavailable. Please try again later.',
        },
      };
    }
  }
}
