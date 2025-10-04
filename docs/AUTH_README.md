# Authentication and Authorization Guide

This document explains, end-to-end, how auth is implemented in this project: JWT login, password hashing, roles and guards, and how to use everything from controllers and clients.

The code uses NestJS with TypeScript in NodeNext/ESM mode. That means relative imports between your own files include the `.js` extension.

## Table of contents

- What you get (features)
- Environment variables
- Data model (User entity)
- DTOs (SignUp, Login)
- Module wiring (AuthModule)
- JWT Strategy

# Guía de Autenticación y Autorización

Este documento explica, de principio a fin, cómo está implementada la autenticación en este proyecto: inicio de sesión con JWT, hash de contraseñas, roles y guards, y cómo usar todo esto desde controladores y clientes.

El proyecto usa NestJS con TypeScript en modo NodeNext/ESM. Eso significa que los imports relativos entre tus propios archivos deben incluir la extensión `.js`.

## Tabla de contenidos

- Qué incluye (features)
- Variables de entorno
- Modelo de datos (Entidad User)
- DTOs (SignUp, Login)
- Cableado del módulo (AuthModule)
- Estrategia JWT
- Guards y decorador (JwtAuthGuard, Roles, RolesGuard)
- Endpoints del controlador (AuthController)
- Uso de roles y guards en módulos de negocio (Restaurant/Section)
- Ejemplos de solicitudes (PowerShell y curl)
- Errores comunes y soluciones
- Notas y buenas prácticas

---

## Qué incluye

- Hash de contraseñas con bcrypt
- Autenticación stateless basada en JWT (token Bearer)
- Autorización basada en roles (USER, OWNER, ADMIN)
- Guards de NestJS y decorador personalizado @Roles para proteger rutas
- La paginación en endpoints de negocio permanece pública salvo que la protejas

---

## Variables de entorno

Agrega lo siguiente a tu `.env` (ya validado por Joi):

- `JWT_SECRET` (requerido, mín. 16 caracteres): secreto para firmar los JWT
- `JWT_EXPIRES_IN` (opcional, por defecto `1d`): tiempo de vida del token, p. ej. `1h`, `7d`

Ejemplo en `.env`:

```
JWT_SECRET='cambia-este-secreto-muy-largo-y-seguro'
JWT_EXPIRES_IN='1d'
```

Estos valores los carga `ConfigModule` (ver `src/config/env.config.ts`) y los valida `src/config/joi.validation.ts`.

---

## Modelo de datos: Entidad User

Archivo: `src/auth/entities/user.entity.ts`

Campos clave:

- `id`: llave primaria uuid (columna: user_id)
- `email`: único (varchar 100)
- `name`: varchar 100
- `phone`: varchar 15
- `passwordHash`: hash con bcrypt (varchar 200)
- `roles`: arreglo de strings con valores del enum `UserRole` (por defecto `['USER']`)
- `active`: boolean, por defecto `true`

Por qué: mantener PII mínima, contraseña hasheada y roles para autorización.

---

## DTOs

Archivos:

- `src/auth/dto/signup.dto.ts`
- `src/auth/dto/login.dto.ts`

Validación destacada:

- SignUpDto: email (formato + longitud), name (requerido), phone (requerido), password (mín. 8; al menos una minúscula, una mayúscula y un dígito)
- LoginDto: email y password requeridos

Las strings entrantes se recortan con `class-transformer`.

---

## Cableado del módulo (AuthModule)

Archivo: `src/auth/auth.module.ts`

- Imports
  - `TypeOrmModule.forFeature([User])` para inyectar el repositorio de User
  - `PassportModule.register({ defaultStrategy: 'jwt' })`
  - `JwtModule.registerAsync(...)` usando `JWT_SECRET` y `JWT_EXPIRES_IN`
- Providers
  - `AuthService`, `JwtStrategy`, `RolesGuard`
- Exports
  - `JwtModule`, `PassportModule`, `RolesGuard` para que otros módulos los usen

`AuthModule` se importa en `AppModule` y también en los módulos de negocio donde se usan guards (p. ej., Restaurant/Section) para que los providers estén disponibles.

---

## Estrategia JWT

Archivo: `src/auth/strategy/jwt.strategy.ts` (o `src/auth/jwt.strategy.ts` según tu árbol)

- Extrae el token del header `Authorization: Bearer <token>`
- Verifica la firma con `JWT_SECRET`
- Adjunta un objeto `user` a `req.user` con forma `{ userId, email, roles }`

Este objeto es el que leen los guards durante la autorización.

---

## Guards y decorador

Archivos:

- `src/auth/guard/jwt-auth.guard.ts`: `export class JwtAuthGuard extends AuthGuard('jwt') {}`
- `src/auth/decorator/roles.decorator.ts`: `@Roles(...roles)` → coloca roles requeridos en la metadata de la ruta
- `src/auth/guard/roles.guard.ts`: lee los roles requeridos desde la metadata y los compara con `req.user.roles`

Uso:

- Agrega `@UseGuards(JwtAuthGuard)` para solo autenticación
- Agrega `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)` para exigir un rol

---

## AuthService

Archivo: `src/auth/auth.service.ts`

Métodos importantes:

- `signup(dto: SignUpDto)`: verifica email único, hashea contraseña, crea usuario con roles `[USER]`, retorna `{ user, token }`
- `login(dto: LoginDto)`: valida credenciales, retorna `{ user, token }`
- Usa bcrypt con `saltRounds = 10`
- Firma el JWT con payload `{ sub: user.id, email: user.email, roles: user.roles }`

---

## Endpoints del controlador (AuthController)

Rutas (prefijo: `/auth`):

- `POST /auth/signup`
  - body: `{ email, name, phone, password }`
  - response: `{ user: { id, email, name, phone, roles }, token }`

- `POST /auth/login`
  - body: `{ email, password }`
  - response: `{ user, token }`

- `GET /auth/me` (JWT)
  - header: `Authorization: Bearer <token>`
  - response: `req.user` (desde la estrategia)

- `GET /auth/admin/check` (JWT + RolesGuard + @Roles(ADMIN))
  - verifica que el token pertenezca a un admin

---

## Uso de roles y guards en módulos de negocio

Ejemplo: `src/restaurant/restaurant.controller.ts`

- Crear: solo `OWNER` o `ADMIN`
- Actualizar: solo `OWNER` o `ADMIN`
- Eliminar: solo `ADMIN`
- Listado y detalle: públicos por ahora (puedes protegerlos si lo necesitas)

La misma idea se aplica en `src/section/section.controller.ts`.

Para que los guards sean inyectables, `RestaurantModule` y `SectionModule` importan `AuthModule`.

---

## Ejemplos de solicitudes

Ejemplos en PowerShell (Windows):

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

Endpoint protegido (me):

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/auth/me -Headers @{ Authorization = "Bearer $token" }
```

Crear un restaurante (OWNER o ADMIN):

```powershell
$body = @{ name='My Resto'; location='Center'; openTime='09:00'; closeTime='18:00'; daysOpen=@('MONDAY','TUESDAY'); totalCapacity=50; subscriptionId=1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/restaurant -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $body
```

---

## Errores comunes y soluciones

- Imports en ESM/NodeNext: usa la extensión `.js` en imports relativos (p. ej., `../auth/roles.guard.js`).
- 401 Unauthorized: token faltante/expirado/inválido en el header `Authorization`.
- 403 Forbidden: token válido pero rol insuficiente → revisa `@Roles(...)` en la ruta.
- Email ya en uso: `ConflictException` al registrar (cambia el email o elimina el usuario existente).
- Cambios de esquema en BD: si modificaste columnas (p. ej., horarios en Restaurant), considera migraciones para producción.

---

## Notas y buenas prácticas

- Nunca guardes contraseñas en texto plano (ya usamos bcrypt).
- Cambia y protege `JWT_SECRET` en producción.
- Usa `NODE_ENV=production` para desactivar `synchronize` y migrar con scripts.
- Define política de expiración/rotación si manejas sesiones largas (tokens de refresco, opcional).
- Para tests e2e, crea utilidades que registren, inicien sesión y reutilicen el token automáticamente.

---

## Apéndice: dónde mirar en el repo

- Entidad: `src/auth/entities/user.entity.ts`
- DTOs: `src/auth/dto/*.ts`
- Servicio: `src/auth/auth.service.ts`
- Módulo: `src/auth/auth.module.ts`
- Estrategia: `src/auth/strategy/jwt.strategy.ts` (o `src/auth/jwt.strategy.ts` si aún no moviste el archivo)
- Guards: `src/auth/guard/*.ts`
- Decorador: `src/auth/decorator/roles.decorator.ts`
- Módulos de negocio: `src/restaurant/*`, `src/section/*`

Si reorganizas carpetas (por ejemplo, mover guards a `auth/guard`), recuerda actualizar los imports relativos (con `.js`).
