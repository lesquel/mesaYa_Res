import { UseCase } from '@shared/application/ports/use-case.port';
import type { ListUsersQuery } from '../dto/input/list-users.query';
import { PaginatedResult } from '@shared/application/types/pagination';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import type { AuthUserRepositoryPort } from '../ports/user.repository.port';

export type PaginatedUserDomainResult = PaginatedResult<AuthUser>;

export class ListUsersUseCase
  implements UseCase<ListUsersQuery, PaginatedUserDomainResult>
{
  constructor(private readonly users: AuthUserRepositoryPort) {}

  async execute(query: ListUsersQuery): Promise<PaginatedUserDomainResult> {
    return this.users.paginate(query);
  }
}
