import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity.js';
import { Role } from '../entities/role.entity.js';
import { DEFAULT_PERMISSION_NAMES, DEFAULT_ROLES } from './rbac.constants.js';

@Injectable()
export class RbacSeeder implements OnModuleInit {
  private readonly logger = new Logger(RbacSeeder.name);

  constructor(
    @InjectRepository(Permission)
    private readonly perms: Repository<Permission>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    // 1) Permisos por defecto
    const existingPerms = await this.perms.find();
    const existingSet = new Set(existingPerms.map((p) => p.name));
    const toCreate = DEFAULT_PERMISSION_NAMES.filter(
      (n) => !existingSet.has(n),
    );
    if (toCreate.length) {
      await this.perms.save(
        toCreate.map((name) => this.perms.create({ name })),
      );
      this.logger.log(`Created permissions: ${toCreate.join(', ')}`);
    }

    const allPerms = await this.perms.find();
    const permByName = new Map(allPerms.map((p) => [p.name, p] as const));

    // 2) Roles por defecto (aditivo)
    for (const def of DEFAULT_ROLES) {
      let role = await this.roles.findOne({ where: { name: def.name } });
      if (!role) {
        role = this.roles.create({
          name: def.name,
          permissions: def.permNames
            .map((n) => permByName.get(n)!)
            .filter(Boolean),
        });
        await this.roles.save(role);
        continue;
      }
      const existing = new Set((role.permissions ?? []).map((p) => p.name));
      const missingPerms = def.permNames
        .filter((n) => !existing.has(n))
        .map((n) => permByName.get(n)!)
        .filter(Boolean);
      if (missingPerms.length) {
        role.permissions = [...(role.permissions ?? []), ...missingPerms];
        await this.roles.save(role);
      }
    }

    this.logger.log('RBAC seed complete');
  }
}
