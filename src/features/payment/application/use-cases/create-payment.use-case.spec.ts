/**
 * CreatePaymentUseCase Unit Tests
 */

import { CreatePaymentUseCase } from './create-payment.use-case';
import type { PaymentDomainService } from '@features/payment/domain';
import type { PaymentEntityDTOMapper } from '../mappers';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { CreatePaymentDto } from '../dtos';
import { PaymentStatusEnum } from '@features/payment/domain/enums';

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  let mockLogger: jest.Mocked<ILoggerPort>;
  let mockDomainService: jest.Mocked<PaymentDomainService>;
  let mockMapper: jest.Mocked<PaymentEntityDTOMapper>;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<ILoggerPort>;

    mockDomainService = {
      registerPayment: jest.fn(),
      findPaymentById: jest.fn(),
      findAllPayments: jest.fn(),
      updatePaymentStatus: jest.fn(),
      deletePayment: jest.fn(),
    } as unknown as jest.Mocked<PaymentDomainService>;

    mockMapper = {
      toRegistrationRequest: jest.fn(),
      fromEntitytoDTO: jest.fn(),
    } as unknown as jest.Mocked<PaymentEntityDTOMapper>;

    useCase = new CreatePaymentUseCase(
      mockLogger,
      mockDomainService,
      mockMapper,
    );
  });

  describe('execute', () => {
    it('should create a payment successfully', async () => {
      const dto: CreatePaymentDto = {
        reservationId: 'reservation-123',
        amount: 100,
        currency: 'USD',
      };

      const mockPayment = {
        id: 'payment-1',
        paymentStatus: { status: PaymentStatusEnum.PENDING },
      };

      const mockRegistrationRequest = { target: { id: 'reservation-123' } };
      const mockRegistrationResult = {
        payment: mockPayment,
        ledger: { target: { id: 'reservation-123' } },
        settlesTarget: false,
      };
      const expectedDto = {
        id: 'payment-1',
        amount: 100,
        status: PaymentStatusEnum.PENDING,
      };

      mockMapper.toRegistrationRequest.mockReturnValue(
        mockRegistrationRequest as any,
      );
      mockDomainService.registerPayment.mockResolvedValue(
        mockRegistrationResult as any,
      );
      mockMapper.fromEntitytoDTO.mockReturnValue(expectedDto as any);

      const result = await useCase.execute(dto);

      expect(mockMapper.toRegistrationRequest).toHaveBeenCalledWith(dto);
      expect(mockDomainService.registerPayment).toHaveBeenCalledWith(
        mockRegistrationRequest,
      );
      expect(mockMapper.fromEntitytoDTO).toHaveBeenCalledWith(mockPayment);
      expect(result).toEqual(expectedDto);
      expect(mockLogger.log).toHaveBeenCalledTimes(2);
    });

    it('should log when target is fully settled', async () => {
      const dto: CreatePaymentDto = {
        reservationId: 'reservation-456',
        amount: 500,
        currency: 'USD',
      };

      const mockPayment = {
        id: 'payment-2',
        paymentStatus: { status: PaymentStatusEnum.COMPLETED },
      };

      mockMapper.toRegistrationRequest.mockReturnValue({} as any);
      mockDomainService.registerPayment.mockResolvedValue({
        payment: mockPayment,
        ledger: { target: { id: 'reservation-456' } },
        settlesTarget: true,
      } as any);
      mockMapper.fromEntitytoDTO.mockReturnValue({} as any);

      await useCase.execute(dto);

      // 3 logs: initial, persisted, and settled
      expect(mockLogger.log).toHaveBeenCalledTimes(3);
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('fully settled'),
        'CreatePaymentUseCase',
      );
    });

    it('should propagate errors from domain service', async () => {
      const dto: CreatePaymentDto = {
        reservationId: 'reservation-789',
        amount: 100,
        currency: 'USD',
      };

      mockMapper.toRegistrationRequest.mockReturnValue({} as any);
      mockDomainService.registerPayment.mockRejectedValue(
        new Error('Payment already settled'),
      );

      await expect(useCase.execute(dto)).rejects.toThrow(
        'Payment already settled',
      );
    });
  });
});
