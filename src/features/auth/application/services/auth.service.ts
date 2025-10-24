import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '@shared/infrastructure/kafka';
import { SignUpUseCase } from '../use-cases/sign-up.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { UpdateUserRolesUseCase } from '../use-cases/update-user-roles.use-case';
import { UpdateRolePermissionsUseCase } from '../use-cases/update-role-permissions.use-case';
import { ListRolesUseCase } from '../use-cases/list-roles.use-case';
import { ListPermissionsUseCase } from '../use-cases/list-permissions.use-case';
import { FindUserByIdUseCase } from '../use-cases/find-user-by-id.use-case';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly updateUserRolesUseCase: UpdateUserRolesUseCase,
    private readonly updateRolePermissionsUseCase: UpdateRolePermissionsUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly getAuthAnalyticsUseCase: GetAuthAnalyticsUseCase,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Emits `mesa-ya.auth.user-signed-up` with `{ action, entityId, entity, token }` and returns the auth token response.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.AUTH_USER_SIGNED_UP,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [SignUpCommand];
      const authResult = result as AuthTokenResponse | undefined;
      const entity = authResult?.user ? toPlain(authResult.user) : null;
      return {
        action: 'auth.user.signed_up',
        entityId: (entity as { id?: string } | null)?.id ?? null,
        email: command.email,
        token: authResult?.token ?? null,
        entity,
      };
    },
  })
  async signup(command: SignUpCommand): Promise<AuthTokenResponse> {
    return this.signUpUseCase.execute(command);
  }

  /**
   * Emits `mesa-ya.auth.user-logged-in` with `{ action, email, entityId }` and returns the auth token response.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.AUTH_USER_LOGGED_IN,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [LoginCommand];
      const authResult = result as AuthTokenResponse | undefined;
      const entity = authResult?.user ? toPlain(authResult.user) : null;
      return {
        action: 'auth.user.logged_in',
        email: command.email,
        entityId: (entity as { id?: string } | null)?.id ?? null,
        token: authResult?.token ?? null,
        entity,
      };
    },
  })
  async login(command: LoginCommand): Promise<AuthTokenResponse> {
    return this.loginUseCase.execute(command);
  }

  async getCurrentUser(userId: string): Promise<AuthUser | null> {
    return this.findUserByIdUseCase.execute(userId);
  }

  /**
   * Emits `mesa-ya.auth.user-roles-updated` with `{ action, entityId, roles }` and returns the updated user.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.AUTH_USER_ROLES_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateUserRolesCommand];
      const entity = result ? toPlain(result) : null;
      return {
        action: 'auth.user.roles_updated',
        entityId: command.userId,
        roles: command.roleNames,
        entity,
      };
    },
  })
  async updateUserRoles(command: UpdateUserRolesCommand): Promise<AuthUser> {
    return this.updateUserRolesUseCase.execute(command);
  }

  /**
   * Emits `mesa-ya.auth.role-permissions-updated` with `{ action, roleName, permissions }` and returns the updated role.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.AUTH_ROLE_PERMISSIONS_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateRolePermissionsCommand];
      const entity = result ? toPlain(result) : null;
      return {
        action: 'auth.role.permissions_updated',
        roleName: command.roleName,
        permissions: command.permissionNames,
        entity,
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
}
