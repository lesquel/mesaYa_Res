/**
 * Payment Entity Unit Tests
 */

import { PaymentEntity } from './payment.entity';
import { PaymentStatusVO } from './values';
import { PaymentStatusEnum, PaymentTypeEnum } from '../enums';
import { PaymentMustBeAssociatedError } from '../errors/payment-must-be-associated.error';
import { MoneyVO } from '@shared/domain/entities/values';

describe('PaymentEntity', () => {
  const createValidProps = (overrides = {}) => ({
    amount: new MoneyVO(100),
    date: new Date('2025-01-15'),
    paymentStatus: PaymentStatusVO.create(PaymentStatusEnum.PENDING),
    reservationId: 'reservation-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('create', () => {
    it('should create a payment entity with valid reservation props', () => {
      const props = createValidProps();
      const payment = PaymentEntity.create('payment-1', props);

      expect(payment.id).toBe('payment-1');
      expect(payment.amount.amount).toBe(100);
      expect(payment.reservationId).toBe('reservation-123');
      expect(payment.paymentStatus.status).toBe(PaymentStatusEnum.PENDING);
    });

    it('should create a payment entity with subscription', () => {
      const props = createValidProps({
        reservationId: undefined,
        subscriptionId: 'subscription-456',
      });
      const payment = PaymentEntity.create('payment-2', props);

      expect(payment.subscriptionId).toBe('subscription-456');
      expect(payment.reservationId).toBeUndefined();
    });

    it('should throw error when neither reservation nor subscription is provided', () => {
      const props = createValidProps({
        reservationId: undefined,
        subscriptionId: undefined,
      });

      expect(() => PaymentEntity.create('payment-3', props)).toThrow(
        PaymentMustBeAssociatedError,
      );
    });

    it('should throw error when date is missing', () => {
      const props = createValidProps({ date: null });

      expect(() => PaymentEntity.create('payment-4', props)).toThrow(
        'Payment must have a valid date',
      );
    });
  });

  describe('paymentType', () => {
    it('should return RESERVATION type for reservation payments', () => {
      const props = createValidProps();
      const payment = PaymentEntity.create('payment-5', props);

      expect(payment.paymentType).toBe(PaymentTypeEnum.RESERVATION);
    });

    it('should return SUBSCRIPTION type for subscription payments', () => {
      const props = createValidProps({
        reservationId: undefined,
        subscriptionId: 'subscription-789',
      });
      const payment = PaymentEntity.create('payment-6', props);

      expect(payment.paymentType).toBe(PaymentTypeEnum.SUBSCRIPTION);
    });
  });

  describe('updateStatus', () => {
    it('should update payment status', () => {
      const props = createValidProps();
      const payment = PaymentEntity.create('payment-7', props);
      const originalUpdatedAt = payment.updatedAt;

      // Small delay to ensure time difference
      const newStatus = PaymentStatusVO.create(PaymentStatusEnum.COMPLETED);
      payment.updateStatus(newStatus);

      expect(payment.paymentStatus.status).toBe(PaymentStatusEnum.COMPLETED);
      expect(payment.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('snapshot and rehydrate', () => {
    it('should create a snapshot of the entity', () => {
      const props = createValidProps();
      const payment = PaymentEntity.create('payment-8', props);
      const snapshot = payment.snapshot();

      expect(snapshot.paymentId).toBe('payment-8');
      expect(snapshot.reservationId).toBe('reservation-123');
      expect(snapshot.amount).toBe(props.amount);
    });

    it('should rehydrate entity from snapshot', () => {
      const props = createValidProps();
      const original = PaymentEntity.create('payment-9', props);
      const snapshot = original.snapshot();

      const rehydrated = PaymentEntity.rehydrate(snapshot);

      expect(rehydrated.id).toBe(original.id);
      expect(rehydrated.amount.amount).toBe(original.amount.amount);
      expect(rehydrated.reservationId).toBe(original.reservationId);
    });
  });
});
