import { AuthPermission } from '../../domain/entities/auth-permission.entity';

export interface AuthPermissionRepositoryPort {
  findByNames(names: string[]): Promise<AuthPermission[]>;
  findAll(): Promise<AuthPermission[]>;
  save(permission: AuthPermission): Promise<AuthPermission>;
}
