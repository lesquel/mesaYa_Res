import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from '@shared/infrastructure/guards/throttler-behind-proxy.guard';
import { THROTTLER_LIMITS } from '@shared/core/config';

/**
 * Decorador para aplicar rate limiting en endpoints de autenticación
 * Límite: 5 peticiones por minuto
 *
 * Usar en: login, registro, recuperación de contraseña, etc.
 *
 * @example
 * ```typescript
 * @Post('login')
 * @ThrottleAuth()
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 * ```
 */
export const ThrottleAuth = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.AUTH.ttl,
        limit: THROTTLER_LIMITS.AUTH.limit,
      },
    }),
    UseGuards(ThrottlerBehindProxyGuard),
  );

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
    UseGuards(ThrottlerBehindProxyGuard),
  );

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
    UseGuards(ThrottlerBehindProxyGuard),
  );

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
    UseGuards(ThrottlerBehindProxyGuard),
  );

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
    UseGuards(ThrottlerBehindProxyGuard),
  );

/**
 * Decorador para aplicar rate limiting en endpoints públicos
 * Límite: 10 peticiones por minuto
 *
 * Usar en: endpoints sin autenticación
 *
 * @example
 * ```typescript
 * @Get('public-info')
 * @ThrottlePublic()
 * async getPublicInfo() {
 *   return this.service.getPublicInfo();
 * }
 * ```
 */
export const ThrottlePublic = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.PUBLIC.ttl,
        limit: THROTTLER_LIMITS.PUBLIC.limit,
      },
    }),
    UseGuards(ThrottlerBehindProxyGuard),
  );

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
  applyDecorators(
    Throttle({ default: { ttl, limit } }),
    UseGuards(ThrottlerBehindProxyGuard),
  );

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
