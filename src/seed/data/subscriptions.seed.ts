import { SubscriptionStatesEnum } from '@features/subscription/domain/enums';
import { SubscriptionStateVO } from '@features/subscription/domain/entities/values/subscription-state.vo';
import { subscriptionPlanNames } from './subscription-plans.seed';

export interface SubscriptionSeedData {
  subscriptionPlanName: string;
  restaurantIndex: number;
  subscriptionStartDate: Date;
  stateSubscription: SubscriptionStateVO;
}

const subscriptionStates = [
  SubscriptionStatesEnum.ACTIVE,
  SubscriptionStatesEnum.INACTIVE,
  SubscriptionStatesEnum.ACTIVE,
  SubscriptionStatesEnum.INACTIVE,
  SubscriptionStatesEnum.ACTIVE,
  SubscriptionStatesEnum.INACTIVE,
  SubscriptionStatesEnum.ACTIVE,
  SubscriptionStatesEnum.INACTIVE,
  SubscriptionStatesEnum.ACTIVE,
  SubscriptionStatesEnum.INACTIVE,
];

export const subscriptionsSeed: SubscriptionSeedData[] =
  subscriptionPlanNames.map((planName, index) => ({
    subscriptionPlanName: planName,
    restaurantIndex: index,
    subscriptionStartDate: new Date(2024, index % 12, 1),
    stateSubscription: SubscriptionStateVO.create(
      subscriptionStates[index % subscriptionStates.length],
    ),
  }));
