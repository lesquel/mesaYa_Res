import { SubscriptionEntity } from '../entities/subscription.entity';
import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';
import { SubscriptionCreate } from '../types/subscription-create.type';
import { SubscriptionUpdate } from '../types/subscription-update.type';

export abstract class ISubscriptionRepositoryPort extends IBaseRepositoryPort<
  SubscriptionEntity,
  SubscriptionCreate,
  SubscriptionUpdate
> {}
