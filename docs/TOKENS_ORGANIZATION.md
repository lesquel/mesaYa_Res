# Tokens de Inyección de Dependencias - Organización por Módulos

## 📋 Resumen

Según las buenas prácticas de **Domain-Driven Design (DDD)**, los símbolos de inyección de dependencias (tokens) ahora están centralizados en un archivo `.tokens.ts` en la raíz de cada módulo funcional.

## 🏗️ Estructura

Cada módulo sigue esta estructura:

```plaintext
src/features/<nombre-modulo>/
├── <nombre-modulo>.tokens.ts    ← NUEVO: Todos los símbolos aquí
├── <nombre-modulo>.module.ts
├── application/
│   └── ports/
│       └── *.port.ts            ← Solo interfaces/clases abstractas
├── domain/
├── infrastructure/
└── interface/ o presentation/
```

## 📝 Ejemplo: Módulo Auth

### Antes (❌ Símbolos dispersos)

```typescript
// src/features/auth/application/ports/user.repository.port.ts
export const AUTH_USER_REPOSITORY = Symbol('AUTH_USER_REPOSITORY');
export interface AuthUserRepositoryPort { ... }

// src/features/auth/application/ports/token.service.port.ts
export const AUTH_TOKEN_SERVICE = Symbol('AUTH_TOKEN_SERVICE');
export interface AuthTokenServicePort { ... }
```

### Después (✅ Centralizado)

```typescript
// src/features/auth/auth.tokens.ts
/**
 * Tokens de inyección de dependencias para el módulo Auth
 * Centralizados según buenas prácticas de DDD
 */

// Repositories
export const AUTH_USER_REPOSITORY = Symbol('AUTH_USER_REPOSITORY');
export const AUTH_ROLE_REPOSITORY = Symbol('AUTH_ROLE_REPOSITORY');
export const AUTH_PERMISSION_REPOSITORY = Symbol('AUTH_PERMISSION_REPOSITORY');
export const AUTH_ANALYTICS_REPOSITORY = Symbol('AUTH_ANALYTICS_REPOSITORY');

// Services
export const AUTH_TOKEN_SERVICE = Symbol('AUTH_TOKEN_SERVICE');
export const AUTH_PASSWORD_HASHER = Symbol('AUTH_PASSWORD_HASHER');
```

```typescript
// src/features/auth/application/ports/user.repository.port.ts
// Solo la interfaz, sin el símbolo
export interface AuthUserRepositoryPort { ... }
```

## 🔄 Cómo Importar

### En Módulos NestJS

```typescript
// src/features/auth/auth.module.ts
import {
  AUTH_USER_REPOSITORY,
  AUTH_TOKEN_SERVICE,
  AUTH_PASSWORD_HASHER,
} from './auth.tokens';

@Module({
  providers: [
    {
      provide: AUTH_USER_REPOSITORY,
      useClass: AuthUserTypeOrmRepository,
    },
    // ...
  ],
})
export class AuthModule {}
```

### En Use Cases

```typescript
// src/features/auth/application/use-cases/login.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { AUTH_USER_REPOSITORY, AUTH_TOKEN_SERVICE } from '@features/auth/auth.tokens';
import type { AuthUserRepositoryPort } from '../ports/user.repository.port';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly userRepository: AuthUserRepositoryPort,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly tokenService: AuthTokenServicePort,
  ) {}
}
```

## 📦 Módulos Actualizados

| Módulo | Archivo de Tokens | Símbolos Incluidos |
|--------|------------------|-------------------|
| **auth** | `auth.tokens.ts` | AUTH_USER_REPOSITORY, AUTH_ROLE_REPOSITORY, AUTH_PERMISSION_REPOSITORY, AUTH_TOKEN_SERVICE, AUTH_PASSWORD_HASHER, AUTH_ANALYTICS_REPOSITORY |
| **images** | `images.tokens.ts` | IMAGE_REPOSITORY, IMAGE_ANALYTICS_REPOSITORY, IMAGE_STORAGE, IMAGE_EVENT_PUBLISHER |
| **menus** | `menus.tokens.ts` | MENU_ANALYTICS_REPOSITORY, DISH_ANALYTICS_REPOSITORY |
| **objects** | `objects.tokens.ts` | GRAPHIC_OBJECT_REPOSITORY, GRAPHIC_OBJECT_ANALYTICS_REPOSITORY, GRAPHIC_OBJECT_EVENT_PUBLISHER |
| **payment** | `payment.tokens.ts` | PAYMENT_ORM_MAPPER, PAYMENT_ANALYTICS_REPOSITORY |
| **reservation** | `reservation.tokens.ts` | RESERVATION_REPOSITORY, RESERVATION_ANALYTICS_REPOSITORY, RESERVATION_EVENT_PUBLISHER, USER_RESERVATION_READER, RESTAURANT_RESERVATION_READER |
| **restaurants** | `restaurants.tokens.ts` | RESTAURANT_REPOSITORY, RESTAURANT_ANALYTICS_REPOSITORY, OWNER_READER |
| **reviews** | `reviews.tokens.ts` | REVIEW_REPOSITORY, REVIEW_ANALYTICS_REPOSITORY, REVIEW_USER_PORT, REVIEW_RESTAURANT_PORT, USER_REVIEW_READER, RESTAURANT_REVIEW_READER |
| **sections** | `sections.tokens.ts` | SECTION_REPOSITORY, SECTION_ANALYTICS_REPOSITORY, RESTAURANT_SECTION_READER |
| **section-objects** | `section-objects.tokens.ts` | SECTION_OBJECT_REPOSITORY, SECTION_OBJECT_EVENT_PUBLISHER, SECTION_READER_FOR_SECTION_OBJECT, OBJECT_READER_FOR_SECTION_OBJECT |
| **subscription** | `subscription.tokens.ts` | SUBSCRIPTION_ANALYTICS_REPOSITORY, SUBSCRIPTION_PLAN_ANALYTICS_REPOSITORY, SUBSCRIPTION_ORM_MAPPER, SUBSCRIPTION_PLAN_ORM_MAPPER |
| **tables** | `tables.tokens.ts` | TABLE_REPOSITORY, TABLE_ANALYTICS_REPOSITORY, TABLE_EVENT_PUBLISHER, SECTION_TABLE_READER |

## ✅ Beneficios

1. **Organización**: Todos los tokens en un solo lugar por módulo
2. **Mantenibilidad**: Fácil de encontrar y actualizar tokens
3. **DDD**: Separación clara entre contratos (ports) y configuración (tokens)
4. **Escalabilidad**: Fácil agregar nuevos tokens sin modificar múltiples archivos
5. **Legibilidad**: Imports más limpios y organizados

## 🚀 Próximos Pasos

- [ ] Actualizar todos los use cases para importar desde `.tokens.ts`
- [ ] Actualizar repositorios de infraestructura
- [ ] Actualizar controladores que inyecten servicios directamente
- [ ] Documentar convención en guía de desarrollo del proyecto
