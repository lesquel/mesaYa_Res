import { Inject, Injectable } from '@nestjs/common';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { type AuthUserRepositoryPort } from '../ports/user.repository.port';
import { AUTH_USER_REPOSITORY } from '@features/auth/auth.tokens';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly users: AuthUserRepositoryPort,
  ) {}

  execute(email: string): Promise<AuthUser | null> {
    return this.users.findByEmail(email);
  }
}
