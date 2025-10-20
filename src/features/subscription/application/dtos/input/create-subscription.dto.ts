export interface CreateSubscriptionDto {
  subscriptionPlanId: string;
  restaurantId: string;
  subscriptionStartDate: string;
  stateSubscription?: string;
}
