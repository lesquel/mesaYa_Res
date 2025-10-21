import { MoneyVO } from '@shared/domain/entities/values';
import { PaymentStatusEnum } from '../enums';
import { PaymentEntity } from '../entities/payment.entity';

export type PaymentTargetType = 'RESERVATION' | 'SUBSCRIPTION';

export interface PaymentTargetReference {
  type: PaymentTargetType;
  id: string;
}

export interface PaymentLedgerEntry {
  readonly paymentId: string;
  readonly amount: number;
  readonly status: PaymentStatusEnum;
}

export interface PaymentLedgerSnapshot {
  readonly target: PaymentTargetReference;
  readonly entries: PaymentLedgerEntry[];
  readonly expectedTotal: number;
  readonly allowPartialPayments: boolean;
}

export interface PaymentRegistrationRequest {
  readonly target: PaymentTargetReference;
  readonly amount: MoneyVO;
  readonly expectedTotal: MoneyVO;
  readonly allowPartialPayments: boolean;
  readonly occurredAt: Date;
}

export interface PaymentRegistrationResult {
  readonly payment: PaymentEntity;
  readonly ledger: PaymentLedgerSnapshot;
  readonly settlesTarget: boolean;
}
