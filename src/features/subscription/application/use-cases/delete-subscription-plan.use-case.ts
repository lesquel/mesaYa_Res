import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionPlanDomainService } from '@features/subscription/domain';
import { DeleteSubscriptionPlanDto } from '../dtos/input/delete-subscription-plan.dto';
import { DeleteSubscriptionPlanResponseDto } from '../dtos/output/delete-subscription-plan-response.dto';

export class DeleteSubscriptionPlanUseCase
  implements
    UseCase<DeleteSubscriptionPlanDto, DeleteSubscriptionPlanResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionPlanDomainService: SubscriptionPlanDomainService,
  ) {}

  async execute(
    dto: DeleteSubscriptionPlanDto,
  ): Promise<DeleteSubscriptionPlanResponseDto> {
    this.logger.log(
      `Deleting subscription plan ${dto.subscriptionPlanId}`,
      'DeleteSubscriptionPlanUseCase',
    );

    await this.subscriptionPlanDomainService.deleteSubscriptionPlan(
      dto.subscriptionPlanId,
    );

    this.logger.log(
      `Subscription plan deleted ${dto.subscriptionPlanId}`,
      'DeleteSubscriptionPlanUseCase',
    );

    return { subscriptionPlanId: dto.subscriptionPlanId };
  }
}
