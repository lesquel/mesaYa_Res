import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionDomainService } from '@features/subscription/domain';
import { SubscriptionMapper } from '../mappers';
import { SubscriptionListResponseDto } from '../dtos/output/subscription-list-response.dto';

export class ListSubscriptionsUseCase
  implements UseCase<void, SubscriptionListResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionDomainService: SubscriptionDomainService,
    private readonly subscriptionMapper: SubscriptionMapper,
  ) {}

  async execute(): Promise<SubscriptionListResponseDto> {
    this.logger.log('Fetching all subscriptions', 'ListSubscriptionsUseCase');

    const subscriptions =
      await this.subscriptionDomainService.findAllSubscriptions();

    this.logger.log(
      `Fetched ${subscriptions.length} subscription(s)`,
      'ListSubscriptionsUseCase',
    );

    return subscriptions.map((subscription) =>
      this.subscriptionMapper.fromEntitytoDTO(subscription),
    );
  }
}
