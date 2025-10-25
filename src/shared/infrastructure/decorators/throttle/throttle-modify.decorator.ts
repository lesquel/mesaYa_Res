import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLER_LIMITS } from '@shared/core/config';

/**
 * Decorador para aplicar rate limiting en endpoints de modificación
 * Límite: 30 peticiones por minuto
 *
 * Usar en: actualizar y eliminar recursos (PUT, PATCH, DELETE)
 *
 * @example
 * ```typescript
 * @Patch(':id')
 * @ThrottleModify()
 * async update(@Param('id') id: string, @Body() dto: UpdateDto) {
 *   return this.service.update(id, dto);
 * }
 * ```
 */
export const ThrottleModify = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.MODIFY.ttl,
        limit: THROTTLER_LIMITS.MODIFY.limit,
      },
    }),
  );
