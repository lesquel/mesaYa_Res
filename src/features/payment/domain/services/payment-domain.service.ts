import {
  IPaymentRepositoryPort,
  PaymentEntity,
  PaymentUpdate,
  PaymentNotFoundError,
  PaymentDeletionFailedError,
  PaymentUpdateFailedError,
  PaymentTargetAmbiguityError,
  PaymentAlreadySettledError,
  PaymentExceedsOutstandingError,
  PartialPaymentsNotAllowedError,
  PaymentRegistrationRequest,
  PaymentRegistrationResult,
  PaymentLedgerSnapshot,
  PaymentLedgerEntry,
  PaymentCreate,
} from '@features/payment/domain';
import { PaymentStatusEnum } from '../enums';
import { PaymentStatusVO } from '../entities/values';

export class PaymentDomainService {
  constructor(private readonly paymentRepository: IPaymentRepositoryPort) {}

  async registerPayment(
    request: PaymentRegistrationRequest,
  ): Promise<PaymentRegistrationResult> {
    this.ensureValidTarget(request);

    const ledgerBefore = await this.buildLedgerSnapshot(request);
    const outstandingBefore = this.calculateOutstanding(ledgerBefore);
    if (outstandingBefore <= 0) {
      throw new PaymentAlreadySettledError(request.target.id);
    }

    const amount = request.amount.amount;
    if (amount > outstandingBefore) {
      throw new PaymentExceedsOutstandingError(amount, outstandingBefore);
    }

    if (!request.allowPartialPayments && amount !== outstandingBefore) {
      throw new PartialPaymentsNotAllowedError(request.target.id);
    }

    const settlesTarget = this.doesPaymentSettleTarget(
      amount,
      outstandingBefore,
    );

    const paymentToPersist = this.toPaymentCreate(request, settlesTarget);
    const persisted = await this.paymentRepository.create(paymentToPersist);

    const ledgerAfter = this.appendLedgerEntry(
      ledgerBefore,
      this.toLedgerEntry(persisted),
    );

    return {
      payment: persisted,
      ledger: ledgerAfter,
      settlesTarget,
    };
  }

  async findPaymentById(paymentId: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError(paymentId);
    }

    return payment;
  }

  async findAllPayments(): Promise<PaymentEntity[]> {
    return this.paymentRepository.findAll();
  }

  async updatePaymentStatus(data: PaymentUpdate): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(data.paymentId);

    if (!payment) {
      throw new PaymentNotFoundError(data.paymentId);
    }

    this.assertValidTransition(
      payment.paymentStatus.status,
      data.status.status,
    );

    const updatedPayment = await this.paymentRepository.update(data);

    if (!updatedPayment) {
      throw new PaymentUpdateFailedError(
        data.paymentId,
        'Repository returned null',
      );
    }

    return updatedPayment;
  }

  async deletePayment(paymentId: string): Promise<void> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError(paymentId);
    }

    const deleted = await this.paymentRepository.delete(paymentId);

    if (!deleted) {
      throw new PaymentDeletionFailedError(
        paymentId,
        'Repository returned false',
      );
    }
  }

  private ensureValidTarget(request: PaymentRegistrationRequest): void {
    if (!request.target.id) {
      throw new PaymentTargetAmbiguityError();
    }
  }

  private async buildLedgerSnapshot(
    request: PaymentRegistrationRequest,
  ): Promise<PaymentLedgerSnapshot> {
    const existing = await this.loadExistingPayments(request.target);

    const entries = existing.map((payment) => this.toLedgerEntry(payment));

    return {
      target: request.target,
      entries,
      expectedTotal: request.expectedTotal.amount,
      allowPartialPayments: request.allowPartialPayments,
    };
  }

  private async loadExistingPayments(
    target: PaymentRegistrationRequest['target'],
  ): Promise<PaymentEntity[]> {
    if (target.type === 'RESERVATION') {
      return this.paymentRepository.findByReservationId(target.id);
    }

    return this.paymentRepository.findBySubscriptionId(target.id);
  }

  private calculateOutstanding(ledger: PaymentLedgerSnapshot): number {
    const paidAmount = ledger.entries
      .filter((entry) => entry.status === PaymentStatusEnum.COMPLETED)
      .reduce((acc, entry) => acc + entry.amount, 0);

    return Math.max(ledger.expectedTotal - paidAmount, 0);
  }

  private doesPaymentSettleTarget(
    amount: number,
    outstanding: number,
  ): boolean {
    const epsilon = 0.0001;
    return Math.abs(outstanding - amount) < epsilon;
  }

  private toPaymentCreate(
    request: PaymentRegistrationRequest,
    settlesTarget: boolean,
  ): PaymentCreate {
    const status = settlesTarget
      ? PaymentStatusVO.create(PaymentStatusEnum.COMPLETED)
      : PaymentStatusVO.create(PaymentStatusEnum.PENDING);

    return {
      reservationId:
        request.target.type === 'RESERVATION' ? request.target.id : undefined,
      subscriptionId:
        request.target.type === 'SUBSCRIPTION' ? request.target.id : undefined,
      amount: request.amount,
      paymentStatus: status,
    };
  }

  private toLedgerEntry(payment: PaymentEntity): PaymentLedgerEntry {
    return {
      paymentId: payment.id,
      amount: payment.amount.amount,
      status: payment.paymentStatus.status,
    };
  }

  private appendLedgerEntry(
    ledger: PaymentLedgerSnapshot,
    entry: PaymentLedgerEntry,
  ): PaymentLedgerSnapshot {
    return {
      ...ledger,
      entries: [...ledger.entries, entry],
    };
  }

  private assertValidTransition(
    current: PaymentStatusEnum,
    next: PaymentStatusEnum,
  ): void {
    if (current === next) return;

    if (current === PaymentStatusEnum.CANCELLED) {
      throw new PaymentUpdateFailedError(
        'CANCELLED_PAYMENT',
        'Cannot transition from cancelled state',
      );
    }

    const allowed: Record<PaymentStatusEnum, PaymentStatusEnum[]> = {
      [PaymentStatusEnum.PENDING]: [
        PaymentStatusEnum.COMPLETED,
        PaymentStatusEnum.CANCELLED,
      ],
      [PaymentStatusEnum.COMPLETED]: [PaymentStatusEnum.CANCELLED],
      [PaymentStatusEnum.CANCELLED]: [],
    };

    if (!allowed[current].includes(next)) {
      throw new PaymentUpdateFailedError(
        'INVALID_TRANSITION',
        `Cannot transition payment from ${current} to ${next}`,
      );
    }
  }
}
