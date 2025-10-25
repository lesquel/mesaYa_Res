import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLER_LIMITS } from '@shared/core/config';

/**
 * Decorador para aplicar rate limiting en endpoints de autenticación
 * Límite: 5 peticiones por minuto
 *
 * Usar en: login, registro, recuperación de contraseña, etc.
 *
 * @example
 * ```typescript
 * @Post('login')
 * @ThrottleAuth()
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 * ```
 */
export const ThrottleAuth = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.AUTH.ttl,
        limit: THROTTLER_LIMITS.AUTH.limit,
      },
    }),
  );
