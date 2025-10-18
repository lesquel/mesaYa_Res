import { AuthPermission } from '../../domain/entities/auth-permission.entity.js';

export const AUTH_PERMISSION_REPOSITORY = Symbol('AUTH_PERMISSION_REPOSITORY');

export interface AuthPermissionRepositoryPort {
  findByNames(names: string[]): Promise<AuthPermission[]>;
  findAll(): Promise<AuthPermission[]>;
  save(permission: AuthPermission): Promise<AuthPermission>;
}
