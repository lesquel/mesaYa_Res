import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionDomainService } from '@features/subscription/domain';
import { SubscriptionMapper } from '../mappers';
import { UpdateSubscriptionStateDto } from '../dtos/input/update-subscription-state.dto';
import { SubscriptionResponseDto } from '../dtos/output/subscription-response.dto';

export class UpdateSubscriptionStateUseCase
  implements UseCase<UpdateSubscriptionStateDto, SubscriptionResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionDomainService: SubscriptionDomainService,
    private readonly subscriptionMapper: SubscriptionMapper,
  ) {}

  async execute(
    dto: UpdateSubscriptionStateDto,
  ): Promise<SubscriptionResponseDto> {
    this.logger.log(
      `Updating subscription state ${dto.subscriptionId} -> ${dto.stateSubscription}`,
      'UpdateSubscriptionStateUseCase',
    );

    const subscriptionUpdate =
      this.subscriptionMapper.fromUpdateStateDtoToDomain(dto);

    const subscription =
      await this.subscriptionDomainService.updateSubscription(
        subscriptionUpdate,
      );

    this.logger.log(
      `Subscription state updated ${subscription.id}`,
      'UpdateSubscriptionStateUseCase',
    );

    return this.subscriptionMapper.fromEntitytoDTO(subscription);
  }
}
