import { SubscriptionStateVO } from '../entities/values/index';

export interface SubscriptionCreate {
  subscriptionPlanId: string;
  restaurantId: string;
  subscriptionStartDate: Date;
  stateSubscription: SubscriptionStateVO;
}
