# Guía de Autenticación y Autorización (JWT + RBAC)

Este documento describe la implementación de autenticación (JWT) y autorización (RBAC: Roles + Permisos) siguiendo la arquitectura limpia aplicada al feature de auth.

Nota ESM/NodeNext: los imports relativos entre archivos del proyecto deben incluir la extensión `.js`.

## Tabla de contenidos

- Qué incluye (features)
- Variables de entorno
- Arquitectura de la feature
- Modelo de datos (Dominio + ORM)
- DTOs (SignUp, Login, UpdateUserRoles, UpdateRolePermissions)
- Casos de uso y puertos
- Módulo y wiring (AuthModule)
- Estrategia JWT y `req.user`
- Decoradores y Guards (Roles, Permissions, JwtAuthGuard, RolesGuard, PermissionsGuard)
- Seeding (RbacSeeder)
- Endpoints de administración (cambiar roles y permisos, listar)
- Proteger módulos de negocio con permisos (Restaurants/Sections)
- Ejemplos de solicitudes (PowerShell)
- Errores comunes y soluciones
- Buenas prácticas
- Dónde mirar en el repo

---

## Qué incluye

- Hash de contraseñas con bcrypt mediante un adaptador dedicado
- Autenticación stateless con JWT (Bearer token)
- Autorización basada en roles y permisos (RBAC)
- Guards para autenticación/autorización reutilizables en el resto de features
- Endpoints de administración para gestionar roles y permisos en tiempo de ejecución

---

## Variables de entorno

En `.env` (validadas con Joi):

- `JWT_SECRET` (requerido, mín. 16 chars): secreto para firmar tokens
- `JWT_EXPIRES_IN` (opcional, por defecto `1d`): tiempo de expiración (`1h`, `7d`, etc.)
- `AUTH_SALT_ROUNDS` (opcional, por defecto `10`): costo de hashing de bcrypt

Ejemplo:

```
JWT_SECRET='cambia-este-secreto-muy-largo-y-seguro'
JWT_EXPIRES_IN='1d'
AUTH_SALT_ROUNDS=10
```

---

## Arquitectura de la feature

La feature sigue cuatro capas dentro de `src/features/auth`:

- `domain/`: entidades de dominio, constantes y errores (`AuthUser`, `AuthRole`, `AuthPermission`).
- `application/`: puertos (interfaces) y casos de uso orquestando la lógica (signup, login, gestión de roles y permisos).
- `infrastructure/`: adaptadores concretos (TypeORM, bcrypt, JWT) y seeding.
- `interface/`: controladores HTTP, DTOs expuestos, decoradores y guards.

Este diseño mantiene el dominio independiente de los detalles de transporte o persistencia.

---

## Modelo de datos (Dominio + ORM)

- Dominio
  - `src/features/auth/domain/entities/auth-user.entity.ts`: agregado usuario con roles, banderas `active` y timestamps.
  - `src/features/auth/domain/entities/auth-role.entity.ts`: rol con nombre y permisos asociados.
  - `src/features/auth/domain/entities/auth-permission.entity.ts`: permiso con nombre único (`entidad:acción`).
- Persistencia (TypeORM)
  - `src/features/auth/infrastructure/database/typeorm/entities/user.orm-entity.ts` → mapea a tabla `users` y relaciones con roles.
  - `src/features/auth/infrastructure/database/typeorm/entities/role.orm-entity.ts` → roles y join table `role_permissions`.
  - `src/features/auth/infrastructure/database/typeorm/entities/permission.orm-entity.ts` → catálogo de permisos.
  - Mappers (`.../mappers/*.ts`) transforman entre entidades de dominio y ORM.

---

## DTOs (SignUp, Login, UpdateUserRoles, UpdateRolePermissions)

- Interface layer:
  - `src/features/auth/interface/dto/sign-up.request.dto.ts`
  - `src/features/auth/interface/dto/login.request.dto.ts`
  - `src/features/auth/interface/dto/update-user-roles.request.dto.ts`
  - `src/features/auth/interface/dto/update-role-permissions.request.dto.ts`
  - `src/features/auth/interface/dto/auth-token.response.dto.ts`
  - `src/features/auth/interface/dto/auth-user.response.dto.ts`
  - `src/features/auth/interface/dto/role.response.dto.ts`
  - `src/features/auth/interface/dto/permission.response.dto.ts`
- Application layer:
  - Comandos en `src/features/auth/application/dto/commands/*.ts` encapsulan entradas para los casos de uso.

---

## Casos de uso y puertos

- Casos de uso (`src/features/auth/application/use-cases/*.ts`):
  - `SignUpUseCase`: registro y emisión de token.
  - `LoginUseCase`: autenticación y emisión de token.
  - `FindUserByIdUseCase`: lectura de perfil autenticado.
  - `UpdateUserRolesUseCase`: asignación de roles.
  - `UpdateRolePermissionsUseCase`: administración de permisos por rol.
  - `ListRolesUseCase` y `ListPermissionsUseCase`: consultas administrativas.
- Puertos (tokens de inyección) en `src/features/auth/application/ports/*.ts` definen contratos para repositorios, hasher y token service.

---

## Módulo y wiring (AuthModule)

Archivo: `src/features/auth/auth.module.ts`

- Imports: `ConfigModule`, `PassportModule`, `JwtModule` (configurable vía env) y `TypeOrmModule` con entidades User/Role/Permission.
- Providers: mapean puertos a adaptadores (`AuthUserTypeOrmRepository`, `BcryptPasswordHasherAdapter`, `JwtTokenServiceAdapter`, etc.), registran casos de uso, guards y `JwtStrategy`.
- Exports: `JwtModule`, `PassportModule`, guards y tokens de repositorio para que otras features puedan reutilizarlos.

---

## Estrategia JWT y `req.user`

Archivo: `src/features/auth/infrastructure/security/jwt.strategy.ts`

- Extrae tokens desde `Authorization: Bearer <token>`.
- Verifica la firma con `JWT_SECRET` y respeta `JWT_EXPIRES_IN`.
- Recupera el usuario vía `AuthUserRepositoryPort` y lo expone en `req.user` (contiene `userId`, email y roles con permisos cargados), optimizando la verificación de guards.

---

## Decoradores y Guards (Roles, Permissions, JwtAuthGuard, RolesGuard, PermissionsGuard)

- Decoradores (`src/features/auth/interface/decorators/*.ts`):
  - `Roles` y `Permissions` añaden metadatos a handlers.
  - `CurrentUser` extrae el usuario autenticado desde `req`.
- Guards (`src/features/auth/interface/guards/*.ts`):
  - `JwtAuthGuard`: wrapper de `AuthGuard('jwt')`.
  - `RolesGuard`: valida metadatos de roles contra `req.user`.
  - `PermissionsGuard`: valida permisos agregados por rol.

Uso típico:

- Solo autenticación: `@UseGuards(JwtAuthGuard)`.
- Rol específico: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(AuthRoleName.ADMIN)`.
- Permiso específico: `@UseGuards(JwtAuthGuard, PermissionsGuard)` + `@Permissions('restaurant:create')`.

---

## Seeding (RbacSeeder)

- `src/features/auth/infrastructure/seeding/rbac.seeder.ts` corre en `OnModuleInit`.
- Usa las constantes de `src/features/auth/domain/constants/rbac.constants.ts` para garantizar permisos y roles por defecto.
- Inserta permisos faltantes y enriquece los roles existentes sin sobrescribir personalizaciones manuales.

Puedes ajustar roles/permisos editando `DEFAULT_PERMISSION_NAMES` y `DEFAULT_ROLES`.

---

## Endpoints de administración (cambiar roles y permisos, listar)

Controlador: `src/features/auth/interface/controllers/auth.controller.ts`

- `POST /auth/signup`: registro + token (caso de uso `SignUpUseCase`).
- `POST /auth/login`: autenticación + token (`LoginUseCase`).
- `GET /auth/me`: perfil autenticado (`FindUserByIdUseCase`).
- `PATCH /auth/admin/users/:id/roles`: requiere rol `ADMIN`, actualiza roles (`UpdateUserRolesUseCase`).
- `PATCH /auth/admin/roles/:name/permissions`: requiere rol `ADMIN`, define permisos (`UpdateRolePermissionsUseCase`).
- `GET /auth/admin/roles`: lista roles con permisos (`ListRolesUseCase`).
- `GET /auth/admin/permissions`: lista permisos (`ListPermissionsUseCase`).

Todos los endpoints administrados aplican `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles(AuthRoleName.ADMIN)`.

---

## Proteger módulos de negocio con permisos (Restaurants/Sections)

Ejemplos de uso en otras features:

- Restaurants (`src/features/restaurants/interface/controllers/restaurants.controller.ts`):
  - Crear: `@UseGuards(JwtAuthGuard, PermissionsGuard)` + `@Permissions('restaurant:create')`.
  - Actualizar: `@Permissions('restaurant:update')`.
  - Eliminar: `@Permissions('restaurant:delete')`.
- Sections (`src/features/sections/interface/controllers/sections.controller.ts`):
  - Crear: `@Permissions('section:create')`.
  - Actualizar: `@Permissions('section:update')`.
  - Eliminar: `@Permissions('section:delete')`.

Asegúrate de importar `AuthModule` en el módulo del feature para que inyección de guards y decoradores funcione.

---

## Ejemplos de solicitudes (PowerShell)

Registro:

```powershell
$body = @{ email='user@example.com'; name='John'; phone='0999999999'; password='StrongP4ss' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/signup -ContentType 'application/json' -Body $body
```

Login:

```powershell
$body = @{ email='user@example.com'; password='StrongP4ss' } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/login -ContentType 'application/json' -Body $body
$token = $login.token
```

Perfil autenticado:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/auth/me -Headers @{ Authorization = "Bearer $token" }
```

Crear restaurante (permiso `restaurant:create`):

```powershell
$body = @{ name='My Resto'; location='Center'; openTime='09:00'; closeTime='18:00'; daysOpen=@('MONDAY','TUESDAY'); totalCapacity=50; subscriptionId=1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/restaurant -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $body
```

Cambiar roles de un usuario (ADMIN):

```powershell
$body = @{ roles=@('ADMIN','OWNER') } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri http://localhost:3000/auth/admin/users/<userId>/roles -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $body
```

Cambiar permisos de un rol (ADMIN):

```powershell
$body = @{ permissions=@('restaurant:create','section:read') } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri http://localhost:3000/auth/admin/roles/OWNER/permissions -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $body
```

---

## Errores comunes y soluciones

- ESM/NodeNext: usa `.js` en imports relativos (p. ej. `../interface/guards/permissions.guard.js`).
- 401 Unauthorized: token faltante/expirado/inválido → revisa el header `Authorization`.
- 403 Forbidden: token válido pero sin permiso/rol → revisa `@Roles(...)` o `@Permissions(...)`.
- Email en uso: `ConflictException` al registrar usuarios duplicados.
- Producción: desactiva `synchronize` y usa migraciones.

---

## Buenas prácticas

- Mantén las contraseñas hasheadas (bcrypt ya implementado, ajusta `AUTH_SALT_ROUNDS` según necesidades).
- Protege `JWT_SECRET` y rota secretos en producción.
- Diseña permisos con formato `entidad:acción` (`order:refund`, `reservation:cancel`).
- Añade tests e2e para validar flujos críticos (403 esperados y 401 cuando corresponde).
- Extiende la lógica creando nuevos casos de uso antes de tocar controladores o adaptadores.

---

## Dónde mirar en el repo

- Dominio: `src/features/auth/domain/entities/*.ts`, `domain/constants/*.ts`, `domain/errors/*.ts`.
- Application: `src/features/auth/application/use-cases/*.ts`, `application/ports/*.ts`, `application/dto/commands/*.ts`.
- Infraestructura: `src/features/auth/infrastructure/database/typeorm/**`, `infrastructure/security/*.ts`, `infrastructure/seeding/rbac.seeder.ts`.
- Interface: `src/features/auth/interface/controllers/auth.controller.ts`, `interface/dto/*.ts`, `interface/guards/*.ts`, `interface/decorators/*.ts`.
- Módulo principal: `src/features/auth/auth.module.ts`.

Si reorganizas carpetas, recuerda actualizar imports relativos con `.js` debido al modo NodeNext/ESM.
