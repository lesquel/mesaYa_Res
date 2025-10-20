export interface CreateSubscriptionPlanDto {
  name: string;
  price: number;
  subscriptionPeriod: string;
  stateSubscriptionPlan?: string;
}
