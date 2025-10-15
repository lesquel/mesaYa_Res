import { SubscriptionPlanEntity } from '../../../domain/entities/subscription-plan.entity.js';
import {
  SubscriptionPlanCreatePort,
  SubscriptionPlanUpdatePort,
} from '../models/subscription-plan-repository.port-models.js';
import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';

export abstract class ISubscriptionPlanRepositoryPort extends IBaseRepositoryPort<
  SubscriptionPlanEntity,
  SubscriptionPlanCreatePort,
  SubscriptionPlanUpdatePort
> {}
