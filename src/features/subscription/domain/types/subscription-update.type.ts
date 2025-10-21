import { SubscriptionStateVO } from '../entities/values/index';

export interface SubscriptionUpdate {
  subscriptionId: string;
  subscriptionPlanId?: string;
  restaurantId?: string;
  subscriptionStartDate?: Date;
  stateSubscription?: SubscriptionStateVO;
}
