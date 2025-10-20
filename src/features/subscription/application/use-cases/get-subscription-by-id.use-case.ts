import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionDomainService } from '@features/subscription/domain';
import { SubscriptionMapper } from '../mappers';
import { GetSubscriptionByIdDto } from '../dtos/input/get-subscription-by-id.dto';
import { SubscriptionResponseDto } from '../dtos/output/subscription-response.dto';

export class GetSubscriptionByIdUseCase
  implements UseCase<GetSubscriptionByIdDto, SubscriptionResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionDomainService: SubscriptionDomainService,
    private readonly subscriptionMapper: SubscriptionMapper,
  ) {}

  async execute(dto: GetSubscriptionByIdDto): Promise<SubscriptionResponseDto> {
    this.logger.log(
      `Fetching subscription with ID: ${dto.subscriptionId}`,
      'GetSubscriptionByIdUseCase',
    );

    const subscription =
      await this.subscriptionDomainService.findSubscriptionById(
        dto.subscriptionId,
      );

    this.logger.log(
      `Subscription retrieved with ID: ${subscription.id}`,
      'GetSubscriptionByIdUseCase',
    );

    return this.subscriptionMapper.fromEntitytoDTO(subscription);
  }
}
