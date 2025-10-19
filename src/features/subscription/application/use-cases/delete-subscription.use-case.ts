import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionDomainService } from '@features/subscription/domain';
import { DeleteSubscriptionDto } from '../dtos/input/delete-subscription.dto';
import { DeleteSubscriptionResponseDto } from '../dtos/output/delete-subscription-response.dto';

export class DeleteSubscriptionUseCase
  implements UseCase<DeleteSubscriptionDto, DeleteSubscriptionResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionDomainService: SubscriptionDomainService,
  ) {}

  async execute(
    dto: DeleteSubscriptionDto,
  ): Promise<DeleteSubscriptionResponseDto> {
    this.logger.log(
      `Deleting subscription ${dto.subscriptionId}`,
      'DeleteSubscriptionUseCase',
    );

    await this.subscriptionDomainService.deleteSubscription(dto.subscriptionId);

    this.logger.log(
      `Subscription deleted ${dto.subscriptionId}`,
      'DeleteSubscriptionUseCase',
    );

    return { subscriptionId: dto.subscriptionId };
  }
}
