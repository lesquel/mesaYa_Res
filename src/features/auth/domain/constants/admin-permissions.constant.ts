import { DEFAULT_PERMISSION_NAMES } from './default-permission-names.constant';

/**
 * Permisos del rol ADMIN.
 * El administrador tiene acceso a todos los permisos del sistema.
 */
export const ADMIN_PERMISSIONS: readonly string[] = [
  ...DEFAULT_PERMISSION_NAMES,
];
