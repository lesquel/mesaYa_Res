import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity.js';
import { Role } from './entities/role.entity.js';

@Injectable()
export class RbacSeederService implements OnModuleInit {
  private readonly logger = new Logger(RbacSeederService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly perms: Repository<Permission>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    const permissionNames = [
      'restaurant:create',
      'restaurant:update',
      'restaurant:delete',
      'restaurant:read',
      'section:create',
      'section:update',
      'section:delete',
      'section:read',
    ];

    // Ensure permissions exist
    const existingPerms = await this.perms.find();
    const existingSet = new Set(existingPerms.map((p) => p.name));
    const toCreate = permissionNames.filter((n) => !existingSet.has(n));
    if (toCreate.length) {
      await this.perms.save(
        toCreate.map((name) => this.perms.create({ name })),
      );
      this.logger.log(`Created permissions: ${toCreate.join(', ')}`);
    }

    const allPerms = await this.perms.find();
    const permByName = new Map(allPerms.map((p) => [p.name, p] as const));

    // Define default roles
    const desiredRoles: Array<{ name: string; permNames: string[] }> = [
      {
        name: 'ADMIN',
        permNames: permissionNames,
      },
      {
        name: 'OWNER',
        permNames: [
          'restaurant:create',
          'restaurant:update',
          'restaurant:read',
          'section:create',
          'section:update',
          'section:read',
        ],
      },
      {
        name: 'USER',
        permNames: ['restaurant:read', 'section:read'],
      },
    ];

    for (const def of desiredRoles) {
      let role = await this.roles.findOne({ where: { name: def.name } });
      if (!role) role = this.roles.create({ name: def.name, permissions: [] });
      role.permissions = def.permNames
        .map((n) => permByName.get(n)!)
        .filter(Boolean);
      await this.roles.save(role);
    }

    this.logger.log('RBAC seed complete');
  }
}
