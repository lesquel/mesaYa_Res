-- Migration: Add Payment MS columns to payments table
-- Run this script against your PostgreSQL database

-- Step 1: Add new values to the payment_status enum
-- PostgreSQL doesn't support IF NOT EXISTS for ALTER TYPE, so we use a workaround
DO $$
BEGIN
    -- Add PROCESSING if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PROCESSING'
                   AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payments_payment_status_enum')) THEN
        ALTER TYPE payments_payment_status_enum ADD VALUE 'PROCESSING';
    END IF;
END $$;

DO $$
BEGIN
    -- Add FAILED if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'FAILED'
                   AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payments_payment_status_enum')) THEN
        ALTER TYPE payments_payment_status_enum ADD VALUE 'FAILED';
    END IF;
END $$;

DO $$
BEGIN
    -- Add REFUNDED if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REFUNDED'
                   AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payments_payment_status_enum')) THEN
        ALTER TYPE payments_payment_status_enum ADD VALUE 'REFUNDED';
    END IF;
END $$;

-- Step 2: Add new columns for Payment Microservice
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'usd';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type varchar(20) DEFAULT 'reservation';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider varchar(50) DEFAULT 'mock';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_payment_id varchar(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_url text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_email varchar(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_name varchar(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS idempotency_key varchar(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_reason text;

-- Add unique constraint for idempotency_key (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'payments_idempotency_key_key'
    ) THEN
        ALTER TABLE payments ADD CONSTRAINT payments_idempotency_key_key UNIQUE (idempotency_key);
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;
