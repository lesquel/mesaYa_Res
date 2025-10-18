import { SubscriptionStatesEnum } from '@features/subscription/domain/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionPlanOrmEntity } from './subscription-plan.type-orm.entity';
import { RestaurantOrmEntity } from '@features/restaurants';

@Entity({ name: 'subscription' })
export class SubscriptionOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'subscription_id' })
  id: string;

  @Column({ type: 'uuid', name: 'subscription_plan_id', nullable: false })
  subscriptionPlanId: string;

  @Column({ type: 'uuid', name: 'restaurant_id', nullable: false })
  restaurantId: string;

  @Column({
    type: 'timestamp',
    name: 'subscription_start_date',
    nullable: false,
  })
  subscriptionStartDate: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionStatesEnum,
    name: 'state_subscription',
    nullable: false,
  })
  stateSubscription: SubscriptionStatesEnum;

  @ManyToOne(() => SubscriptionPlanOrmEntity, (plan) => plan.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_plan_id', referencedColumnName: 'id' })
  subscriptionPlan: SubscriptionPlanOrmEntity;

  @ManyToOne(() => RestaurantOrmEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: RestaurantOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
