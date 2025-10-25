import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLER_LIMITS } from '@shared/core/config';

/**
 * Decorador para aplicar rate limiting en endpoints de lectura
 * Límite: 100 peticiones por minuto
 *
 * Usar en: obtener recursos (GET)
 *
 * @example
 * ```typescript
 * @Get()
 * @ThrottleRead()
 * async findAll() {
 *   return this.service.findAll();
 * }
 * ```
 */
export const ThrottleRead = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.READ.ttl,
        limit: THROTTLER_LIMITS.READ.limit,
      },
    }),
  );
