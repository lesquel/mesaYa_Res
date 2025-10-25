import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLER_LIMITS } from '@shared/core/config';

/**
 * Decorador para aplicar rate limiting en endpoints de búsqueda
 * Límite: 50 peticiones por minuto
 *
 * Usar en: búsquedas complejas, filtrados, queries
 *
 * @example
 * ```typescript
 * @Get('search')
 * @ThrottleSearch()
 * async search(@Query() query: SearchDto) {
 *   return this.service.search(query);
 * }
 * ```
 */
export const ThrottleSearch = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.SEARCH.ttl,
        limit: THROTTLER_LIMITS.SEARCH.limit,
      },
    }),
  );
