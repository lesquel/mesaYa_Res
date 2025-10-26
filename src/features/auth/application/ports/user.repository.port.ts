import { AuthUser } from '../../domain/entities/auth-user.entity';

export interface AuthUserRepositoryPort {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  save(user: AuthUser): Promise<AuthUser>;
  paginate(
    query: import('../dto/input/list-users.query').ListUsersQuery,
  ): Promise<
    import('@shared/application/types/pagination').PaginatedResult<AuthUser>
  >;
}
