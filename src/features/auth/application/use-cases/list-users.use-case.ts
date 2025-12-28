import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import type { ListUsersQuery } from '../dto/input/list-users.query';
import { PaginatedResult } from '@shared/application/types';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import type { AuthUserRepositoryPort } from '../ports/user.repository.port';
import { AUTH_USER_REPOSITORY } from '@features/auth/auth.tokens';

export type PaginatedUserDomainResult = PaginatedResult<AuthUser>;

@Injectable()
export class ListUsersUseCase
  implements UseCase<ListUsersQuery, PaginatedUserDomainResult>
{
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly users: AuthUserRepositoryPort,
  ) {}

  async execute(query: ListUsersQuery): Promise<PaginatedUserDomainResult> {
    return this.users.paginate(query);
  }
}
