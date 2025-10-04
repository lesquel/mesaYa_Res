import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Role } from '../entities/role.entity.js';
import { Permission } from '../entities/permission.entity.js';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Permission)
    private readonly perms: Repository<Permission>,
  ) {}

  async updateUserRoles(userId: string, roleNames: string[]) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const roles = await this.roles.find({
      where: roleNames.map((name) => ({ name })),
    });
    user.roles = roles;
    await this.users.save(user);
    return { id: user.id, email: user.email, roles: roles.map((r) => r.name) };
  }

  async updateRolePermissions(roleName: string, permissionNames: string[]) {
    let role = await this.roles.findOne({ where: { name: roleName } });
    role ??= this.roles.create({ name: roleName, permissions: [] });
    const perms = await this.perms.find({
      where: permissionNames.map((name) => ({ name })),
    });
    role.permissions = perms;
    role = await this.roles.save(role);
    return {
      name: role.name,
      permissions: role.permissions.map((p) => p.name),
    };
  }

  async listRoles() {
    const roles = await this.roles.find();
    return roles.map((r) => ({
      name: r.name,
      permissions: (r.permissions ?? []).map((p) => p.name),
    }));
  }

  async listPermissions() {
    const perms = await this.perms.find();
    return perms.map((p) => p.name);
  }
}
