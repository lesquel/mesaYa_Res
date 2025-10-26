import { EntityDTOMapper } from '@shared/application/mappers/abstract-domain-dto.mapper';
import {
  SubscriptionEntity,
  SubscriptionStateVO,
  SubscriptionCreate,
  SubscriptionUpdate,
  SubscriptionStatesEnum,
} from '@features/subscription/domain';
import {
  CreateSubscriptionDto,
  SubscriptionDto,
  UpdateSubscriptionDto,
  UpdateSubscriptionStateDto,
} from '../dtos';

export class SubscriptionMapper extends EntityDTOMapper<
  SubscriptionEntity,
  SubscriptionDto
> {
  fromEntitytoDTO(entity: SubscriptionEntity): SubscriptionDto {
    return {
      subscriptionId: entity.id,
      subscriptionPlanId: entity.planId,
      restaurantId: entity.restaurantId,
      subscriptionStartDate: entity.startDate.toISOString(),
      stateSubscription: entity.state.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  fromDTOtoEntity(dto: SubscriptionDto): SubscriptionEntity {
    const state = this.toStateVO(dto.stateSubscription);
    const startDate = new Date(dto.subscriptionStartDate);

    return SubscriptionEntity.create(dto.subscriptionId, {
      subscriptionPlanId: dto.subscriptionPlanId,
      restaurantId: dto.restaurantId,
      subscriptionStartDate: startDate,
      stateSubscription: state,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }

  fromCreateDtoToDomain(dto: CreateSubscriptionDto): SubscriptionCreate {
    const state = this.toStateVO(
      dto.stateSubscription ?? SubscriptionStatesEnum.ACTIVE,
    );
    return {
      subscriptionPlanId: dto.subscriptionPlanId,
      restaurantId: dto.restaurantId,
      subscriptionStartDate: new Date(dto.subscriptionStartDate),
      stateSubscription: state,
    };
  }

  fromUpdateDtoToDomain(dto: UpdateSubscriptionDto): SubscriptionUpdate {
    return {
      subscriptionId: dto.subscriptionId,
      subscriptionPlanId: dto.subscriptionPlanId,
      subscriptionStartDate: dto.subscriptionStartDate
        ? new Date(dto.subscriptionStartDate)
        : undefined,
      stateSubscription: dto.stateSubscription
        ? this.toStateVO(dto.stateSubscription)
        : undefined,
    };
  }

  fromUpdateStateDtoToDomain(
    dto: UpdateSubscriptionStateDto,
  ): SubscriptionUpdate {
    return {
      subscriptionId: dto.subscriptionId,
      stateSubscription: this.toStateVO(dto.stateSubscription),
    };
  }

  private toStateVO(value: string): SubscriptionStateVO {
    const normalized = value.toUpperCase() as SubscriptionStatesEnum;

    if (!Object.values(SubscriptionStatesEnum).includes(normalized)) {
      throw new Error(`Invalid subscription state: ${value}`);
    }

    return SubscriptionStateVO.create(normalized);
  }
}
