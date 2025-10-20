import { SubscriptionPlanStatesEnum } from '../../enums';

export class SubscriptionPlanStateVO {
  private constructor(
    private readonly stateValue: SubscriptionPlanStatesEnum,
  ) {}

  static create(value: SubscriptionPlanStatesEnum): SubscriptionPlanStateVO {
    if (!Object.values(SubscriptionPlanStatesEnum).includes(value)) {
      throw new Error(`Invalid subscription plan state: ${value}`);
    }
    return new SubscriptionPlanStateVO(value);
  }

  get value(): SubscriptionPlanStatesEnum {
    return this.stateValue;
  }

  equals(other: SubscriptionPlanStateVO): boolean {
    return this.stateValue === other.value;
  }
}
