import { SubscriptionStateVO } from './values';
import type { SubscriptionProps, SubscriptionSnapshot } from '../types';

// Re-export for backward compatibility
export type { SubscriptionProps, SubscriptionSnapshot } from '../types';

export class SubscriptionEntity {
  private constructor(
    private readonly _subscriptionId: string,
    private props: SubscriptionProps,
  ) {}

  static create(id: string, props: SubscriptionProps): SubscriptionEntity {
    this.validate(props);
    const now = new Date();
    const propsCopy: SubscriptionProps = {
      ...props,
      subscriptionStartDate: new Date(props.subscriptionStartDate),
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
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
      createdAt: rest.createdAt,
      updatedAt: rest.updatedAt,
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Mutator
  updateState(newState: SubscriptionStateVO): void {
    this.props.stateSubscription = newState;
    this.props.updatedAt = new Date();
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
    if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt))
      throw new Error('createdAt must be a valid Date');
    if (!(props.updatedAt instanceof Date) || Number.isNaN(props.updatedAt))
      throw new Error('updatedAt must be a valid Date');
  }
}
