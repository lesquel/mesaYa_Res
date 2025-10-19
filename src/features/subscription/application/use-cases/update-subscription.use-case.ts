import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionDomainService } from '@features/subscription/domain';
import { SubscriptionMapper } from '../mappers';
import { UpdateSubscriptionDto } from '../dtos/input/update-subscription.dto';
import { SubscriptionResponseDto } from '../dtos/output/subscription-response.dto';

export class UpdateSubscriptionUseCase
  implements UseCase<UpdateSubscriptionDto, SubscriptionResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionDomainService: SubscriptionDomainService,
    private readonly subscriptionMapper: SubscriptionMapper,
  ) {}

  async execute(dto: UpdateSubscriptionDto): Promise<SubscriptionResponseDto> {
    this.logger.log(
      `Updating subscription ${dto.subscriptionId}`,
      'UpdateSubscriptionUseCase',
    );

    const subscriptionUpdate =
      this.subscriptionMapper.fromUpdateDtoToDomain(dto);

    const subscription =
      await this.subscriptionDomainService.updateSubscription(
        subscriptionUpdate,
      );

    this.logger.log(
      `Subscription updated ${subscription.id}`,
      'UpdateSubscriptionUseCase',
    );

    return this.subscriptionMapper.fromEntitytoDTO(subscription);
  }
}
