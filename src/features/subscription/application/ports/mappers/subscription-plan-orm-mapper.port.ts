import { SubscriptionPlanEntity } from '@features/subscription/domain';
import { OrmMapperPort } from '@shared/application/ports/mappers/orm-mapper.port';

export const SUBSCRIPTION_PLAN_ORM_MAPPER = Symbol(
  'SUBSCRIPTION_PLAN_ORM_MAPPER',
);

export abstract class SubscriptionPlanOrmMapperPort<
  ORM = unknown,
> extends OrmMapperPort<SubscriptionPlanEntity, ORM> {}
