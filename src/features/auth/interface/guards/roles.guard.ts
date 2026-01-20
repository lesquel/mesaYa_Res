import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthRoleName } from '../../domain/enums';
import { CurrentUserVo } from '../../domain/value-objects/current-user.value-object';

/**
 * Guard que valida roles del usuario.
 *
 * Lee roles requeridos de metadatos (@Roles decorator).
 * Extrae CurrentUserVo del request.user (validado por JwtAuthGuard).
 * Usa método hasRole() del value object.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AuthRoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserVo | undefined;

    if (!user || !(user instanceof CurrentUserVo)) {
      this.logger.warn('User is not a CurrentUserVo');
      return false;
    }

    const hasRequiredRole = requiredRoles.some((role) => user.hasRole(role));

    if (!hasRequiredRole) {
      this.logger.warn(
        `User ${user.userId} lacks required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return hasRequiredRole;
  }
}
