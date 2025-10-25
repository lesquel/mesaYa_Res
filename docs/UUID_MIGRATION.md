# ✅ Migración de IDs Completada - Int → UUID

## 🎯 Resumen de Cambios

Se ha completado la migración de **TODOS** los IDs de `number` (integer) a `string` (UUID) en la aplicación.

---

## 📦 1. ORM Entities Actualizadas

### ✅ Menu ORM Entity

**Archivo:** `src/features/menus/infrastructure/database/typeorm/orm/menu.orm-entity.ts`

```typescript
// ANTES
@Column({ type: 'int', name: 'restaurant_id' })
restaurantId: number;

// DESPUÉS
@Column({ type: 'uuid', name: 'restaurant_id' })
restaurantId: string;
```

### ✅ Dish ORM Entity

**Archivo:** `src/features/menus/infrastructure/database/typeorm/orm/dish.orm-entity.ts`

```typescript
// ANTES
@Column({ type: 'int', name: 'restaurant_id' })
restaurantId: number;

@Column({ type: 'int', name: 'image_id', nullable: true })
imageId?: number | null;

// DESPUÉS
@Column({ type: 'uuid', name: 'restaurant_id' })
restaurantId: string;

@Column({ type: 'uuid', name: 'image_id', nullable: true })
imageId?: string | null;
```

### ✅ Restaurant ORM Entity

**Archivo:** `src/features/restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity.ts`

```typescript
// ANTES
@Column({ type: 'int', name: 'subscription_id' })
subscriptionId: number;

@Column({ type: 'int', name: 'image_id', nullable: true })
imageId?: number | null;

// DESPUÉS
@Column({ type: 'uuid', name: 'subscription_id' })
subscriptionId: string;

@Column({ type: 'uuid', name: 'image_id', nullable: true })
imageId?: string | null;
```

### ✅ Table ORM Entity

**Archivo:** `src/features/tables/infrastructure/database/typeorm/orm/table.orm-entity.ts`

```typescript
// ANTES
@Column({ type: 'int', name: 'table_image_id' })
tableImageId: number;

@Column({ type: 'int', name: 'chair_image_id' })
chairImageId: number;

// DESPUÉS
@Column({ type: 'uuid', name: 'table_image_id' })
tableImageId: string;

@Column({ type: 'uuid', name: 'chair_image_id' })
chairImageId: string;
```

---

## 🗄️ 2. Migración de Base de Datos

### Opción A: Desarrollo (Recomendado) ⚡

Tu configuración actual tiene `synchronize: !IS_PROD`, así que:

```bash
# Simplemente reinicia la aplicación
npm run start:dev
```

TypeORM **automáticamente**:

- ✅ Detectará los cambios en las entidades
- ✅ Modificará las columnas de `int` a `uuid`
- ✅ Sincronizará el esquema

### Opción B: Migración Manual SQL 🔧

Si prefieres control total o estás en producción:

```bash
# Ejecutar el script SQL
psql -U your_user -d your_database -f src/shared/infrastructure/database/migrations/manual-uuid-migration.sql
```

O desde tu cliente PostgreSQL:

1. Abre el archivo `manual-uuid-migration.sql`
2. Ejecuta todo el contenido

### Opción C: Migración TypeORM 🏗️

Si quieres usar el sistema de migraciones de TypeORM:

1. **Actualiza `package.json`:**

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:run": "npm run typeorm migration:run -- -d src/shared/infrastructure/adapters/database/data-source.ts",
    "migration:revert": "npm run typeorm migration:revert -- -d src/shared/infrastructure/adapters/database/data-source.ts"
  }
}
```

2. **Crea data-source.ts:**

```typescript
// src/shared/infrastructure/adapters/database/data-source.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  entities: ['src/**/*.orm-entity.ts'],
  migrations: ['src/shared/infrastructure/database/migrations/*.ts'],
  synchronize: false,
});
```

3. **Ejecuta la migración:**

```bash
npm run migration:run
```

---

## 📋 3. Tabla de Cambios en Base de Datos

| Tabla | Columna | Tipo Anterior | Tipo Nuevo |
|-------|---------|---------------|------------|
| `menu` | `restaurant_id` | `integer` | `uuid` |
| `dish` | `restaurant_id` | `integer` | `uuid` |
| `dish` | `image_id` | `integer` | `uuid` |
| `restaurant` | `subscription_id` | `integer` | `uuid` |
| `restaurant` | `image_id` | `integer` | `uuid` |
| `table` | `table_image_id` | `integer` | `uuid` |
| `table` | `chair_image_id` | `integer` | `uuid` |

---

## ⚠️ 4. Consideraciones Importantes

### 🔴 Datos Existentes

Si tienes datos en tu base de datos:

1. **Las relaciones se romperán** porque los IDs numéricos no mapean a UUIDs
2. **Soluciones:**
   - Opción 1: Borrar la base de datos y empezar de cero (desarrollo)
   - Opción 2: Ejecutar seeds para repoblar
   - Opción 3: Crear script de migración de datos personalizado

### 🔵 Base de Datos Limpia

Si no tienes datos (recomendado):

```bash
# PostgreSQL
DROP DATABASE your_database;
CREATE DATABASE your_database;

# Luego reinicia la app
npm run start:dev
```

### 🟢 Seeds Actualizados

Todos los seeds ya usan UUIDs:

```bash
# Ejecuta los seeds para poblar la BD
curl -X POST http://localhost:3000/seed
```

---

## ✅ 5. Verificación

### Verifica los Tipos de Columna

```sql
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('menu', 'dish', 'restaurant', 'table')
  AND column_name LIKE '%_id'
ORDER BY table_name, column_name;
```

**Resultado Esperado:**

```
 table_name  |   column_name    | data_type | is_nullable
-------------+------------------+-----------+-------------
 dish        | dish_id          | uuid      | NO
 dish        | image_id         | uuid      | YES
 dish        | menu_id          | uuid      | YES
 dish        | restaurant_id    | uuid      | NO
 menu        | menu_id          | uuid      | NO
 menu        | restaurant_id    | uuid      | NO
 restaurant  | image_id         | uuid      | YES
 restaurant  | restaurant_id    | uuid      | NO
 restaurant  | subscription_id  | uuid      | NO
 table       | chair_image_id   | uuid      | NO
 table       | section_id       | uuid      | NO
 table       | table_id         | uuid      | NO
 table       | table_image_id   | uuid      | NO
```

### Prueba la API

```bash
# Crear un menú (debería funcionar con UUIDs)
curl -X POST http://localhost:3000/api/v1/menus \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Menú Test",
    "description": "Descripción",
    "price": 15.99,
    "imageUrl": "https://example.com/image.jpg"
  }'
```

---

## 🚀 6. Pasos Siguientes

1. ✅ **Reinicia la aplicación** (si aún no lo has hecho)
2. ✅ **Verifica la base de datos** con las queries de arriba
3. ✅ **Ejecuta los seeds** para poblar datos de prueba
4. ✅ **Prueba las APIs** con UUIDs
5. ✅ **Actualiza tus tests** para usar UUIDs

---

## 📚 7. Archivos Creados/Modificados

### Archivos de Migración

- ✅ `src/shared/infrastructure/database/migrations/1729800000000-ConvertIdsToUuid.ts`
- ✅ `src/shared/infrastructure/database/migrations/manual-uuid-migration.sql`
- ✅ `src/shared/infrastructure/database/migrations/README.md`

### ORM Entities Modificadas

- ✅ `menu.orm-entity.ts`
- ✅ `dish.orm-entity.ts`
- ✅ `restaurant.orm-entity.ts`
- ✅ `table.orm-entity.ts`

### Archivos de Dominio (Ya actualizados previamente)

- ✅ Todas las entidades de dominio
- ✅ Todos los tipos e interfaces
- ✅ Todos los DTOs
- ✅ Todos los Value Objects
- ✅ Todos los seeds

---

## 🆘 Troubleshooting

### Error: "column type mismatch"

```bash
# Solución: Borrar y recrear base de datos
DROP DATABASE mesaya;
CREATE DATABASE mesaya;

# Reiniciar app
npm run start:dev
```

### Error: "invalid input syntax for type uuid"

**Causa:** Intentando insertar un número en columna UUID

**Solución:** Asegúrate de usar strings UUID:

```typescript
// ✅ Correcto
restaurantId: randomUUID()
restaurantId: "550e8400-e29b-41d4-a716-446655440000"

// ❌ Incorrecto
restaurantId: 1
restaurantId: "1"
```

---

## 🎉 ¡Listo

Tu aplicación ahora usa **UUIDs en todos los IDs** de manera consistente. Todos los cambios están completados y listos para usar.
