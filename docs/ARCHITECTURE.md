# MesaYa - Arquitectura del Sistema

## Visión General

Este documento define la arquitectura del sistema **MesaYa**, basada en:

- **Clean Architecture** (capas concéntricas con dependencias hacia adentro)
- **Domain-Driven Design (DDD)** (modelado rico del dominio)
- **Feature-based organization** (módulos por contexto de negocio)

**Objetivo:** Mantener un código desacoplado, testeable y escalable, permitiendo
cambiar implementaciones externas sin afectar la lógica de negocio.

## Arquitectura de Capas

El sistema se organiza en **4 capas concéntricas**:

| Capa               | Responsabilidad                                                                   | Dependencias          |
| ------------------ | --------------------------------------------------------------------------------- | --------------------- |
| **Domain**         | Entidades, Value Objects, reglas de negocio, servicios de dominio                | Ninguna               |
| **Application**    | Casos de uso, DTOs, Ports (interfaces), Mappers                                   | Domain                |
| **Infrastructure** | Repositorios concretos, ORM, servicios externos, adaptadores                      | Application + Domain  |
| **Interface**      | Controladores REST, GraphQL resolvers, CLI, validaciones de entrada              | Application + Domain  |

### Regla de Dependencia

**Las dependencias apuntan SIEMPRE hacia adentro:**

```text
┌─────────────────────────────────────┐
│          Interface/               │  ← HTTP, GraphQL, CLI
│      (Controllers, Resolvers)       │
├─────────────────────────────────────┤
│       Infrastructure                │  ← TypeORM, Kafka, Supabase
│  (Repositories, External Services)  │
├─────────────────────────────────────┤
│         Application                 │  ← Use Cases, DTOs, Ports
│    (Business Logic Orchestration)   │
├─────────────────────────────────────┤
│           Domain                    │  ← Entities, Value Objects
│       (Pure Business Logic)         │
└─────────────────────────────────────┘
```

- **Domain** no conoce ninguna otra capa
- **Application** solo conoce Domain
- **Infrastructure** e **Interface** conocen Application y Domain
- **Inversión de dependencias:** Application define interfaces (Ports) que
  Infrastructure implementa

## Organización por Features

El código se organiza por **contextos de negocio** (features), cada uno con sus
propias capas internas.

### Estructura Global

```text
src/
├── features/                        # Módulos de negocio
│   ├── features.module.ts           # Módulo agregador
│   ├── auth/                        # Autenticación y autorización
│   ├── restaurants/                 # Gestión de restaurantes
│   ├── sections/                    # Secciones de restaurantes
│   ├── tables/                      # Mesas
│   ├── objects/                     # Objetos/mobiliario
│   ├── section-objects/             # Relaciones sección-objeto
│   ├── reviews/                     # Reseñas
│   ├── reservation/                 # Reservas
│   ├── menus/                       # Menús
│   ├── payment/                     # Pagos
│   ├── subscription/                # Suscripciones
│   └── images/                      # Gestión de imágenes
├── shared/                          # Código compartido
│   ├── core/                        # Abstracciones base
│   ├── domain/                      # Entidades compartidas
│   ├── application/                 # Lógica compartida
│   ├── infrastructure/              # Adaptadores compartidos
│   └── interface/                   # Interfaces compartidas
├── seed/                            # Datos de prueba
└── main.ts                          # Punto de entrada
```

### Estructura de una Feature

Cada feature replica las 4 capas internamente:

```text
src/features/<feature-name>/
├── <feature-name>.module.ts         # Módulo NestJS
├── <feature-name>.tokens.ts         # Tokens de inyección (Symbols)
├── index.ts                         # Barrel exports
│
├── domain/                          # Capa de Dominio
│   ├── entities/                    # Entidades con identidad
│   ├── value-objects/               # Valores inmutables
│   ├── services/                    # Servicios de dominio
│   └── events/                      # Eventos de dominio
│
├── application/                     # Capa de Aplicación
│   ├── use-cases/                   # Casos de uso
│   ├── dto/
│   │   ├── input/                   # DTOs de entrada
│   │   └── output/                  # DTOs de salida
│   ├── ports/                       # Interfaces (contratos)
│   └── mappers/                     # Transformadores
│
├── infrastructure/                  # Capa de Infraestructura
│   ├── repositories/                # Implementaciones de repositorios
│   ├── orm/                         # Schemas de TypeORM
│   ├── mappers/                     # Mappers ORM ↔ Domain
│   └── providers/                   # Servicios externos
│
└── interface/                       # Capa de Interfaz
    ├── controllers/                 # Controladores REST
    ├── graphql/                     # Resolvers GraphQL
    └── validators/                  # Validaciones específicas
```

## Responsabilidades por Capa

### 1. Domain (Dominio)

**Responsabilidad:** Modelar el negocio puro, sin dependencias externas.

- **Entities:** Objetos con identidad única (Restaurant, User, Reservation)
- **Value Objects:** Valores inmutables con validaciones (Email, SectionWidth, Price)
- **Domain Services:** Lógica compleja que involucra múltiples entidades
- **Domain Events:** Hechos significativos del negocio (RestaurantCreated)

**Reglas:**

- Solo TypeScript puro, sin NestJS ni TypeORM
- Sin imports de otras capas
- Validaciones en constructores o métodos estáticos
- Inmutabilidad en Value Objects

### 2. Application (Aplicación)

**Responsabilidad:** Orquestar casos de uso del negocio.

- **Use Cases:** Acciones específicas (CreateRestaurant, UpdateReservation)
- **DTOs:** Objetos de transferencia de datos (input/output)
- **Ports:** Interfaces que definen contratos (RepositoryPort, GatewayPort)
- **Mappers:** Transformadores entre Domain ↔ DTO

**Reglas:**

- Define INTERFACES, no implementaciones
- No conoce tecnologías concretas (TypeORM, Kafka, etc.)
- Usa inyección de dependencias mediante Ports
- No maneja HTTP requests/responses directamente

### 3. Infrastructure (Infraestructura)

**Responsabilidad:** Implementar adaptadores a tecnologías externas.

- **Repositories:** Implementaciones concretas de repositorios (TypeORM)
- **ORM Schemas:** Definiciones de esquemas de base de datos
- **External Services:** Integraciones (Kafka, Supabase, APIs externas)
- **Mappers:** Transformaciones ORM ↔ Domain

**Reglas:**

- IMPLEMENTA las interfaces definidas en Application (Ports)
- Única capa que conoce TypeORM, Kafka, HTTP clients, etc.
- Maneja detalles de persistencia y comunicación externa

### 4. Interface (Interfaz / Presentación)

**Responsabilidad:** Exponer la aplicación al mundo exterior.

- **Controllers:** Endpoints REST
- **GraphQL Resolvers:** Queries y mutations
- **Validators:** Validaciones de entrada con `class-validator`
- **Response Mappers:** Serialización de respuestas

**Reglas:**

- Delega TODA la lógica a Use Cases
- Maneja validaciones de entrada (DTOs con decoradores)
- No contiene lógica de negocio
- Transforma requests → Use Case Input
- Transforma Use Case Output → Response

## Inyección de Dependencias (NestJS)

### Sistema de Tokens

Cada feature define sus tokens de inyección usando **Symbols** en archivos
`*.tokens.ts`:

```typescript
// src/features/restaurants/restaurants.tokens.ts

// Repositories
export const RESTAURANT_REPOSITORY = Symbol('RESTAURANT_REPOSITORY');
export const RESTAURANT_ANALYTICS_REPOSITORY = Symbol('RESTAURANT_ANALYTICS_REPOSITORY');

// Services
export const RESTAURANT_EVENT_PUBLISHER = Symbol('RESTAURANT_EVENT_PUBLISHER');

// Readers (para comunicación cross-feature)
export const USER_RESTAURANT_READER = Symbol('USER_RESTAURANT_READER');
```

**Ventajas:**

- Evita colisiones de nombres entre módulos
- Type-safe (TypeScript infiere tipos)
- Facilita refactoring

### Estructura de Módulos NestJS

Cada feature tiene un módulo que registra providers e implementaciones:

```typescript
// src/features/restaurants/restaurants.module.ts
import { Module } from '@nestjs/common';
import { RestaurantsController } from './interface/controllers/restaurants.controller';
import { RESTAURANT_REPOSITORY } from './restaurants.tokens';
import { RestaurantTypeOrmRepository } from './infrastructure/repositories/restaurant-typeorm.repository';
import { CreateRestaurantUseCase } from './application/use-cases/create-restaurant.use-case';

@Module({
  controllers: [RestaurantsController],
  providers: [
    // Implementación de Port
    {
      provide: RESTAURANT_REPOSITORY,
      useClass: RestaurantTypeOrmRepository,
    },
    // Use Cases
    CreateRestaurantUseCase,
    ListRestaurantsUseCase,
  ],
  exports: [
    RESTAURANT_REPOSITORY,    // Otras features pueden usarlo
    CreateRestaurantUseCase,
  ],
})
export class RestaurantsModule {}
```

### Módulo Agregador (FeaturesModule)

Todas las features se agrupan en un módulo central:

```typescript
// src/features/features.module.ts
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AuthModule,
    RestaurantsModule,
    SectionsModule,
    TablesModule,
    ReviewsModule,
    ReservationModule,
    // ... otras features
  ],
  exports: [
    AuthModule,
    RestaurantsModule,
    // ... todas las features
  ],
})
export class FeaturesModule {}
```

## Comunicación entre Features

### Reglas de dependencias entre módulos

- **Evitar dependencias circulares:** Feature A no debe depender de Feature B si
  B ya depende de A
- **Usar Ports/Interfaces:** Para comunicación entre features, exporta interfaces
  (Ports) no implementaciones concretas
- **Readers para consultas:** Usa interfaces `Reader` para consultas
  cross-feature sin exponer repositorios completos

### Comunicación asíncrona (eventos)

Para desacoplar completamente, usa **Domain Events** o **Integration Events**:

- **Domain Events:** Dentro del mismo bounded context
- **Integration Events:** Entre bounded contexts (vía Kafka, RabbitMQ)

```text
┌─────────────┐          Event          ┌─────────────┐
│  Payments   │ ──────────────────────> │ Reservation │
│   Feature   │   PaymentConfirmed      │   Feature   │
└─────────────┘                         └─────────────┘
```

## Módulo Shared (Código Compartido)

El módulo `shared/` contiene código transversal usado por múltiples features:

```text
src/shared/
├── core/                            # Abstracciones base
│   ├── BaseEntity.ts                # Entidad base con ID
│   ├── UseCase.ts                   # Interface de casos de uso
│   ├── Result.ts / Either.ts        # Manejo de errores funcional
│   ├── DomainEvent.ts               # Eventos de dominio
│   └── config/                      # Configuraciones globales
│
├── domain/                          # Entidades compartidas
│   ├── entities/                    # Entidades usadas por múltiples features
│   └── value-objects/               # Value Objects compartidos
│
├── application/                     # Lógica compartida
│   ├── interfaces/                  # Interfaces comunes
│   └── services/                    # Servicios transversales
│
├── infrastructure/                  # Adaptadores compartidos
│   ├── adapters/
│   │   ├── app-config/              # ConfigModule (variables de entorno)
│   │   ├── database/                # TypeORM DatabaseModule
│   │   ├── logger/                  # LoggerModule (Winston)
│   │   └── exceptions-filter/       # Filtros globales de excepciones
│   ├── kafka/                       # Integración con Kafka
│   ├── pagination/                  # Helpers de paginación
│   ├── guards/                      # Guards globales (Auth, Throttler)
│   ├── decorators/                  # Decoradores compartidos
│   └── supabase/                    # Cliente Supabase
│
└── interface/                       # Interfaces compartidas
    └── dto/                         # DTOs comunes
```

### Principios para Shared

- **Solo código REALMENTE compartido:** No mover código aquí prematuramente
- **Sin lógica de negocio específica:** Debe ser genérico
- **Abstracciones estables:** Cambios en shared afectan a todas las features

## Patrones de Diseño Aplicados

### 1. Dependency Inversion Principle (DIP)

Application define interfaces (Ports), Infrastructure las implementa:

```typescript
// Application Layer - Define el contrato
export interface RestaurantRepositoryPort {
  save(restaurant: Restaurant): Promise<void>;
  findById(id: string): Promise<Restaurant | null>;
}

// Infrastructure Layer - Implementa el contrato
export class RestaurantTypeOrmRepository implements RestaurantRepositoryPort {
  save(restaurant: Restaurant): Promise<void> {
    // Implementación con TypeORM
  }
}
```

### 2. Ports & Adapters (Hexagonal Architecture)

- **Ports:** Interfaces en Application
- **Adapters:** Implementaciones en Infrastructure
- **Driving Adapters:** Controllers (entrada)
- **Driven Adapters:** Repositories, External Services (salida)

### 3. Repository Pattern

Abstrae el acceso a datos:

```typescript
// Port (Application)
interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// Adapter (Infrastructure)
class UserTypeOrmRepository implements UserRepositoryPort {
  // Implementación específica de TypeORM
}
```

### 4. Use Case Pattern

Cada acción de negocio es un caso de uso independiente:

```typescript
export class CreateRestaurantUseCase {
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly repository: RestaurantRepositoryPort,
  ) {}

  async execute(input: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
    const restaurant = Restaurant.create(input);
    await this.repository.save(restaurant);
    return { id: restaurant.id };
  }
}
```

### 5. Value Object Pattern

Encapsula validaciones en objetos inmutables:

```typescript
export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    return new Email(email);
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getValue(): string {
    return this.value;
  }
}
```

## Glosario

### Términos de arquitectura

- **Entity:** Objeto con identidad única en el negocio (Restaurant, User, Table).
  Contiene lógica de negocio y se persiste en la base de datos.
- **Value Object:** Define propiedades inmutables con reglas de validación
  (SectionWidth, Email, Price). No tiene identidad propia.
- **Use Case:** Orquesta una acción específica del negocio (CreateRestaurant,
  UpdateReservationStatus). Coordina entidades, value objects y repositorios.
- **Port:** Contrato abstracto (interface) para infraestructura
  (RestaurantRepositoryPort, PaymentGatewayPort). Define qué operaciones necesita
  la aplicación sin especificar cómo se implementan.
- **Adapter:** Implementación concreta de un port (RestaurantTypeOrmRepository,
  StripePaymentGateway). Traduce entre el dominio y tecnologías externas.
- **Aggregate:** Grupo de entidades y value objects que se tratan como una unidad
  para cambios de datos (Restaurant + Sections + Tables).
- **Domain Event:** Hecho significativo que ocurrió en el dominio
  (RestaurantCreated, ReservationConfirmed). Usado para comunicación asíncrona.
- **Bounded Context:** Límite explícito dentro del cual un modelo de dominio es
  válido y consistente.
- **Feature:** Módulo que encapsula un contexto de negocio completo con sus 4 capas.

### Términos de NestJS

- **Module:** Unidad de organización que agrupa providers, controllers y exports.
- **Provider:** Clase inyectable (services, repositories, factories).
- **Controller:** Maneja requests HTTP y delega a casos de uso.
- **Guard:** Determina si un request puede proceder (autenticación, autorización).
- **Interceptor:** Transforma o procesa requests/responses.
- **Pipe:** Transforma o valida datos de entrada.

## Recursos adicionales

### Documentación interna

- **[NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md):** Convenciones de nombrado del proyecto
- **[TOKENS_ORGANIZATION.md](./TOKENS_ORGANIZATION.md):** Organización de tokens de inyección

### Referencias externas

- [Clean Architecture (Robert C. Martin)](https://www.oreilly.com/library/view/clean-architecture/9780134494272/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/ddd/)

---

**Última actualización:** Noviembre 2025
**Mantenedores:** Equipo MesaYa
