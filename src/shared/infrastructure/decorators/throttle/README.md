# Throttle Decorators

Decoradores modulares para aplicar rate limiting en los endpoints de la API.

## 📁 Estructura

```plaintext
throttle/
├── index.ts                          # Exporta todos los decoradores
├── throttle-auth.decorator.ts        # Rate limiting para autenticación
├── throttle-create.decorator.ts      # Rate limiting para creación (POST)
├── throttle-read.decorator.ts        # Rate limiting para lectura (GET)
├── throttle-modify.decorator.ts      # Rate limiting para modificación (PUT/PATCH/DELETE)
├── throttle-search.decorator.ts      # Rate limiting para búsquedas
├── throttle-public.decorator.ts      # Rate limiting para endpoints públicos
├── throttle-custom.decorator.ts      # Rate limiting personalizado
└── skip-throttling.decorator.ts      # Omitir rate limiting
```

## 🎯 Uso

### Importación

```typescript
import {
  ThrottleAuth,
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
  ThrottlePublic,
  ThrottleCustom,
  SkipThrottling,
} from '@shared/infrastructure/decorators';
```

### Ejemplos

#### ThrottleAuth - Endpoints de Autenticación

```typescript
@Post('login')
@ThrottleAuth() // 5 req/min
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

#### ThrottleRead - Lectura de Recursos

```typescript
@Get()
@ThrottleRead() // 100 req/min
async findAll() {
  return this.service.findAll();
}
```

#### ThrottleCreate - Creación de Recursos

```typescript
@Post()
@ThrottleCreate() // 20 req/min
async create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}
```

#### ThrottleModify - Modificación/Eliminación

```typescript
@Patch(':id')
@ThrottleModify() // 30 req/min
async update(@Param('id') id: string, @Body() dto: UpdateDto) {
  return this.service.update(id, dto);
}
```

#### ThrottleSearch - Búsquedas Complejas

```typescript
@Get('search')
@ThrottleSearch() // 50 req/min
async search(@Query() query: SearchDto) {
  return this.service.search(query);
}
```

#### ThrottlePublic - Endpoints Públicos

```typescript
@Get('public-data')
@ThrottlePublic() // 10 req/min
async getPublicData() {
  return this.service.getPublicData();
}
```

#### ThrottleCustom - Límites Personalizados

```typescript
@Post('upload')
@ThrottleCustom(30000, 5) // 5 req cada 30 segundos
async upload(@UploadedFile() file: File) {
  return this.service.upload(file);
}
```

#### SkipThrottling - Sin Límites

```typescript
@Get('health')
@SkipThrottling() // Sin límite
async healthCheck() {
  return { status: 'ok' };
}
```

## 📊 Límites por Decorador

| Decorador         | TTL (ms) | Límite | Uso                    |
| ----------------- | -------- | ------ | ---------------------- |
| ThrottleAuth      | 60000    | 5      | Login, registro        |
| ThrottleCreate    | 60000    | 20     | POST endpoints         |
| ThrottleRead      | 60000    | 100    | GET endpoints          |
| ThrottleModify    | 60000    | 30     | PUT/PATCH/DELETE       |
| ThrottleSearch    | 60000    | 50     | Búsquedas              |
| ThrottlePublic    | 60000    | 10     | Endpoints públicos     |
| ThrottleCustom    | custom   | custom | Personalizado          |
| SkipThrottling    | -        | ∞      | Sin límite             |

## 🔧 Configuración

Los límites se definen en `@shared/core/config/throttler/throttler-limits.config.ts`:

```typescript
export const THROTTLER_LIMITS = {
  AUTH: { ttl: 60000, limit: 5 },
  CREATE: { ttl: 60000, limit: 20 },
  READ: { ttl: 60000, limit: 100 },
  // ...
};
```

## ✨ Ventajas de la Modularización

### 1. Responsabilidad Única

- ✅ Cada decorador en su propio archivo
- ✅ Fácil de entender y mantener
- ✅ Cambios aislados

### 2. Descubrimiento

- ✅ Fácil ver todos los decoradores disponibles
- ✅ Autocompletado mejorado en el IDE
- ✅ Documentación clara por archivo

### 3. Testing

- ✅ Tests unitarios por decorador
- ✅ Mock fácil de dependencias
- ✅ Cobertura granular

### 4. Extensibilidad

- ✅ Agregar nuevos decoradores sin modificar existentes
- ✅ Importar solo lo que necesitas
- ✅ Tree-shaking optimizado

## 📝 Agregar Nuevo Decorador

1. **Crear archivo**: `throttle-[nombre].decorator.ts`

```typescript
import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLER_LIMITS } from '@shared/core/config';

export const ThrottleNombre = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.NOMBRE.ttl,
        limit: THROTTLER_LIMITS.NOMBRE.limit,
      },
    }),
  );
```

2. **Agregar límite** en `throttler-limits.config.ts`:

```typescript
export const THROTTLER_LIMITS = {
  // ... límites existentes
  NOMBRE: {
    ttl: 60000,
    limit: 15,
  },
};
```

3. **Exportar** en `index.ts`:

```typescript
export * from './throttle-nombre.decorator';
```

4. **Usar** en tu controller:

```typescript
@Get('endpoint')
@ThrottleNombre()
async endpoint() {
  return this.service.method();
}
```

## 🔗 Referencias

- Documentación completa: `docs/RATE_LIMITING.md`
- Ejemplos: `docs/RATE_LIMITING_EXAMPLES.md`
- Arquitectura: `docs/RATE_LIMITING_ARCHITECTURE.md`
- Configuración: `src/shared/core/config/throttler/`

---

**Decoradores modulares para un rate limiting efectivo y mantenible.** 🚀
