import { AuthUser } from '../../../../domain/entities/auth-user.entity.js';
import { UserOrmEntity } from '../entities/user.orm-entity.js';
import { AuthRoleOrmMapper } from './auth-role.orm-mapper.js';

export class AuthUserOrmMapper {
  static toDomain(entity: UserOrmEntity): AuthUser {
    return new AuthUser({
      id: entity.id,
      email: entity.email,
      name: entity.name,
      phone: entity.phone,
      passwordHash: entity.passwordHash,
      roles: (entity.roles ?? []).map((role) =>
        AuthRoleOrmMapper.toDomain(role),
      ),
      active: entity.active,
    });
  }

  static toOrm(user: AuthUser): UserOrmEntity {
    const entity = new UserOrmEntity();
    if (user.id) {
      entity.id = user.id;
    }
    entity.email = user.email;
    entity.name = user.name;
    entity.phone = user.phone;
    entity.passwordHash = user.passwordHash;
    entity.roles = user.roles.map((role) => AuthRoleOrmMapper.toOrm(role));
    entity.active = user.active;
    return entity;
  }
}
