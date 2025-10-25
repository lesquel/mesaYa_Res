import { AuthUser } from '../../domain/entities/auth-user.entity';

export interface AuthTokenServicePort {
  sign(user: AuthUser): Promise<string>;
}
