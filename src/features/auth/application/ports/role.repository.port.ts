import { AuthRole } from '../../domain/entities/auth-role.entity.js';

export const AUTH_ROLE_REPOSITORY = Symbol('AUTH_ROLE_REPOSITORY');

export interface AuthRoleRepositoryPort {
  findByName(name: string): Promise<AuthRole | null>;
  findByNames(names: string[]): Promise<AuthRole[]>;
  findAll(): Promise<AuthRole[]>;
  save(role: AuthRole): Promise<AuthRole>;
}
