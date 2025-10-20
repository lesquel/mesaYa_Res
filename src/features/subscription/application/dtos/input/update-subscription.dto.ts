export interface UpdateSubscriptionDto {
  subscriptionId: string;
  subscriptionPlanId?: string;
  subscriptionStartDate?: string;
  stateSubscription?: string;
}
