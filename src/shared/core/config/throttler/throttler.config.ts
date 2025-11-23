import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Configuración global de rate limiting para el módulo ThrottlerModule
 *
 * Define múltiples throttlers que se evalúan en conjunto:
 * - short: Protección contra ráfagas rápidas
 * - medium: Control de tasa a medio plazo
 * - long: Control de tasa a largo plazo
 *
 * Todos los throttlers deben cumplirse para permitir la petición
 */
export const THROTTLER_CONFIG: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: 1000, // 1 segundo
      limit: 20, // 20 peticiones por segundo
    },
    {
      name: 'medium',
      ttl: 10000, // 10 segundos
      limit: 100, // 100 peticiones cada 10 segundos
    },
    {
      name: 'long',
      ttl: 60000, // 60 segundos (1 minuto)
      limit: 300, // 300 peticiones por minuto
    },
  ],
};
