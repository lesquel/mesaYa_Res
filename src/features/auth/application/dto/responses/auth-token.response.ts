import { AuthUser } from '../../../domain/entities/auth-user.entity';

export interface AuthTokenResponse {
  user: AuthUser;
  token: string;
}
