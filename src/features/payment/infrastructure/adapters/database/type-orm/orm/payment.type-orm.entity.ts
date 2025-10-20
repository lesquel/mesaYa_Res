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

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    name: 'payment_status',
    nullable: false,
  })
  paymentStatus: PaymentStatusEnum;

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
