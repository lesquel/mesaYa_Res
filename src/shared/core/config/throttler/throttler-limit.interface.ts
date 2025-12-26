/**
 * Throttler limit interface definition.
 *
 * Defines the shape of a rate limiting configuration.
 */

/**
 * Límite de rate limiting
 *
 * Define:
 * - ttl: Tiempo de vida en milisegundos
 * - limit: Número máximo de peticiones permitidas en ese tiempo
 */
export interface ThrottlerLimit {
  ttl: number;
  limit: number;
}
