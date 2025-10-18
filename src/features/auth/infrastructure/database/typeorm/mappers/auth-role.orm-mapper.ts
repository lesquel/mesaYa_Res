import { AuthRole } from '../../../../domain/entities/auth-role.entity.js';
import { RoleOrmEntity } from '../entities/role.orm-entity.js';
import { AuthPermissionOrmMapper } from './auth-permission.orm-mapper.js';

export class AuthRoleOrmMapper {
  static toDomain(entity: RoleOrmEntity): AuthRole {
    return new AuthRole({
      id: entity.id,
      name: entity.name,
      permissions: (entity.permissions ?? []).map((permission) =>
        AuthPermissionOrmMapper.toDomain(permission),
      ),
    });
  }

  static toOrm(role: AuthRole): RoleOrmEntity {
    const entity = new RoleOrmEntity();
    if (role.id) {
      entity.id = role.id;
    }
    entity.name = role.name;
    entity.permissions = role.permissions.map((permission) =>
      AuthPermissionOrmMapper.toOrm(permission),
    );
    return entity;
  }
}
