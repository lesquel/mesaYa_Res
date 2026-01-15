/**
 * Partner ORM Entity
 *
 * TypeORM entity for persisting partners in the database.
 */

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('partners')
export class PartnerOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_partner_name')
  name!: string;

  @Column({ type: 'varchar', length: 500, name: 'webhook_url' })
  webhookUrl!: string;

  @Column({ type: 'varchar', length: 64 })
  secret!: string;

  @Column({ type: 'simple-array', name: 'subscribed_events' })
  subscribedEvents!: string[];

  @Column({ type: 'varchar', length: 20, default: 'active' })
  @Index('idx_partner_status')
  status!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'contact_email' })
  contactEmail?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_webhook_at' })
  lastWebhookAt?: Date;

  @Column({ type: 'int', default: 0, name: 'failed_webhook_count' })
  failedWebhookCount!: number;
}
