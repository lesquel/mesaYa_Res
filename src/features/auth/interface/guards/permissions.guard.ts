import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
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
    const user = request.user as
      | { roles?: Array<{ permissions?: Array<{ name: string }> }> }
      | undefined;

    if (!user?.roles) {
      return false;
    }

    const userPermissions = user.roles.flatMap(
      (role) => role.permissions?.map((permission) => permission.name) ?? [],
    );

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
