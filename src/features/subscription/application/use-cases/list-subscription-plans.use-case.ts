import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionPlanDomainService } from '@features/subscription/domain';
import { SubscriptionPlanMapper } from '../mappers';
import { SubscriptionPlanListResponseDto } from '../dtos/output/subscription-plan-list-response.dto';

export class ListSubscriptionPlansUseCase
  implements UseCase<void, SubscriptionPlanListResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionPlanDomainService: SubscriptionPlanDomainService,
    private readonly subscriptionPlanMapper: SubscriptionPlanMapper,
  ) {}

  async execute(): Promise<SubscriptionPlanListResponseDto> {
    this.logger.log(
      'Fetching all subscription plans',
      'ListSubscriptionPlansUseCase',
    );

    const plans =
      await this.subscriptionPlanDomainService.findAllSubscriptionPlans();

    this.logger.log(
      `Fetched ${plans.length} subscription plan(s)`,
      'ListSubscriptionPlansUseCase',
    );

    return plans.map((plan) =>
      this.subscriptionPlanMapper.fromEntitytoDTO(plan),
    );
  }
}
