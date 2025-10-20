import { Inject, Injectable } from '@nestjs/common';
import { AuthPermission } from '../../domain/entities/auth-permission.entity';
import {
  AUTH_PERMISSION_REPOSITORY,
  type AuthPermissionRepositoryPort,
} from '../ports/permission.repository.port';

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
