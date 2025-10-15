import { MoneyVO } from '@shared/domain/entities/values';
import {
  SubscriptionPlanEntity,
  SubscriptionPlanPeriodVO,
  SubscriptionPlanStateVO,
} from '../../../domain/entities';
import { SubscriptionPlanOrmEntity } from '../orm/subscription-plan.type-orm.entity';

export interface SubscriptionPlanOrmMapperOptions {
  existing?: SubscriptionPlanOrmEntity;
}

export class SubscriptionPlanOrmMapper {
  static toOrmEntity(
    plan: SubscriptionPlanEntity,
    options: SubscriptionPlanOrmMapperOptions = {},
  ): SubscriptionPlanOrmEntity {
    const snapshot = plan.snapshot();
    const entity = options.existing ?? new SubscriptionPlanOrmEntity();

    entity.id = snapshot.subscriptionPlanId;
    entity.name = snapshot.name;
    entity.price = snapshot.price.amount;
    entity.subscriptionPeriod = snapshot.subscriptionPeriod.value;
    entity.stateSubscriptionPlan = snapshot.stateSubscriptionPlan.value;

    return entity;
  }

  static toDomain(entity: SubscriptionPlanOrmEntity): SubscriptionPlanEntity {
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
