import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Convert numeric IDs to UUID
 *
 * This migration converts all foreign key and reference columns from integer
 * to UUID type to maintain consistency across the application.
 *
 * Affected tables:
 * - menu: restaurant_id (int -> uuid)
 * - dish: restaurant_id, image_id (int -> uuid)
 * - restaurant: subscription_id, image_id (int -> uuid)
 * - table: table_image_id, chair_image_id (int -> uuid)
 */
export class ConvertIdsToUuid1729800000000 implements MigrationInterface {
  name = 'ConvertIdsToUuid1729800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // 1. MENU TABLE - Convert restaurant_id
    // ========================================

    // Add temporary UUID column
    await queryRunner.query(`
      ALTER TABLE "menu"
      ADD COLUMN "restaurant_id_uuid" UUID
    `);

    // If you have existing data, you'll need to map old IDs to new UUIDs
    // For now, we'll set existing rows to a placeholder or handle in application
    await queryRunner.query(`
      UPDATE "menu"
      SET "restaurant_id_uuid" = gen_random_uuid()
      WHERE "restaurant_id" IS NOT NULL
    `);

    // Drop old column and rename new one
    await queryRunner.query(`
      ALTER TABLE "menu"
      DROP COLUMN "restaurant_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "menu"
      RENAME COLUMN "restaurant_id_uuid" TO "restaurant_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "menu"
      ALTER COLUMN "restaurant_id" SET NOT NULL
    `);

    // ========================================
    // 2. DISH TABLE - Convert restaurant_id and image_id
    // ========================================

    // Convert restaurant_id
    await queryRunner.query(`
      ALTER TABLE "dish"
      ADD COLUMN "restaurant_id_uuid" UUID
    `);

    await queryRunner.query(`
      UPDATE "dish"
      SET "restaurant_id_uuid" = gen_random_uuid()
      WHERE "restaurant_id" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      DROP COLUMN "restaurant_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      RENAME COLUMN "restaurant_id_uuid" TO "restaurant_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      ALTER COLUMN "restaurant_id" SET NOT NULL
    `);

    // Convert image_id
    await queryRunner.query(`
      ALTER TABLE "dish"
      ADD COLUMN "image_id_uuid" UUID
    `);

    await queryRunner.query(`
      UPDATE "dish"
      SET "image_id_uuid" = gen_random_uuid()
      WHERE "image_id" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      DROP COLUMN "image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      RENAME COLUMN "image_id_uuid" TO "image_id"
    `);

    // ========================================
    // 3. RESTAURANT TABLE - Convert subscription_id and image_id
    // ========================================

    // Convert subscription_id
    await queryRunner.query(`
      ALTER TABLE "restaurant"
      ADD COLUMN "subscription_id_uuid" UUID
    `);

    await queryRunner.query(`
      UPDATE "restaurant"
      SET "subscription_id_uuid" = gen_random_uuid()
      WHERE "subscription_id" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      DROP COLUMN "subscription_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      RENAME COLUMN "subscription_id_uuid" TO "subscription_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      ALTER COLUMN "subscription_id" SET NOT NULL
    `);

    // Convert image_id
    await queryRunner.query(`
      ALTER TABLE "restaurant"
      ADD COLUMN "image_id_uuid" UUID
    `);

    await queryRunner.query(`
      UPDATE "restaurant"
      SET "image_id_uuid" = gen_random_uuid()
      WHERE "image_id" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      DROP COLUMN "image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      RENAME COLUMN "image_id_uuid" TO "image_id"
    `);

    // ========================================
    // 4. TABLE - Convert table_image_id and chair_image_id
    // ========================================

    // Convert table_image_id
    await queryRunner.query(`
      ALTER TABLE "table"
      ADD COLUMN "table_image_id_uuid" UUID
    `);

    await queryRunner.query(`
      UPDATE "table"
      SET "table_image_id_uuid" = gen_random_uuid()
      WHERE "table_image_id" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      DROP COLUMN "table_image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      RENAME COLUMN "table_image_id_uuid" TO "table_image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      ALTER COLUMN "table_image_id" SET NOT NULL
    `);

    // Convert chair_image_id
    await queryRunner.query(`
      ALTER TABLE "table"
      ADD COLUMN "chair_image_id_uuid" UUID
    `);

    await queryRunner.query(`
      UPDATE "table"
      SET "chair_image_id_uuid" = gen_random_uuid()
      WHERE "chair_image_id" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      DROP COLUMN "chair_image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      RENAME COLUMN "chair_image_id_uuid" TO "chair_image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      ALTER COLUMN "chair_image_id" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // ROLLBACK: Convert UUID back to INT
    // ========================================

    // Note: This will lose data if UUIDs don't map back to original integers
    // This is a destructive operation and should be used with caution

    // 1. MENU - Rollback restaurant_id
    await queryRunner.query(`
      ALTER TABLE "menu"
      ADD COLUMN "restaurant_id_int" INTEGER
    `);

    await queryRunner.query(`
      UPDATE "menu"
      SET "restaurant_id_int" = 1
      WHERE "restaurant_id" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "menu"
      DROP COLUMN "restaurant_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "menu"
      RENAME COLUMN "restaurant_id_int" TO "restaurant_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "menu"
      ALTER COLUMN "restaurant_id" SET NOT NULL
    `);

    // 2. DISH - Rollback restaurant_id and image_id
    await queryRunner.query(`
      ALTER TABLE "dish"
      ADD COLUMN "restaurant_id_int" INTEGER
    `);

    await queryRunner.query(`
      UPDATE "dish"
      SET "restaurant_id_int" = 1
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      DROP COLUMN "restaurant_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      RENAME COLUMN "restaurant_id_int" TO "restaurant_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      ALTER COLUMN "restaurant_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      ADD COLUMN "image_id_int" INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      DROP COLUMN "image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "dish"
      RENAME COLUMN "image_id_int" TO "image_id"
    `);

    // 3. RESTAURANT - Rollback subscription_id and image_id
    await queryRunner.query(`
      ALTER TABLE "restaurant"
      ADD COLUMN "subscription_id_int" INTEGER
    `);

    await queryRunner.query(`
      UPDATE "restaurant"
      SET "subscription_id_int" = 1
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      DROP COLUMN "subscription_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      RENAME COLUMN "subscription_id_int" TO "subscription_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      ALTER COLUMN "subscription_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      ADD COLUMN "image_id_int" INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      DROP COLUMN "image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant"
      RENAME COLUMN "image_id_int" TO "image_id"
    `);

    // 4. TABLE - Rollback table_image_id and chair_image_id
    await queryRunner.query(`
      ALTER TABLE "table"
      ADD COLUMN "table_image_id_int" INTEGER
    `);

    await queryRunner.query(`
      UPDATE "table"
      SET "table_image_id_int" = 1
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      DROP COLUMN "table_image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      RENAME COLUMN "table_image_id_int" TO "table_image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      ALTER COLUMN "table_image_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      ADD COLUMN "chair_image_id_int" INTEGER
    `);

    await queryRunner.query(`
      UPDATE "table"
      SET "chair_image_id_int" = 1
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      DROP COLUMN "chair_image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      RENAME COLUMN "chair_image_id_int" TO "chair_image_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "table"
      ALTER COLUMN "chair_image_id" SET NOT NULL
    `);
  }
}
