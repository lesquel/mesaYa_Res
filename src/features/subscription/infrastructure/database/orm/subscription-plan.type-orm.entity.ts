import {
  SubscriptionPlanPeriodsEnum,
  SubscriptionPlanStatesEnum,
} from '@features/subscription/domain/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SubscriptionOrmEntity } from './subscription.type-orm.entity';

@Entity({ name: 'subscription_plan' })
export class SubscriptionPlanOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'subscription_plan_id' })
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({
    type: 'enum',
    enum: SubscriptionPlanPeriodsEnum,
    name: 'subscription_period',
    nullable: false,
  })
  subscriptionPeriod: SubscriptionPlanPeriodsEnum;

  @Column({
    type: 'enum',
    enum: SubscriptionPlanStatesEnum,
    name: 'state_subscription_plan',
    nullable: false,
  })
  stateSubscriptionPlan: SubscriptionPlanStatesEnum;

  @OneToMany(
    () => SubscriptionOrmEntity,
    (subscription) => subscription.subscriptionPlan,
  )
  subscriptions: SubscriptionOrmEntity[];

  // 🕒 Auditoría
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
