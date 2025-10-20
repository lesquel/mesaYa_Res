import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionDomainService } from '@features/subscription/domain';
import type { SubscriptionEntity } from '@features/subscription/domain';
import { SubscriptionMapper } from '../mappers';
import { SubscriptionListResponseDto } from '../dtos/output/subscription-list-response.dto';

export class ListSubscriptionsUseCase
  implements
    UseCase<PaginatedQueryParams | undefined, SubscriptionListResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionDomainService: SubscriptionDomainService,
    private readonly subscriptionMapper: SubscriptionMapper,
  ) {}

  async execute(
    params?: PaginatedQueryParams,
  ): Promise<SubscriptionListResponseDto> {
    this.logger.log('Fetching all subscriptions', 'ListSubscriptionsUseCase');

    const subscriptions =
      await this.subscriptionDomainService.findAllSubscriptions();

    const filtered = this.applySearch(subscriptions, params?.search);
    const sorted = this.applySorting(
      filtered,
      params?.sortBy,
      params?.sortOrder,
    );
    const paginated = this.applyPagination(sorted, params);

    this.logger.log(
      `Fetched ${paginated.length} subscription(s)`,
      'ListSubscriptionsUseCase',
    );

    return paginated.map((subscription) =>
      this.subscriptionMapper.fromEntitytoDTO(subscription),
    );
  }

  private applySearch(
    subscriptions: SubscriptionEntity[],
    search?: string,
  ): SubscriptionEntity[] {
    if (!search) {
      return subscriptions;
    }

    const term = search.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const snapshot = subscription.snapshot();
      return [
        snapshot.subscriptionId,
        snapshot.subscriptionPlanId,
        snapshot.restaurantId,
        snapshot.stateSubscription.value,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }

  private applySorting(
    subscriptions: SubscriptionEntity[],
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' | undefined = 'DESC',
  ): SubscriptionEntity[] {
    const direction = sortOrder === 'ASC' ? 1 : -1;
    const normalized = sortBy?.toLowerCase();

    const comparator = (a: SubscriptionEntity, b: SubscriptionEntity) => {
      switch (normalized) {
        case 'planid':
        case 'subscriptionplanid':
          return a.planId.localeCompare(b.planId) * direction;
        case 'restaurantid':
          return a.restaurantId.localeCompare(b.restaurantId) * direction;
        case 'state':
        case 'statesubscription':
          return a.state.value.localeCompare(b.state.value) * direction;
        case 'startdate':
        case 'subscriptionstartdate':
        default:
          return (a.startDate.getTime() - b.startDate.getTime()) * direction;
      }
    };

    return [...subscriptions].sort(comparator);
  }

  private applyPagination(
    subscriptions: SubscriptionEntity[],
    params?: PaginatedQueryParams,
  ): SubscriptionEntity[] {
    if (!params?.pagination) {
      return subscriptions;
    }

    const limit = params.pagination.limit ?? subscriptions.length;
    const offset =
      params.pagination.offset ??
      ((params.pagination.page ?? 1) - 1) *
        (params.pagination.limit ?? subscriptions.length);

    if (limit <= 0) {
      return subscriptions;
    }

    return subscriptions.slice(offset, offset + limit);
  }
}
