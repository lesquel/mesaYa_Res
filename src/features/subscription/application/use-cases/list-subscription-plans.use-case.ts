import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionPlanDomainService } from '@features/subscription/domain';
import type { SubscriptionPlanEntity } from '@features/subscription/domain';
import { SubscriptionPlanMapper } from '../mappers';
import { SubscriptionPlanListResponseDto } from '../dtos/output/subscription-plan-list-response.dto';

export class ListSubscriptionPlansUseCase
  implements
    UseCase<PaginatedQueryParams | undefined, SubscriptionPlanListResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionPlanDomainService: SubscriptionPlanDomainService,
    private readonly subscriptionPlanMapper: SubscriptionPlanMapper,
  ) {}

  async execute(
    params?: PaginatedQueryParams,
  ): Promise<SubscriptionPlanListResponseDto> {
    this.logger.log(
      'Fetching all subscription plans',
      'ListSubscriptionPlansUseCase',
    );

    const plans =
      await this.subscriptionPlanDomainService.findAllSubscriptionPlans();

    const filtered = this.applySearch(plans, params?.search);
    const sorted = this.applySorting(
      filtered,
      params?.sortBy,
      params?.sortOrder,
    );
    const paginated = this.applyPagination(sorted, params);

    this.logger.log(
      `Fetched ${paginated.length} subscription plan(s)`,
      'ListSubscriptionPlansUseCase',
    );

    return paginated.map((plan) =>
      this.subscriptionPlanMapper.fromEntitytoDTO(plan),
    );
  }

  private applySearch(
    plans: SubscriptionPlanEntity[],
    search?: string,
  ): SubscriptionPlanEntity[] {
    if (!search) {
      return plans;
    }

    const term = search.trim().toLowerCase();

    return plans.filter((plan) => {
      const snapshot = plan.snapshot();
      return [
        snapshot.subscriptionPlanId,
        snapshot.name,
        snapshot.subscriptionPeriod.value,
        snapshot.stateSubscriptionPlan.value,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }

  private applySorting(
    plans: SubscriptionPlanEntity[],
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' | undefined = 'ASC',
  ): SubscriptionPlanEntity[] {
    const direction = sortOrder === 'DESC' ? -1 : 1;
    const normalized = sortBy?.toLowerCase();

    const comparator = (
      a: SubscriptionPlanEntity,
      b: SubscriptionPlanEntity,
    ) => {
      switch (normalized) {
        case 'name':
          return a.name.localeCompare(b.name) * direction;
        case 'price':
          return (a.price.amount - b.price.amount) * direction;
        case 'period':
        case 'subscriptionperiod':
          return a.period.value.localeCompare(b.period.value) * direction;
        case 'state':
        case 'statesubscriptionplan':
          return a.state.value.localeCompare(b.state.value) * direction;
        default:
          return a.id.localeCompare(b.id) * direction;
      }
    };

    return [...plans].sort(comparator);
  }

  private applyPagination(
    plans: SubscriptionPlanEntity[],
    params?: PaginatedQueryParams,
  ): SubscriptionPlanEntity[] {
    if (!params?.pagination) {
      return plans;
    }

    const limit = params.pagination.limit ?? plans.length;
    const offset =
      params.pagination.offset ??
      ((params.pagination.page ?? 1) - 1) *
        (params.pagination.limit ?? plans.length);

    if (limit <= 0) {
      return plans;
    }

    return plans.slice(offset, offset + limit);
  }
}
