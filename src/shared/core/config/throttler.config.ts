import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Configuración global de rate limiting
 *
 * Límites por defecto:
 * - TTL (Time To Live): 60 segundos
 * - Límite: 10 peticiones por TTL
 *
 * Esto significa: 10 peticiones por minuto por IP
 */
export const THROTTLER_CONFIG: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: 1000, // 1 segundo
      limit: 3, // 3 peticiones por segundo
    },
    {
      name: 'medium',
      ttl: 10000, // 10 segundos
      limit: 20, // 20 peticiones cada 10 segundos
    },
    {
      name: 'long',
      ttl: 60000, // 60 segundos (1 minuto)
      limit: 100, // 100 peticiones por minuto
    },
  ],
};

/**
 * Límites personalizados para diferentes tipos de endpoints
 */
export const THROTTLER_LIMITS = {
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
