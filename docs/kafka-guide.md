## Nuevos endpoints de analytics (Auth)

Se añadieron endpoints para obtener analytics de usuarios con distintos scopes:

- Public: GET /public/users/analytics
  - Query params: startDate, endDate, role, active, restaurantId
  - Responde: summary + registrations (no roles/permissions) — DTO: `PublicAuthAnalyticsResponseDto`

- Public profile: GET /public/users/:id
  - Responde: perfil público de usuario (DTO: `AuthUserResponseDto`)
- Restaurant-scoped analytics (propietarios/admins): GET /restaurant/users/analytics/restaurant/:restaurantId
  - Auth: JWT + permission `restaurant:read` (se puede ajustar)
  - Query params: startDate, endDate, role, active
  - Comportamiento: filtra usuarios que tienen al menos una reserva en `restaurantId`.

Ejemplo de request público de analytics:
GET /public/users/analytics?startDate=2025-01-01&endDate=2025-01-31

Ejemplo de request restaurant-scoped (autenticado):

GET /restaurant/users/analytics/restaurant/d290f1ee-6c54-4b01-90e6-d701748f0851?role=OWNER
Nota: `restaurantId` en los query params también puede usarse en el endpoint público para obtener agregados filtrados por restaurante; internamente se realiza un JOIN con la tabla `reservation` para contar usuarios distintos con reservas en ese restaurante.

# Guía completa de Kafka en MesaYa

Esta guía documenta al detalle cómo está integrada la mensajería con Apache Kafka en MesaYa. Aquí encontrarás los componentes disponibles, los pasos de configuración, ejemplos de uso de productores y consumidores, y buenas prácticas para mantener la integración estable y confiable.

## Visión general

La infraestructura Kafka vive en `src/shared/infrastructure/kafka` y se compone de:

- **KafkaModule**: módulo global de Nest que expone el servicio y explora los consumidores decorados.
- **KafkaService**: gateway centralizado que gestiona productor, servidores de consumidores y operaciones `emit`/`send`.
- **Decoradores**: utilidades para inyectar el servicio (`@KafkaProducer()`), registrar consumidores (`@KafkaConsumer()`) y emitir eventos declarativamente (`@KafkaEmit()`).
- **KafkaConsumerExplorer**: escanea los providers de Nest y registra automáticamente los métodos decorados como consumidores.
- **Tópicos normalizados**: definidos en `kafka.topics.ts` para mantener un naming consistente.

La meta es habilitar eventos de dominio desacoplados, reutilizables por cualquier feature sin romper la arquitectura limpia.

## Configuración requerida

Variables de entorno validadas al inicio (ver `shared/core/config/joi.validation.ts`):

| Variable          | Descripción                                         | Ejemplo             |
| ----------------- | --------------------------------------------------- | ------------------- |
| `KAFKA_BROKER`    | Lista de brokers separados por coma                 | `localhost:9092`    |
| `KAFKA_CLIENT_ID` | Identificador del cliente Kafka (opcional, default) | `mesa-ya`           |
| `KAFKA_GROUP_ID`  | Grupo consumidor por defecto                        | `mesa-ya-consumers` |

El módulo utiliza `ConfigService` para leer estos valores. Si `KAFKA_BROKER` o `KAFKA_GROUP_ID` no están configurados, la app falla durante el bootstrap para evitar estados inconsistentes.

## Componentes clave

### KafkaService

Ubicación: `shared/infrastructure/kafka/kafka.service.ts`

Funciones principales:

- Gestiona una única instancia de productor (`ClientKafka`), conectada bajo demanda.
- Administra servidores de consumidores (`ServerKafka`) agrupados por `groupId`.
- Expone `emit(topic, payload)` y `send(topic, payload)` (request/response).
- Permite registrar definiciones de consumidor en memoria y las inicializa durante `onApplicationBootstrap`.
- Serializa/limpia los payloads antes de enviarlos y asegura logs en caso de errores.

### Decoradores

- `@KafkaProducer()`: inyecta `KafkaService` vía DI manteniendo la capa de aplicación limpia.
- `@KafkaConsumer(topic, groupId?)`: añade metadatos para que el explorer registre el método como handler del tópico indicado.
- `@KafkaEmit({ topic, payload, includeTimestamp })`: envuelve métodos asincrónicos, ejecuta el caso de uso original y emite el evento correspondiente de forma automática. `payload` recibe `{ result, args, instance, toPlain }`.
- `toKafkaPlain`: helper reutilizable para forzar serialización a JSON plano.

### KafkaConsumerExplorer

- Se ejecuta en `onApplicationBootstrap`.
- Recorre los providers usando `DiscoveryService` y `MetadataScanner`.
- Por cada método decorado con `@KafkaConsumer` agrega la definición al `KafkaService`.
- Invoca `initializeConsumers()` para levantar los servidores necesarios.

### Kafka topics (Optimizado v2.0)

Definidos en `kafka.topics.ts` y exportados vía `shared/infrastructure/kafka/index.ts`.

**DISEÑO OPTIMIZADO:**

- Un tópico por dominio (agregado) en lugar de uno por acción
- El tipo de evento se especifica en el payload con `event_type`
- Eventos efímeros (selecting/released) van por WebSocket, no Kafka
- Naming convention: `mesa-ya.{domain}.events`

```ts
export const EVENT_TYPES = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  STATUS_CHANGED: 'status_changed',
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  ROLES_UPDATED: 'roles_updated',
  PERMISSIONS_UPDATED: 'permissions_updated',
} as const;

export const KAFKA_TOPICS = {
  RESTAURANTS: 'mesa-ya.restaurants.events',
  SECTIONS: 'mesa-ya.sections.events',
  TABLES: 'mesa-ya.tables.events',
  OBJECTS: 'mesa-ya.objects.events',
  SECTION_OBJECTS: 'mesa-ya.section-objects.events',
  MENUS: 'mesa-ya.menus.events',           // Incluye dishes con entity_subtype: 'dish'
  REVIEWS: 'mesa-ya.reviews.events',
  IMAGES: 'mesa-ya.images.events',
  RESERVATIONS: 'mesa-ya.reservations.events',
  PAYMENTS: 'mesa-ya.payments.events',
  SUBSCRIPTIONS: 'mesa-ya.subscriptions.events', // Incluye plans con entity_subtype: 'plan'
  AUTH: 'mesa-ya.auth.events',
  OWNER_UPGRADE: 'mesa-ya.owner-upgrade.events',
} as const;
```

**Payload estándar:**

```json
{
  "event_type": "created",
  "entity_id": "uuid-123",
  "entity_subtype": "dish",     // opcional, para sub-entidades
  "timestamp": "2025-12-11T10:30:00.000Z",
  "data": { ... },
  "metadata": {
    "user_id": "user-456",
    "correlation_id": "corr-789"
  }
}
```

**Eventos efímeros (WebSocket only, NO Kafka):**

```ts
export const WEBSOCKET_ONLY_EVENTS = {
  TABLE_SELECTING: 'tables.selecting',
  TABLE_RELEASED: 'tables.released',
  CONNECTION_HEARTBEAT: 'system.heartbeat',
} as const;
```

> Usa siempre estas constantes para evitar typos y garantizar estabilidad en los contratos.

## Cómo producir eventos

### Inyección con `@KafkaProducer()`

```ts
@Injectable()
export class ReviewsService {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}
}
```

### Emisión declarativa con `@KafkaEmit` (v2.0)

```ts
@KafkaEmit({
  topic: KAFKA_TOPICS.REVIEWS,
  payload: ({ result, args, toPlain }) => {
    const [command] = args as [CreateReviewCommand];
    const entity = toPlain(result);
    return {
      event_type: EVENT_TYPES.CREATED,
      entity_id: (entity as { id?: string }).id ?? '',
      data: entity,
      metadata: { user_id: command.userId },
    };
  },
})
async create(command: CreateReviewCommand) {
  return this.createReviewUseCase.execute(command);
}
```

Ventajas:

- No repites boilerplate para `emit` ni `try/catch` en cada método.
- Puedes centralizar la estructura del mensaje en una sola función.
- El decorador añade automáticamente una marca de tiempo (`timestamp`) si no está presente.

### Alternativa manual

Si necesitas control total (casos muy específicos) puedes llamar directamente al servicio:

## Catálogo de eventos por servicio (v2.0)

La tabla resume los eventos emitidos automáticamente por cada servicio de aplicación. Todos usan el nuevo esquema unificado con `event_type` en el payload.

| Servicio                  | Método                  | Tópico                            | `event_type`         | `entity_subtype` | Retorno                             |
| ------------------------- | ----------------------- | --------------------------------- | -------------------- | ---------------- | ----------------------------------- |
| `AuthService`             | `signup`                | `mesa-ya.auth.events`             | `user_signed_up`     | -                | `AuthTokenResponse`                 |
| `AuthService`             | `login`                 | `mesa-ya.auth.events`             | `user_logged_in`     | -                | `AuthTokenResponse`                 |
| `AuthService`             | `updateUserRoles`       | `mesa-ya.auth.events`             | `roles_updated`      | -                | `AuthUser`                          |
| `AuthService`             | `updateRolePermissions` | `mesa-ya.auth.events`             | `permissions_updated`| -                | `AuthRole`                          |
| `PaymentService`          | `createPayment`         | `mesa-ya.payments.events`         | `created`            | -                | `PaymentResponseDto`                |
| `PaymentService`          | `updatePaymentStatus`   | `mesa-ya.payments.events`         | `status_changed`     | -                | `PaymentResponseDto`                |
| `PaymentService`          | `deletePayment`         | `mesa-ya.payments.events`         | `deleted`            | -                | `DeletePaymentResponseDto`          |
| `ReservationService`      | `create`                | `mesa-ya.reservations.events`     | `created`            | -                | `ReservationResponseDto`            |
| `ReservationService`      | `update`                | `mesa-ya.reservations.events`     | `updated`            | -                | `ReservationResponseDto`            |
| `ReservationService`      | `delete`                | `mesa-ya.reservations.events`     | `deleted`            | -                | `DeleteReservationResponseDto`      |
| `RestaurantsService`      | `create`                | `mesa-ya.restaurants.events`      | `created`            | -                | `RestaurantResponseDto`             |
| `RestaurantsService`      | `update`                | `mesa-ya.restaurants.events`      | `updated`            | -                | `RestaurantResponseDto`             |
| `RestaurantsService`      | `updateStatus`          | `mesa-ya.restaurants.events`      | `status_changed`     | -                | `RestaurantResponseDto`             |
| `RestaurantsService`      | `delete`                | `mesa-ya.restaurants.events`      | `deleted`            | -                | `DeleteRestaurantResponseDto`       |
| `ReviewsService`          | `create`                | `mesa-ya.reviews.events`          | `created`            | -                | `ReviewResponseDto`                 |
| `ReviewsService`          | `update`                | `mesa-ya.reviews.events`          | `updated`            | -                | `ReviewResponseDto`                 |
| `ReviewsService`          | `moderate`              | `mesa-ya.reviews.events`          | `updated`            | -                | `ReviewResponseDto`                 |
| `ReviewsService`          | `delete`                | `mesa-ya.reviews.events`          | `deleted`            | -                | `DeleteReviewResponseDto`           |
| `SectionObjectsService`   | `create`                | `mesa-ya.section-objects.events`  | `created`            | -                | `SectionObjectResponseDto`          |
| `SectionObjectsService`   | `update`                | `mesa-ya.section-objects.events`  | `updated`            | -                | `SectionObjectResponseDto`          |
| `SectionObjectsService`   | `delete`                | `mesa-ya.section-objects.events`  | `deleted`            | -                | `DeleteSectionObjectResponseDto`    |
| `SectionsService`         | `create`                | `mesa-ya.sections.events`         | `created`            | -                | `SectionResponseDto`                |
| `SectionsService`         | `update`                | `mesa-ya.sections.events`         | `updated`            | -                | `SectionResponseDto`                |
| `SectionsService`         | `delete`                | `mesa-ya.sections.events`         | `deleted`            | -                | `DeleteSectionResponseDto`          |
| `SubscriptionService`     | `create`                | `mesa-ya.subscriptions.events`    | `created`            | `subscription`   | `SubscriptionResponseDto`           |
| `SubscriptionService`     | `update`                | `mesa-ya.subscriptions.events`    | `updated`            | `subscription`   | `SubscriptionResponseDto`           |
| `SubscriptionService`     | `updateState`           | `mesa-ya.subscriptions.events`    | `status_changed`     | `subscription`   | `SubscriptionResponseDto`           |
| `SubscriptionService`     | `delete`                | `mesa-ya.subscriptions.events`    | `deleted`            | `subscription`   | `DeleteSubscriptionResponseDto`     |
| `SubscriptionPlanService` | `create`                | `mesa-ya.subscriptions.events`    | `created`            | `plan`           | `SubscriptionPlanResponseDto`       |
| `SubscriptionPlanService` | `update`                | `mesa-ya.subscriptions.events`    | `updated`            | `plan`           | `SubscriptionPlanResponseDto`       |
| `SubscriptionPlanService` | `delete`                | `mesa-ya.subscriptions.events`    | `deleted`            | `plan`           | `DeleteSubscriptionPlanResponseDto` |
| `MenuService`             | `create`                | `mesa-ya.menus.events`            | `created`            | `menu`           | `MenuResponseDto`                   |
| `MenuService`             | `update`                | `mesa-ya.menus.events`            | `updated`            | `menu`           | `MenuResponseDto`                   |
| `MenuService`             | `delete`                | `mesa-ya.menus.events`            | `deleted`            | `menu`           | `DeleteMenuResponseDto`             |
| `DishService`             | `create`                | `mesa-ya.menus.events`            | `created`            | `dish`           | `DishResponseDto`                   |
| `DishService`             | `update`                | `mesa-ya.menus.events`            | `updated`            | `dish`           | `DishResponseDto`                   |
| `DishService`             | `delete`                | `mesa-ya.menus.events`            | `deleted`            | `dish`           | `DeleteDishResponseDto`             |
| `TablesService`           | `create`                | `mesa-ya.tables.events`           | `created`            | -                | `TableResponseDto`                  |
| `TablesService`           | `update`                | `mesa-ya.tables.events`           | `updated`            | -                | `TableResponseDto`                  |
| `TablesService`           | `delete`                | `mesa-ya.tables.events`           | `deleted`            | -                | `DeleteTableResponseDto`            |
| `ObjectsService`          | `create`                | `mesa-ya.objects.events`          | `created`            | -                | `GraphicObjectResponseDto`          |
| `ObjectsService`          | `update`                | `mesa-ya.objects.events`          | `updated`            | -                | `GraphicObjectResponseDto`          |
| `ObjectsService`          | `delete`                | `mesa-ya.objects.events`          | `deleted`            | -                | `DeleteGraphicObjectResponseDto`    |
| `OwnerUpgradeService`     | `process`               | `mesa-ya.owner-upgrade.events`    | `status_changed`     | -                | `OwnerUpgradeResponseDto`           |

**Nota:** Los eventos efímeros `selectTable` y `releaseTable` de `TablesService` **ya no usan Kafka**. Van directamente por WebSocket para baja latencia.

```ts
await this.kafkaService.emit(KAFKA_TOPICS.REVIEW_CREATED, payload);
```

Para mantener coherencia, limita esta modalidad a escenarios excepcionales.

## Cómo consumir eventos

1. Crea un provider o servicio y decora el método con `@KafkaConsumer`.

```ts
@Injectable()
export class ReviewEventsHandler {
  @KafkaConsumer(KAFKA_TOPICS.REVIEW_CREATED)
  async handleReviewCreated(payload: unknown, context: KafkaContext) {
    // Procesa el mensaje
  }
}
```

2. Asegúrate de que el provider se registre dentro de un módulo importado por la aplicación (Nest lo detectará).

3. Opcional: especifica `groupId` para aislar consumidores. Si no lo haces, usa el `KAFKA_GROUP_ID` por defecto.

> Tip: utiliza DTOs o zod schemas para validar `payload` dentro del handler.

## Estrategia de payloads

- Cada evento incluye al menos: `action`, `entity` (para create/update/delete), `entityId` cuando aplica, `timestamp` y metadatos relevantes (`performedBy`, etc.).
- Las operaciones de eliminación publican la entidad completa tal y como existía antes de borrarla. Esto permite a los consumidores reconstruir el estado sin hacer llamadas adicionales.
- Usa `toPlain` para transformar entidades/DTOs en objetos simples sin prototipos de clase ni fechas crudas.
- Mantén backward compatibility: si introduces campos nuevos, hazlos opcionales y documenta el cambio.

```json
{
  "action": "restaurant.deleted",
  "entityId": "rest-123",
  "entity": {
    "id": "rest-123",
    "name": "MesaYa Centro",
    "ownerId": "owner-456",
    "status": "inactive"
  },
  "performedBy": "owner-456",
  "timestamp": "2025-10-12T23:59:59.000Z"
}
```

### Qué se emite en cada operación

| Operación | `action`                    | Cuerpo principal (`entity`)                                                     | Metadatos adicionales                                                         |
| --------- | --------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Create    | `mesa-ya.<feature>.created` | Entidad recién persistida (DTO de respuesta del caso de uso)                    | `performedBy` cuando la acción depende de un usuario (p. ej. ownerId, userId) |
| Update    | `mesa-ya.<feature>.updated` | Entidad resultante tras aplicar los cambios                                     | `performedBy`, `entityId` si el caso de uso recibe un identificador explícito |
| Delete    | `mesa-ya.<feature>.deleted` | Snapshot completo de la entidad antes de su eliminación (`entity` + `entityId`) | `performedBy` cuando aplica                                                   |

**Ejemplos completos (restaurant):**

```json
{
  "action": "restaurant.created",
  "entity": {
    "id": "rest-123",
    "name": "MesaYa Centro",
    "ownerId": "owner-456",
    "status": "active",
    "createdAt": "2025-10-12T10:00:00.000Z",
    "updatedAt": "2025-10-12T10:00:00.000Z"
  },
  "performedBy": "owner-456",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

```json
{
  "action": "restaurant.updated",
  "entityId": "rest-123",
  "entity": {
    "id": "rest-123",
    "name": "MesaYa Centro",
    "ownerId": "owner-456",
    "status": "inactive",
    "createdAt": "2025-10-12T10:00:00.000Z",
    "updatedAt": "2025-10-13T09:30:15.000Z"
  },
  "performedBy": "owner-456",
  "timestamp": "2025-10-13T09:30:15.000Z"
}
```

```json
{
  "action": "restaurant.deleted",
  "entityId": "rest-123",
  "entity": {
    "id": "rest-123",
    "name": "MesaYa Centro",
    "ownerId": "owner-456",
    "status": "inactive",
    "createdAt": "2025-10-12T10:00:00.000Z",
    "updatedAt": "2025-10-13T09:30:15.000Z"
  },
  "performedBy": "owner-456",
  "timestamp": "2025-10-14T08:45:00.000Z"
}
```

**Secuencia interna del decorador `@KafkaEmit`:**

1. Ejecuta el método original (caso de uso / servicio) y captura el resultado (`result`).
2. Construye el payload con la función `payload` definida en el servicio. Ahí se recibe:
   - `result`: salida del método (los delete incluyen `{ ok, entity }`).
   - `args`: parámetros originales (útil para tomar IDs o usuarios ejecutores).
   - `toPlain`: helper que serializa DTOs y entidades a JSON plano.
3. Añade `timestamp` ISO8601 si el payload aún no lo trae.
4. Serializa el mensaje (internamente usa `JSON.parse(JSON.stringify(...))` para remover símbolos, fechas y prototypes).
5. Publica el evento vía `KafkaService.emit(topic, payload)` y registra cualquier error en el `Logger` del contexto sin interrumpir la respuesta HTTP.

> Gracias al snapshot incluido en `entity`, los consumidores pueden procesar eventos de eliminación sin consultas adicionales a la base de datos.

## Manejo de errores y resiliencia

- `KafkaEmit` atrapa cualquier error al construir o enviar el payload y los escribe en el `Logger` del contexto (o crea uno nuevo con el nombre de la clase).
- Si Kafka no está disponible, el endpoint HTTP sigue respondiendo con éxito para no bloquear la operación principal. Revisa los logs para detectar los fallos y aplica reintentos fuera del request (ej. workers o dead letter queues).
- El `KafkaService` limpia recursos durante `onModuleDestroy`, cerrando productor y consumidores correctamente.

## Testing

- **Unit tests**: mockea `KafkaService` para verificar que los payload builders retornan la estructura correcta. Puedes stubear el método `emit` y asegurarte de que se llame con el topic esperado.
- **Integration tests**: levanta un broker Kafka (por ejemplo usando `docker-compose`) y verifica que los mensajes llegan al topic correcto. Usa librerías como `kafkajs` para consumirlos dentro del test.
- **Contract tests**: define el esquema del evento (OpenAPI/AsyncAPI/JSON Schema) y valida que el payload emitido lo cumpla.

## Checklist para nuevas features

1. **Definir tópicos**: añade la constante en `kafka.topics.ts` siguiendo el patrón `mesa-ya.<feature>.<evento>`.
2. **Configurar permisos**: garantiza que el componente tenga acceso a `KafkaModule` (importa el módulo si aún no lo hace).
3. **Emitir eventos**: aplica `@KafkaEmit` en los métodos relevantes y documenta los campos del payload.
4. **Consumir eventos** (opcional): crea un handler con `@KafkaConsumer`, valida entrada y maneja errores.
5. **Documentar**: añade la descripción del evento y payload al README de la feature o al catálogo de eventos.
6. **Pruebas**: cubre casos exitosos y fallidos para los builders de payload y handlers.

## Diagnóstico y monitoreo

- `KafkaService` loguea cada conexión de productor y arranque de consumidor (`Kafka producer connected...`, `Kafka consumer ready...`).
- Ante errores de emisión o construcción de payload, revisa los logs con el contexto `<Clase>.error`.
- Considera añadir métricas (ej. Prometheus) envolviendo `KafkaService` para contar eventos enviados/errores.

## Referencias cruzadas

- **Código**: `src/shared/infrastructure/kafka/*`.
- **Uso en features**:
  - `reviews/application/services/reviews.service.ts`
  - `restaurants/application/services/restaurants.service.ts`
  - `sections/application/services/sections.service.ts`
- **Documentación complementaria**: sección "Integración con Kafka" en `docs/ARCHITECTURE.md`.

Con esta guía puedes incorporar o extender la mensajería Kafka de manera uniforme, evitando duplicar código y manteniendo los estándares de MesaYa.
