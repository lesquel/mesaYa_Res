import { SubscriptionStateVO } from '../entities/values';

export interface SubscriptionCreate {
  subscriptionPlanId: string;
  restaurantId: string;
  subscriptionStartDate: Date;
  stateSubscription: SubscriptionStateVO;
}
