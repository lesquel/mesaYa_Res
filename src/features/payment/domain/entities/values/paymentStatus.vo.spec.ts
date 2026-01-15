/**
 * PaymentStatusVO Unit Tests
 */

import { PaymentStatusVO } from './paymentStatus.vo';
import { PaymentStatusEnum } from '../../enums';

describe('PaymentStatusVO', () => {
  describe('create', () => {
    it('should create a valid PENDING status', () => {
      const status = PaymentStatusVO.create(PaymentStatusEnum.PENDING);

      expect(status.status).toBe(PaymentStatusEnum.PENDING);
    });

    it('should create a valid COMPLETED status', () => {
      const status = PaymentStatusVO.create(PaymentStatusEnum.COMPLETED);

      expect(status.status).toBe(PaymentStatusEnum.COMPLETED);
    });

    it('should create a valid CANCELLED status', () => {
      const status = PaymentStatusVO.create(PaymentStatusEnum.CANCELLED);

      expect(status.status).toBe(PaymentStatusEnum.CANCELLED);
    });

    it('should throw error for invalid status', () => {
      expect(() =>
        PaymentStatusVO.create('INVALID' as PaymentStatusEnum),
      ).toThrow('Invalid status: INVALID');
    });
  });

  describe('changeStatus', () => {
    it('should change status from PENDING to COMPLETED', () => {
      const status = PaymentStatusVO.create(PaymentStatusEnum.PENDING);

      status.changeStatus(PaymentStatusEnum.COMPLETED);

      expect(status.status).toBe(PaymentStatusEnum.COMPLETED);
    });

    it('should change status from PENDING to CANCELLED', () => {
      const status = PaymentStatusVO.create(PaymentStatusEnum.PENDING);

      status.changeStatus(PaymentStatusEnum.CANCELLED);

      expect(status.status).toBe(PaymentStatusEnum.CANCELLED);
    });

    it('should throw error when changing to invalid status', () => {
      const status = PaymentStatusVO.create(PaymentStatusEnum.PENDING);

      expect(() =>
        status.changeStatus('UNKNOWN' as PaymentStatusEnum),
      ).toThrow('Invalid status: UNKNOWN');
    });
  });
});
