import { SubscriptionStateVO } from './values/subscription-state.vo';

export interface SubscriptionProps {
  subscriptionPlanId: string;
  restaurantId: string;
  subscriptionStartDate: Date;
  stateSubscription: SubscriptionStateVO;
}

export interface SubscriptionSnapshot extends SubscriptionProps {
  subscriptionId: string;
}

export class SubscriptionEntity {
  private constructor(
    private readonly _subscriptionId: string,
    private props: SubscriptionProps,
  ) {}

  static create(id: string, props: SubscriptionProps): SubscriptionEntity {
    this.validate(props);
    return new SubscriptionEntity(id, props);
  }

  // Rehydrate from persistence (ORM → dominio)
  static rehydrate(snapshot: SubscriptionSnapshot): SubscriptionEntity {
    return new SubscriptionEntity(snapshot.subscriptionId, { ...snapshot });
  }

  // Getters
  get id(): string {
    return this._subscriptionId;
  }

  get planId(): string {
    return this.props.subscriptionPlanId;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get startDate(): Date {
    return this.props.subscriptionStartDate;
  }

  get state(): SubscriptionStateVO {
    return this.props.stateSubscription;
  }

  // Mutator
  updateState(newState: SubscriptionStateVO): void {
    this.props.stateSubscription = newState;
  }

  // Snapshot for persistence
  snapshot(): SubscriptionSnapshot {
    return {
      subscriptionId: this._subscriptionId,
      ...this.props,
    };
  }

  // Validation
  private static validate(props: SubscriptionProps): void {
    if (!props.subscriptionPlanId)
      throw new Error('Subscription must have a plan');
    if (!props.restaurantId)
      throw new Error('Subscription must be linked to a restaurant');
    if (!props.subscriptionStartDate)
      throw new Error('Subscription must have a start date');
    if (!props.stateSubscription)
      throw new Error('Subscription must have a valid state');
  }
}
