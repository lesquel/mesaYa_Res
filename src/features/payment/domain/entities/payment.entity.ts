import { PaymentMustBeAssociatedError } from '../errors/payment-must-be-associated.error';
import type { Money, PaymentStatus } from './values';

export class PaymentEntity {
  constructor(
    private readonly _paymentId: string,
    private readonly _amount: Money,
    private readonly _date: Date,
    private _paymentStatus: PaymentStatus,
    private readonly _reservationId?: string,
    private readonly _subscriptionId?: string,
  ) {}

  get paymentId(): string {
    return this._paymentId;
  }

  get reservationId(): string | undefined {
    return this._reservationId;
  }

  get subscriptionId(): string | undefined {
    return this._subscriptionId;
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

  paymentType(): 'RESERVATION' | 'SUBSCRIPTION' {
    if (this._reservationId) return 'RESERVATION';
    if (this._subscriptionId) return 'SUBSCRIPTION';
    throw new PaymentMustBeAssociatedError();
  }
}
