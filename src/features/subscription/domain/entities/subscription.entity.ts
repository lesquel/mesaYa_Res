import { SubscriptionStateVO } from './values';

export interface SubscriptionProps {
  // We store only identifiers to keep the aggregate decoupled from other aggregates.
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
    const propsCopy: SubscriptionProps = {
      ...props,
      subscriptionStartDate: new Date(props.subscriptionStartDate),
    };
    return new SubscriptionEntity(id, propsCopy);
  }

  // Rehydrate from persistence (ORM → dominio)
  static rehydrate(snapshot: SubscriptionSnapshot): SubscriptionEntity {
    const { subscriptionId, ...rest } = snapshot;
    const propsCopy: SubscriptionProps = {
      subscriptionPlanId: rest.subscriptionPlanId,
      restaurantId: rest.restaurantId,
      subscriptionStartDate: new Date(rest.subscriptionStartDate),
      stateSubscription: rest.stateSubscription,
    };
    return new SubscriptionEntity(subscriptionId, propsCopy);
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
    return new Date(this.props.subscriptionStartDate);
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
      subscriptionStartDate: new Date(this.props.subscriptionStartDate),
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
    if (Number.isNaN(props.subscriptionStartDate.getTime()))
      throw new Error('Subscription must have a valid start date');
    if (!props.stateSubscription)
      throw new Error('Subscription must have a valid state');
  }
}
