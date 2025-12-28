import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types';
import type { PaginatedResult } from '@shared/application/types';
import { UseCase } from '@shared/application/ports/use-case.port';

import { ISubscriptionRepositoryPort } from '@features/subscription/domain/repositories';
import { SubscriptionMapper } from '../mappers';
import { SubscriptionResponseDto } from '../dtos/output/subscription-response.dto';

export type PaginatedSubscriptionResponse =
  PaginatedResult<SubscriptionResponseDto>;

export class ListSubscriptionsUseCase
  implements UseCase<PaginatedQueryParams, PaginatedSubscriptionResponse>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionRepository: ISubscriptionRepositoryPort,
    private readonly subscriptionMapper: SubscriptionMapper,
  ) {}

  async execute(
    params: PaginatedQueryParams,
  ): Promise<PaginatedSubscriptionResponse> {
    this.logger.log(
      'Fetching subscriptions with pagination',
      'ListSubscriptionsUseCase',
    );

    const query = {
      pagination: params.pagination,
      route: params.route,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      search: params.search,
    };

    const paginatedResult = await this.subscriptionRepository.paginate(query);

    this.logger.log(
      `Fetched ${paginatedResult.results.length} subscription(s) from ${paginatedResult.total} total`,
      'ListSubscriptionsUseCase',
    );

    return {
      ...paginatedResult,
      results: paginatedResult.results.map((subscription) =>
        this.subscriptionMapper.fromEntitytoDTO(subscription),
      ),
    };
  }
}
