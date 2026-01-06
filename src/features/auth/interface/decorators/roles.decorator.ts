import { SetMetadata } from '@nestjs/common';
import { AuthRoleName } from '../../domain/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AuthRoleName[]) =>
  SetMetadata(ROLES_KEY, roles);
