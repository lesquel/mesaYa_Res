import { MoneyVO } from '@shared/domain/entities/values';
import { PaymentTypeEnum } from '../enums';
import { PaymentMustBeAssociatedError } from '../errors/payment-must-be-associated.error';
import { PaymentStatusVO } from './values';
import type { PaymentProps, PaymentSnapshot } from '../types';

// Re-export for backward compatibility
export type { PaymentProps, PaymentSnapshot } from '../types';

export class PaymentEntity {
  private constructor(
    private readonly _paymentId: string,
    private props: PaymentProps,
  ) {}

  static create(id: string, props: PaymentProps): PaymentEntity {
    this.validate(props);
    const now = new Date();
    const normalized: PaymentProps = {
      ...props,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    };
    return new PaymentEntity(id, normalized);
  }

  snapshot(): PaymentSnapshot {
    return {
      paymentId: this._paymentId,
      ...this.props,
    };
  }
  static rehydrate(snapshot: PaymentSnapshot): PaymentEntity {
    return new PaymentEntity(snapshot.paymentId, { ...snapshot });
  }

  get id(): string {
    return this._paymentId;
  }

  get amount(): MoneyVO {
    return this.props.amount;
  }

  get date(): Date {
    return this.props.date;
  }

  get paymentStatus(): PaymentStatusVO {
    return this.props.paymentStatus;
  }

  get reservationId(): string | undefined {
    return this.props.reservationId;
  }

  get subscriptionId(): string | undefined {
    return this.props.subscriptionId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateStatus(newStatus: PaymentStatusVO): void {
    this.props.paymentStatus = newStatus;
    this.props.updatedAt = new Date();
  }

  get paymentType(): PaymentTypeEnum {
    if (this.props.reservationId) return PaymentTypeEnum.RESERVATION;
    if (this.props.subscriptionId) return PaymentTypeEnum.SUBSCRIPTION;
    throw new PaymentMustBeAssociatedError();
  }

  private static validate(props: PaymentProps): void {
    if (!props.date) throw new Error('Payment must have a valid date');
    if (!props.paymentStatus)
      throw new Error('Payment must have a valid status');
    if (!props.reservationId && !props.subscriptionId)
      throw new PaymentMustBeAssociatedError();
    if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt))
      throw new Error('createdAt must be a valid Date');
    if (!(props.updatedAt instanceof Date) || Number.isNaN(props.updatedAt))
      throw new Error('updatedAt must be a valid Date');
  }
}
