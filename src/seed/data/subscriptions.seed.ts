import { SubscriptionStatesEnum } from '@features/subscription/domain/enums';

export interface SubscriptionSeedData {
  subscriptionPlanName: string;
  restaurantIndex: number;
  subscriptionStartDate: Date;
  stateSubscription: SubscriptionStatesEnum;
}

export const subscriptionsSeed: SubscriptionSeedData[] = [
  {
    subscriptionPlanName: 'Plan Premium',
    restaurantIndex: 0,
    subscriptionStartDate: new Date('2024-01-01'),
    stateSubscription: SubscriptionStatesEnum.ACTIVE,
  },
  {
    subscriptionPlanName: 'Plan Estándar',
    restaurantIndex: 1,
    subscriptionStartDate: new Date('2024-02-01'),
    stateSubscription: SubscriptionStatesEnum.ACTIVE,
  },
];
