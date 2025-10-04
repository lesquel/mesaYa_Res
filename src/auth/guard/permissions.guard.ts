import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorator/permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as
      | { roles?: Array<{ permissions?: Array<{ name: string }> }> }
      | undefined;
    if (!user?.roles) return false;

    const userPerms = user.roles.flatMap(
      (r) => r.permissions?.map((p) => p.name) ?? [],
    );
    return required.every((p) => userPerms.includes(p));
  }
}
