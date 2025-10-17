import { AuthUser } from '../../../domain/entities/auth-user.entity.js';

export interface AuthTokenResponse {
  user: AuthUser;
  token: string;
}
