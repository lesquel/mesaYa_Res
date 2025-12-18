/**
 * Módulo de Autenticación - Exports Públicos
 *
 * Lo que otros módulos PUEDEN importar:
 * - Guards: JwtAuthGuard, RolesGuard, PermissionsGuard
 * - Decoradores: CurrentUser, Roles, Permissions
 * - Enums: AuthRoleName
 * - Tipos: CurrentUserVo, CurrentUserPayload (alias deprecated)
 * - Errores: AuthDomainError, AuthErrorCode
 * - Puerto: AUTH_PROVIDER, IAuthProvider (para inyección)
 * - Módulo: AuthModule
 *
 * PROHIBIDO importar directamente:
 * - KafkaAuthProvider, AuthProxyService
 * - Tipos internos de Kafka
 * - DTOs de application/infrastructure
 */

// Módulo
export { AuthModule } from './auth.module';

// Guards
export { JwtAuthGuard } from './interface/guards/jwt-auth.guard';
export { RolesGuard } from './interface/guards/roles.guard';
export { PermissionsGuard } from './interface/guards/permissions.guard';

// Decoradores
export {
  CurrentUser,
  type CurrentUserPayload,
} from './interface/decorators/current-user.decorator';
export { Roles, ROLES_KEY } from './interface/decorators/roles.decorator';
export {
  Permissions,
  PERMISSIONS_KEY,
} from './interface/decorators/permissions.decorator';

// Enums
export { AuthRoleName } from './domain/enums/auth-role-name.enum';

// Tipos públicos (Value Objects)
export { CurrentUserVo } from './domain/value-objects/current-user.value-object';

// Errores de dominio
export {
  AuthDomainError,
  AuthErrorCode,
  AuthErrors,
} from './domain/errors/auth.errors';

// Puerto para inyección en otros módulos
export {
  AUTH_PROVIDER,
  type IAuthProvider,
  type ProviderUserInfo,
  type ProviderTokenData,
} from './application/ports/auth-provider.port';
