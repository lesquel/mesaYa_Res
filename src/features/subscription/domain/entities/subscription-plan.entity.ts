import {
  SubscriptionPlanStatesEnum,
  SubscriptionPlanPeriodsEnum,
} from '../enums';

export class SubscriptionPlanEntity {
  constructor(
    private readonly _subscriptionPlanId: string,
    private readonly _name: string,
    private readonly _price: number,
    private readonly _subscription_period: SubscriptionPlanPeriodsEnum,
    private readonly _stateSubscriptionPlan: SubscriptionPlanStatesEnum,
  ) {}

  get subscriptionPlanId(): string {
    return this._subscriptionPlanId;
  }

  get name(): string {
    return this._name;
  }

  get price(): number {
    return this._price;
  }

  get duration(): SubscriptionPlanPeriodsEnum {
    return this._subscription_period;
  }

  get state(): SubscriptionPlanStatesEnum {
    return this._stateSubscriptionPlan;
  }
}
