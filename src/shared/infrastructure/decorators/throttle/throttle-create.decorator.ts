import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLER_LIMITS } from '@shared/core/config';

/**
 * Decorador para aplicar rate limiting en endpoints de creación
 * Límite: 20 peticiones por minuto
 *
 * Usar en: crear recursos (POST)
 *
 * @example
 * ```typescript
 * @Post()
 * @ThrottleCreate()
 * async create(@Body() dto: CreateDto) {
 *   return this.service.create(dto);
 * }
 * ```
 */
export const ThrottleCreate = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.CREATE.ttl,
        limit: THROTTLER_LIMITS.CREATE.limit,
      },
    }),
  );
