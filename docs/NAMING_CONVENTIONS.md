# Naming Conventions Guide

> Este documento define las **convenciones de nombrado** que deben seguirse en todo el proyecto para mantener un código consistente, legible y alineado con las buenas prácticas de **NestJS**, **TypeScript**, y **Clean Architecture + DDD**.

---

## Propósito

Las convenciones de nombrado ayudan a:

* Mantener una estructura uniforme entre módulos.
* Mejorar la legibilidad y búsqueda del código.
* Facilitar la colaboración entre desarrolladores.
* Evitar confusiones en nombres de archivos, clases o variables.

---

## Tipos de Convenciones

En este proyecto se utilizarán **cuatro tipos principales** de estilos de nombrado:

| Tipo                               | Estilo                    | Ejemplo                                            |
| ---------------------------------- | ------------------------- | -------------------------------------------------- |
| **Archivos**                       | 🟡 `kebab-case`           | `create-user.dto.ts`                               |
| **Clases, interfaces y tipos**     | 🟢 `PascalCase`           | `export class CreateUserDto {}`                    |
| **Variables, funciones y métodos** | 🔵 `camelCase`            | `const userRepository = new UserRepositoryImpl();` |
| **Constantes globales**            | 🔴 `SCREAMING_SNAKE_CASE` | `export const APP_PORT = process.env.APP_PORT`      |

---

## 1. Archivos → `kebab-case`

Todos los archivos deben escribirse en **minúsculas** y las palabras deben separarse con guiones (`-`).

### ✅ Ejemplos correctos

```
user.entity.ts
create-user.dto.ts
get-user-by-id.use-case.ts
user.repository.impl.ts
users.controller.ts
users.module.ts
```

> 📘 **Motivo:**
> `kebab-case` es el formato habitual en proyectos NestJS.
> Mejora la legibilidad en terminales, importaciones y sistemas Unix.

---

## 2. Clases, Interfaces y Tipos → `PascalCase`

Cada palabra inicia con mayúscula.
Este formato se usa para **clases, tipos, interfaces, enums y decoradores**.

### ✅ Ejemplos correctos

```ts
export class CreateUserDto {}
export abstract class UserRepository {}
export class UserRepositoryImpl implements UserRepository {}
export class EmailValueObject {}
export class CreateUserUseCase {}
```

> 📘 **Motivo:**
> En TypeScript y NestJS, las clases y tipos representan entidades o constructores,
> por lo que deben ser fácilmente distinguibles de variables o funciones.

---

## 3. Variables, Funciones y Métodos → `camelCase`

Comienzan en **minúscula**, y cada palabra siguiente inicia con **mayúscula**.
Aplica a nombres de variables locales, propiedades, métodos y funciones.

### ✅ Ejemplos correctos

```ts
const userRepository = new UserRepositoryImpl();

async findByEmail(email: string): Promise<User | null> {
  return this.userRepository.findByEmail(email);
}

function createAccessToken(userId: string): string {
  // lógica...
}
```

> 📘 **Motivo:**
> `camelCase` es el estándar de JavaScript/TypeScript para variables y funciones.
> Distingue visualmente los objetos y funciones de las clases.

---

## 4. Constantes Globales → `SCREAMING_SNAKE_CASE`

Las **constantes globales** o de configuración se escriben en **mayúsculas**,
separando las palabras con guiones bajos (`_`).

### ✅ Ejemplos correctos

```ts
export const APP_PORT = process.env.APP_PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MAX_USERS_PER_PAGE = 50;
```

> 📘 **Motivo:**
> Este estilo hace evidente que el valor **no debe ser modificado** en tiempo de ejecución.
