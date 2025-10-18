import { Inject, Injectable } from '@nestjs/common';
import { AuthPermission } from '../../domain/entities/auth-permission.entity.js';
import {
  AUTH_PERMISSION_REPOSITORY,
  type AuthPermissionRepositoryPort,
} from '../ports/permission.repository.port.js';

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
