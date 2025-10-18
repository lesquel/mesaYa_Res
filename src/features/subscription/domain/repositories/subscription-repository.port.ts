import { SubscriptionEntity } from '../entities/subscription.entity.js';
import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';
import { SubscriptionCreate } from '../types/subscription-create.type.js';
import { SubscriptionUpdate } from '../types/subscription-update.type.js';

export abstract class ISubscriptionRepositoryPort extends IBaseRepositoryPort<
  SubscriptionEntity,
  SubscriptionCreate,
  SubscriptionUpdate
> {}
