/**
 * Default role definition interface.
 *
 * Defines the structure of a default role.
 */

import { AuthRoleName } from '../entities/auth-role.entity';

/**
 * Interfaz que define la estructura de un rol por defecto.
 */
export interface DefaultRoleDefinition {
  name: AuthRoleName;
  permNames: readonly string[];
}
