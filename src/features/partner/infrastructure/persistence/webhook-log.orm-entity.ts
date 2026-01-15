/**
 * Webhook Log ORM Entity
 *
 * TypeORM entity for persisting webhook logs in the database.
 */

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('webhook_logs')
export class WebhookLogOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'partner_id' })
  @Index('idx_webhook_log_partner')
  partnerId!: string;

  @Column({ type: 'varchar', length: 20 })
  direction!: string;

  @Column({ type: 'varchar', length: 100, name: 'event_type' })
  @Index('idx_webhook_log_event')
  eventType!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  @Index('idx_webhook_log_status')
  status!: string;

  @Column({ type: 'int', nullable: true, name: 'status_code' })
  statusCode?: number;

  @Column({ type: 'text', nullable: true, name: 'response_body' })
  responseBody?: string;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage?: string;

  @Column({ type: 'int', default: 0, name: 'retry_count' })
  retryCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt?: Date;
}
