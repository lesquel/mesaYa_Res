import { SubscriptionPlanPeriodsEnum } from '../../enums';

export class SubscriptionPlanPeriodVO {
  private constructor(
    private readonly periodValue: SubscriptionPlanPeriodsEnum,
  ) {}

  static create(value: SubscriptionPlanPeriodsEnum): SubscriptionPlanPeriodVO {
    if (!Object.values(SubscriptionPlanPeriodsEnum).includes(value)) {
      throw new Error(`Invalid subscription plan period: ${value}`);
    }
    return new SubscriptionPlanPeriodVO(value);
  }

  get value(): SubscriptionPlanPeriodsEnum {
    return this.periodValue;
  }

  equals(other: SubscriptionPlanPeriodVO): boolean {
    return this.periodValue === other.value;
  }
}
