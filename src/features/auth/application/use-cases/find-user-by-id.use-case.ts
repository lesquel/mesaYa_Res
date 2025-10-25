import { Inject, Injectable } from '@nestjs/common';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { type AuthUserRepositoryPort } from '../ports/user.repository.port';
import { AUTH_USER_REPOSITORY } from '@features/auth/auth.tokens';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly users: AuthUserRepositoryPort,
  ) {}

  execute(id: string): Promise<AuthUser | null> {
    return this.users.findById(id);
  }
}
