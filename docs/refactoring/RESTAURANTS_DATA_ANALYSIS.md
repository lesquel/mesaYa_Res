# Análisis de Datos del Módulo Restaurants

> 📋 **Fecha**: Enero 2025  
> 🎯 **Objetivo**: Identificar errores de datos, validaciones faltantes, errores de mapeo y problemas de persistencia

---

## 1️⃣ Análisis del Contexto Recibido

### Estructura del Módulo

```
restaurants/
├── domain/
│   ├── entities/
│   │   ├── restaurant.entity.ts          # Entidad agregada con 14+ Value Objects
│   │   └── values/
│   │       ├── restaurant-location.ts    # VO de ubicación con coordenadas
│   │       ├── restaurant-schedule.ts    # VO de horarios HH:mm
│   │       ├── restaurant-status.ts      # VO de estado ACTIVE/SUSPENDED/ARCHIVED
│   │       ├── restaurant-days-open.ts   # VO de días de apertura
│   │       └── restaurant-capacity.ts    # VO de capacidad
│   ├── errors/                           # 4 tipos de errores de dominio
│   ├── ports/
│   │   └── restaurant-owner.port.ts      # Port para verificar owner en Auth MS
│   ├── repositories/
│   │   └── restaurant-domain-repository.port.ts
│   ├── services/
│   │   └── restaurant-domain.service.ts  # Lógica de dominio
│   └── types/                            # Interfaces de datos
├── application/
│   ├── dto/
│   │   ├── input/
│   │   │   ├── create-restaurant.dto.ts  # Con RestaurantLocationDto nested
│   │   │   └── update-restaurant.dto.ts  # Partial de create
│   │   └── output/
│   │       └── restaurant.response.dto.ts
│   ├── mappers/
│   │   └── restaurant.mapper.ts          # Entity → ResponseDto
│   ├── use-cases/                        # CQRS Use Cases
│   └── services/
│       └── restaurants.service.ts        # Orquestación con Kafka
├── infrastructure/
│   └── database/typeorm/
│       ├── orm/
│       │   └── restaurant.orm-entity.ts  # 3 formas de almacenar location
│       ├── mappers/
│       │   └── restaurant.orm-mapper.ts  # Bidireccional con buildLocationSnapshot
│       └── repositories/
│           └── restaurant-typeorm.repository.ts
└── interface/
    ├── controllers/v1/
    │   └── restaurants.controller.ts
    └── dto/
        ├── restaurant-response.swagger-dto.ts  # ⚠️ Desactualizado
        └── list-restaurants.query.dto.ts
```

### Flujo de Datos Identificado

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FLUJO DE CREACIÓN                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ CreateRestaurantDto → CreateRestaurantUseCase → RestaurantDomainService     │
│         ↓                                                                    │
│ RestaurantEntity.create() → RestaurantTypeOrmRepository.save()              │
│         ↓                                                                    │
│ RestaurantOrmMapper.toOrmEntity() → PostgreSQL                              │
│                                                                              │
│ ⚠️ PUNTOS CRÍTICOS:                                                         │
│   1. location: RestaurantLocationDto → RestaurantLocation VO → ORM          │
│   2. Datos almacenados en 3 lugares: location, locationPayload, lat/lng     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Errores Detectados

### 🔴 ERROR CRÍTICO 1: Redundancia de Datos de Location

**Ubicación**: `restaurant.orm-entity.ts` (líneas 23-45)

**Problema**:
Los datos de ubicación se almacenan en **3 columnas diferentes**, lo que puede causar inconsistencias:

```typescript
// restaurant.orm-entity.ts
@Column({ type: 'varchar', length: 200, name: 'location' })
location: string;                    // ← Solo el label/dirección como string

@Column({ type: 'jsonb', name: 'location_payload', nullable: true })
locationPayload?: { ... };           // ← Objeto completo con todos los campos

@Column({ type: 'double precision', name: 'location_latitude', nullable: true })
locationLatitude?: number | null;    // ← Duplicado de locationPayload.latitude

@Column({ type: 'double precision', name: 'location_longitude', nullable: true })
locationLongitude?: number | null;   // ← Duplicado de locationPayload.longitude
```

**Impacto**:
- Si se actualiza `locationPayload.latitude` pero no `locationLatitude`, quedan desincronizados
- La columna `location` (varchar) no tiene la estructura completa
- El mapper `buildLocationSnapshot` tiene lógica de fallback compleja

---

### 🔴 ERROR CRÍTICO 2: Swagger DTO Desactualizado

**Ubicación**: `restaurant-response.swagger-dto.ts`

**Problema**:
El DTO de Swagger muestra `location` como `string`, pero el DTO real devuelve un objeto completo:

```typescript
// restaurant-response.swagger-dto.ts (INCORRECTO)
@ApiProperty()
location!: string;  // ← Swagger documenta string

// restaurant.response.dto.ts (CORRECTO)
location: RestaurantLocationResponseDto;  // ← Realmente es un objeto
```

**Impacto**:
- Documentación de API incorrecta
- Clientes del API esperan string, reciben objeto
- Rompe contratos de integración

---

### 🟠 ERROR MEDIO 3: Validación de openTime/closeTime Inconsistente

**Ubicación**: `create-restaurant.dto.ts` vs `restaurant-schedule.ts`

**Problema**:
```typescript
// create-restaurant.dto.ts - Validación débil
@IsString()
@IsNotEmpty()
@MaxLength(100)  // ← Permite "cualquier cosa de 100 chars"
openTime: string;

// restaurant-schedule.ts - Validación estricta
const TIME_REGEX = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
// ← Solo acepta HH:mm exacto
```

**Impacto**:
- El DTO permite `"nueve de la mañana"` como openTime
- El Value Object lanza `InvalidRestaurantDataError` al crear la entidad
- Error 500 en lugar de 400 con mensaje claro

---

### 🟠 ERROR MEDIO 4: cuisineType Busca en Campo Incorrecto

**Ubicación**: `restaurant-typeorm.repository.ts` (línea 299-303)

**Problema**:
```typescript
if (query.cuisineType) {
  qb.andWhere(
    `unaccent(LOWER(${alias}.description)) LIKE unaccent(LOWER(:cuisineType))`,
    { cuisineType: `%${query.cuisineType}%` }
  );
}
```

**Impacto**:
- Busca `cuisineType` en el campo `description` 
- No existe campo `cuisineType` en la entidad `RestaurantOrmEntity`
- Si el restaurante tiene descripción "Italian cuisine" funciona por casualidad
- Si busca "mexican" y la descripción dice "comida mexicana", no lo encuentra

---

### 🟠 ERROR MEDIO 5: city Filter Busca en location String

**Ubicación**: `restaurant-typeorm.repository.ts` (línea 291-295)

**Problema**:
```typescript
if (query.city) {
  qb.andWhere(
    `unaccent(LOWER(${alias}.location)) LIKE unaccent(LOWER(:filterCity))`,
    { filterCity: `%${query.city}%` }
  );
}
```

**Impacto**:
- Busca en la columna `location` (varchar string)
- Debería buscar en `locationPayload->>'city'` (JSONB)
- Si location = "Av. Amazonas 123" y city en payload = "Quito", no lo encuentra

---

### 🟡 ERROR MENOR 6: Falta Validación @Matches para Tiempo

**Ubicación**: `create-restaurant.dto.ts`

**Problema**:
```typescript
// Actual
@IsString()
@IsNotEmpty()
@MaxLength(100)
openTime: string;

// Debería incluir
@Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
  message: 'openTime must be in HH:mm format (e.g., 09:00)'
})
```

---

### 🟡 ERROR MENOR 7: Controller Usa `as any` en Múltiples Lugares

**Ubicación**: `restaurants.controller.ts` (líneas 195, 208, 225, 234, 252)

**Problema**:
```typescript
// Línea 195
return this.restaurantsService.create({
  ...dto,
  ownerId: user.userId,
} as any);  // ← Evita type checking

// Línea 208
return this.restaurantsService.update({
  restaurantId: id,
  ...dto,
  ownerId: user.userId,
} as any);  // ← Mismo problema
```

**Impacto**:
- Pierde type safety
- Errores de tipado no detectados en compile time
- Posible pasar campos incorrectos al service

---

### 🟡 ERROR MENOR 8: listOwners Devuelve Placeholders

**Ubicación**: `restaurant-typeorm.repository.ts` (línea 166-170)

**Problema**:
```typescript
return rows.map((row) =>
  RestaurantOwnerOptionDto.fromRaw({
    ownerId: row.ownerId,
    name: 'Owner',  // ← Placeholder hardcodeado
    email: '',      // ← Siempre vacío
  }),
);
```

**Impacto**:
- UI muestra "Owner" para todos los propietarios
- No hay forma de identificar al owner real sin llamada adicional

---

### 🟡 ERROR MENOR 9: Falta Validación de city en RestaurantLocation VO

**Ubicación**: `restaurant-location.ts`

**Problema**:
```typescript
private validate(input: RestaurantLocationSnapshot): void {
  if (!input.address) {
    throw new InvalidRestaurantDataError('Location address is required');
  }
  // ← No valida que city sea requerido
  // ← No valida que country sea requerido
}
```

**Impacto**:
- Permite crear restaurantes sin ciudad
- El DTO valida `@IsNotEmpty()` para city, pero si viene de rehydrate no se valida

---

## 3️⃣ Comportamiento Correcto Esperado

### Location Data

| Campo | Almacenamiento Único | Tipo |
|-------|---------------------|------|
| location | `location_payload` (JSONB) | RestaurantLocationSnapshot |
| latitude | Dentro de `location_payload` | number \| null |
| longitude | Dentro de `location_payload` | number \| null |

La columna `location` (varchar) debería ser:
- **Opción A**: Eliminada (breaking change)
- **Opción B**: Generada automáticamente desde `location_payload->>'label'`
- **Opción C**: Mantenida para búsquedas full-text pero sincronizada

### Swagger Documentation

```typescript
// restaurant-response.swagger-dto.ts
@ApiProperty({ type: () => RestaurantLocationSwaggerDto })
location!: RestaurantLocationSwaggerDto;

class RestaurantLocationSwaggerDto {
  @ApiProperty() label!: string;
  @ApiProperty() address!: string;
  @ApiProperty() city!: string;
  @ApiProperty({ required: false }) province?: string | null;
  @ApiProperty() country!: string;
  @ApiProperty({ required: false }) latitude?: number | null;
  @ApiProperty({ required: false }) longitude?: number | null;
  @ApiProperty({ required: false }) placeId?: string | null;
}
```

### Time Validation

```typescript
// create-restaurant.dto.ts
@Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
  message: 'Must be HH:mm format (e.g., 09:00)',
})
@ApiProperty({ example: '09:00', pattern: '^([0-1]\\d|2[0-3]):([0-5]\\d)$' })
openTime: string;
```

---

## 4️⃣ Guía Paso a Paso de Corrección

### Paso 1: Agregar Validación de Tiempo en DTO

**Archivo**: `application/dto/input/create-restaurant.dto.ts`

```typescript
import { Matches } from 'class-validator';

// Añadir a openTime
@Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
  message: 'openTime must be in HH:mm format (e.g., 09:00)',
})
openTime: string;

// Añadir a closeTime
@Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
  message: 'closeTime must be in HH:mm format (e.g., 18:00)',
})
closeTime: string;
```

---

### Paso 2: Corregir Swagger DTO

**Archivo**: `interface/dto/restaurant-response.swagger-dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

class RestaurantLocationSwaggerDto {
  @ApiProperty({ example: 'Av. Amazonas 123, Quito, Ecuador' })
  label!: string;

  @ApiProperty({ example: 'Av. Amazonas 123' })
  address!: string;

  @ApiProperty({ example: 'Quito' })
  city!: string;

  @ApiProperty({ required: false, nullable: true, example: 'Pichincha' })
  province?: string | null;

  @ApiProperty({ example: 'Ecuador' })
  country!: string;

  @ApiProperty({ required: false, nullable: true, example: -0.180653 })
  latitude?: number | null;

  @ApiProperty({ required: false, nullable: true, example: -78.467834 })
  longitude?: number | null;

  @ApiProperty({ required: false, nullable: true })
  placeId?: string | null;
}

export class RestaurantResponseSwaggerDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ type: () => RestaurantLocationSwaggerDto })
  location!: RestaurantLocationSwaggerDto;

  // ... resto de propiedades sin cambios
}
```

---

### Paso 3: Corregir Filtro de City

**Archivo**: `infrastructure/database/typeorm/repositories/restaurant-typeorm.repository.ts`

```typescript
// Cambiar de:
if (query.city) {
  qb.andWhere(
    `unaccent(LOWER(${alias}.location)) LIKE unaccent(LOWER(:filterCity))`,
    { filterCity: `%${query.city}%` }
  );
}

// A:
if (query.city) {
  qb.andWhere(
    `unaccent(LOWER(${alias}.locationPayload->>'city')) LIKE unaccent(LOWER(:filterCity))`,
    { filterCity: `%${query.city}%` }
  );
}
```

---

### Paso 4: Eliminar Redundancia de Coordenadas (Opcional - Breaking Change)

**Opción A - Mantener columnas separadas pero sincronizar**:

Modificar `restaurant.orm-mapper.ts` para que siempre copie de locationPayload:

```typescript
static toOrmEntity(restaurant: RestaurantEntity): RestaurantOrmEntity {
  const snapshot = restaurant.snapshot();
  const entity = new RestaurantOrmEntity();
  
  // ... otros campos
  
  entity.locationPayload = {
    label: snapshot.location.label,
    address: snapshot.location.address,
    city: snapshot.location.city,
    province: snapshot.location.province ?? null,
    country: snapshot.location.country,
    latitude: snapshot.location.latitude ?? null,
    longitude: snapshot.location.longitude ?? null,
    placeId: snapshot.location.placeId ?? null,
  };
  
  // Siempre sincronizar desde locationPayload
  entity.location = snapshot.location.label || snapshot.location.address;
  entity.locationLatitude = entity.locationPayload.latitude;
  entity.locationLongitude = entity.locationPayload.longitude;
  
  return entity;
}
```

**Opción B - Migrar a solo locationPayload** (recomendado a futuro):

1. Crear migración que copie datos a locationPayload
2. Actualizar queries para usar JSONB operators
3. Deprecar y luego eliminar columnas redundantes

---

### Paso 5: Eliminar `as any` del Controller

**Archivo**: `interface/controllers/v1/restaurants.controller.ts`

```typescript
// Crear interfaces intermedias
interface CreateRestaurantRequest extends CreateRestaurantDto {
  ownerId: string;
}

interface UpdateRestaurantRequest extends UpdateRestaurantDto {
  restaurantId: string;
  ownerId?: string;
}

// En create()
async create(
  @Body() dto: CreateRestaurantDto,
  @CurrentUser() user: CurrentUserPayload,
): Promise<RestaurantResponseDto> {
  const command: CreateRestaurantCommand = {
    ...dto,
    ownerId: user.userId,
  };
  return this.restaurantsService.create(command);
}

// En update()
async update(
  @Param('id', UUIDPipe) id: string,
  @Body() dto: UpdateRestaurantDto,
  @CurrentUser() user: CurrentUserPayload,
): Promise<RestaurantResponseDto> {
  const command: UpdateRestaurantCommand = {
    restaurantId: id,
    ...dto,
    ownerId: user.userId,
    enforceOwnership: !user.roles?.some(r => r.name === AuthRoleName.ADMIN),
  };
  return this.restaurantsService.update(command);
}
```

---

### Paso 6: Agregar Campo cuisineType (Opcional)

Si se necesita filtrar por tipo de cocina, agregar campo real:

**Archivo**: `restaurant.orm-entity.ts`

```typescript
@Column({ type: 'varchar', length: 50, name: 'cuisine_type', nullable: true })
cuisineType?: string | null;
```

**Archivo**: `domain/entities/values/restaurant-cuisine-type.ts`

```typescript
const VALID_CUISINE_TYPES = [
  'ITALIAN', 'MEXICAN', 'JAPANESE', 'CHINESE', 'INDIAN',
  'FRENCH', 'SPANISH', 'AMERICAN', 'MEDITERRANEAN', 'OTHER'
] as const;

export type CuisineTypeValue = typeof VALID_CUISINE_TYPES[number];

export class RestaurantCuisineType {
  private constructor(private readonly internal: CuisineTypeValue | null) {}

  static create(value?: string | null): RestaurantCuisineType {
    if (!value) return new RestaurantCuisineType(null);
    
    const normalized = value.toUpperCase();
    if (!VALID_CUISINE_TYPES.includes(normalized as CuisineTypeValue)) {
      return new RestaurantCuisineType('OTHER');
    }
    
    return new RestaurantCuisineType(normalized as CuisineTypeValue);
  }

  get value(): CuisineTypeValue | null {
    return this.internal;
  }
}
```

---

## 5️⃣ Checklist de Validación

### Validaciones de Datos

- [ ] `openTime` y `closeTime` validan formato HH:mm en DTO
- [ ] `RestaurantSchedule` VO valida formato estricto
- [ ] `RestaurantLocation` VO valida address requerido
- [ ] `RestaurantCapacity` VO valida entero positivo
- [ ] `RestaurantStatus` VO acepta solo valores permitidos
- [ ] `RestaurantDaysOpen` VO valida días válidos

### Consistencia de Datos

- [ ] `locationPayload` siempre contiene lat/lng actualizados
- [ ] `locationLatitude/Longitude` sincronizados con payload
- [ ] `location` (varchar) contiene el label correcto
- [ ] Filtros usan campos correctos (city → locationPayload->>'city')

### Documentación API

- [ ] Swagger DTO refleja estructura real de location
- [ ] Swagger DTO incluye todos los campos de respuesta
- [ ] Ejemplos en Swagger son correctos

### Type Safety

- [ ] Controller no usa `as any`
- [ ] Commands tienen tipos correctos
- [ ] Mappers no pierden información

### Pruebas

- [ ] Test unitario: crear restaurante con openTime inválido → 400
- [ ] Test unitario: crear restaurante con location válida
- [ ] Test e2e: filtrar por ciudad funciona
- [ ] Test e2e: respuesta incluye location como objeto

---

## 6️⃣ Comentario Final

### Resumen de Severidad

| Severidad | Cantidad | Impacto |
|-----------|----------|---------|
| 🔴 Crítico | 2 | Datos inconsistentes, API incorrecta |
| 🟠 Medio | 3 | Filtros no funcionan, validación 500 |
| 🟡 Menor | 4 | Type safety, UX degradada |

### Prioridad de Corrección

1. **Inmediato (P0)**: Corregir Swagger DTO - los clientes esperan respuesta incorrecta
2. **Alto (P1)**: Agregar validación de tiempo en DTO - evita errores 500
3. **Medio (P2)**: Corregir filtro de city - afecta búsquedas
4. **Bajo (P3)**: Refactorizar redundancia de location - mejora mantenibilidad

### Notas Arquitectónicas

El módulo sigue correctamente el patrón Hexagonal con:
- ✅ Value Objects encapsulando validaciones
- ✅ Domain Service orquestando lógica de negocio
- ✅ Repository Port abstrayendo persistencia
- ✅ Owner Port desacoplando Auth MS

Los problemas identificados son principalmente de **sincronización de datos** y **validación temprana**, no de arquitectura.
