/**
 * Default roles constant.
 *
 * Configuración de roles por defecto del sistema.
 */

import { AuthRoleName } from '../entities/auth-role.entity';
import { ADMIN_PERMISSIONS } from './admin-permissions.constant';
import { DefaultRoleDefinition } from './default-role-definition.interface';
import { OWNER_PERMISSIONS } from './owner-permissions.constant';
import { USER_PERMISSIONS } from './user-permissions.constant';

/**
 * Configuración de roles por defecto del sistema.
 * Define qué permisos tiene cada rol.
 */
export const DEFAULT_ROLES: DefaultRoleDefinition[] = [
  {
    name: AuthRoleName.ADMIN,
    permNames: ADMIN_PERMISSIONS,
  },
  {
    name: AuthRoleName.OWNER,
    permNames: OWNER_PERMISSIONS,
  },
  {
    name: AuthRoleName.USER,
    permNames: USER_PERMISSIONS,
  },
];
