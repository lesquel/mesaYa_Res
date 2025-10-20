import { SubscriptionPlanEntity } from '../entities/subscription-plan.entity';
import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';
import { SubscriptionPlanUpdate } from '../types/subscription-plan-update.type';
import { SubscriptionPlanCreate } from '../types/subscription-plan-create.type';

export abstract class ISubscriptionPlanRepositoryPort extends IBaseRepositoryPort<
  SubscriptionPlanEntity,
  SubscriptionPlanCreate,
  SubscriptionPlanUpdate
> {}
