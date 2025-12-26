/**
 * Throttler limits constant.
 *
 * Límites de rate limiting por tipo de operación.
 */

import { ThrottlerLimit } from './throttler-limit.interface';

/**
 * Límites personalizados para diferentes tipos de endpoints
 */
export const THROTTLER_LIMITS: Record<string, ThrottlerLimit> = {
  // Para operaciones sensibles (login, registro, recuperación de contraseña)
  AUTH: {
    ttl: 60000, // 1 minuto
    limit: 5, // 5 intentos por minuto
  },

  // Para creación de recursos
  CREATE: {
    ttl: 60000, // 1 minuto
    limit: 20, // 20 creaciones por minuto
  },

  // Para lectura de recursos (GET)
  READ: {
    ttl: 60000, // 1 minuto
    limit: 100, // 100 lecturas por minuto
  },

  // Para actualización y eliminación
  MODIFY: {
    ttl: 60000, // 1 minuto
    limit: 30, // 30 modificaciones por minuto
  },

  // Para búsquedas y filtrados complejos
  SEARCH: {
    ttl: 60000, // 1 minuto
    limit: 50, // 50 búsquedas por minuto
  },

  // Para endpoints públicos sin autenticación
  PUBLIC: {
    ttl: 60000, // 1 minuto
    limit: 10, // 10 peticiones por minuto
  },
};
