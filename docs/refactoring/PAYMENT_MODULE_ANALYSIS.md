# Análisis y Refactorización del Módulo de Pagos

> 📋 **Fecha**: Enero 2025  
> 🎯 **Objetivo**: Identificar problemas de diseño, acoplamiento, duplicación y riesgos técnicos en el módulo de pagos

---

## Sección 1: Análisis del Contexto Recibido

### 1.1 Estructura del Módulo

```
payment/
├── payment.module.ts              # Módulo NestJS principal
├── payment.tokens.ts              # Tokens de inyección (Symbols)
├── domain/
│   ├── entities/
│   │   ├── payment.entity.ts      # Entidad de dominio con Value Objects
│   │   └── values/
│   │       └── paymentStatus.vo.ts
│   ├── enums/
│   │   ├── payment-status.enum.ts
│   │   └── payment-type.enum.ts
│   ├── errors/                    # 11 tipos de errores de dominio
│   ├── repositories/
│   │   └── payment-repository.port.ts
│   ├── services/
│   │   └── payment-domain.service.ts
│   └── types/
│       ├── payment-entity.types.ts
│       ├── payment-registration.types.ts
│       ├── paymentCreate.ts
│       └── paymentUpdate.ts
├── application/
│   ├── dtos/
│   │   ├── input/                 # CreatePaymentDto, UpdatePaymentStatusDto, etc.
│   │   ├── output/                # PaymentResponseDto, PaymentListResponseDto
│   │   └── analytics/
│   ├── mappers/
│   │   └── payment.mapper.ts      # PaymentEntityDTOMapper
│   ├── ports/
│   │   └── payment-gateway.port.ts # IPaymentGatewayPort (Stripe/Mock)
│   ├── services/
│   │   ├── payment.service.ts     # Servicio de aplicación principal
│   │   └── payment-access.service.ts # Control de acceso
│   └── use-cases/
│       ├── create-payment.use-case.ts
│       ├── delete-payment.use-case.ts
│       ├── get-all-payments.use-case.ts
│       ├── get-payment-analytics.use-case.ts
│       ├── get-payment-by-id.use-case.ts
│       └── update-payment-status.use-case.ts
├── infrastructure/
│   └── adapters/
│       ├── database/type-orm/
│       │   ├── orm/
│       │   │   └── payment.type-orm.entity.ts
│       │   ├── mappers/
│       │   └── repositories/
│       │       ├── payment-type-orm.repository.ts
│       │       └── payment-analytics-type-orm.repository.ts
│       ├── stripe/
│       │   ├── stripe.adapter.ts      # Implementación real de Stripe
│       │   └── mock-payment.adapter.ts # Mock para desarrollo
│       └── payment-ms/
│           └── payment-ms-client.service.ts # Cliente HTTP a Payment MS
└── presentation/
    ├── controllers/
    │   ├── payment-gateway.controller.ts  # API Gateway a Payment MS
    │   └── v1/
    │       ├── payments.controller.ts     # CRUD de pagos
    │       └── payment-webhook.controller.ts # Webhooks de Stripe
    ├── dto/                               # DTOs de presentación
    └── dtos/
        └── payment-gateway.dto.ts
```

### 1.2 Tecnologías y Dependencias

| Tecnología | Uso |
|------------|-----|
| **NestJS** | Framework backend con inyección de dependencias |
| **TypeORM** | ORM para PostgreSQL |
| **Stripe SDK** | Procesamiento de pagos en producción |
| **Kafka** | Eventos de pago (created, updated, webhook) |
| **class-validator** | Validación de DTOs |

### 1.3 Flujo de Pagos Identificado

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FLUJO 1: Pago interno (registro manual de pagos)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Controller → PaymentService → CreatePaymentUseCase →                        │
│   → PaymentDomainService.registerPayment() →                                │
│   → PaymentRepository.create() → PostgreSQL                                 │
│   → KafkaEmit('mesa-ya.payments.events')                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ FLUJO 2: Pago con Stripe (PaymentIntent)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PaymentGatewayController → PaymentMsClientService →                         │
│   → Payment Microservice (HTTP) → Stripe →                                  │
│   → Webhook (Stripe) → PaymentWebhookController →                           │
│   → IPaymentGatewayPort.validateWebhook() →                                 │
│   → KafkaService.emit()                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ FLUJO 3: Checkout con Payment MS externo                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PaymentGatewayController.createReservationCheckout() →                      │
│   → PaymentMsClientService.createPayment() →                                │
│   → HTTP POST to Payment Microservice →                                     │
│   → Return checkout_url to frontend                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.4 Patrones Implementados

- ✅ **Hexagonal Architecture**: domain/, application/, infrastructure/, presentation/
- ✅ **Repository Pattern**: `IPaymentRepositoryPort` abstracto
- ✅ **Adapter Pattern**: `IPaymentGatewayPort` → StripeAdapter, MockPaymentAdapter
- ✅ **Use Case Pattern**: Cada operación es un use case independiente
- ✅ **Domain Service**: Lógica de negocio en `PaymentDomainService`
- ✅ **Value Objects**: `PaymentStatusVO`, `MoneyVO`
- ⚠️ **API Gateway Pattern**: `PaymentGatewayController` + `PaymentMsClientService`

---

## Sección 2: Problemas Detectados

### 🔴 CRÍTICO 1: Duplicación de Responsabilidades de Gateway

**Ubicación**: 
- `infrastructure/adapters/stripe/stripe.adapter.ts`
- `infrastructure/adapters/payment-ms/payment-ms-client.service.ts`
- `presentation/controllers/payment-gateway.controller.ts`

**Problema**:
Existen **dos formas paralelas** de procesar pagos con Stripe:

1. **Directo via StripeAdapter**: Usa el SDK de Stripe directamente
2. **Via PaymentMsClientService**: Llama a un microservicio externo que también usa Stripe

```typescript
// StripeAdapter - directo
async createPaymentIntent(params): Promise<PaymentIntentResult> {
  return this.stripe.paymentIntents.create({ ... });
}

// PaymentMsClientService - HTTP a otro servicio
async createPayment(request): Promise<CreatePaymentMsResponse> {
  return fetch(`${this.baseUrl}/api/v1/payments`, { ... });
}
```

**Impacto**:
- Confusión sobre cuál usar
- Código duplicado para la misma funcionalidad
- El `PAYMENT_GATEWAY` token exporta StripeAdapter pero `PaymentGatewayController` usa `PaymentMsClientService`

---

### 🔴 CRÍTICO 2: PaymentService Instancia Use Cases Manualmente

**Ubicación**: `application/services/payment.service.ts` (líneas 50-75)

**Problema**:
```typescript
constructor(
  private readonly logger: ILoggerPort,
  paymentRepository: IPaymentRepositoryPort,
  paymentEntityToMapper: PaymentEntityDTOMapper,
  private readonly kafkaService: KafkaService,
  private readonly accessControl: PaymentAccessService,
) {
  // ⚠️ Instanciación manual en lugar de inyección
  this.paymentDomainService = new PaymentDomainService(paymentRepository);
  this.createPaymentUseCase = new CreatePaymentUseCase(
    this.logger,
    this.paymentDomainService,
    paymentEntityToMapper,
  );
  // ... más use cases
}
```

**Impacto**:
- Viola el principio de Inversión de Dependencias (DI)
- Difícil de testear (no se pueden mockear use cases)
- No aprovecha el container de NestJS
- Los use cases no pueden tener sus propias dependencias inyectadas

---

### 🔴 CRÍTICO 3: PaymentAccessService Accede Directamente a Repositorios de Otros Módulos

**Ubicación**: `application/services/payment-access.service.ts`

**Problema**:
```typescript
@Injectable()
export class PaymentAccessService {
  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly reservations: Repository<ReservationOrmEntity>,
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptions: Repository<SubscriptionOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {}
```

**Impacto**:
- Acoplamiento directo a la capa de infraestructura de otros módulos
- Si cambia el schema de Reservation, Payment se rompe
- Viola los límites de contexto (Bounded Contexts)
- El módulo de Payment importa TypeOrmModule.forFeature de 3 módulos externos

---

### 🟠 MEDIO 4: Carpetas dto y dtos Duplicadas en Presentation

**Ubicación**: 
- `presentation/dto/` (7 archivos)
- `presentation/dtos/` (1 archivo)

**Problema**:
```
presentation/
├── dto/
│   ├── create-payment.request.dto.ts
│   ├── payment-analytics.request.dto.ts
│   └── ... (5 más)
└── dtos/
    └── payment-gateway.dto.ts
```

**Impacto**:
- Confusión sobre dónde poner nuevos DTOs
- Inconsistencia en la estructura
- Dificultad para encontrar archivos

---

### 🟠 MEDIO 5: Falta Port para Acceso a Reservations/Subscriptions

**Ubicación**: `application/services/payment-access.service.ts`

**Problema**:
En lugar de usar ports, accede directamente a repositorios TypeORM de otros módulos.

**Solución Esperada**:
```typescript
// domain/ports/payment-target.port.ts
export abstract class IPaymentTargetPort {
  abstract getReservationOwnership(reservationId: string): Promise<ReservationOwnership | null>;
  abstract getSubscriptionOwnership(subscriptionId: string): Promise<SubscriptionOwnership | null>;
  abstract isRestaurantOwner(restaurantId: string, ownerId: string): Promise<boolean>;
}
```

---

### 🟠 MEDIO 6: TODO sin Implementar en PaymentGatewayController

**Ubicación**: `presentation/controllers/payment-gateway.controller.ts` (líneas 93-97)

**Problema**:
```typescript
// TODO: Validate that the reservation exists and belongs to the user
// const reservation = await this.reservationService.findById(dto.reservationId);
// if (!reservation || reservation.userId !== userId) {
//   throw new ForbiddenException('Invalid reservation');
// }
```

**Impacto**:
- Cualquier usuario puede crear pagos para cualquier reservación
- Vulnerabilidad de seguridad

---

### 🟡 MENOR 7: Tokens Definidos como Symbols pero No Todos Tienen Port

**Ubicación**: `payment.tokens.ts`

**Problema**:
```typescript
export const PAYMENT_ANALYTICS_REPOSITORY = Symbol('PAYMENT_ANALYTICS_REPOSITORY');
export const PAYMENT_ORM_MAPPER = Symbol('PAYMENT_ORM_MAPPER');
export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
```

El `PAYMENT_ANALYTICS_REPOSITORY` no tiene un port abstracto definido, se inyecta directamente la implementación.

---

### 🟡 MENOR 8: ORM Entity en payment.module.ts Carga Entidades de Otros Módulos

**Ubicación**: `payment.module.ts` (líneas 42-47)

**Problema**:
```typescript
TypeOrmModule.forFeature([
  PaymentOrmEntity,
  ReservationOrmEntity,    // ← De otro módulo
  SubscriptionOrmEntity,   // ← De otro módulo
  RestaurantOrmEntity,     // ← De otro módulo
]),
```

**Impacto**:
- Si otro módulo cambia su ORM entity, Payment se ve afectado
- Rompe encapsulación de módulos

---

## Sección 3: Diseño Objetivo del Módulo de Pagos

### 3.1 Arquitectura Objetivo

```
payment/
├── payment.module.ts
├── payment.tokens.ts
│
├── domain/
│   ├── entities/
│   │   ├── payment.entity.ts
│   │   └── values/
│   │       └── payment-status.vo.ts
│   ├── enums/
│   ├── errors/
│   ├── ports/                         # ← NUEVO
│   │   ├── payment-repository.port.ts # (mover desde repositories/)
│   │   └── payment-target.port.ts     # ← NUEVO: acceso a reservations/subscriptions
│   ├── services/
│   │   └── payment-domain.service.ts
│   └── types/
│
├── application/
│   ├── dto/
│   │   ├── input/
│   │   ├── output/
│   │   └── analytics/
│   ├── mappers/
│   ├── ports/
│   │   ├── payment-gateway.port.ts
│   │   └── payment-analytics.port.ts  # ← NUEVO
│   ├── services/
│   │   ├── payment.service.ts
│   │   └── payment-access.service.ts
│   └── use-cases/                      # Registrar en módulo como providers
│
├── infrastructure/
│   └── adapters/
│       ├── database/
│       ├── stripe/                     # StripeAdapter + MockPaymentAdapter
│       └── target/                     # ← NUEVO: Implementación de IPaymentTargetPort
│           └── payment-target.adapter.ts
│
└── presentation/
    ├── controllers/
    │   └── v1/
    │       ├── payments.controller.ts
    │       ├── payment-webhook.controller.ts
    │       └── payment-checkout.controller.ts # ← RENOMBRAR payment-gateway
    └── dto/                            # ← UNIFICAR (eliminar dtos/)
```

### 3.2 Decisión: ¿StripeAdapter o PaymentMsClientService?

**Recomendación**: Elegir **una sola estrategia**:

| Opción | Cuándo Usar | Acción |
|--------|-------------|--------|
| **StripeAdapter directo** | Monolito, control total | Eliminar `PaymentMsClientService` y `PaymentGatewayController` |
| **PaymentMsClientService** | Microservicios, Payment MS separado | Eliminar `StripeAdapter`, `MockPaymentAdapter` y webhook local |

Para esta guía, asumimos **opción híbrida**: usar `PAYMENT_GATEWAY` (Stripe/Mock) para webhooks y operaciones internas, y `PaymentMsClientService` para checkout (puede eliminarse si no hay MS externo).

---

## Sección 4: Guía Paso a Paso de Refactorización

### Paso 1: Crear IPaymentTargetPort en Dominio

**Archivo a crear**: `domain/ports/payment-target.port.ts`

```typescript
export interface ReservationOwnership {
  reservationId: string;
  userId: string;
  restaurantId: string;
  restaurantOwnerId: string | null;
}

export interface SubscriptionOwnership {
  subscriptionId: string;
  restaurantId: string;
  restaurantOwnerId: string | null;
}

export abstract class IPaymentTargetPort {
  abstract getReservationOwnership(
    reservationId: string,
  ): Promise<ReservationOwnership | null>;

  abstract getSubscriptionOwnership(
    subscriptionId: string,
  ): Promise<SubscriptionOwnership | null>;

  abstract isRestaurantOwner(
    restaurantId: string,
    ownerId: string,
  ): Promise<boolean>;
}
```

**Validación**: El archivo compila sin errores.

---

### Paso 2: Implementar PaymentTargetAdapter

**Archivo a crear**: `infrastructure/adapters/target/payment-target.adapter.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationOrmEntity } from '@features/reservation';
import { SubscriptionOrmEntity } from '@features/subscription';
import { RestaurantOrmEntity } from '@features/restaurants';
import {
  IPaymentTargetPort,
  ReservationOwnership,
  SubscriptionOwnership,
} from '@features/payment/domain/ports/payment-target.port';

@Injectable()
export class PaymentTargetAdapter extends IPaymentTargetPort {
  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly reservations: Repository<ReservationOrmEntity>,
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptions: Repository<SubscriptionOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {
    super();
  }

  async getReservationOwnership(
    reservationId: string,
  ): Promise<ReservationOwnership | null> {
    const reservation = await this.reservations.findOne({
      where: { id: reservationId },
      relations: ['restaurant'],
    });

    if (!reservation) return null;

    return {
      reservationId: reservation.id,
      userId: reservation.userId,
      restaurantId: reservation.restaurantId,
      restaurantOwnerId: reservation.restaurant?.ownerId ?? null,
    };
  }

  async getSubscriptionOwnership(
    subscriptionId: string,
  ): Promise<SubscriptionOwnership | null> {
    const subscription = await this.subscriptions.findOne({
      where: { id: subscriptionId },
      relations: ['restaurant'],
    });

    if (!subscription) return null;

    return {
      subscriptionId: subscription.id,
      restaurantId: subscription.restaurantId,
      restaurantOwnerId: subscription.restaurant?.ownerId ?? null,
    };
  }

  async isRestaurantOwner(
    restaurantId: string,
    ownerId: string,
  ): Promise<boolean> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId, ownerId },
    });
    return restaurant !== null;
  }
}
```

**Validación**: El archivo compila y los métodos retornan datos correctos.

---

### Paso 3: Refactorizar PaymentAccessService para Usar el Port

**Archivo a modificar**: `application/services/payment-access.service.ts`

**Cambios**:
1. Eliminar inyección directa de repositorios TypeORM
2. Inyectar `IPaymentTargetPort`
3. Usar el port para todas las consultas

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IPaymentTargetPort } from '@features/payment/domain/ports/payment-target.port';
import { PAYMENT_TARGET_PORT } from '@features/payment/payment.tokens';
// ... resto de imports

@Injectable()
export class PaymentAccessService {
  constructor(
    @Inject(PAYMENT_TARGET_PORT)
    private readonly targetPort: IPaymentTargetPort,
  ) {}

  async assertUserReservationPayment(
    dto: CreatePaymentDto,
    userId: string,
  ): Promise<void> {
    // ... validaciones
    const reservation = await this.targetPort.getReservationOwnership(dto.reservationId);
    if (!reservation) {
      throw new PaymentTargetNotFoundError('reservation', dto.reservationId);
    }
    if (reservation.userId !== userId) {
      throw new PaymentForbiddenError('Reservation does not belong to authenticated user');
    }
  }
  // ... resto de métodos usando targetPort
}
```

**Validación**: 
- `PaymentAccessService` no importa nada de TypeORM
- Las validaciones de ownership funcionan correctamente

---

### Paso 4: Agregar Token para IPaymentTargetPort

**Archivo a modificar**: `payment.tokens.ts`

```typescript
// Agregar nuevo token
export const PAYMENT_TARGET_PORT = Symbol('PAYMENT_TARGET_PORT');
```

**Validación**: El token se exporta correctamente.

---

### Paso 5: Registrar Use Cases como Providers Inyectables

**Archivos a modificar**: Cada use case en `application/use-cases/`

Ejemplo para `create-payment.use-case.ts`:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
// ...

@Injectable()
export class CreatePaymentUseCase implements UseCase<CreatePaymentDto, PaymentDto> {
  constructor(
    @Inject(LOGGER) private readonly logger: ILoggerPort,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly paymentMapper: PaymentEntityDTOMapper,
  ) {}
  // ... execute()
}
```

Repetir para todos los use cases.

**Validación**: Los use cases tienen `@Injectable()`.

---

### Paso 6: Refactorizar PaymentService para Inyectar Use Cases

**Archivo a modificar**: `application/services/payment.service.ts`

```typescript
@Injectable()
export class PaymentService {
  constructor(
    @Inject(LOGGER) private readonly logger: ILoggerPort,
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentByIdUseCase: GetPaymentByIdUseCase,
    private readonly getAllPaymentsUseCase: GetAllPaymentsUseCase,
    private readonly updatePaymentStatusUseCase: UpdatePaymentStatusUseCase,
    private readonly deletePaymentUseCase: DeletePaymentUseCase,
    private readonly kafkaService: KafkaService,
    private readonly accessControl: PaymentAccessService,
    private readonly paymentRepository: IPaymentRepositoryPort,
    private readonly paymentMapper: PaymentEntityDTOMapper,
  ) {}
  // Eliminar instanciación manual
}
```

**Validación**: El servicio no tiene `new UseCaseXxx()`.

---

### Paso 7: Actualizar payment.module.ts

**Archivo a modificar**: `payment.module.ts`

Cambios principales:
1. Registrar `IPaymentTargetPort` con `PaymentTargetAdapter`
2. Registrar use cases como providers
3. Simplificar factory de `PaymentService`

```typescript
import { PAYMENT_TARGET_PORT } from './payment.tokens';
import { PaymentTargetAdapter } from './infrastructure/adapters/target/payment-target.adapter';
import {
  CreatePaymentUseCase,
  GetPaymentByIdUseCase,
  // ... otros use cases
} from './application/use-cases';

@Module({
  providers: [
    // Target Port
    {
      provide: PAYMENT_TARGET_PORT,
      useClass: PaymentTargetAdapter,
    },
    // Domain Service
    {
      provide: PaymentDomainService,
      useFactory: (repo: IPaymentRepositoryPort) => new PaymentDomainService(repo),
      inject: [IPaymentRepositoryPort],
    },
    // Use Cases (ahora inyectables)
    CreatePaymentUseCase,
    GetPaymentByIdUseCase,
    GetAllPaymentsUseCase,
    UpdatePaymentStatusUseCase,
    DeletePaymentUseCase,
    // Services
    PaymentAccessService,
    PaymentService,
    // ... resto
  ],
})
```

**Validación**: El módulo compila y arranca sin errores.

---

### Paso 8: Unificar Carpetas dto/ y dtos/ en Presentation

**Acciones**:
1. Mover `presentation/dtos/payment-gateway.dto.ts` → `presentation/dto/payment-gateway.dto.ts`
2. Eliminar carpeta `presentation/dtos/`
3. Actualizar imports en `payment-gateway.controller.ts`

**Validación**: No existen carpetas duplicadas.

---

### Paso 9: Implementar Validación en PaymentGatewayController

**Archivo a modificar**: `presentation/controllers/payment-gateway.controller.ts`

Reemplazar el TODO con validación real:

```typescript
@Post('reservations/checkout')
async createReservationCheckout(
  @Body() dto: CreateReservationPaymentDto,
  @Req() req: AuthenticatedRequest,
): Promise<PaymentCreatedResponseDto> {
  const userId = req.user?.sub;

  if (!userId) {
    throw new UnauthorizedException('User not authenticated');
  }

  // Validar que la reservación existe y pertenece al usuario
  await this.accessControl.assertUserReservationPayment(
    { reservationId: dto.reservationId, amount: dto.amount },
    userId,
  );

  // ... resto del código
}
```

**Validación**: Crear pago para reservación ajena retorna 403.

---

### Paso 10: Mover payment-repository.port.ts a domain/ports/

**Acciones**:
1. Mover `domain/repositories/payment-repository.port.ts` → `domain/ports/payment-repository.port.ts`
2. Actualizar `domain/index.ts`
3. Eliminar `domain/repositories/` si queda vacío

**Validación**: Los imports funcionan correctamente.

---

## Sección 5: Checklist de Validación

### Después de Cada Paso

- [ ] El proyecto compila sin errores (`npm run build`)
- [ ] Los tests existentes pasan (`npm run test`)
- [ ] El módulo arranca (`npm run start:dev`)

### Validación del Flujo de Pagos

#### Flujo 1: Crear Pago de Reservación (Usuario)

```bash
# 1. Autenticar como usuario
POST /auth/login → token

# 2. Crear pago (debe validar ownership)
POST /v1/payments
Authorization: Bearer <token>
{
  "reservationId": "<reservation-del-usuario>",
  "amount": 50.00
}

# Esperado: 201 Created si es su reservación, 403 si no
```

#### Flujo 2: Webhook de Stripe

```bash
# Simular webhook
POST /v1/payments/webhook/stripe
stripe-signature: <signature>
Body: { "type": "payment_intent.succeeded", ... }

# Esperado: 200 OK, evento publicado a Kafka
```

#### Flujo 3: Checkout (si se usa Payment MS)

```bash
POST /payment-gateway/reservations/checkout
Authorization: Bearer <token>
{
  "reservationId": "<id>",
  "amount": 100
}

# Esperado: checkout_url válida o 403 si no es owner
```

### Verificaciones de Arquitectura

- [ ] `PaymentAccessService` no importa nada de `@nestjs/typeorm`
- [ ] `PaymentService` no tiene `new UseCase()` 
- [ ] No existe carpeta `presentation/dtos/`
- [ ] `payment.module.ts` no usa `useFactory` para `PaymentService`
- [ ] Todos los use cases tienen `@Injectable()`

---

## Sección 6: Comentario Final sobre el Impacto

### Resumen de Cambios

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Acoplamiento** | PaymentAccessService → TypeORM de 3 módulos | PaymentAccessService → IPaymentTargetPort |
| **Testabilidad** | Use cases no mockeables | Use cases inyectables |
| **Estructura** | dto/ + dtos/ duplicados | dto/ unificado |
| **Seguridad** | TODO sin validación | Validación de ownership implementada |
| **DI** | Instanciación manual en PaymentService | Inyección via NestJS container |

### Riesgos Mitigados

1. **Cambios en otros módulos**: Al usar ports, Payment no se rompe si cambia el schema de Reservation
2. **Vulnerabilidad de seguridad**: Ahora se valida ownership antes de crear pagos
3. **Dificultad de testing**: Use cases ahora son mockeables para unit tests

### Esfuerzo Estimado

| Paso | Complejidad | Tiempo |
|------|-------------|--------|
| 1-2: Crear IPaymentTargetPort + Adapter | Media | 1h |
| 3-4: Refactorizar PaymentAccessService | Media | 1h |
| 5-6: Inyectar Use Cases | Alta | 2h |
| 7: Actualizar Module | Media | 1h |
| 8: Unificar dto/ | Baja | 15min |
| 9: Validación en Controller | Media | 30min |
| 10: Mover repository port | Baja | 15min |
| **Total** | | **~6h** |

### Decisiones Pendientes

1. **¿Eliminar PaymentMsClientService?**: Si no existe Payment MS externo, eliminar para reducir confusión
2. **¿Crear IPaymentAnalyticsPort?**: Para abstraer `PAYMENT_ANALYTICS_REPOSITORY`
3. **¿Migrar PaymentGatewayController a v1/?**: Para consistencia de versionado

Esta refactorización mejora significativamente la mantenibilidad y testabilidad del módulo sin cambiar la funcionalidad visible para el usuario.

---

## Estado de Implementación

> 📅 **Última actualización**: Enero 2025

### Pasos Completados

| # | Paso | Estado | Archivos Modificados |
|---|------|--------|---------------------|
| 1 | Crear IPaymentTargetPort | ✅ Completado | `domain/ports/payment-target.port.ts` |
| 2 | Crear PaymentTargetAdapter | ✅ Completado | `infrastructure/adapters/target/payment-target.adapter.ts` |
| 3 | Refactorizar PaymentAccessService | ✅ Completado | `application/services/payment-access.service.ts` |
| 4 | Agregar token PAYMENT_TARGET_PORT | ✅ Completado | `payment.tokens.ts` |
| 5 | Actualizar payment.module.ts | ✅ Completado | `payment.module.ts` |
| 6 | Convertir use cases a @Injectable | ✅ Completado | `application/use-cases/*.ts`, `domain/services/payment-domain.service.ts` |
| 7 | Refactorizar PaymentService | ✅ Completado | `application/services/payment.service.ts` |
| 8 | Unificar carpetas dto/dtos | ✅ Completado | `presentation/dto/`, eliminado `presentation/dtos/` |
| 9 | Corregir TODO en controller | ✅ Completado | `presentation/controllers/payment-gateway.controller.ts` |
| 10 | Mover IPaymentGatewayPort | ✅ Completado | Movido a `domain/ports/payment-gateway.port.ts` |

### Cambios Realizados

#### Nuevos Archivos Creados
- `domain/ports/payment-target.port.ts` - Puerto abstracto para acceso a datos externos
- `infrastructure/adapters/target/payment-target.adapter.ts` - Implementación TypeORM del puerto

#### Archivos Modificados
- `payment.tokens.ts` - Agregado `PAYMENT_TARGET_PORT`
- `payment.module.ts` - Registrados todos los use cases como providers @Injectable
- `application/services/payment-access.service.ts` - Usa IPaymentTargetPort en lugar de repos directos
- `application/services/payment.service.ts` - Recibe use cases inyectados
- `application/use-cases/*.ts` - Todos ahora tienen @Injectable y @Inject(LOGGER)
- `domain/services/payment-domain.service.ts` - Ahora es @Injectable
- `presentation/dto/index.ts` - Exporta payment-gateway.dto.ts
- `presentation/controllers/payment-gateway.controller.ts` - Implementada validación de ownership

#### Archivos Eliminados
- `presentation/dtos/` - Carpeta eliminada, contenido movido a `presentation/dto/`

### Checklist Post-Implementación

- [x] `PaymentAccessService` no inyecta repositorios de otros módulos directamente
- [x] `PaymentService.constructor` no usa `new PaymentDomainService(...)`
- [x] Todos los use cases tienen `@Injectable()` decorator
- [x] `PaymentGatewayController` valida ownership antes de crear pagos
- [x] `IPaymentGatewayPort` está en `domain/ports/`
- [x] No existe carpeta `presentation/dtos/` (solo `dto/`)
- [x] `payment.module.ts` no usa `useFactory` para `PaymentService`
