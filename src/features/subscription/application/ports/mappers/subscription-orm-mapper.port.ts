import { SubscriptionEntity } from '@features/subscription/domain';
import { OrmMapperPort } from '@shared/application/ports/mappers/orm-mapper.port';

export const SUBSCRIPTION_ORM_MAPPER = Symbol('SUBSCRIPTION_ORM_MAPPER');

export abstract class SubscriptionOrmMapperPort<
  ORM = unknown,
> extends OrmMapperPort<SubscriptionEntity, ORM> {}
