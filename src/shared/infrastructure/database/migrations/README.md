# Database Migrations - UUID Conversion

## Overview

This migration converts all foreign key reference columns from `integer` to `uuid` type for consistency across the application.

## Affected Tables and Columns

| Table | Columns Changed | Old Type | New Type |
|-------|----------------|----------|----------|
| `menu` | `restaurant_id` | `int` | `uuid` |
| `dish` | `restaurant_id`, `image_id` | `int` | `uuid` |
| `restaurant` | `subscription_id`, `image_id` | `int` | `uuid` |
| `table` | `table_image_id`, `chair_image_id` | `int` | `uuid` |

## Development Environment

In development, TypeORM is configured with `synchronize: true`, which means:

- The database schema is automatically synchronized with your entities
- No manual migration execution is needed
- **Just restart your application** and the schema will update automatically

## Production Environment

For production deployments, you should:

### 1. Disable Auto-Synchronization

Ensure your production config has:

```typescript
synchronize: false
```

### 2. Run Migrations Manually

```bash
# Generate migration (if needed)
npm run migration:generate -- -n ConvertIdsToUuid

# Run pending migrations
npm run migration:run

# Revert last migration (if needed)
npm run migration:revert
```

### 3. Add Migration Scripts to package.json

```json
{
  "scripts": {
    "migration:generate": "typeorm migration:generate",
    "migration:run": "typeorm migration:run",
    "migration:revert": "typeorm migration:revert",
    "migration:show": "typeorm migration:show"
  }
}
```

## Important Notes

⚠️ **Data Migration Considerations:**

1. **Fresh Database**: If you're working with a fresh database (no existing data), the migration will work seamlessly.

2. **Existing Data**: If you have existing data with integer IDs:
   - The migration generates new UUIDs for existing records
   - **Original integer ID references will be lost**
   - You may need to rebuild relationships or maintain a mapping table

3. **Foreign Key Constraints**:
   - Ensure all foreign key constraints are dropped before running the migration
   - Re-add them after the migration completes

4. **Backup Your Database**: Always backup your production database before running migrations!

## Rollback Strategy

The migration includes a `down()` method that:

- Converts UUIDs back to integers
- Sets all values to placeholder `1` (⚠️ **data loss**)
- Should only be used in emergencies

## Verification Steps

After migration, verify:

```sql
-- Check column types
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('menu', 'dish', 'restaurant', 'table')
AND column_name LIKE '%_id';

-- Verify data integrity
SELECT COUNT(*) FROM menu WHERE restaurant_id IS NOT NULL;
SELECT COUNT(*) FROM dish WHERE restaurant_id IS NOT NULL;
SELECT COUNT(*) FROM restaurant WHERE subscription_id IS NOT NULL;
SELECT COUNT(*) FROM "table" WHERE table_image_id IS NOT NULL;
```

## Development Workflow

For local development:

1. **Update ORM Entities** ✅ (Already done)
   - Changed column types in `*.orm-entity.ts` files

2. **Update Domain Types** ✅ (Already done)
   - Changed all domain interfaces and types

3. **Restart Application**

   ```bash
   npm run start:dev
   ```

4. **Verify Changes**
   - Check database schema with pgAdmin or `\d table_name` in psql
   - Test CRUD operations
   - Verify seeds work correctly

## Troubleshooting

### Issue: Migration fails with "column already exists"

**Solution**: Drop and recreate the database in development:

```bash
# Drop all tables
npm run db:drop

# Restart app (auto-sync will recreate schema)
npm run start:dev
```

### Issue: Seed data fails with "invalid UUID"

**Solution**: Ensure seed services use proper UUIDs:

```typescript
// ✅ Correct
restaurantId: randomUUID()
restaurantId: 'abc-123-uuid-format'

// ❌ Wrong
restaurantId: 1
restaurantId: '1'
```

### Issue: TypeORM query fails with "column type mismatch"

**Solution**: Clear TypeORM cache:

```bash
rm -rf dist/
npm run build
```

## Additional Resources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL UUID Type](https://www.postgresql.org/docs/current/datatype-uuid.html)
- [UUID Best Practices](https://www.postgresql.org/docs/current/uuid-ossp.html)
