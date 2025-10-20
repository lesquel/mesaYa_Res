import { AuthPermission } from '../../../../domain/entities/auth-permission.entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';

export class AuthPermissionOrmMapper {
  static toDomain(entity: PermissionOrmEntity): AuthPermission {
    return new AuthPermission({
      id: entity.id,
      name: entity.name,
    });
  }

  static toOrm(permission: AuthPermission): PermissionOrmEntity {
    const entity = new PermissionOrmEntity();
    if (permission.id) {
      entity.id = permission.id;
    }
    entity.name = permission.name;
    return entity;
  }
}
