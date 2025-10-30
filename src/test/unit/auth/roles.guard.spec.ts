import { describe, expect, it, jest } from '@jest/globals';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { RolesGuard } from '@features/auth/interface/guards/roles.guard';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';

describe('RolesGuard', () => {
  const createContext = (user: unknown): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('allows access when user roles include required role as string', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue<[AuthRoleName]>([AuthRoleName.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const context = createContext({ roles: [AuthRoleName.ADMIN] });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when user roles include required role as object', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue<[AuthRoleName]>([AuthRoleName.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const context = createContext({
      roles: [{ name: AuthRoleName.ADMIN }],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when roles missing', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue<[AuthRoleName]>([AuthRoleName.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const context = createContext({ roles: [] });

    expect(guard.canActivate(context)).toBe(false);
  });
});
