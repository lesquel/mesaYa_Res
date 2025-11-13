import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRestaurantStatusAndAdminNote1730500000000
  implements MigrationInterface
{
  name = 'AddRestaurantStatusAndAdminNote1730500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "restaurant" ADD "status" character varying(20) NOT NULL DEFAULT 'ACTIVE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurant" ADD "admin_note" character varying(500)`,
    );
    await queryRunner.query(
      `UPDATE "restaurant" SET "status" = CASE WHEN "active" = true THEN 'ACTIVE' ELSE 'SUSPENDED' END`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "restaurant" DROP COLUMN "admin_note"`,
    );
    await queryRunner.query(`ALTER TABLE "restaurant" DROP COLUMN "status"`);
  }
}
