import { AuthRoleName } from '../enums/auth-role-name.enum';

/**
 * Rol extraído del JWT.
 * Inmutable y validado.
 */
export class RoleVo {
  constructor(
    public readonly name: AuthRoleName,
    public readonly permissions: PermissionVo[] = [],
  ) {
    if (!name || !Object.values(AuthRoleName).includes(name)) {
      throw new Error(`Invalid role: ${name}`);
    }
  }
}

/**
 * Permiso extraído del JWT.
 */
export class PermissionVo {
  constructor(public readonly name: string) {
    if (!name || name.trim().length === 0) {
      throw new Error('Permission name cannot be empty');
    }
  }
}

/**
 * Usuario actual extraído del JWT.
 * Garantiza integridad de datos después de validación.
 */
export class CurrentUserVo {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly roles: RoleVo[],
  ) {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
    if (!email || email.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }
  }

  get fullName(): string {
    const parts = [this.firstName, this.lastName].filter(Boolean);
    return parts.join(' ');
  }

  hasRole(role: AuthRoleName): boolean {
    return this.roles.some((r) => r.name === role);
  }

  hasPermission(permission: string): boolean {
    return this.roles.some((r) =>
      r.permissions.some((p) => p.name === permission),
    );
  }
}
