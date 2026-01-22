import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentStatusEnum } from '@features/payment/domain/enums';
import { SubscriptionOrmEntity } from '@features/subscription/';
import { ReservationOrmEntity } from '@features/reservation';

@Entity({ name: 'payments' })
export class PaymentOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_id' })
  id: string;

  @Column({ type: 'uuid', name: 'reservation_id', nullable: true })
  reservationId?: string;

  @Column({ type: 'uuid', name: 'subscription_id', nullable: true })
  subscriptionId?: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'usd', nullable: true })
  currency?: string;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    name: 'payment_status',
    nullable: false,
  })
  paymentStatus: PaymentStatusEnum;

  @Column({ type: 'varchar', length: 20, name: 'payment_type', default: 'reservation', nullable: true })
  paymentType?: string;

  @Column({ type: 'varchar', length: 50, default: 'mock', nullable: true })
  provider?: string;

  @Column({ type: 'varchar', length: 255, name: 'provider_payment_id', nullable: true })
  providerPaymentId?: string;

  @Column({ type: 'text', name: 'checkout_url', nullable: true })
  checkoutUrl?: string;

  @Column({ type: 'varchar', length: 255, name: 'payer_email', nullable: true })
  payerEmail?: string;

  @Column({ type: 'varchar', length: 255, name: 'payer_name', nullable: true })
  payerName?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: {}, nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: 'varchar', length: 255, name: 'idempotency_key', unique: true, nullable: true })
  idempotencyKey?: string;

  @Column({ type: 'text', name: 'failure_reason', nullable: true })
  failureReason?: string;

  @ManyToOne(() => ReservationOrmEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reservation_id', referencedColumnName: 'id' })
  reservation?: ReservationOrmEntity;

  @ManyToOne(() => SubscriptionOrmEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'subscription_id', referencedColumnName: 'id' })
  subscription?: SubscriptionOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
