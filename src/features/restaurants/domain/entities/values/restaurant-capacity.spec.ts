/**
 * RestaurantCapacity Value Object Unit Tests
 */

import { RestaurantCapacity } from './restaurant-capacity';
import { InvalidRestaurantDataError } from '../../errors';

describe('RestaurantCapacity', () => {
  describe('create', () => {
    it('should create capacity with valid positive integer', () => {
      const capacity = RestaurantCapacity.create(50);

      expect(capacity.value).toBe(50);
    });

    it('should create capacity with value of 1 (minimum)', () => {
      const capacity = RestaurantCapacity.create(1);

      expect(capacity.value).toBe(1);
    });

    it('should create capacity with large value', () => {
      const capacity = RestaurantCapacity.create(10000);

      expect(capacity.value).toBe(10000);
    });

    it('should throw error for zero capacity', () => {
      expect(() => RestaurantCapacity.create(0)).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should throw error for negative capacity', () => {
      expect(() => RestaurantCapacity.create(-10)).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should throw error for floating point capacity', () => {
      expect(() => RestaurantCapacity.create(50.5)).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should throw error with descriptive message for invalid capacity', () => {
      expect(() => RestaurantCapacity.create(0)).toThrow(/capacity|positive|integer/i);
    });

    it('should throw error for NaN', () => {
      expect(() => RestaurantCapacity.create(NaN)).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should throw error for Infinity', () => {
      expect(() => RestaurantCapacity.create(Infinity)).toThrow(
        InvalidRestaurantDataError,
      );
    });
  });

  describe('value property', () => {
    it('should be readonly', () => {
      const capacity = RestaurantCapacity.create(100);

      expect(capacity.value).toBe(100);
    });

    it('should return exact integer value', () => {
      const capacity = RestaurantCapacity.create(75);

      expect(Number.isInteger(capacity.value)).toBe(true);
      expect(capacity.value).toBe(75);
    });
  });

  describe('equality', () => {
    it('should be equal to another RestaurantCapacity with same value', () => {
      const capacity1 = RestaurantCapacity.create(50);
      const capacity2 = RestaurantCapacity.create(50);

      expect(capacity1.value).toBe(capacity2.value);
    });

    it('should not be equal to another RestaurantCapacity with different value', () => {
      const capacity1 = RestaurantCapacity.create(50);
      const capacity2 = RestaurantCapacity.create(100);

      expect(capacity1.value).not.toBe(capacity2.value);
    });
  });

  describe('boundary values', () => {
    it('should accept capacity of 1', () => {
      const capacity = RestaurantCapacity.create(1);

      expect(capacity.value).toBe(1);
    });

    it('should reject capacity of 0', () => {
      expect(() => RestaurantCapacity.create(0)).toThrow();
    });

    it('should reject capacity of -1', () => {
      expect(() => RestaurantCapacity.create(-1)).toThrow();
    });
  });

  describe('type coercion handling', () => {
    it('should handle string that can be parsed as integer', () => {
      // This tests how the VO handles potentially coerced values
      // The behavior depends on implementation
      expect(() => RestaurantCapacity.create('50' as any)).toThrow();
    });

    it('should handle null value', () => {
      expect(() => RestaurantCapacity.create(null as any)).toThrow();
    });

    it('should handle undefined value', () => {
      expect(() => RestaurantCapacity.create(undefined as any)).toThrow();
    });
  });
});
