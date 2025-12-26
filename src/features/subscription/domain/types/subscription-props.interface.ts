import type { SubscriptionStateVO } from '../entities/values';

export interface SubscriptionProps {
  // We store only identifiers to keep the aggregate decoupled from other aggregates.
  subscriptionPlanId: string;
  restaurantId: string;
  subscriptionStartDate: Date;
  stateSubscription: SubscriptionStateVO;
  createdAt: Date;
  updatedAt: Date;
}
