import { ReservationOrmEntity as ReservationOrmEntity } from '@features/reservation';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('payment')
export class PaymentOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_id' })
  id!: string;

  @OneToOne(() => ReservationOrmEntity, { nullable: true })
  @JoinColumn({ name: 'reservation_id', referencedColumnName: 'id' })
  reservation!: ReservationOrmEntity | null;

  // @OneToOne(() => SubscriptionOrmEntity, { nullable: true })
  // subscription!: SubscriptionOrmEntity | null;

  @Column({ type: 'decimal' })
  amount!: number;

  @Column({ type: 'varchar', length: 10 })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
