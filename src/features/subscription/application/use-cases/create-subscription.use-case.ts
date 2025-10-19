import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionDomainService } from '@features/subscription/domain';
import { SubscriptionMapper } from '../mappers';
import { CreateSubscriptionDto } from '../dtos/input/create-subscription.dto';
import { SubscriptionResponseDto } from '../dtos/output/subscription-response.dto';

export class CreateSubscriptionUseCase
  implements UseCase<CreateSubscriptionDto, SubscriptionResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionDomainService: SubscriptionDomainService,
    private readonly subscriptionMapper: SubscriptionMapper,
  ) {}

  async execute(dto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    this.logger.log(
      `Creating subscription for restaurant ${dto.restaurantId} with plan ${dto.subscriptionPlanId}`,
      'CreateSubscriptionUseCase',
    );

    const subscriptionCreate =
      this.subscriptionMapper.fromCreateDtoToDomain(dto);

    const subscription =
      await this.subscriptionDomainService.createSubscription(
        subscriptionCreate,
      );

    this.logger.log(
      `Subscription created with ID: ${subscription.id}`,
      'CreateSubscriptionUseCase',
    );

    return this.subscriptionMapper.fromEntitytoDTO(subscription);
  }
}
