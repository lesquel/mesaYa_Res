import { Injectable } from '@nestjs/common';

import {
  SubscriptionEntity,
  SubscriptionStateVO,
} from '../../../domain/entities';
import { SubscriptionOrmEntity } from '../orm/subscription.type-orm.entity';
import { SubscriptionOrmMapperPort } from '@features/subscription/application';

@Injectable()
export class SubscriptionOrmMapper extends SubscriptionOrmMapperPort<SubscriptionOrmEntity> {
  toDomain(entity: SubscriptionOrmEntity): SubscriptionEntity {
    return SubscriptionEntity.rehydrate({
      subscriptionId: entity.id,
      subscriptionPlanId: entity.subscriptionPlanId,
      restaurantId: entity.restaurantId,
      subscriptionStartDate: entity.subscriptionStartDate,
      stateSubscription: SubscriptionStateVO.create(entity.stateSubscription),
    });
  }

  toOrm(domain: SubscriptionEntity): SubscriptionOrmEntity {
    const snapshot = domain.snapshot();
    const ormEntity = new SubscriptionOrmEntity();
    ormEntity.id = snapshot.subscriptionId;
    ormEntity.subscriptionPlanId = snapshot.subscriptionPlanId;
    ormEntity.restaurantId = snapshot.restaurantId;
    ormEntity.subscriptionStartDate = snapshot.subscriptionStartDate;
    ormEntity.stateSubscription = snapshot.stateSubscription.value;

    return ormEntity;
  }
}
