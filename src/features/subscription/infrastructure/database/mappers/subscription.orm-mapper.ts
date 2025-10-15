import {
  SubscriptionEntity,
  SubscriptionStateVO,
} from '../../../domain/entities';
import { SubscriptionOrmEntity } from '../orm/subscription.type-orm.entity';
import { SubscriptionPlanOrmEntity } from '../orm/subscription-plan.type-orm.entity';
import { RestaurantOrmEntity } from '@features/restaurants';

export interface SubscriptionOrmMapperOptions {
  existing?: SubscriptionOrmEntity;
  plan?: SubscriptionPlanOrmEntity;
  restaurant?: RestaurantOrmEntity;
}

export class SubscriptionOrmMapper {
  static toOrmEntity(
    subscription: SubscriptionEntity,
    options: SubscriptionOrmMapperOptions = {},
  ): SubscriptionOrmEntity {
    const snapshot = subscription.snapshot();
    const entity = options.existing ?? new SubscriptionOrmEntity();

    entity.id = snapshot.subscriptionId;
    entity.subscriptionPlanId = snapshot.subscriptionPlanId;
    entity.restaurantId = snapshot.restaurantId;
    entity.subscriptionStartDate = snapshot.subscriptionStartDate;
    entity.stateSubscription = snapshot.stateSubscription.value;
    if (options.plan) {
      entity.plan = options.plan;
    }
    if (options.restaurant) {
      entity.restaurant = options.restaurant;
    }

    return entity;
  }

  static toDomain(entity: SubscriptionOrmEntity): SubscriptionEntity {
    return SubscriptionEntity.rehydrate({
      subscriptionId: entity.id,
      subscriptionPlanId: entity.subscriptionPlanId,
      restaurantId: entity.restaurantId,
      subscriptionStartDate: entity.subscriptionStartDate,
      stateSubscription: SubscriptionStateVO.create(entity.stateSubscription),
    });
  }
}
