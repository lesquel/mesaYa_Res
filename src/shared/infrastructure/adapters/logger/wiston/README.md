# Winston Logger Adapter - Arquitectura Modular

Esta carpeta contiene la implementación modularizada del adaptador de Winston para el sistema de logging.

## 📁 Estructura de Carpetas

```
logger/
├── common/                    # Utilidades genéricas (reutilizables)
│   ├── constants/
│   │   └── log-meta.constants.ts
│   ├── types/
│   │   └── log.types.ts
│   └── utils/
│       ├── log-meta-collector.util.ts
│       ├── log-meta-sanitizer.util.ts
│       ├── log-meta-stringifier.util.ts
│       └── log-section-formatter.util.ts
└── wiston/                    # Específico de Winston
    ├── constants/
    │   └── winston-logger.constants.ts
    ├── factories/
    │   └── winston-logger.factory.ts
    ├── formatters/
    │   ├── console-format.builder.ts
    │   └── file-format.builder.ts
    ├── types/
    │   └── winston-logger.types.ts
    ├── utils/
    │   └── index.ts (re-exporta de common)
    └── winstonLogger.adapter.ts
```

## 🔄 Separación de Responsabilidades

### Common (Genérico - Reutilizable con cualquier logger)

**Propósito**: Utilidades que no dependen de Winston y pueden ser usadas por otros adapters de logging.

#### Constants (`common/constants/`)

- **log-meta.constants.ts**: Claves excluidas de metadata (genérico)

#### Types (`common/types/`)

- **log.types.ts**: Interfaces base para metadata y payload

#### Utils (`common/utils/`)

- **LogMetaCollectorUtil**: Recolecta metadatos adicionales
- **LogMetaSanitizerUtil**: Sanitiza valores (errores, objetos, arrays)
- **LogMetaStringifierUtil**: Convierte metadata a string
- **LogSectionFormatterUtil**: Formatea secciones con indentación

### Winston (Específico)

**Propósito**: Implementación específica de Winston usando las utilidades comunes.

#### Constants (`wiston/constants/`)

- **winston-logger.constants.ts**: Constantes específicas de Winston (formato timestamp, símbolos, rutas)

#### Factories (`wiston/factories/`)

- **WinstonLoggerFactory**: Crea y configura la instancia de Winston

#### Formatters (`wiston/formatters/`)

- **ConsoleFormatBuilder**: Formato para consola con colores de Winston
- **FileFormatBuilder**: Formato JSON para archivos

#### Types (`wiston/types/`)

- **winston-logger.types.ts**: Re-exporta tipos base con nombres de Winston

## 🔄 Flujo de Datos

```
Logger Method (log/warn/error)
    ↓
Winston Logger Instance (Factory)
    ↓
Transport (Console/File)
    ↓
Format Builder (Winston-specific)
    ↓
Utils (Common - Reutilizables)
    ├─ LogMetaCollectorUtil
    ├─ LogMetaSanitizerUtil
    ├─ LogMetaStringifierUtil
    └─ LogSectionFormatterUtil
    ↓
Output (Console/File)
```

## ✨ Beneficios de la Nueva Arquitectura

### 1. **Reutilización**

Las utilidades en `common/` pueden ser usadas por otros adapters de logging (Pino, Bunyan, etc.) sin duplicación de código.

### 2. **Separación de Concerns**

- `common/`: Lógica de negocio genérica
- `wiston/`: Implementación específica de Winston

### 3. **Extensibilidad**

Agregar un nuevo logger (ej: Pino) solo requiere:

- Crear carpeta `pino/`
- Implementar formatters específicos
- Reutilizar utils de `common/`

### 4. **Testabilidad**

Cada módulo puede ser testeado independientemente:

- Tests genéricos en `common/`
- Tests específicos en `wiston/`

### 5. **Mantenibilidad**

Cambios en lógica genérica benefician a todos los loggers.

## 🚀 Uso

### Actual (Winston)

```typescript
import { WinstonLoggerAdapter } from './wiston/winstonLogger.adapter';

const logger = new WinstonLoggerAdapter();
logger.log('Mensaje', 'Contexto', { userId: 123 });
```

### Futuro (Otro Logger)

```typescript
import { PinoLoggerAdapter } from './pino/pinoLogger.adapter';
// Usa las mismas utilidades de common/

const logger = new PinoLoggerAdapter();
logger.log('Mensaje', 'Contexto', { userId: 123 });
```

## � Migración de Utilidades

### Antes (Todo en Winston)

```
wiston/
├── utils/
│   ├── meta-collector.util.ts      ❌ Winston-specific
│   ├── meta-sanitizer.util.ts      ❌ Winston-specific
│   ├── meta-stringifier.util.ts    ❌ Winston-specific
│   └── section-formatter.util.ts   ❌ Winston-specific
```

### Después (Separado)

```
common/
├── utils/
│   ├── log-meta-collector.util.ts      ✅ Genérico
│   ├── log-meta-sanitizer.util.ts      ✅ Genérico
│   ├── log-meta-stringifier.util.ts    ✅ Genérico
│   └── log-section-formatter.util.ts   ✅ Genérico

wiston/
├── utils/
│   └── index.ts                        ✅ Re-exporta de common
```

## 📝 Convenciones de Nombres

### Common

- Prefijo `Log` para indicar propósito genérico
- Ejemplo: `LogMetaCollectorUtil`, `BaseLogMeta`

### Winston

- Prefijo `Winston` para constantes específicas
- Re-exporta tipos de common con alias
- Ejemplo: `WINSTON_CONSTANTS`, `LogMeta` (alias de `BaseLogMeta`)
