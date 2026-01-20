import { Logger } from '@nestjs/common';
import { JwtPayloadEntity } from '../../domain/entities/jwt-payload.entity';
import {
  CurrentUserVo,
  RoleVo,
  PermissionVo,
} from '../../domain/value-objects/current-user.value-object';
import { AuthRoleName } from '../../domain/enums/auth-role-name.enum';

/**
 * Mapea JWT payload validado a Value Objects de dominio.
 * Centraliza transformación de JWT claims.
 */
export class JwtPayloadMapper {
  private static readonly logger = new Logger(JwtPayloadMapper.name);

  /**
   * Convierte payload validado a CurrentUserVo.
   * @throws Error si payload es inválido.
   */
  static toDomain(entity: JwtPayloadEntity): CurrentUserVo {
    const roles = entity.roles
      .filter((roleName): roleName is AuthRoleName =>
        Object.values(AuthRoleName).includes(roleName as AuthRoleName),
      )
      .map(
        (roleName) =>
          new RoleVo(
            roleName,
            (entity.permissions || []).map((perm) => new PermissionVo(perm)),
          ),
      );

    this.logger.debug(
      `Mapped JWT for user: ${entity.sub}, roles: ${roles.map((r) => r.name).join(',')}`,
    );

    return new CurrentUserVo(
      entity.sub,
      entity.email,
      entity.firstName || null,
      entity.lastName || null,
      roles,
    );
  }
}
