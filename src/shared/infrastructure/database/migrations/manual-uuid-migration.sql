-- ============================================
-- UUID Migration Script for PostgreSQL
-- ============================================
-- This script converts integer ID columns to UUID
-- Execute this ONLY if you need manual migration
-- (For development with synchronize:true, just restart the app)
-- ============================================

-- WARNING: This script will LOSE existing data mappings!
-- BACKUP YOUR DATABASE before running!

BEGIN;

-- ============================================
-- 1. MENU TABLE - Convert restaurant_id
-- ============================================

-- Add new UUID column
ALTER TABLE "menu"
ADD COLUMN IF NOT EXISTS "restaurant_id_new" UUID;

-- Generate UUIDs for existing records (if any)
-- Note: This breaks the relationship with actual restaurants!
UPDATE "menu"
SET "restaurant_id_new" = gen_random_uuid()
WHERE "restaurant_id" IS NOT NULL;

-- Drop old column
ALTER TABLE "menu"
DROP COLUMN IF EXISTS "restaurant_id";

-- Rename new column
ALTER TABLE "menu"
RENAME COLUMN "restaurant_id_new" TO "restaurant_id";

-- Add NOT NULL constraint
ALTER TABLE "menu"
ALTER COLUMN "restaurant_id" SET NOT NULL;

-- ============================================
-- 2. DISH TABLE - Convert restaurant_id and image_id
-- ============================================

-- Convert restaurant_id
ALTER TABLE "dish"
ADD COLUMN IF NOT EXISTS "restaurant_id_new" UUID;

UPDATE "dish"
SET "restaurant_id_new" = gen_random_uuid()
WHERE "restaurant_id" IS NOT NULL;

ALTER TABLE "dish"
DROP COLUMN IF EXISTS "restaurant_id";

ALTER TABLE "dish"
RENAME COLUMN "restaurant_id_new" TO "restaurant_id";

ALTER TABLE "dish"
ALTER COLUMN "restaurant_id" SET NOT NULL;

-- Convert image_id (nullable)
ALTER TABLE "dish"
ADD COLUMN IF NOT EXISTS "image_id_new" UUID;

UPDATE "dish"
SET "image_id_new" = gen_random_uuid()
WHERE "image_id" IS NOT NULL;

ALTER TABLE "dish"
DROP COLUMN IF EXISTS "image_id";

ALTER TABLE "dish"
RENAME COLUMN "image_id_new" TO "image_id";

-- ============================================
-- 3. RESTAURANT TABLE - Convert subscription_id and image_id
-- ============================================

-- Convert subscription_id
ALTER TABLE "restaurant"
ADD COLUMN IF NOT EXISTS "subscription_id_new" UUID;

UPDATE "restaurant"
SET "subscription_id_new" = gen_random_uuid()
WHERE "subscription_id" IS NOT NULL;

ALTER TABLE "restaurant"
DROP COLUMN IF EXISTS "subscription_id";

ALTER TABLE "restaurant"
RENAME COLUMN "subscription_id_new" TO "subscription_id";

ALTER TABLE "restaurant"
ALTER COLUMN "subscription_id" SET NOT NULL;

-- Convert image_id (nullable)
ALTER TABLE "restaurant"
ADD COLUMN IF NOT EXISTS "image_id_new" UUID;

UPDATE "restaurant"
SET "image_id_new" = gen_random_uuid()
WHERE "image_id" IS NOT NULL;

ALTER TABLE "restaurant"
DROP COLUMN IF EXISTS "image_id";

ALTER TABLE "restaurant"
RENAME COLUMN "image_id_new" TO "image_id";

-- ============================================
-- 4. TABLE - Convert table_image_id and chair_image_id
-- ============================================

-- Convert table_image_id
ALTER TABLE "table"
ADD COLUMN IF NOT EXISTS "table_image_id_new" UUID;

UPDATE "table"
SET "table_image_id_new" = gen_random_uuid()
WHERE "table_image_id" IS NOT NULL;

ALTER TABLE "table"
DROP COLUMN IF EXISTS "table_image_id";

ALTER TABLE "table"
RENAME COLUMN "table_image_id_new" TO "table_image_id";

ALTER TABLE "table"
ALTER COLUMN "table_image_id" SET NOT NULL;

-- Convert chair_image_id
ALTER TABLE "table"
ADD COLUMN IF NOT EXISTS "chair_image_id_new" UUID;

UPDATE "table"
SET "chair_image_id_new" = gen_random_uuid()
WHERE "chair_image_id" IS NOT NULL;

ALTER TABLE "table"
DROP COLUMN IF EXISTS "chair_image_id";

ALTER TABLE "table"
RENAME COLUMN "chair_image_id_new" TO "chair_image_id";

ALTER TABLE "table"
ALTER COLUMN "chair_image_id" SET NOT NULL;

-- ============================================
-- COMMIT TRANSACTION
-- ============================================

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check column types
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('menu', 'dish', 'restaurant', 'table')
  AND column_name LIKE '%_id'
ORDER BY table_name, column_name;

-- Check data counts
SELECT 'menu' as table_name, COUNT(*) as total, COUNT(restaurant_id) as with_restaurant_id FROM "menu"
UNION ALL
SELECT 'dish', COUNT(*), COUNT(restaurant_id) FROM "dish"
UNION ALL
SELECT 'restaurant', COUNT(*), COUNT(subscription_id) FROM "restaurant"
UNION ALL
SELECT 'table', COUNT(*), COUNT(table_image_id) FROM "table";
