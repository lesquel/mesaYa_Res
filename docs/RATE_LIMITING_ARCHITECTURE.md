# Arquitectura del Rate Limiting

## 📐 Separación de Responsabilidades

La implementación de rate limiting sigue el principio de **Separación de Responsabilidades (SoC)** y está modularizada en diferentes capas:

```plaintext
src/
├── shared/
│   ├── core/
│   │   └── config/
│   │       ├── throttler.config.ts         # Configuración del módulo
│   │       └── throttler-limits.config.ts  # Límites por tipo de endpoint
│   └── infrastructure/
│       ├── guards/
│       │   └── throttler-behind-proxy.guard.ts  # Lógica de extracción de IP
│       └── decorators/
│           └── throttle.decorator.ts            # Decoradores helper
└── app.module.ts                           # Integración global
```

## 🎯 Responsabilidades por Archivo

### 1. `throttler.config.ts` (Core/Config)

**Responsabilidad:** Configuración global del módulo `ThrottlerModule`

```typescript
// Define los throttlers globales que se aplican a TODAS las peticiones
export const THROTTLER_CONFIG: ThrottlerModuleOptions = {
  throttlers: [
  { name: 'short', ttl: 1000, limit: 3 },   // Anti-burst (ráfaga)
    { name: 'medium', ttl: 10000, limit: 20 }, // Control medio plazo
    { name: 'long', ttl: 60000, limit: 100 },  // Control largo plazo
  ],
};
```

**Propósito:**

- Define límites base para toda la aplicación
- Protección contra ráfagas de peticiones
- Se importa en `app.module.ts`

---

### 2. `throttler-limits.config.ts` (Core/Config)

**Responsabilidad:** Definir límites específicos por tipo de endpoint

```typescript
export interface ThrottlerLimit {
  ttl: number;
  limit: number;
}

export const THROTTLER_LIMITS: Record<string, ThrottlerLimit> = {
  AUTH: { ttl: 60000, limit: 5 },
  CREATE: { ttl: 60000, limit: 20 },
  READ: { ttl: 60000, limit: 100 },
  // ...
};
```

**Propósito:**

- Centraliza los límites por tipo de operación
- Fácil de modificar y mantener
- Usado por los decoradores

**Ventajas:**

- ✅ Un solo lugar para cambiar límites
- ✅ Type-safe con TypeScript
- ✅ Autodocumentado

---

### 3. `throttler-behind-proxy.guard.ts` (Infrastructure/Guards)

**Responsabilidad:** Extraer la IP real del cliente

```typescript
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    // Lógica de extracción de IP desde headers de proxy
    // X-Forwarded-For, X-Real-IP, X-Client-IP
  }
}
```

**Propósito:**

- Manejo de proxies (NGINX, Cloudflare, AWS ALB)
- Extracción correcta de IP del cliente
- Se registra como `APP_GUARD` global

**Por qué es un Guard separado:**

- ✅ Reutilizable en toda la aplicación
- ✅ No acopla lógica de infraestructura con decoradores
- ✅ Fácil de testear de forma aislada

---

### 4. `throttle.decorator.ts` (Infrastructure/Decorators)

**Responsabilidad:** Proveer decoradores helper para aplicar rate limiting

```typescript
export const ThrottleAuth = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.AUTH.ttl,
        limit: THROTTLER_LIMITS.AUTH.limit,
      },
    }),
  );
```

**Propósito:**

- API amigable para desarrolladores
- Abstrae la configuración de `@Throttle()`
- No depende del Guard (inyectado globalmente)

**Por qué NO incluye el Guard:**

- ✅ El Guard se aplica globalmente en `app.module.ts`
- ✅ Evita duplicación (aplicar el guard en cada decorador)
- ✅ Menor acoplamiento
- ✅ Más simple y declarativo

---

### 5. `app.module.ts` (Application Root)

**Responsabilidad:** Integración y configuración global

```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot(THROTTLER_CONFIG),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard, // Guard global
    },
  ],
})
export class AppModule {}
```

**Propósito:**

- Registra el módulo de throttling
- Aplica el Guard globalmente
- Punto único de configuración

---

## 🔄 Flujo de Ejecución

```plaintext
1. Petición HTTP llega →
2. ThrottlerBehindProxyGuard (Global) →
   - Extrae IP real del cliente
   - Verifica límites configurados
3. Si pasa el Guard → Controller
4. Decorador @ThrottleAuth() (en el endpoint) →
   - Sobrescribe límites específicos para ese endpoint
5. Ejecuta el handler del controller
```

## 📊 Ventajas de esta Arquitectura

### Modularidad

- ✅ Cada archivo tiene una responsabilidad clara
- ✅ Fácil de entender y mantener
- ✅ Cambios en un archivo no afectan otros

### Reutilización

- ✅ Guard global reutilizable
- ✅ Límites centralizados
- ✅ Decoradores composables

### Testing

- ✅ Cada componente testeable por separado
- ✅ Mock fácil de guards y configuraciones
- ✅ Tests unitarios simples

### Escalabilidad

- ✅ Fácil agregar nuevos tipos de límites
- ✅ Fácil crear decoradores personalizados
- ✅ Posibilidad de almacenar límites en BD

## 🔧 Extensibilidad

### Agregar un nuevo tipo de límite

**1. Agregar a `throttler-limits.config.ts`:**

```typescript
export const THROTTLER_LIMITS = {
  // ... límites existentes
  PAYMENT: {
    ttl: 60000,
    limit: 3, // Solo 3 pagos por minuto
  },
};
```

**2. Crear decorador en `throttle.decorator.ts`:**

```typescript
export const ThrottlePayment = () =>
  applyDecorators(
    Throttle({
      default: {
        ttl: THROTTLER_LIMITS.PAYMENT.ttl,
        limit: THROTTLER_LIMITS.PAYMENT.limit,
      },
    }),
  );
```

**3. Usar en el controller:**

```typescript
@Post('process-payment')
@ThrottlePayment()
async processPayment(@Body() dto: PaymentDto) {
  return this.paymentService.process(dto);
}
```

### Personalizar el Guard

Si necesitas lógica personalizada de tracking:

```typescript
@Injectable()
export class CustomThrottlerGuard extends ThrottlerBehindProxyGuard {
  protected async getTracker(req: Request): Promise<string> {
    // Usa user ID si está autenticado
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    // Fallback a IP
    return super.getTracker(req);
  }
}
```

## 🎓 Principios SOLID Aplicados

### Single Responsibility (SRP)

- ✅ Cada archivo tiene UNA responsabilidad
- ✅ Config solo configura
- ✅ Guard solo extrae IP
- ✅ Decoradores solo definen límites

### Open/Closed Principle (OCP)

- ✅ Abierto a extensión (nuevos decoradores)
- ✅ Cerrado a modificación (estructura base estable)

### Dependency Inversion (DIP)

- ✅ Decoradores dependen de abstracciones (THROTTLER_LIMITS)
- ✅ No dependen de implementaciones concretas

## 📝 Mejores Prácticas

### ✅ Hacer

- Agregar nuevos límites en `throttler-limits.config.ts`
- Crear decoradores específicos para casos de uso
- Documentar cada límite con su propósito
- Usar el Guard global en `app.module.ts`

### ❌ Evitar

- No mezclar configuración con lógica de Guards
- No aplicar Guards individualmente en decoradores
- No hardcodear límites directamente en decoradores
- No duplicar configuraciones

---

**Arquitectura diseñada para ser mantenible, escalable y testeable.** 🎯
