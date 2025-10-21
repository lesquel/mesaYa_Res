import { Inject, Injectable } from '@nestjs/common';
import { AuthRole } from '../../domain/entities/auth-role.entity';
import {
  AUTH_ROLE_REPOSITORY,
  type AuthRoleRepositoryPort,
} from '../ports/role.repository.port';

@Injectable()
export class ListRolesUseCase {
  constructor(
    @Inject(AUTH_ROLE_REPOSITORY)
    private readonly roles: AuthRoleRepositoryPort,
  ) {}

  async execute(): Promise<AuthRole[]> {
    return this.roles.findAll();
  }
}
