import { SubscriptionEntity } from '../../../domain/entities/subscription.entity.js';
import {
  SubscriptionCreatePort,
  SubscriptionUpdatePort,
} from '../models/subscription-repository.port-models.js';
import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';

export abstract class ISubscriptionRepositoryPort extends IBaseRepositoryPort<
  SubscriptionEntity,
  SubscriptionCreatePort,
  SubscriptionUpdatePort
> {}
