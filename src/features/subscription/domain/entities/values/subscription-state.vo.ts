import { SubscriptionStatesEnum } from '../../enums';

export class SubscriptionStateVO {
  private constructor(private stateValue: SubscriptionStatesEnum) {}

  static create(value: SubscriptionStatesEnum): SubscriptionStateVO {
    if (!Object.values(SubscriptionStatesEnum).includes(value)) {
      throw new Error(`Invalid subscription state: ${value}`);
    }
    return new SubscriptionStateVO(value);
  }

  get value(): SubscriptionStatesEnum {
    return this.stateValue;
  }

  changeState(newState: SubscriptionStatesEnum): void {
    if (!Object.values(SubscriptionStatesEnum).includes(newState)) {
      throw new Error(`Invalid subscription state: ${newState}`);
    }
    this.stateValue = newState;
  }

  equals(other: SubscriptionStateVO): boolean {
    return this.stateValue === other.value;
  }
}
