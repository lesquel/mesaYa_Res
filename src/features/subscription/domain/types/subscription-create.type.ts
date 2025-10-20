import { SubscriptionStateVO } from '../entities/values/index.js';

export interface SubscriptionCreate {
  subscriptionPlanId: string;
  restaurantId: string;
  subscriptionStartDate: Date;
  stateSubscription: SubscriptionStateVO;
}
