import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { CurrentUserVo } from '../../domain/value-objects/current-user.value-object';

/**
 * Guard que valida permisos del usuario.
 *
 * Lee permisos requeridos de metadatos (@Permissions decorator).
 * Usa método hasPermission() del value object.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserVo | undefined;

    if (!user || !(user instanceof CurrentUserVo)) {
      this.logger.warn('User is not a CurrentUserVo');
      return false;
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      user.hasPermission(permission),
    );

    if (!hasAllPermissions) {
      this.logger.warn(
        `User ${user.userId} lacks required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return hasAllPermissions;
  }
}
