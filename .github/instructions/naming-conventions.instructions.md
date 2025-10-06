---
applyTo: '**'
---

# Naming Conventions

Follow these conventions across the project (NestJS + TypeScript + Clean Architecture + DDD):

| Category                      | Style                | Example                                            |
| ----------------------------- | -------------------- | -------------------------------------------------- |
| Files                         | kebab-case           | `create-user.dto.ts`                               |
| Classes, Interfaces, Types    | PascalCase           | `export class CreateUserDto {}`                    |
| Variables, Functions, Methods | camelCase            | `const userRepository = new UserRepositoryImpl();` |
| Constants                     | SCREAMING_SNAKE_CASE | `export const APP_PORT = process.env.APP_PORT;`    |

## Rules

- **Files:** lowercase + hyphens (`user.repository.impl.ts`)
- **Classes/Types:** capitalized words (`UserRepositoryImpl`)
- **Variables/Functions:** start lowercase, then capitalize each word (`findByEmail`)
- **Constants:** all caps + underscores (`JWT_SECRET`)
- Use clear, descriptive names; avoid abbreviations.
- Keep consistency with NestJS structure (modules, controllers, services, etc.).

These rules ensure consistency, readability, and alignment with TypeScript and NestJS standards.
