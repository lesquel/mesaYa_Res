import { Inject, Injectable } from '@nestjs/common';
import { AuthRole } from '../../domain/entities/auth-role.entity';
import { type AuthRoleRepositoryPort } from '../ports/role.repository.port';
import { type AuthPermissionRepositoryPort } from '../ports/permission.repository.port';
import { UpdateRolePermissionsCommand } from '../dto/commands/update-role-permissions.command';
import {
  AUTH_PERMISSION_REPOSITORY,
  AUTH_ROLE_REPOSITORY,
} from '@features/auth/auth.tokens';

@Injectable()
export class UpdateRolePermissionsUseCase {
  constructor(
    @Inject(AUTH_ROLE_REPOSITORY)
    private readonly roles: AuthRoleRepositoryPort,
    @Inject(AUTH_PERMISSION_REPOSITORY)
    private readonly permissions: AuthPermissionRepositoryPort,
  ) {}

  async execute(command: UpdateRolePermissionsCommand): Promise<AuthRole> {
    let role = await this.roles.findByName(command.roleName);
    if (!role) {
      role = new AuthRole({ name: command.roleName });
    }

    if (!command.permissionNames.length) {
      role.setPermissions([]);
    } else {
      const perms = await this.permissions.findByNames(command.permissionNames);
      role.setPermissions(perms);
    }

    return this.roles.save(role);
  }
}
