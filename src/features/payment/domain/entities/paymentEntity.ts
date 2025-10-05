import type { Money, PaymentStatus, PaymentType } from './values';

export class PaymentEntity {
  constructor(
    private readonly _paymentId: string,
    private readonly _payerId: string, // It cpuld be a user or a restaurant
    private readonly _paymentType: PaymentType, // It could be reservation or subscription
    private readonly _targetId: string, //It could be reservation or subscription
    private readonly _amount: Money,
    private readonly _date: Date,
    private _paymentStatus: PaymentStatus,
  ) {}

  get paymentId(): string {
    return this._paymentId;
  }

  get payerId(): string {
    return this._payerId;
  }

  get paymentType(): PaymentType {
    return this._paymentType;
  }

  get targetId(): string {
    return this._targetId;
  }

  get amount(): Money {
    return this._amount;
  }

  get date(): Date {
    return this._date;
  }

  get paymentStatus(): PaymentStatus {
    return this._paymentStatus;
  }

  updateStatus(newStatus: PaymentStatus): void {
    this._paymentStatus = newStatus;
  }
}
