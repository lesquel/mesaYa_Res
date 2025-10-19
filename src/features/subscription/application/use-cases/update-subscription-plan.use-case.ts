import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionPlanDomainService } from '@features/subscription/domain';
import { SubscriptionPlanMapper } from '../mappers';
import { UpdateSubscriptionPlanDto } from '../dtos/input/update-subscription-plan.dto';
import { SubscriptionPlanResponseDto } from '../dtos/output/subscription-plan-response.dto';

export class UpdateSubscriptionPlanUseCase
  implements UseCase<UpdateSubscriptionPlanDto, SubscriptionPlanResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionPlanDomainService: SubscriptionPlanDomainService,
    private readonly subscriptionPlanMapper: SubscriptionPlanMapper,
  ) {}

  async execute(
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    this.logger.log(
      `Updating subscription plan ${dto.subscriptionPlanId}`,
      'UpdateSubscriptionPlanUseCase',
    );

    const subscriptionPlanUpdate =
      this.subscriptionPlanMapper.fromUpdateDtoToDomain(dto);

    const subscriptionPlan =
      await this.subscriptionPlanDomainService.updateSubscriptionPlan(
        subscriptionPlanUpdate,
      );

    this.logger.log(
      `Subscription plan updated ${subscriptionPlan.id}`,
      'UpdateSubscriptionPlanUseCase',
    );

    return this.subscriptionPlanMapper.fromEntitytoDTO(subscriptionPlan);
  }
}
