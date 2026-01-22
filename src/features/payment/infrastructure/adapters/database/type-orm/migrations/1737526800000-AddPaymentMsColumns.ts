import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add columns required by Payment Microservice.
 *
 * These columns enable the Payment MS to store additional payment information
 * such as provider details, checkout URLs, and payer information.
 */
export class AddPaymentMsColumns1737526800000 implements MigrationInterface {
  name = 'AddPaymentMsColumns1737526800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns for Payment MS
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD COLUMN IF NOT EXISTS "user_id" uuid,
      ADD COLUMN IF NOT EXISTS "currency" varchar(3) DEFAULT 'usd',
      ADD COLUMN IF NOT EXISTS "payment_type" varchar(20) DEFAULT 'reservation',
      ADD COLUMN IF NOT EXISTS "provider" varchar(50) DEFAULT 'mock',
      ADD COLUMN IF NOT EXISTS "provider_payment_id" varchar(255),
      ADD COLUMN IF NOT EXISTS "checkout_url" text,
      ADD COLUMN IF NOT EXISTS "payer_email" varchar(255),
      ADD COLUMN IF NOT EXISTS "payer_name" varchar(255),
      ADD COLUMN IF NOT EXISTS "description" text,
      ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "idempotency_key" varchar(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS "failure_reason" text
    `);

    console.log('✅ Payment MS columns added successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove Payment MS columns
    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP COLUMN IF EXISTS "user_id",
      DROP COLUMN IF EXISTS "currency",
      DROP COLUMN IF EXISTS "payment_type",
      DROP COLUMN IF EXISTS "provider",
      DROP COLUMN IF EXISTS "provider_payment_id",
      DROP COLUMN IF EXISTS "checkout_url",
      DROP COLUMN IF EXISTS "payer_email",
      DROP COLUMN IF EXISTS "payer_name",
      DROP COLUMN IF EXISTS "description",
      DROP COLUMN IF EXISTS "metadata",
      DROP COLUMN IF EXISTS "idempotency_key",
      DROP COLUMN IF EXISTS "failure_reason"
    `);
  }
}
