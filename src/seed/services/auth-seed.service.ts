import { Inject, Injectable, Logger } from '@nestjs/common';
import type { AuthPermissionRepositoryPort } from '@features/auth/application/ports/permission.repository.port';
import type { AuthRoleRepositoryPort } from '@features/auth/application/ports/role.repository.port';
import {
  AUTH_PERMISSION_REPOSITORY,
  AUTH_ROLE_REPOSITORY,
} from '@features/auth/auth.tokens';
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
    const existingNames = new Set(existing.map((p) => p.name));

    let createdCount = 0;
    for (const permissionData of permissionsSeed) {
      if (!existingNames.has(permissionData.name)) {
        const permission = new AuthPermission({
          name: permissionData.name,
        });
        await this.permissionRepository.save(permission);
        createdCount++;
      }
    }

    if (createdCount > 0) {
      this.logger.log(`✅ Created ${createdCount} new permissions`);
    } else {
      this.logger.log('⏭️  All permissions already exist');
    }
  }

  async seedRoles(): Promise<void> {
    this.logger.log('👥 Seeding roles...');

    for (const roleSeed of rolesSeed) {
      const permissions = await this.permissionRepository.findByNames(
        roleSeed.permissions,
      );

      let role = await this.roleRepository.findByName(roleSeed.name);

      if (role) {
        role.setPermissions(permissions);
        await this.roleRepository.save(role);
        this.logger.log(`🔄 Updated role ${roleSeed.name}`);
      } else {
        role = new AuthRole({
          name: roleSeed.name,
          permissions,
        });
        await this.roleRepository.save(role);
        this.logger.log(`✅ Created role ${roleSeed.name}`);
      }
    }
  }
}
