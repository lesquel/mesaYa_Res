import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRestaurantScheduleSlot1731620000000
  implements MigrationInterface
{
  name = 'CreateRestaurantScheduleSlot1731620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "restaurant_schedule_slot" (
        "schedule_slot_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" uuid NOT NULL,
        "summary" character varying(120) NOT NULL,
        "weekday" character varying(16) NOT NULL,
        "open_time" time NOT NULL,
        "close_time" time NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_restaurant_schedule_slot" PRIMARY KEY ("schedule_slot_id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurant_schedule_slot"
      ADD CONSTRAINT "FK_restaurant_schedule_slot_restaurant"
      FOREIGN KEY ("restaurant_id") REFERENCES "restaurant" ("restaurant_id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_restaurant_schedule_slot_restaurant"
      ON "restaurant_schedule_slot" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_restaurant_schedule_slot_restaurant_day"
      ON "restaurant_schedule_slot" ("restaurant_id", "weekday")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_restaurant_schedule_slot_restaurant_day"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_restaurant_schedule_slot_restaurant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurant_schedule_slot" DROP CONSTRAINT "FK_restaurant_schedule_slot_restaurant"`,
    );
    await queryRunner.query(`DROP TABLE "restaurant_schedule_slot"`);
  }
}
