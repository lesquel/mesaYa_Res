# Common Logger Utilities

Esta carpeta contiene utilidades genéricas para logging que **NO dependen de ninguna implementación específica** de logger (Winston, Pino, Bunyan, etc.).

## 🎯 Propósito

Proporcionar funcionalidades reutilizables que puedan ser compartidas entre diferentes adapters de logging, evitando duplicación de código y facilitando la implementación de nuevos loggers.

## 📁 Estructura

```
common/
├── constants/
│   ├── log-meta.constants.ts    # Claves excluidas de metadata
│   └── index.ts
├── types/
│   ├── log.types.ts             # Interfaces base
│   └── index.ts
├── utils/
│   ├── log-meta-collector.util.ts
│   ├── log-meta-sanitizer.util.ts
│   ├── log-meta-stringifier.util.ts
│   ├── log-section-formatter.util.ts
│   └── index.ts
└── index.ts
```

## 🔧 Componentes

### Constants

#### `LOG_META_EXCLUDED_KEYS`

Lista de claves que deben ser excluidas al recolectar metadata adicional.

```typescript
const excludedKeys = LOG_META_EXCLUDED_KEYS;
// ['level', 'timestamp', 'message', 'context', 'trace', 'stack', 'meta']
```

### Types

#### `BaseLogMeta`

Interface base para metadatos de log.

```typescript
interface BaseLogMeta {
  context?: string;
  meta?: Record<string, unknown>;
  trace?: string;
}
```

#### `BaseLogPayload`

Interface base para payload de log en archivos.

```typescript
interface BaseLogPayload {
  timestamp: unknown;
  level: string;
  message: unknown;
  context?: string;
  meta?: unknown;
  trace?: string;
}
```

### Utils

#### `LogMetaCollectorUtil`

Recolecta metadatos adicionales de la información de log, excluyendo las claves estándar.

```typescript
const meta = LogMetaCollectorUtil.collect(logInfo);
// { userId: 123, requestId: 'abc-123', ... }
```

#### `LogMetaSanitizerUtil`

Sanitiza valores para logging seguro:

- Convierte errores a objetos serializables
- Procesa arrays recursivamente
- Sanitiza objetos anidados

```typescript
const sanitized = LogMetaSanitizerUtil.sanitize(errorObject);
// { name: 'Error', message: '...', stack: '...' }
```

#### `LogMetaStringifierUtil`

Convierte metadatos a string usando JSON.stringify o util.inspect como fallback.

```typescript
const str = LogMetaStringifierUtil.stringify(metadata);
// JSON string formateado
```

#### `LogSectionFormatterUtil`

Formatea secciones de log con indentación y etiquetas.

```typescript
const section = LogSectionFormatterUtil.format('trace', stackTrace);
// "  trace:\n    line 1\n    line 2"
```

## 🚀 Uso en Adapters

### Winston

```typescript
import { LogMetaCollectorUtil, LogMetaStringifierUtil } from '../common';

// En el formatter
const meta = LogMetaCollectorUtil.collect(info);
const metaString = LogMetaStringifierUtil.stringify(meta);
```

### Pino (Ejemplo futuro)

```typescript
import { LogMetaSanitizerUtil, LogMetaCollectorUtil } from '../common';

// En el serializer
const meta = LogMetaCollectorUtil.collect(logData);
const sanitized = LogMetaSanitizerUtil.sanitize(meta);
```

## ✅ Ventajas

1. **DRY (Don't Repeat Yourself)**: Evita duplicación entre adapters
2. **Consistencia**: Mismo comportamiento en todos los loggers
3. **Testabilidad**: Tests unitarios independientes del logger
4. **Mantenibilidad**: Cambios en un solo lugar
5. **Extensibilidad**: Fácil agregar nuevos adapters

## 📝 Convenciones

- **Prefijo `Log`**: Todos los nombres tienen prefijo `Log` para indicar que son genéricos
- **Sufijo `Util`**: Clases utilitarias terminan en `Util`
- **Métodos estáticos**: Todas las utilidades usan métodos estáticos (sin estado)
- **Nombrado descriptivo**: Nombres claros que indican la funcionalidad

## 🧪 Testing

Estas utilidades deben ser testeadas de forma aislada:

```typescript
describe('LogMetaSanitizerUtil', () => {
  it('should sanitize errors', () => {
    const error = new Error('Test');
    const result = LogMetaSanitizerUtil.sanitize(error);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('stack');
  });
});
```

## 🔮 Futuro

Esta carpeta puede crecer con:

- Filtros de datos sensibles
- Formatters de fecha/hora genéricos
- Utilidades de niveles de log
- Estrategias de rotación de logs
- Parsers de stack traces
