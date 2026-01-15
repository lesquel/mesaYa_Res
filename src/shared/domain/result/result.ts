/**
 * Result Pattern Implementation
 *
 * A functional approach to error handling that makes errors explicit
 * in the type system. Inspired by Rust's Result<T, E> and fp-ts Either.
 *
 * Benefits:
 * - Explicit error handling at compile time
 * - No hidden exceptions in use cases
 * - Composable with map, flatMap, etc.
 * - Better testability
 *
 * @example
 * ```typescript
 * // In use case
 * async execute(dto: CreatePaymentDto): Promise<Result<PaymentDto, PaymentError>> {
 *   if (!dto.amount) {
 *     return Result.fail(new InvalidAmountError());
 *   }
 *   const payment = await this.repo.create(dto);
 *   return Result.ok(payment);
 * }
 *
 * // In controller
 * const result = await useCase.execute(dto);
 * if (result.isFailure) {
 *   throw new BadRequestException(result.error.message);
 * }
 * return result.value;
 * ```
 */

import { BaseDomainError } from '../errors/base-domain-error';

// Re-export for convenience
export { BaseDomainError };

/**
 * Result type representing either success (Ok) or failure (Err).
 *
 * @typeParam T - The success value type
 * @typeParam E - The error type (extends BaseDomainError)
 */
export class Result<T, E extends BaseDomainError = BaseDomainError> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  /**
   * Creates a successful result.
   */
  static ok<T, E extends BaseDomainError = BaseDomainError>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  /**
   * Creates a failed result.
   */
  static fail<T, E extends BaseDomainError = BaseDomainError>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  /**
   * Creates a successful result with no value.
   */
  static void<E extends BaseDomainError = BaseDomainError>(): Result<void, E> {
    return new Result<void, E>(true, undefined, undefined);
  }

  /**
   * Returns true if the result is successful.
   */
  get isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * Returns true if the result is a failure.
   */
  get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Gets the success value. Throws if result is a failure.
   */
  get value(): T {
    if (this.isFailure) {
      throw new Error(
        `Cannot get value of a failed result. Error: ${this._error?.message}`,
      );
    }
    return this._value as T;
  }

  /**
   * Gets the error. Throws if result is successful.
   */
  get error(): E {
    if (this.isSuccess) {
      throw new Error('Cannot get error of a successful result');
    }
    return this._error as E;
  }

  /**
   * Gets the value or returns a default.
   */
  getOrElse(defaultValue: T): T {
    return this.isSuccess ? (this._value as T) : defaultValue;
  }

  /**
   * Gets the value or throws the error.
   */
  getOrThrow(): T {
    if (this.isFailure) {
      throw this._error;
    }
    return this._value as T;
  }

  /**
   * Transforms the success value.
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this._error as E);
    }
    return Result.ok(fn(this._value as T));
  }

  /**
   * Transforms the error.
   */
  mapError<F extends BaseDomainError>(fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess) {
      return Result.ok(this._value as T);
    }
    return Result.fail(fn(this._error as E));
  }

  /**
   * Chains another result-returning operation.
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this._error as E);
    }
    return fn(this._value as T);
  }

  /**
   * Executes a side effect on success.
   */
  tap(fn: (value: T) => void): Result<T, E> {
    if (this.isSuccess) {
      fn(this._value as T);
    }
    return this;
  }

  /**
   * Executes a side effect on failure.
   */
  tapError(fn: (error: E) => void): Result<T, E> {
    if (this.isFailure) {
      fn(this._error as E);
    }
    return this;
  }

  /**
   * Pattern matching for Result.
   */
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this.isSuccess
      ? handlers.ok(this._value as T)
      : handlers.err(this._error as E);
  }

  /**
   * Combines multiple results. Returns first failure or all successes.
   */
  static combine<T, E extends BaseDomainError>(
    results: Result<T, E>[],
  ): Result<T[], E> {
    const values: T[] = [];
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error);
      }
      values.push(result.value);
    }
    return Result.ok(values);
  }

  /**
   * Wraps a promise that might throw into a Result.
   */
  static async fromPromise<T, E extends BaseDomainError>(
    promise: Promise<T>,
    errorMapper: (error: unknown) => E,
  ): Promise<Result<T, E>> {
    try {
      const value = await promise;
      return Result.ok(value);
    } catch (error) {
      return Result.fail(errorMapper(error));
    }
  }

  /**
   * Wraps a function that might throw into a Result.
   */
  static fromTry<T, E extends BaseDomainError>(
    fn: () => T,
    errorMapper: (error: unknown) => E,
  ): Result<T, E> {
    try {
      const value = fn();
      return Result.ok(value);
    } catch (error) {
      return Result.fail(errorMapper(error));
    }
  }
}

/**
 * Type alias for async results.
 */
export type AsyncResult<T, E extends BaseDomainError = BaseDomainError> = Promise<
  Result<T, E>
>;
