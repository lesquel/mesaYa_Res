import { AuthUser } from '../../domain/entities/auth-user.entity.js';

export const AUTH_USER_REPOSITORY = Symbol('AUTH_USER_REPOSITORY');

export interface AuthUserRepositoryPort {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  save(user: AuthUser): Promise<AuthUser>;
}
