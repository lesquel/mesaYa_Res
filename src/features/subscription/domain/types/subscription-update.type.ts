import { SubscriptionStateVO } from '../entities/values';

export interface SubscriptionUpdate {
  subscriptionId: string;
  subscriptionPlanId?: string;
  restaurantId?: string;
  subscriptionStartDate?: Date;
  stateSubscription?: SubscriptionStateVO;
}
