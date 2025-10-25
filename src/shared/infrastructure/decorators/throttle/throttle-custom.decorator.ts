import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

/**
 * Decorador para aplicar rate limiting personalizado
 *
 * @param ttl - Tiempo en milisegundos
 * @param limit - Número máximo de peticiones permitidas
 *
 * @example
 * ```typescript
 * @Get('custom')
 * @ThrottleCustom(30000, 15) // 15 peticiones cada 30 segundos
 * async customEndpoint() {
 *   return this.service.customMethod();
 * }
 * ```
 */
export const ThrottleCustom = (ttl: number, limit: number) =>
  applyDecorators(Throttle({ default: { ttl, limit } }));
