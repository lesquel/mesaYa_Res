import { AuthUser } from '../../domain/entities/auth-user.entity.js';

export const AUTH_TOKEN_SERVICE = Symbol('AUTH_TOKEN_SERVICE');

export interface AuthTokenServicePort {
  sign(user: AuthUser): Promise<string>;
}
