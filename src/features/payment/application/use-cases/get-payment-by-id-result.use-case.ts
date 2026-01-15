/**
 * Get Payment By Id Use Case (Result Pattern Version)
 *
 * This use case demonstrates the Result Pattern for explicit error handling.
 * Instead of throwing exceptions, it returns a Result<T, E> that the
 * controller can pattern match on.
 *
 * Benefits:
 * - Explicit error types in the signature
 * - No hidden exceptions
 * - Composable with other Result operations
 * - Better testability
 */

import { Injectable, Inject } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import { Result, AsyncResult } from '@shared/domain/result';
import { IPaymentRepositoryPort, PaymentNotFoundError } from '@features/payment/domain';
import { PaymentDto } from '../dtos';
import { PaymentEntityDTOMapper } from '../mappers';

/**
 * Input DTO for getting a payment by ID.
 */
export interface GetPaymentByIdResultInput {
  paymentId: string;
}

/**
 * Error types that this use case can return.
 */
export type GetPaymentByIdResultError = PaymentNotFoundError;

@Injectable()
export class GetPaymentByIdResultUseCase {
  constructor(
    @Inject(LOGGER)
    private readonly logger: ILoggerPort,
    private readonly paymentRepository: IPaymentRepositoryPort,
    private readonly paymentMapper: PaymentEntityDTOMapper,
  ) {}

  /**
   * Executes the use case and returns a Result.
   *
   * @param input - The payment ID to find
   * @returns Result containing PaymentDto on success, or PaymentNotFoundError on failure
   *
   * @example
   * ```typescript
   * const result = await useCase.execute({ paymentId: 'abc-123' });
   *
   * if (result.isFailure) {
   *   // Handle error - type is PaymentNotFoundError
   *   throw new NotFoundException(result.error.message);
   * }
   *
   * // Type is PaymentDto
   * return result.value;
   * ```
   */
  async execute(
    input: GetPaymentByIdResultInput,
  ): AsyncResult<PaymentDto, GetPaymentByIdResultError> {
    this.logger.log(
      `Getting payment by ID: ${input.paymentId}`,
      'GetPaymentByIdResultUseCase',
    );

    const payment = await this.paymentRepository.findById(input.paymentId);

    if (!payment) {
      this.logger.warn(
        `Payment not found: ${input.paymentId}`,
        'GetPaymentByIdResultUseCase',
      );
      return Result.fail(new PaymentNotFoundError(input.paymentId));
    }

    const dto = this.paymentMapper.fromEntitytoDTO(payment);

    this.logger.log(
      `Payment found: ${input.paymentId}`,
      'GetPaymentByIdResultUseCase',
    );

    return Result.ok(dto);
  }

  /**
   * Alternative method that unwraps the result or throws.
   * Useful for backward compatibility with exception-based code.
   */
  async executeOrThrow(input: GetPaymentByIdResultInput): Promise<PaymentDto> {
    const result = await this.execute(input);
    return result.getOrThrow();
  }
}
