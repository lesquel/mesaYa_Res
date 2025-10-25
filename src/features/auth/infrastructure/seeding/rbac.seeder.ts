import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AuthPermission } from '../../domain/entities/auth-permission.entity';
import { AuthRole } from '../../domain/entities/auth-role.entity';
import {
  DEFAULT_PERMISSION_NAMES,
  DEFAULT_ROLES,
} from '../../domain/constants/rbac.constants';
import { type AuthPermissionRepositoryPort } from '../../application/ports/permission.repository.port';
import { type AuthRoleRepositoryPort } from '../../application/ports/role.repository.port';
import {
  AUTH_PERMISSION_REPOSITORY,
  AUTH_ROLE_REPOSITORY,
} from '../../auth.tokens';

@Injectable()
export class RbacSeeder implements OnModuleInit {
  private readonly logger = new Logger(RbacSeeder.name);

  constructor(
    @Inject(AUTH_PERMISSION_REPOSITORY)
    private readonly permissions: AuthPermissionRepositoryPort,
    @Inject(AUTH_ROLE_REPOSITORY)
    private readonly roles: AuthRoleRepositoryPort,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  private async seed(): Promise<void> {
    const existingPermissions = await this.permissions.findAll();
    const existingNames = new Set(
      existingPermissions.map((permission) => permission.name),
    );

    const missingPermissionNames = DEFAULT_PERMISSION_NAMES.filter(
      (name) => !existingNames.has(name),
    );

    if (missingPermissionNames.length) {
      for (const name of missingPermissionNames) {
        await this.permissions.save(new AuthPermission({ name }));
      }
      this.logger.log(
        `Created permissions: ${missingPermissionNames.join(', ')}`,
      );
    }

    const allPermissions = await this.permissions.findAll();
    const permissionByName = new Map(
      allPermissions.map(
        (permission) => [permission.name, permission] as const,
      ),
    );

    for (const roleDef of DEFAULT_ROLES) {
      let role = await this.roles.findByName(roleDef.name);
      if (!role) {
        role = new AuthRole({ name: roleDef.name });
      }

      const desiredPermissions = roleDef.permNames
        .map((name) => permissionByName.get(name))
        .filter((permission): permission is AuthPermission =>
          Boolean(permission),
        );

      const existingRolePermissions = new Map(
        role.permissions.map(
          (permission) => [permission.name, permission] as const,
        ),
      );

      for (const permission of desiredPermissions) {
        existingRolePermissions.set(permission.name, permission);
      }

      role.setPermissions([...existingRolePermissions.values()]);
      await this.roles.save(role);
    }

    this.logger.log('RBAC seed complete');
  }
}
