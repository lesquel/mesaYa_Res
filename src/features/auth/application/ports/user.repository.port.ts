import { AuthUser } from '../../domain/entities/auth-user.entity';

export interface AuthUserRepositoryPort {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  save(user: AuthUser): Promise<AuthUser>;
}
