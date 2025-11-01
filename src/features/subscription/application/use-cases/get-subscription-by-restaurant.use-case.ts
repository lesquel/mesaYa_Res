import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionDomainService } from '@features/subscription/domain';
import { SubscriptionMapper } from '../mappers';
import { GetSubscriptionByRestaurantDto } from '../dtos/input/get-subscription-by-restaurant.dto';
import { SubscriptionResponseDto } from '../dtos/output/subscription-response.dto';

export class GetSubscriptionByRestaurantUseCase
  implements UseCase<GetSubscriptionByRestaurantDto, SubscriptionResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionDomainService: SubscriptionDomainService,
    private readonly subscriptionMapper: SubscriptionMapper,
  ) {}

  async execute(
    dto: GetSubscriptionByRestaurantDto,
  ): Promise<SubscriptionResponseDto> {
    this.logger.log(
      `Fetching subscription for restaurant: ${dto.restaurantId}`,
      'GetSubscriptionByRestaurantUseCase',
    );

    const subscription =
      await this.subscriptionDomainService.findSubscriptionByRestaurant(
        dto.restaurantId,
      );

    this.logger.log(
      `Subscription ${subscription.id} retrieved for restaurant ${subscription.restaurantId}`,
      'GetSubscriptionByRestaurantUseCase',
    );

    return this.subscriptionMapper.fromEntitytoDTO(subscription);
  }
}
