import { MoneyVO } from '@shared/domain/entities/values';
import { SubscriptionPlanPeriodVO, SubscriptionPlanStateVO } from './values';

export interface SubscriptionPlanProps {
  name: string;
  price: MoneyVO;
  subscriptionPeriod: SubscriptionPlanPeriodVO;
  stateSubscriptionPlan: SubscriptionPlanStateVO;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlanSnapshot extends SubscriptionPlanProps {
  subscriptionPlanId: string;
}

export class SubscriptionPlanEntity {
  private constructor(
    private readonly _subscriptionPlanId: string,
    private props: SubscriptionPlanProps,
  ) {}

  static create(
    id: string,
    props: SubscriptionPlanProps,
  ): SubscriptionPlanEntity {
    this.validate(props);
    const now = new Date();
    return new SubscriptionPlanEntity(id, {
      ...props,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  static rehydrate(snapshot: SubscriptionPlanSnapshot): SubscriptionPlanEntity {
    const { subscriptionPlanId, ...rest } = snapshot;
    return new SubscriptionPlanEntity(subscriptionPlanId, { ...rest });
  }

  get id(): string {
    return this._subscriptionPlanId;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): MoneyVO {
    return this.props.price;
  }

  get period(): SubscriptionPlanPeriodVO {
    return this.props.subscriptionPeriod;
  }

  get state(): SubscriptionPlanStateVO {
    return this.props.stateSubscriptionPlan;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateState(newState: SubscriptionPlanStateVO): void {
    this.props.stateSubscriptionPlan = newState;
    this.props.updatedAt = new Date();
  }

  updatePrice(newPrice: MoneyVO): void {
    this.props.price = newPrice;
    this.props.updatedAt = new Date();
  }

  snapshot(): SubscriptionPlanSnapshot {
    return {
      subscriptionPlanId: this._subscriptionPlanId,
      ...this.props,
    };
  }

  private static validate(props: SubscriptionPlanProps): void {
    if (!props.name || !props.name.trim()) {
      throw new Error('Subscription plan must have a valid name');
    }
    if (!props.price) {
      throw new Error('Subscription plan must have a valid price');
    }
    if (!props.subscriptionPeriod) {
      throw new Error('Subscription plan must define a period');
    }
    if (!props.stateSubscriptionPlan) {
      throw new Error('Subscription plan must define a state');
    }
    if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt))
      throw new Error('createdAt must be a valid Date');
    if (!(props.updatedAt instanceof Date) || Number.isNaN(props.updatedAt))
      throw new Error('updatedAt must be a valid Date');
  }
}
