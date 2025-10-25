# Rate Limiting Guide

## Descripción

Esta API implementa **rate limiting** (limitación de tasa) para proteger los endpoints contra:

- Ataques de fuerza bruta
- Abuso de API
- Scraping excesivo
- Denegación de servicio (DoS)
- Consumo excesivo de recursos

## Implementación

Utilizamos `@nestjs/throttler`, el paquete oficial de NestJS para rate limiting.

### Configuración Global

La configuración se encuentra en `src/shared/core/config/throttler.config.ts`:

```typescript
- short: 3 peticiones por segundo
- medium: 20 peticiones cada 10 segundos
- long: 100 peticiones por minuto
```

### Guard Personalizado

Implementamos `ThrottlerBehindProxyGuard` que extrae la IP real del cliente incluso cuando la aplicación está detrás de:

- NGINX
- Apache
- Load Balancers (AWS ALB/ELB)
- CDN (Cloudflare)

El guard revisa los siguientes headers en orden:

1. `X-Forwarded-For`
2. `X-Real-IP`
3. `X-Client-IP`
4. IP de conexión directa

## Decoradores Disponibles

### @ThrottleAuth()

**Uso:** Endpoints de autenticación
**Límite:** 5 peticiones por minuto
**Aplicar en:** Login, registro, recuperación de contraseña

```typescript
@Post('login')
@ThrottleAuth()
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

### @ThrottleCreate()

**Uso:** Creación de recursos
**Límite:** 20 peticiones por minuto
**Aplicar en:** POST endpoints

```typescript
@Post()
@ThrottleCreate()
async create(@Body() dto: CreateRestaurantDto) {
  return this.restaurantService.create(dto);
}
```

### @ThrottleRead()

**Uso:** Lectura de recursos
**Límite:** 100 peticiones por minuto
**Aplicar en:** GET endpoints

```typescript
@Get()
@ThrottleRead()
async findAll() {
  return this.restaurantService.findAll();
}
```

### @ThrottleModify()

**Uso:** Modificación de recursos
**Límite:** 30 peticiones por minuto
**Aplicar en:** PUT, PATCH, DELETE endpoints

```typescript
@Patch(':id')
@ThrottleModify()
async update(@Param('id') id: string, @Body() dto: UpdateRestaurantDto) {
  return this.restaurantService.update(id, dto);
}
```

### @ThrottleSearch()

**Uso:** Búsquedas y filtrados
**Límite:** 50 peticiones por minuto
**Aplicar en:** Búsquedas complejas, queries

```typescript
@Get('search')
@ThrottleSearch()
async search(@Query() query: SearchRestaurantDto) {
  return this.restaurantService.search(query);
}
```

### @ThrottlePublic()

**Uso:** Endpoints públicos sin autenticación
**Límite:** 10 peticiones por minuto
**Aplicar en:** Endpoints de información pública

```typescript
@Get('public-info')
@ThrottlePublic()
async getPublicInfo() {
  return this.restaurantService.getPublicInfo();
}
```

### @ThrottleCustom(ttl, limit)

**Uso:** Límites personalizados
**Parámetros:**

- `ttl`: Tiempo en milisegundos
- `limit`: Número de peticiones

```typescript
@Get('custom')
@ThrottleCustom(30000, 15) // 15 peticiones cada 30 segundos
async customEndpoint() {
  return this.service.customMethod();
}
```

### @SkipThrottling()

**Uso:** Omitir rate limiting
**⚠️ Usar con precaución**

```typescript
@Get('health')
@SkipThrottling()
async healthCheck() {
  return { status: 'ok' };
}
```

## Ejemplos de Uso

### Controller de Autenticación

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ThrottleAuth } from '@shared/infrastructure/decorators';

@Controller('auth')
export class AuthController {
  @Post('login')
  @ThrottleAuth()
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ThrottleAuth()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('forgot-password')
  @ThrottleAuth()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }
}
```

### Controller CRUD

```typescript
import { Controller, Get, Post, Patch, Delete } from '@nestjs/common';
import {
  ThrottleRead,
  ThrottleCreate,
  ThrottleModify,
} from '@shared/infrastructure/decorators';

@Controller('restaurants')
export class RestaurantsController {
  @Get()
  @ThrottleRead()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ThrottleRead()
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ThrottleCreate()
  async create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ThrottleModify()
  async update(@Param('id') id: string, @Body() dto: UpdateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ThrottleModify()
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

## Respuestas HTTP

### Cuando se excede el límite

**Status Code:** `429 Too Many Requests`

**Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1635340800
Retry-After: 60
```

**Body:**

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## Configuración de Producción

### Variables de Entorno

Puedes sobrescribir los límites mediante variables de entorno:

```env
# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Auth endpoints
THROTTLE_AUTH_TTL=60000
THROTTLE_AUTH_LIMIT=5
```

### Proxy Configuration (NGINX)

Si usas NGINX, asegúrate de configurar los headers:

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $host;
}
```

### Cloudflare

Cloudflare automáticamente añade `X-Forwarded-For`. No requiere configuración adicional.

## Testing

### Probar límites con cURL

```bash
# Hacer 6 peticiones rápidas (debe fallar la 6ta)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"pass"}' \
    -i
done
```

### Verificar headers de rate limit

```bash
curl -I http://localhost:3000/api/v1/restaurants
```

## Mejores Prácticas

### ✅ Hacer

- Aplicar decoradores de throttling en todos los endpoints públicos
- Usar límites más estrictos en endpoints de autenticación
- Monitorear logs para detectar abusos
- Configurar headers de proxy correctamente en producción

### ❌ Evitar

- Usar `@SkipThrottling()` en endpoints sensibles
- Configurar límites muy altos en endpoints de creación
- Ignorar errores 429 en el cliente
- No documentar los límites en la API

## Monitoreo

### Logs

El sistema registra automáticamente cuando se alcanza un límite:

```log
[ThrottlerGuard] Too many requests from IP: 192.168.1.1
```

### Métricas Recomendadas

- Número de 429 responses por endpoint
- IPs que exceden límites frecuentemente
- Patrones de uso sospechosos

## Troubleshooting

### Problema: Límites se aplican incorrectamente detrás de proxy

**Solución:** Verificar que el proxy esté configurando los headers `X-Forwarded-For` o `X-Real-IP`.

### Problema: Todos los usuarios tienen el mismo límite

**Solución:** Verificar que `ThrottlerBehindProxyGuard` esté configurado correctamente y que los headers de proxy se estén enviando.

### Problema: Rate limiting no funciona en desarrollo

**Solución:** Verificar que `APP_GUARD` esté configurado en `app.module.ts` y que `ThrottlerModule` esté importado.

## Referencias

- [NestJS Throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [HTTP 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
