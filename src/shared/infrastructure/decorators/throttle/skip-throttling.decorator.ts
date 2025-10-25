import { applyDecorators } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

/**
 * Decorador para omitir el rate limiting en un endpoint específico
 *
 * Usar con precaución. Solo para endpoints que no requieren protección.
 *
 * @example
 * ```typescript
 * @Get('health')
 * @SkipThrottling()
 * async healthCheck() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const SkipThrottling = () => applyDecorators(SkipThrottle());
