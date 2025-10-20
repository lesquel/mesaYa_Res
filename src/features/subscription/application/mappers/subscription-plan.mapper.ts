import { EntityDTOMapper } from '@shared/application/mappers/abstract-domain-dto.mapper';
import { MoneyVO } from '@shared/domain/entities/values';
import {
  SubscriptionPlanEntity,
  SubscriptionPlanPeriodVO,
  SubscriptionPlanStateVO,
  SubscriptionPlanCreate,
  SubscriptionPlanUpdate,
  SubscriptionPlanPeriodsEnum,
  SubscriptionPlanStatesEnum,
} from '@features/subscription/domain';
import {
  CreateSubscriptionPlanDto,
  SubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
} from '../dtos';

export class SubscriptionPlanMapper extends EntityDTOMapper<
  SubscriptionPlanEntity,
  SubscriptionPlanDto
> {
  fromEntitytoDTO(entity: SubscriptionPlanEntity): SubscriptionPlanDto {
    return {
      subscriptionPlanId: entity.id,
      name: entity.name,
      price: entity.price.amount,
      subscriptionPeriod: entity.period.value,
      stateSubscriptionPlan: entity.state.value,
    };
  }

  fromDTOtoEntity(dto: SubscriptionPlanDto): SubscriptionPlanEntity {
    const price = new MoneyVO(dto.price);
    const period = this.toPeriodVO(dto.subscriptionPeriod);
    const state = this.toStateVO(dto.stateSubscriptionPlan);

    return SubscriptionPlanEntity.create(dto.subscriptionPlanId, {
      name: dto.name,
      price,
      subscriptionPeriod: period,
      stateSubscriptionPlan: state,
    });
  }

  fromCreateDtoToDomain(
    dto: CreateSubscriptionPlanDto,
  ): SubscriptionPlanCreate {
    const price = new MoneyVO(dto.price);
    const period = this.toPeriodVO(dto.subscriptionPeriod);
    const state = this.toStateVO(
      dto.stateSubscriptionPlan ?? SubscriptionPlanStatesEnum.ACTIVE,
    );

    return {
      name: dto.name,
      price,
      subscriptionPeriod: period,
      stateSubscriptionPlan: state,
    };
  }

  fromUpdateDtoToDomain(
    dto: UpdateSubscriptionPlanDto,
  ): SubscriptionPlanUpdate {
    return {
      subscriptionPlanId: dto.subscriptionPlanId,
      name: dto.name,
      price: dto.price !== undefined ? new MoneyVO(dto.price) : undefined,
      subscriptionPeriod: dto.subscriptionPeriod
        ? this.toPeriodVO(dto.subscriptionPeriod)
        : undefined,
      stateSubscriptionPlan: dto.stateSubscriptionPlan
        ? this.toStateVO(dto.stateSubscriptionPlan)
        : undefined,
    };
  }

  private toPeriodVO(value: string): SubscriptionPlanPeriodVO {
    const normalized = value.toUpperCase() as SubscriptionPlanPeriodsEnum;

    if (!Object.values(SubscriptionPlanPeriodsEnum).includes(normalized)) {
      throw new Error(`Invalid subscription plan period: ${value}`);
    }

    return SubscriptionPlanPeriodVO.create(normalized);
  }

  private toStateVO(value: string): SubscriptionPlanStateVO {
    const normalized = value.toUpperCase() as SubscriptionPlanStatesEnum;

    if (!Object.values(SubscriptionPlanStatesEnum).includes(normalized)) {
      throw new Error(`Invalid subscription plan state: ${value}`);
    }

    return SubscriptionPlanStateVO.create(normalized);
  }
}
