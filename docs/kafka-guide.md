# Guía completa de Kafka en MesaYa

Esta guía documenta al detalle cómo está integrada la mensajería con Apache Kafka en MesaYa. Aquí encontrarás los componentes disponibles, los pasos de configuración, ejemplos de uso de productores y consumidores, y buenas prácticas para mantener la integración al 10000000%.

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

### Kafka topics

Definidos en `kafka.topics.ts` y exportados vía `shared/infrastructure/kafka/index.ts`.

```ts
export const KAFKA_TOPICS = {
  REVIEW_CREATED: 'mesa-ya.reviews.created',
  REVIEW_UPDATED: 'mesa-ya.reviews.updated',
  REVIEW_DELETED: 'mesa-ya.reviews.deleted',
  RESTAURANT_CREATED: 'mesa-ya.restaurants.created',
  RESTAURANT_UPDATED: 'mesa-ya.restaurants.updated',
  RESTAURANT_DELETED: 'mesa-ya.restaurants.deleted',
  SECTION_CREATED: 'mesa-ya.sections.created',
  SECTION_UPDATED: 'mesa-ya.sections.updated',
  SECTION_DELETED: 'mesa-ya.sections.deleted',
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

### Emisión declarativa con `@KafkaEmit`

```ts
@KafkaEmit({
  topic: KAFKA_TOPICS.REVIEW_CREATED,
  payload: ({ args, result, toPlain }) => {
    const [command] = args as [CreateReviewCommand];
    return {
      action: 'review.created',
      entity: toPlain(result),
      performedBy: command.userId,
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

- Cada evento incluye al menos: `action`, `entity` (o `entityId`), `timestamp` y metadatos relevantes (`performedBy`, `result`, etc.).
- Usa `toPlain` para transformar entidades/DTOs en objetos simples sin prototipos de clase ni fechas crudas.
- Mantén backward compatibility: si introduces campos nuevos, hazlos opcionales y documenta el cambio.

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
