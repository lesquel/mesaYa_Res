import { SubscriptionStatesEnum } from '@features/subscription/domain/enums';
import { SubscriptionStateVO } from '@features/subscription/domain/entities/values/subscription-state.vo';

export interface SubscriptionSeedData {
  subscriptionPlanName: string;
  restaurantIndex: number;
  subscriptionStartDate: Date;
  stateSubscription: SubscriptionStateVO;
}

export const subscriptionsSeed: SubscriptionSeedData[] = [
  {
    subscriptionPlanName: 'Plan Premium',
    restaurantIndex: 0,
    subscriptionStartDate: new Date('2024-01-01'),
    stateSubscription: SubscriptionStateVO.create(
      SubscriptionStatesEnum.ACTIVE,
    ),
  },
  {
    subscriptionPlanName: 'Plan Estándar',
    restaurantIndex: 1,
    subscriptionStartDate: new Date('2024-02-01'),
    stateSubscription: SubscriptionStateVO.create(
      SubscriptionStatesEnum.ACTIVE,
    ),
  },
];
