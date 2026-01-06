import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
} from '@shared/infrastructure/kafka';
import { UpdateUserRolesUseCase } from '../use-cases/update-user-roles.use-case';
import { UpdateRolePermissionsUseCase } from '../use-cases/update-role-permissions.use-case';
import { ListRolesUseCase } from '../use-cases/list-roles.use-case';
import { ListPermissionsUseCase } from '../use-cases/list-permissions.use-case';
import { GetAuthAnalyticsUseCase } from '../use-cases/get-auth-analytics.use-case';
import { SignUpCommand } from '../dto/commands/sign-up.command';
import { LoginCommand } from '../dto/commands/login.command';
import { UpdateUserRolesCommand } from '../dto/commands/update-user-roles.command';
import { UpdateRolePermissionsCommand } from '../dto/commands/update-role-permissions.command';
import type { AuthTokenResponse } from '../dto/responses/auth-token.response';
import type { AuthUser } from '../../domain/entities/auth-user.entity';
import type { AuthRole } from '../../domain/entities/auth-role.entity';
import type { AuthPermission } from '../../domain/entities/auth-permission.entity';
import type { AuthAnalyticsQuery } from '../dto/queries/auth-analytics.query';
import type { AuthAnalyticsResponse } from '../dto/responses/auth-analytics.response';
import {
  AuthProxyService,
  AuthTokenData,
} from '../../infrastructure/messaging/auth-proxy.service';

/**
 * AuthService now delegates authentication operations to the Auth Microservice
 * via Kafka, while keeping role/permission management local to the Gateway.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly authProxy: AuthProxyService,
    private readonly updateUserRolesUseCase: UpdateUserRolesUseCase,
    private readonly updateRolePermissionsUseCase: UpdateRolePermissionsUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly getAuthAnalyticsUseCase: GetAuthAnalyticsUseCase,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Delegates signup to Auth MS via Kafka.
   * The Auth MS will emit user.signed-up event which UserSyncConsumer will process.
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
  async getCurrentUser(userId: string): Promise<AuthUser | null> {
    const response = await this.authProxy.findUserById(userId);

    if (!response.success) {
      return null;
    }

    if (!response.data) {
      return null;
    }

    // Map proxy response to domain entity format
    return {
      id: response.data.id,
      email: response.data.email,
      name: `${response.data.firstName} ${response.data.lastName}`.trim(),
      roles: response.data.roles.map((roleName) => ({
        name: roleName,
        permissions: [],
      })),
    } as unknown as AuthUser;
  }

  /**
   * Emits `mesa-ya.auth.events` with event_type='roles_updated' and returns the updated user.
   * Role management is local to the Gateway.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.AUTH,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateUserRolesCommand];
      const entity = result ? toPlain(result) : null;
      return {
        event_type: EVENT_TYPES.ROLES_UPDATED,
        entity_id: command.userId,
        data: entity,
        metadata: { roles: command.roleNames },
      };
    },
  })
  async updateUserRoles(command: UpdateUserRolesCommand): Promise<AuthUser> {
    return this.updateUserRolesUseCase.execute(command);
  }

  /**
   * Emits `mesa-ya.auth.events` with event_type='permissions_updated' and returns the updated role.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.AUTH,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateRolePermissionsCommand];
      const entity = result ? toPlain(result) : null;
      return {
        event_type: EVENT_TYPES.PERMISSIONS_UPDATED,
        entity_id: command.roleName,
        data: entity,
        metadata: { permissions: command.permissionNames },
      };
    },
  })
  async updateRolePermissions(
    command: UpdateRolePermissionsCommand,
  ): Promise<AuthRole> {
    return this.updateRolePermissionsUseCase.execute(command);
  }

  async listRoles(): Promise<AuthRole[]> {
    return this.listRolesUseCase.execute();
  }

  async listPermissions(): Promise<AuthPermission[]> {
    return this.listPermissionsUseCase.execute();
  }

  async getAnalytics(
    query: AuthAnalyticsQuery,
  ): Promise<AuthAnalyticsResponse> {
    return this.getAuthAnalyticsUseCase.execute(query);
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
      } as unknown as AuthUser,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  }

  private mapProxyError(
    error?: { code: string; message: string },
  ): UnauthorizedException | BadRequestException {
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
