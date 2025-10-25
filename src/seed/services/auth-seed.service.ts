import { Inject, Injectable, Logger } from '@nestjs/common';
import type { AuthPermissionRepositoryPort } from '@features/auth/application/ports/permission.repository.port';
import { AUTH_PERMISSION_REPOSITORY } from '@features/auth/application/ports/permission.repository.port';
import type { AuthRoleRepositoryPort } from '@features/auth/application/ports/role.repository.port';
import { AUTH_ROLE_REPOSITORY } from '@features/auth/application/ports/role.repository.port';
import { AuthPermission } from '@features/auth/domain/entities/auth-permission.entity';
import { AuthRole } from '@features/auth/domain/entities/auth-role.entity';
import { permissionsSeed, rolesSeed } from '../data';

@Injectable()
export class AuthSeedService {
  private readonly logger = new Logger(AuthSeedService.name);

  constructor(
    @Inject(AUTH_PERMISSION_REPOSITORY)
    private readonly permissionRepository: AuthPermissionRepositoryPort,
    @Inject(AUTH_ROLE_REPOSITORY)
    private readonly roleRepository: AuthRoleRepositoryPort,
  ) {}

  async seedPermissions(): Promise<void> {
    this.logger.log('🔑 Seeding permissions...');

    const existing = await this.permissionRepository.findAll();
    if (existing.length > 0) {
      this.logger.log('⏭️  Permissions already exist, skipping...');
      return;
    }

    for (const permissionData of permissionsSeed) {
      const permission = new AuthPermission({
        name: permissionData.name,
      });
      await this.permissionRepository.save(permission);
    }

    this.logger.log(`✅ Created ${permissionsSeed.length} permissions`);
  }

  async seedRoles(): Promise<void> {
    this.logger.log('👥 Seeding roles...');

    const existing = await this.roleRepository.findAll();
    if (existing.length > 0) {
      this.logger.log('⏭️  Roles already exist, skipping...');
      return;
    }

    for (const roleSeed of rolesSeed) {
      const permissions = await this.permissionRepository.findByNames(
        roleSeed.permissions,
      );

      const role = new AuthRole({
        name: roleSeed.name,
        permissions,
      });

      await this.roleRepository.save(role);
    }

    this.logger.log(`✅ Created ${rolesSeed.length} roles`);
  }
}
