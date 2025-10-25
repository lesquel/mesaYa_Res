import { Inject, Injectable } from '@nestjs/common';
import { AuthPermission } from '../../domain/entities/auth-permission.entity';
import { type AuthPermissionRepositoryPort } from '../ports/permission.repository.port';
import { AUTH_PERMISSION_REPOSITORY } from '@features/auth/auth.tokens';

@Injectable()
export class ListPermissionsUseCase {
  constructor(
    @Inject(AUTH_PERMISSION_REPOSITORY)
    private readonly permissions: AuthPermissionRepositoryPort,
  ) {}

  async execute(): Promise<AuthPermission[]> {
    return this.permissions.findAll();
  }
}
