import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionPlanDomainService } from '@features/subscription/domain';
import { SubscriptionPlanMapper } from '../mappers';
import { GetSubscriptionPlanByIdDto } from '../dtos/input/get-subscription-plan-by-id.dto';
import { SubscriptionPlanResponseDto } from '../dtos/output/subscription-plan-response.dto';

export class GetSubscriptionPlanByIdUseCase
  implements UseCase<GetSubscriptionPlanByIdDto, SubscriptionPlanResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionPlanDomainService: SubscriptionPlanDomainService,
    private readonly subscriptionPlanMapper: SubscriptionPlanMapper,
  ) {}

  async execute(
    dto: GetSubscriptionPlanByIdDto,
  ): Promise<SubscriptionPlanResponseDto> {
    this.logger.log(
      `Fetching subscription plan ${dto.subscriptionPlanId}`,
      'GetSubscriptionPlanByIdUseCase',
    );

    const plan =
      await this.subscriptionPlanDomainService.findSubscriptionPlanById(
        dto.subscriptionPlanId,
      );

    this.logger.log(
      `Subscription plan retrieved ${plan.id}`,
      'GetSubscriptionPlanByIdUseCase',
    );

    return this.subscriptionPlanMapper.fromEntitytoDTO(plan);
  }
}
