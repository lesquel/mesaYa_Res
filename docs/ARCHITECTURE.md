# MesaYa Clean Architecture Guide

## Objetivo

Este documento define la estructura base y las reglas de arquitectura para
MesaYa aplicando principios de Clean Architecture, diseño orientado a dominios
(DDD) y organización por _feature_. El objetivo es poder cambiar proveedores
externos (base de datos, colas, gateways) sin reescribir el dominio ni la lógica
de negocio, mantener un código fácil de probar y escalar, y ofrecer una guía
clara para la incorporación de nuevos módulos. Además, se registran iniciativas
recientes (por ejemplo, normalización de paginación Swagger, endpoints
parametrizados por restaurante y enriquecimiento de los _value objects_ de
`sections`) y un backlog de mejoras futuras.

## Macrovisión de capas

La solución se organiza en cuatro zonas concéntricas. Cada capa solo puede
conocer a las capas más internas y expone contratos (interfaces) que permiten a
las capas externas interactuar sin generar dependencias cíclicas.

| Capa               | Responsabilidad principal                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Domain**         | Modelar el negocio: entidades, _value objects_, servicios de dominio, eventos.                                  |
| **Application**    | Casos de uso orquestan al dominio. Define DTOs, _ports_ y _mappers_.                                            |
| **Infrastructure** | Adapta el mundo exterior: repositorios concretos, ORM, proveedores externos.                                    |
| **Interface**      | Expone la aplicación (REST, GraphQL, WebSockets, CLI). Maneja validaciones de entrada, serialización de salida. |

**Regla de dependencia:** Las importaciones siempre apuntan hacia adentro. El
Dominio no importa nada de Application; Application no importa nada de
Infrastructure o Interface. Las capas externas dependen de contratos definidos
más adentro.

## Estructura base por feature

Cada _feature_ vive en su propio directorio y replica las capas internas. Por
consistencia usa plural para el nombre (ej.: `users`, `orders`).

```
src/
├── users/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── services/              # opcional: lógica de negocio pura
│   │   └── events/                # opcional
│   ├── application/
│   │   ├── use-cases/
│   │   ├── dto/
│   │   │   ├── input/
│   │   │   └── output/
│   │   ├── ports/                 # interfaces de repositorio/gateway
│   │   └── mappers/
│   ├── infrastructure/
│   │   ├── repositories/
│   │   ├── orm/
│   │   ├── mappers/
│   │   └── providers/
│   └── interface/
│       ├── controllers/
│       ├── graphql/
│       ├── subscribers/           # eventos, sockets
│       └── validators/
├── orders/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── interface/
└── shared/
    ├── core/
    │   ├── BaseEntity.ts
    │   ├── DomainEvent.ts
    │   ├── UseCase.ts
    │   └── Result.ts
    ├── utils/
    ├── config/
    ├── providers/
    └── testing/
```

> **Sugerencia:** Comienza migrando _features_ existentes una por una. Por
> ejemplo, `auth` y `users` se pueden fusionar en un nuevo módulo `users` con
> subcarpetas Domain/Application/Infrastructure/Interface.

> **Implementado recientemente:** los módulos `restaurants`, `sections` y
> `reviews` ya siguen el patrón con _value objects_ y repositorios aislados;
> además, se introdujo un decorador compartido `ApiPaginationQuery` para evitar
> duplicar metadatos Swagger en controladores REST.

## Convenciones por capa

### Domain

- Solo TypeScript puro, sin dependencias de NestJS ni TypeORM.
- Entidades extienden `BaseEntity` del `shared/core` para tener ID, timestamps o
  manejo de eventos de dominio (si aplica).
- _Value Objects_ encapsulan reglas de validación inmutables.
- Servicios de dominio orquestan reglas complejas entre entidades.
- Exponer interfaces (`IUserRole`, `PaymentStatus`) en `/types` cuando sea útil.

> **Ejemplo:** `Section` utiliza _value objects_ como `SectionWidth` y
> `SectionHeight` para garantizar dimensiones válidas sin depender de la capa
> de infraestructura.

### Application

- Cada caso de uso implementa `UseCase<InputDTO, OutputDTO>`.
- Define _ports_ (interfaces) para repositorios, gateways, proveedores de email,
  etc. Ej.: `UserRepositoryPort`.
- Mappers transforman entidades ↔ DTOs.
- Controla transacciones y consistencia, pero no ejecuta queries directas.
- Puede usar _Result/Either_ para comunicar éxito/fracaso sin lanzar excepciones.

> **Ejemplo:** `ListRestaurantSectionsUseCase` recibe un `ListRestaurantSectionsQuery`
> y delega el filtrado al `SectionRepositoryPort` manteniendo la paginación
> alineada con la infraestructura.

### Infrastructure

- Implementaciones concretas de los `ports` (TypeORM, HTTP, Redis, S3…).
- Configuración específica (entity schemas de TypeORM, modelos Prisma, etc.).
- Adaptadores externos se registran como `providers` en el módulo Nest
  (`users.module.ts`).

> **Ejemplo:** `SectionTypeOrmRepository` reusa un helper global de paginación y
> expone métodos `paginate` / `paginateByRestaurant`, manteniendo la lógica de
> query dentro de infra.

### Interface

- Controladores REST, resolvers GraphQL, handlers de eventos.
- Validan y transforman entrada usando DTOs y `class-validator`.
- Delegan toda la lógica al caso de uso correspondiente.
- No realizan llamadas directas a infraestructura.

> **Implementado:** controladores emplean `ApiPaginationQuery` para documentar
> parámetros comunes y exponen rutas versionadas (`/api/v1/...`).

### Shared

- Código transversal reutilizable.
- `core/`: abstracciones base (UseCase, BaseEntity, ValueObject, Result, Guard,
  DomainEvent, etc.).
- `utils/`: helpers puros (formateo de fechas, generadores de UUID, hashing).
- `config/`: adaptadores de configuración, carga de `.env`.
- `providers/`: módulos globales (Logger, Event Bus).
- `testing/`: utilidades para tests unitarios/integración.

## Módulos NestJS por feature

Cada _feature_ expone un módulo Nest principal (`users.module.ts`) dentro de su
raíz. Este módulo vincula la capa `interface` con los `use-cases` y registra las
implementaciones de infraestructura.

```
// src/users/users.module.ts
@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: UserRepositoryPort,
      useClass: TypeOrmUserRepository,
    },
    CreateUserUseCase,
    UpdateUserUseCase,
  ],
  exports: [
    CreateUserUseCase,
    UpdateUserUseCase,
  ],
})
export class UsersModule {}
```

Reglas para módulos:

- Las dependencias entre módulos deben seguir el dominio (por ejemplo,
  `orders` puede importar `users` para validar propietarios, pero no al revés).
- Las exportaciones son casos de uso o _ports_ que otras features necesitan.

## Estrategia de migración desde la estructura actual

1. **Inventario:** Lista las entidades y servicios existentes (`auth`,
   `restaurant`, `review`, `section`, `payment`).
2. **Define features:** Agrupa elementos por contexto de negocio.
   - `users`: modelos y lógica de autenticación/autorización.
   - `restaurants`: restaurantes y secciones.
   - `orders`: pagos y órdenes (actualmente `payment`).
   - `reviews`: calificaciones.
3. **Mover dominio:** Extrae las clases `*.entity.ts` y reglas de negocio a
   `domain/entities` y `domain/value-objects`.
4. **Crear ports:** En `application/ports` define interfaces de repositorio usando
   métodos que el caso de uso requiere (ej.: `findByEmail`, `save`).
5. **Reescribir casos de uso:** Al migrar los servicios (`*.service.ts`),
   conviértelos en `use-cases` con dependencias solo hacia los `ports`.
6. **Adaptadores:** Mueve repositories concretos (TypeORM) a
   `infrastructure/repositories`. Implementan los `ports`.
7. **Módulo Nest:** Actualiza el módulo de la feature para wirear los providers y
   exponer controladores.
8. **Actualizar imports:** Usa `@` o rutas relativas en `tsconfig` para evitar
   recorridos largos (`"paths": { "@users/*": ["src/users/*"] }`).
9. **Testing:** Asegúrate de que los tests unitarios trabajen contra _ports_ y
   usen _mocks_ (test doubles) de infraestructura.

> **Checklist aplicada:** Se agregaron módulos `SectionsModule` y `RestaurantsModule`
> al `AppModule` para que sus controladores se expongan en Swagger y la versión
> `dist` cargue sin `MODULE_NOT_FOUND`.

## DTOs y validaciones

- Input DTOs viven en `application/dto/input`. Se anotan con `class-validator`.
- Output DTOs en `application/dto/output`. Pueden mapear desde `domain`.
- Validaciones complejas deben moverse a _value objects_ para reutilizarse.

> **Ejemplo:** `CreateSectionDto` valida `width` y `height` como enteros positivos,
> mientras que el `SectionWidth`/`SectionHeight` refuerzan la misma regla en el
> dominio.

## Pruebas recomendadas

| Capa           | Tipo de prueba      | Objetivo                                      |
| -------------- | ------------------- | --------------------------------------------- |
| Domain         | Unitarias puras     | Validar reglas con value objects y entidades. |
| Application    | Unitarias con mocks | Asegurar orquestación de casos de uso.        |
| Infrastructure | Integración         | Verificar conexión con DB, HTTP, colas.       |
| Interface      | E2E / Pact          | Validar contratos REST/GraphQL con la API.    |

Considera una carpeta paralela `__tests__` para cada capa o agrupa tests por
feature (`src/users/tests/...`). Usa `shared/testing` para builders y factories.

## Gestión de dependencias y configuración

- Centraliza tokens de inyección (`const USER_REPOSITORY = Symbol('UserRepository');`).
- Evita literales mágicos en casos de uso; extrae a `shared/core/constants`.
- Usa `ConfigService` solo en infraestructura o interface. La aplicación/le no
  debe leer variables de entorno directamente.

## Comunicación entre features

- Expón casos de uso o _ports_ específicos a través de `exports` del módulo.
- Considera eventos de dominio (`UserRegisteredEvent`) para desacoplar flujos
  cruzados (por ejemplo, crear una orden al recibir un pago confirmado).
- Si necesitas compartir entidades, hazlo vía `shared/core` o interfaces de
  dominio, no usando clases concretas de otra feature.

> **Pendiente:** evaluar un mecanismo de eventos de dominio o integración (ej. a
> través de `@nestjs/cqrs`) para sincronizar reservas y disponibilidad de
> secciones en tiempo real.

## Guía para nuevos features

1. Crea la carpeta `src/<feature>/` con la estructura base.
2. Define entidades y value objects mínimos.
3. Crea puertos en `application/ports` y casos de uso.
4. Implementa adaptadores en `infrastructure` según la tecnología actual (por
   ejemplo, TypeORM). Si más adelante cambias a Prisma o un microservicio, bastará
   con reemplazar el adaptador.
5. Exponer controladores/resolvers en `interface` que llamen a los casos de uso.
6. Registra el módulo en `app.module.ts`.

> **Sugerencia:** agrega pruebas mínimas (unitarias para value objects y E2E para
> endpoints críticos) antes de exponer un nuevo módulo en producción.

## Configuración de rutas y permisos

- Mantén guardias y decoradores (roles/permissions) en la capa `interface`.
- Los casos de uso no deben conocer `Request`, `Response` ni guardias NestJS.
- La autorización de alto nivel (¿puede el usuario ejecutar el caso de uso?) se
  valida antes de invocar al caso de uso.

## Logging y monitoreo

- Usa un `Logger` compartido en `shared/providers/logger.provider.ts`.
- Casos de uso loguean eventos de alto nivel; adaptadores loguean detalles de
  integración.
- Considera un wrapper para métricas (`shared/providers/metrics`).

## Roadmap sugerido

1. Crear `shared/core` con abstracciones base (UseCase, BaseEntity, Result,
   UniqueEntityID, DomainEvent, Guard).
2. Migrar `auth` → `users feature` siguiendo la estructura propuesta.
3. Migrar `restaurants`, `sections` y `reviews`.
4. Unificar `payment` dentro de un nuevo dominio `orders` o `payments` según lo
   que defina el negocio.
5. Añadir pruebas unitarias al dominio antes de mover a producción.
6. Documentar en README los comandos para ejecutar casos de uso y tests.

### Backlog de mejoras adicionales

- Instrumentar migraciones automatizadas (TypeORM CLI o `@nestjs/typeorm`
  factories) para nuevos campos (`width`, `height`, etc.).
- Centralizar configuración de variables obligatorias con defaults y perfiles
  (`.env.development`, `.env.test`) para evitar fallos en `ConfigModule`.
- Añadir _health checks_ y métricas (p. ej. `@nestjs/terminus`) en `shared` para
  monitoreo.
- Incluir _fixtures_ de semillas por feature (extendiendo `seed` actual) y
  automatizar su ejecución en pipelines.
- Expandir la documentación de estándares de Swagger (naming de tags, ejemplos
  por respuesta, políticas de error).
- Implementar pruebas contractuales para módulos que consumen `paginateQueryBuilder`
  asegurando alias válidos al ordenar.
- Analizar la introducción de un _event bus_ o _outbox pattern_ para futuras
  integraciones (pagos, notificaciones) sin acoplar casos de uso entre sí.
- Incorporar un _linter_ para convenciones de importación (evitar `../..` largos)
  y un _formatter_ consistente (`eslint + prettier`) ya configurado en scripts.

## Glosario rápido

- **Entity:** Objeto con identidad en el negocio (User, Restaurant, Order).
- **Value Object:** Define propiedades inmutables y reglas (Email, Price).
- **Use Case:** Orquesta una acción concreta (CreateUser, UpdateOrderStatus).
- **Port:** Contrato abstracto para infraestructura (UserRepositoryPort).
- **Adapter:** Implementación concreta del port (TypeOrmUserRepository).

## Recursos adicionales

- [Clean Architecture (Robert C. Martin)](https://www.oreilly.com/library/view/clean-architecture/9780134494272/)
- [Implementing DDD with NestJS](https://docs.nestjs.com/recipes/prisma#domain-driven-design-passion-project)
- [Hexagonal Architecture in TypeScript](https://blog.arkency.com/hexagonal-architecture/)

> Mantén este documento vivo: actualízalo cuando cambie la estrategia
> arquitectónica, se incorporen nuevas reglas o se agreguen herramientas.
