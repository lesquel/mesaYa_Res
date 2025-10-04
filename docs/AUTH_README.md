# Guía de Autenticación y Autorización (JWT + RBAC)

Este documento explica cómo está implementado el sistema de autenticación (JWT) y autorización (RBAC: Roles + Permisos) en este proyecto, cómo proteger rutas con guards, y cómo administrar roles y permisos desde endpoints de administración.

Nota ESM/NodeNext: los imports relativos entre archivos del proyecto deben incluir la extensión `.js`.

## Tabla de contenidos

- Qué incluye (features)
- Variables de entorno
- Modelo de datos (User, Role, Permission)
- DTOs (SignUp, Login, UpdateUserRoles, UpdateRolePermissions)
- Módulo y wiring (AuthModule)
- Estrategia JWT y `req.user`
- Decoradores y Guards (Roles, Permissions, JwtAuthGuard, RolesGuard, PermissionsGuard)
- Seeding (RbacSeeder): cómo se crean roles y permisos por defecto
- Endpoints de administración (cambiar roles y permisos, listar)
- Proteger módulos de negocio con permisos (Restaurant/Section)
- Ejemplos de solicitudes (PowerShell)
- Errores comunes y soluciones
- Buenas prácticas

---

## Qué incluye

- Hash de contraseñas con bcrypt
- Autenticación stateless con JWT (Bearer token)
- Autorización fina basada en permisos (RBAC): Roles → Permisos
- Guards de NestJS: autenticación (JWT) y autorización (roles/permisos)
- Endpoints de administración para gestionar roles y permisos en caliente

---

## Variables de entorno

En `.env` (validadas con Joi):

- `JWT_SECRET` (requerido, mín. 16 chars) → secreto de firma
- `JWT_EXPIRES_IN` (opcional, por defecto `1d`) → ttl del token (ej. `1h`, `7d`)

Ejemplo:

```
JWT_SECRET='cambia-este-secreto-muy-largo-y-seguro'
JWT_EXPIRES_IN='1d'
```

---

## Modelo de datos

- `src/auth/entities/user.entity.ts`
  - id (uuid), email único, name, phone, passwordHash
  - roles: ManyToMany con `Role` (eager), JoinTable `user_roles`
  - active: boolean

- `src/auth/entities/role.entity.ts`
  - name único (ADMIN, OWNER, USER, ...)
  - permissions: ManyToMany con `Permission` (eager), JoinTable `role_permissions`

- `src/auth/entities/permission.entity.ts`
  - name único (string) con formato `entidad:acción` (ej. `restaurant:create`)

---

## DTOs

- `src/auth/dto/signup.dto.ts` → registro
- `src/auth/dto/login.dto.ts` → login
- `src/auth/dto/update-user-roles.dto.ts` → cambiar roles de usuario
  - roles: string[] (nombres de rol)
- `src/auth/dto/update-role-permissions.dto.ts` → cambiar permisos de un rol
  - permissions: string[] (nombres de permiso)

Barrel para imports ESM: `src/auth/dto/index.ts`.

---

## Módulo y wiring (AuthModule)

Archivo: `src/auth/auth.module.ts`

- Imports: TypeOrmModule([User, Role, Permission]), Passport(JWT), JwtModule (async, usa ConfigService)
- Providers:
  - `AuthService` (signup/login)
  - `JwtStrategy` (valida token y adjunta usuario a `req.user`)
  - `RolesGuard` y `PermissionsGuard`
  - `RbacSeeder` (seeding en el arranque) y `RbacService` (gestión de RBAC)
- Exports: JwtModule, PassportModule, RolesGuard, PermissionsGuard, RbacService

---

## Estrategia JWT y `req.user`

Archivo: `src/auth/strategy/jwt.strategy.ts`

- Extrae token desde `Authorization: Bearer <token>`
- Verifica con `JWT_SECRET`
- Carga el usuario desde BD y adjunta en `req.user` un objeto con:
  - userId, email, roles (array de `Role` con `permissions` eager)

Esto permite que `PermissionsGuard` consulte permisos sin más consultas.

---

## Decoradores y Guards

- Decoradores:
  - `src/auth/decorator/roles.decorator.ts` → `@Roles(...roles)`
  - `src/auth/decorator/permissions.decorator.ts` → `@Permissions(...perms)`

- Guards:
  - `src/auth/guard/jwt-auth.guard.ts` → `AuthGuard('jwt')`
  - `src/auth/guard/roles.guard.ts` → verifica `@Roles` contra `req.user.roles`
  - `src/auth/guard/permissions.guard.ts` → verifica `@Permissions` contra `req.user.roles[].permissions[]`

Uso típico:

- Solo autenticación: `@UseGuards(JwtAuthGuard)`
- Rol específico: `@UseGuards(JwtAuthGuard, RolesGuard) + @Roles(UserRole.ADMIN)`
- Permiso específico: `@UseGuards(JwtAuthGuard, PermissionsGuard) + @Permissions('restaurant:create')`

---

## Seeding (RbacSeeder)

Archivo: `src/auth/rbac/rbac.seeder.ts`

- Corre en el arranque del módulo (`OnModuleInit`).
- Crea permisos por defecto (si faltan), definidos en `src/auth/rbac/rbac.constants.ts`.
- Crea roles por defecto (si faltan) y agrega permisos faltantes de forma aditiva (no borra personalizaciones).

Puedes ampliar los permisos y roles por defecto editando `DEFAULT_PERMISSION_NAMES` y `DEFAULT_ROLES`.

---

## Endpoints de administración (ADMIN)

Archivo: `src/auth/auth.controller.ts`

- `PATCH /auth/admin/users/:id/roles`
  - Body: `{ "roles": ["ADMIN", "OWNER"] }`
  - Cambia roles de un usuario.

- `PATCH /auth/admin/roles/:name/permissions`
  - Body: `{ "permissions": ["restaurant:create", "section:read"] }`
  - Cambia permisos de un rol (crea el rol si no existe).

- `GET /auth/admin/roles`
  - Lista roles con sus permisos.

- `GET /auth/admin/permissions`
  - Lista todos los permisos disponibles.

Todos requieren JWT + `RolesGuard` + `@Roles(UserRole.ADMIN)`.

La lógica vive en `src/auth/rbac/rbac.service.ts`.

---

## Proteger módulos de negocio con permisos

Ejemplos:

- Restaurant (`src/restaurant/restaurant.controller.ts`):
  - Crear: `@UseGuards(JwtAuthGuard, PermissionsGuard)` + `@Permissions('restaurant:create')`
  - Actualizar: `@Permissions('restaurant:update')`
  - Eliminar: `@Permissions('restaurant:delete')`
  - Leer (opcional): `@Permissions('restaurant:read')`

- Section (`src/section/section.controller.ts`):
  - Crear: `@Permissions('section:create')`
  - Actualizar: `@Permissions('section:update')`
  - Eliminar: `@Permissions('section:delete')`
  - Leer (opcional): `@Permissions('section:read')`

Recuerda importar `AuthModule` en los módulos de negocio para que los guards sean inyectables.

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

Llamar endpoint protegido (me):

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/auth/me -Headers @{ Authorization = "Bearer $token" }
```

Crear restaurante (requiere permiso restaurant:create):

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

- ESM/NodeNext: usa `.js` en imports relativos (p. ej. `../auth/guard/permissions.guard.js`).
- 401 Unauthorized: token faltante/expirado/inválido → revisa el header `Authorization`.
- 403 Forbidden: token válido pero sin permiso/rol → revisa `@Roles(...)` o `@Permissions(...)`.
- Email en uso: `ConflictException` en registro.
- Producción: desactiva `synchronize` y usa migraciones.

---

## Buenas prácticas

- No guardes contraseñas en texto plano (usa bcrypt; ya implementado).
- Protege `JWT_SECRET` y rota secretos en producción.
- Diseña permisos por entidad y acción (`entidad:acción`), ej. `order:refund`.
- Añade tests e2e para flujos de permisos críticos (403 esperados).
- Usa `RbacService` para operaciones admin y mantén `AuthService` solo para auth.

---

## Dónde mirar en el repo

- Entidades: `src/auth/entities/*.ts`
- DTOs: `src/auth/dto/*.ts` y `src/auth/dto/index.ts`
- Servicio Auth: `src/auth/auth.service.ts`
- Servicio RBAC: `src/auth/rbac/rbac.service.ts`
- Seeder RBAC: `src/auth/rbac/rbac.seeder.ts`
- Constantes RBAC: `src/auth/rbac/rbac.constants.ts`
- Módulo: `src/auth/auth.module.ts`
- Estrategia: `src/auth/strategy/jwt.strategy.ts`
- Guards: `src/auth/guard/*.ts`
- Decoradores: `src/auth/decorator/*.ts`
  Si reorganizas carpetas, recuerda actualizar imports relativos con `.js` por estar en modo NodeNext/ESM.
- Guards: `src/auth/guard/*.ts`
