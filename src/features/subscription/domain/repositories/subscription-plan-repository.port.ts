import { SubscriptionPlanEntity } from '../entities/subscription-plan.entity';
import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';
import { SubscriptionPlanUpdate } from '../types/subscription-plan-update.type';
import { SubscriptionPlanCreate } from '../types/subscription-plan-create.type';
import { PaginatedResult } from '@shared/application/types';
import { ListSubscriptionPlansQuery } from '@features/subscription/application/dtos/input/list-subscription-plans.query';

export abstract class ISubscriptionPlanRepositoryPort extends IBaseRepositoryPort<
  SubscriptionPlanEntity,
  SubscriptionPlanCreate,
  SubscriptionPlanUpdate
> {
  abstract paginate(
    query: ListSubscriptionPlansQuery,
  ): Promise<PaginatedResult<SubscriptionPlanEntity>>;
}
