import { SetMetadata } from '@nestjs/common';
import { AuthRoleName } from '../../domain/entities/auth-role.entity.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AuthRoleName[]) =>
  SetMetadata(ROLES_KEY, roles);
