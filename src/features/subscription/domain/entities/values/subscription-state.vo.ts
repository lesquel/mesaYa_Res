export class SubscriptionStateVO {
  constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }
}
