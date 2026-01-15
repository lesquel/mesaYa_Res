/**
 * Partner ORM Entity
 *
 * TypeORM entity for partner webhook registration.
 * Maps to 'partners' table in PostgreSQL.
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PartnerStatusORM {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('partners')
export class PartnerOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ name: 'webhook_url' })
  webhookUrl: string;

  @Column({ name: 'secret' })
  secret: string;

  @Column({
    type: 'enum',
    enum: PartnerStatusORM,
    default: PartnerStatusORM.ACTIVE,
  })
  @Index()
  status: PartnerStatusORM;

  @Column('simple-array', { name: 'events' })
  events: string[];

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'contact_email', nullable: true })
  contactEmail?: string;

  @Column({ name: 'api_version', default: 'v1' })
  apiVersion: string;

  @Column({ name: 'failed_attempts', default: 0 })
  failedAttempts: number;

  @Column({ name: 'last_webhook_at', type: 'timestamp', nullable: true })
  lastWebhookAt?: Date;

  @Column({ name: 'last_success_at', type: 'timestamp', nullable: true })
  lastSuccessAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;
}
