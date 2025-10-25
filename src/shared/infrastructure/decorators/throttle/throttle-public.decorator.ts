import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLER_LIMITS } from '@shared/core/config';

/**
 * Decorador para aplicar rate limiting en endpoints públicos
 * Límite: 10 peticiones por minuto
 *
 * Usar en: endpoints sin autenticación
 *
 * @example
 * ```typescript
 * @Get('public-info')
 * @ThrottlePublic()
 * async getPublicInfo() {
 *   return this.service.getPublicInfo();
 * }
 * ```
 */
export const ThrottlePublic = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.PUBLIC.ttl,
        limit: THROTTLER_LIMITS.PUBLIC.limit,
      },
    }),
  );
