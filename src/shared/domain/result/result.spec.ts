/**
 * Result Pattern Unit Tests
 */

import { Result, BaseDomainError } from './result';

class TestError extends BaseDomainError {
  constructor(message: string = 'Test error') {
    super(message, 400, { code: 'TEST_ERROR' });
  }
}

class AnotherError extends BaseDomainError {
  constructor(message: string = 'Another error') {
    super(message, 500, { code: 'ANOTHER_ERROR' });
  }
}

describe('Result', () => {
  describe('ok', () => {
    it('should create a successful result', () => {
      const result = Result.ok('success');

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe('success');
    });

    it('should work with complex objects', () => {
      const data = { id: 1, name: 'test' };
      const result = Result.ok(data);

      expect(result.value).toEqual(data);
    });
  });

  describe('fail', () => {
    it('should create a failed result', () => {
      const error = new TestError('Something went wrong');
      const result = Result.fail<string, TestError>(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
      expect(result.error.message).toBe('Something went wrong');
    });
  });

  describe('void', () => {
    it('should create a successful void result', () => {
      const result = Result.void();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeUndefined();
    });
  });

  describe('value', () => {
    it('should throw when accessing value of failed result', () => {
      const result = Result.fail<string, TestError>(new TestError());

      expect(() => result.value).toThrow('Cannot get value of a failed result');
    });
  });

  describe('error', () => {
    it('should throw when accessing error of successful result', () => {
      const result = Result.ok('success');

      expect(() => result.error).toThrow(
        'Cannot get error of a successful result',
      );
    });
  });

  describe('getOrElse', () => {
    it('should return value for successful result', () => {
      const result = Result.ok('success');

      expect(result.getOrElse('default')).toBe('success');
    });

    it('should return default for failed result', () => {
      const result = Result.fail<string, TestError>(new TestError());

      expect(result.getOrElse('default')).toBe('default');
    });
  });

  describe('getOrThrow', () => {
    it('should return value for successful result', () => {
      const result = Result.ok('success');

      expect(result.getOrThrow()).toBe('success');
    });

    it('should throw error for failed result', () => {
      const error = new TestError('My error');
      const result = Result.fail<string, TestError>(error);

      expect(() => result.getOrThrow()).toThrow(error);
    });
  });

  describe('map', () => {
    it('should transform successful result', () => {
      const result = Result.ok(5);
      const mapped = result.map((n) => n * 2);

      expect(mapped.value).toBe(10);
    });

    it('should not transform failed result', () => {
      const error = new TestError();
      const result = Result.fail<number, TestError>(error);
      const mapped = result.map((n) => n * 2);

      expect(mapped.isFailure).toBe(true);
      expect(mapped.error).toBe(error);
    });
  });

  describe('mapError', () => {
    it('should transform error', () => {
      const result = Result.fail<string, TestError>(new TestError('original'));
      const mapped = result.mapError(
        (e) => new AnotherError(`Wrapped: ${e.message}`),
      );

      expect(mapped.error.message).toBe('Wrapped: original');
      expect(mapped.error).toBeInstanceOf(AnotherError);
    });

    it('should not transform successful result', () => {
      const result = Result.ok<string, TestError>('success');
      const mapped = result.mapError((e) => new AnotherError(e.message));

      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe('success');
    });
  });

  describe('flatMap', () => {
    it('should chain successful results', () => {
      const result = Result.ok(5);
      const chained = result.flatMap((n) => Result.ok(n * 2));

      expect(chained.value).toBe(10);
    });

    it('should short-circuit on failure', () => {
      const error = new TestError();
      const result = Result.fail<number, TestError>(error);
      const chained = result.flatMap((n) => Result.ok(n * 2));

      expect(chained.isFailure).toBe(true);
      expect(chained.error).toBe(error);
    });

    it('should propagate inner failure', () => {
      const result = Result.ok(5);
      const innerError = new TestError('inner');
      const chained = result.flatMap(() =>
        Result.fail<number, TestError>(innerError),
      );

      expect(chained.isFailure).toBe(true);
      expect(chained.error).toBe(innerError);
    });
  });

  describe('tap', () => {
    it('should execute side effect on success', () => {
      let sideEffect = 0;
      const result = Result.ok(5);

      result.tap((n) => {
        sideEffect = n;
      });

      expect(sideEffect).toBe(5);
    });

    it('should not execute side effect on failure', () => {
      let sideEffect = 0;
      const result = Result.fail<number, TestError>(new TestError());

      result.tap((n) => {
        sideEffect = n;
      });

      expect(sideEffect).toBe(0);
    });
  });

  describe('tapError', () => {
    it('should execute side effect on failure', () => {
      let sideEffect = '';
      const result = Result.fail<string, TestError>(new TestError('error'));

      result.tapError((e) => {
        sideEffect = e.message;
      });

      expect(sideEffect).toBe('error');
    });

    it('should not execute side effect on success', () => {
      let sideEffect = '';
      const result = Result.ok<string, TestError>('success');

      result.tapError((e) => {
        sideEffect = e.message;
      });

      expect(sideEffect).toBe('');
    });
  });

  describe('match', () => {
    it('should call ok handler on success', () => {
      const result = Result.ok(5);
      const matched = result.match({
        ok: (n) => `Value: ${n}`,
        err: (e) => `Error: ${e.message}`,
      });

      expect(matched).toBe('Value: 5');
    });

    it('should call err handler on failure', () => {
      const result = Result.fail<number, TestError>(new TestError('oops'));
      const matched = result.match({
        ok: (n) => `Value: ${n}`,
        err: (e) => `Error: ${e.message}`,
      });

      expect(matched).toBe('Error: oops');
    });
  });

  describe('combine', () => {
    it('should combine successful results', () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
      const combined = Result.combine(results);

      expect(combined.isSuccess).toBe(true);
      expect(combined.value).toEqual([1, 2, 3]);
    });

    it('should return first failure', () => {
      const error = new TestError('first error');
      const results = [
        Result.ok(1),
        Result.fail<number, TestError>(error),
        Result.ok(3),
      ];
      const combined = Result.combine(results);

      expect(combined.isFailure).toBe(true);
      expect(combined.error).toBe(error);
    });
  });

  describe('fromPromise', () => {
    it('should wrap successful promise', async () => {
      const promise = Promise.resolve('success');
      const result = await Result.fromPromise(promise, () => new TestError());

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('success');
    });

    it('should wrap rejected promise', async () => {
      const promise = Promise.reject(new Error('failed'));
      const result = await Result.fromPromise(
        promise,
        (e) => new TestError((e as Error).message),
      );

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('failed');
    });
  });

  describe('fromTry', () => {
    it('should wrap successful function', () => {
      const result = Result.fromTry(
        () => JSON.parse('{"a":1}'),
        () => new TestError(),
      );

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({ a: 1 });
    });

    it('should wrap throwing function', () => {
      const result = Result.fromTry(
        () => JSON.parse('invalid'),
        (e) => new TestError((e as Error).message),
      );

      expect(result.isFailure).toBe(true);
    });
  });
});
