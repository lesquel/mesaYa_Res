import { RestaurantEntity } from '@features/restaurants';
import { SubscriptionPlanEntity } from './subscription-plan.entity';
import { SubscriptionStateVO } from './values/subscription-state.vo';

export class SubscriptionEntity {
  constructor(
    private readonly _subscriptionId: string,
    private readonly _subscriptionPlan: SubscriptionPlanEntity,
    private readonly _restaurant: RestaurantEntity,
    private readonly _subscriptionStartDate: Date,
    private _stateSubscription: SubscriptionStateVO,
  ) {}
}
