import { SubscriptionEntity } from '../entities/subscription.entity';
import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';
import { SubscriptionCreate } from '../types/subscription-create.type';
import { SubscriptionUpdate } from '../types/subscription-update.type';
import { PaginatedResult } from '@shared/application/types/pagination';
import { ListSubscriptionsQuery } from '@features/subscription/application/dtos/input/list-subscriptions.query';

export abstract class ISubscriptionRepositoryPort extends IBaseRepositoryPort<
  SubscriptionEntity,
  SubscriptionCreate,
  SubscriptionUpdate
> {
  abstract paginate(
    query: ListSubscriptionsQuery,
  ): Promise<PaginatedResult<SubscriptionEntity>>;
}
