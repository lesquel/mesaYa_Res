import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { SubscriptionPlanDomainService } from '@features/subscription/domain';
import { SubscriptionPlanMapper } from '../mappers';
import { CreateSubscriptionPlanDto } from '../dtos/input/create-subscription-plan.dto';
import { SubscriptionPlanResponseDto } from '../dtos/output/subscription-plan-response.dto';

export class CreateSubscriptionPlanUseCase
  implements UseCase<CreateSubscriptionPlanDto, SubscriptionPlanResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly subscriptionPlanDomainService: SubscriptionPlanDomainService,
    private readonly subscriptionPlanMapper: SubscriptionPlanMapper,
  ) {}

  async execute(
    dto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    this.logger.log(
      `Creating subscription plan ${dto.name}`,
      'CreateSubscriptionPlanUseCase',
    );

    const subscriptionPlanCreate =
      this.subscriptionPlanMapper.fromCreateDtoToDomain(dto);

    const subscriptionPlan =
      await this.subscriptionPlanDomainService.createSubscriptionPlan(
        subscriptionPlanCreate,
      );

    this.logger.log(
      `Subscription plan created ${subscriptionPlan.id}`,
      'CreateSubscriptionPlanUseCase',
    );

    return this.subscriptionPlanMapper.fromEntitytoDTO(subscriptionPlan);
  }
}
