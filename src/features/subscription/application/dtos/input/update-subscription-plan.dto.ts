export interface UpdateSubscriptionPlanDto {
  subscriptionPlanId: string;
  name?: string;
  price?: number;
  subscriptionPeriod?: string;
  stateSubscriptionPlan?: string;
}
