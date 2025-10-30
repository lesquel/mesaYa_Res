import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthRoleName } from '../../domain/entities/auth-role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
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
    const user = request.user as
      | { roles?: Array<AuthRoleName | { name?: AuthRoleName }> }
      | undefined;
    if (!user?.roles) {
      return false;
    }

    const roleNames = user.roles
      .map((role) => (typeof role === 'string' ? role : role?.name))
      .filter((role): role is AuthRoleName => Boolean(role));

    return requiredRoles.some((role) => roleNames.includes(role));
  }
}
