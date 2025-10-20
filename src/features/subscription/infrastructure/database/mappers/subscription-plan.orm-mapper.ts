import { Injectable } from '@nestjs/common';

import { MoneyVO } from '@shared/domain/entities/values';
import {
  SubscriptionPlanEntity,
  SubscriptionPlanPeriodVO,
  SubscriptionPlanStateVO,
} from '../../../domain/entities';
import { SubscriptionPlanOrmEntity } from '../orm/subscription-plan.type-orm.entity';
import { SubscriptionPlanOrmMapperPort } from '@features/subscription/application';

@Injectable()
export class SubscriptionPlanOrmMapper extends SubscriptionPlanOrmMapperPort<SubscriptionPlanOrmEntity> {
  toOrm(domain: SubscriptionPlanEntity): SubscriptionPlanOrmEntity {
    const snapshot = domain.snapshot();
    const entity = new SubscriptionPlanOrmEntity();
    entity.id = snapshot.subscriptionPlanId;
    entity.name = snapshot.name;
    entity.price = snapshot.price.amount;
    entity.subscriptionPeriod = snapshot.subscriptionPeriod.value;
    entity.stateSubscriptionPlan = snapshot.stateSubscriptionPlan.value;

    return entity;
  }

  toDomain(entity: SubscriptionPlanOrmEntity): SubscriptionPlanEntity {
    return SubscriptionPlanEntity.rehydrate({
      subscriptionPlanId: entity.id,
      name: entity.name,
      price: new MoneyVO(Number(entity.price)),
      subscriptionPeriod: SubscriptionPlanPeriodVO.create(
        entity.subscriptionPeriod,
      ),
      stateSubscriptionPlan: SubscriptionPlanStateVO.create(
        entity.stateSubscriptionPlan,
      ),
    });
  }
}
