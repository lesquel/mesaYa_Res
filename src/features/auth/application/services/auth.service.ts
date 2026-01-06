import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  AuthProxyService,
  AuthTokenData,
} from '../../infrastructure/messaging/auth-proxy.service';
import { SignUpCommand } from '../dto/commands/sign-up.command';
import { LoginCommand } from '../dto/commands/login.command';
import type { AuthTokenResponse } from '../dto/responses/auth-token.response';

/**
 * Simplified AuthService that delegates ALL authentication operations to Auth MS.
 *
 * This service acts as a pure proxy - no local user storage or management.
 * Users live exclusively in Auth MS.
 */
@Injectable()
export class AuthService {
  constructor(private readonly authProxy: AuthProxyService) {}

  /**
   * Delegates signup to Auth MS via Kafka.
   */
  async signup(command: SignUpCommand): Promise<AuthTokenResponse> {
    const [firstName, ...lastNameParts] = (command.name || '').split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const response = await this.authProxy.signUp({
      email: command.email,
      password: command.password,
      firstName: firstName || '',
      lastName: lastName,
      phone: command.phone,
    });

    if (!response.success || !response.data) {
      throw this.mapProxyError(response.error);
    }

    return this.mapTokenDataToResponse(response.data);
  }

  /**
   * Delegates login to Auth MS via Kafka.
   */
  async login(command: LoginCommand): Promise<AuthTokenResponse> {
    const response = await this.authProxy.login({
      email: command.email,
      password: command.password,
    });

    if (!response.success || !response.data) {
      throw this.mapProxyError(response.error);
    }

    return this.mapTokenDataToResponse(response.data);
  }

  /**
   * Gets current user info from Auth MS.
   */
  async getCurrentUser(
    userId: string,
  ): Promise<AuthTokenResponse['user'] | null> {
    const response = await this.authProxy.findUserById(userId);

    if (!response.success || !response.data) {
      return null;
    }

    return {
      id: response.data.id,
      email: response.data.email,
      name: `${response.data.firstName} ${response.data.lastName}`.trim(),
      roles: response.data.roles.map((roleName) => ({
        name: roleName,
        permissions: [],
      })),
    };
  }

  /**
   * Refreshes access token via Auth MS.
   */
  async refreshToken(refreshToken: string): Promise<AuthTokenResponse> {
    const response = await this.authProxy.refreshToken({ refreshToken });

    if (!response.success || !response.data) {
      throw this.mapProxyError(response.error);
    }

    return this.mapTokenDataToResponse(response.data);
  }

  /**
   * Logs out user via Auth MS.
   */
  async logout(userId: string, revokeAll = false): Promise<void> {
    await this.authProxy.logout({ userId, revokeAll });
  }

  private mapTokenDataToResponse(data: AuthTokenData): AuthTokenResponse {
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: `${data.user.firstName} ${data.user.lastName}`.trim(),
        roles: data.user.roles.map((roleName) => ({
          name: roleName,
          permissions: [],
        })),
      },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  }

  private mapProxyError(error?: {
    code: string;
    message: string;
  }): UnauthorizedException | BadRequestException {
    if (!error) {
      return new BadRequestException('Unknown authentication error');
    }

    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        return new UnauthorizedException('Invalid email or password');
      case 'EMAIL_ALREADY_IN_USE':
        return new BadRequestException('Email is already registered');
      case 'USER_NOT_FOUND':
        return new UnauthorizedException('User not found');
      case 'AUTH_MS_UNREACHABLE':
        return new BadRequestException(error.message);
      default:
        return new BadRequestException(error.message);
    }
  }
}
