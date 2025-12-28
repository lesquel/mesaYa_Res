import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types';
import type { PaginatedResult } from '@shared/application/types';
import { UseCase } from '@shared/application/ports/use-case.port';

import { ISubscriptionPlanRepositoryPort } from '@features/subscription/domain/repositories';
import { SubscriptionPlanMapper } from '../mappers';
import { SubscriptionPlanResponseDto } from '../dtos/output/subscription-plan-response.dto';

export type PaginatedSubscriptionPlanResponse =
  PaginatedResult<SubscriptionPlanResponseDto>;

export class ListSubscriptionPlansUseCase
  implements UseCase<PaginatedQueryParams, PaginatedSubscriptionPlanResponse>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionPlanRepository: ISubscriptionPlanRepositoryPort,
    private readonly subscriptionPlanMapper: SubscriptionPlanMapper,
  ) {}

  async execute(
    params: PaginatedQueryParams,
  ): Promise<PaginatedSubscriptionPlanResponse> {
    this.logger.log(
      'Fetching subscription plans with pagination',
      'ListSubscriptionPlansUseCase',
    );

    const query = {
      pagination: params.pagination,
      route: params.route,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      search: params.search,
    };

    const paginatedResult =
      await this.subscriptionPlanRepository.paginate(query);

    this.logger.log(
      `Fetched ${paginatedResult.results.length} subscription plan(s) from ${paginatedResult.total} total`,
      'ListSubscriptionPlansUseCase',
    );

    return {
      ...paginatedResult,
      results: paginatedResult.results.map((plan) =>
        this.subscriptionPlanMapper.fromEntitytoDTO(plan),
      ),
    };
  }
}
