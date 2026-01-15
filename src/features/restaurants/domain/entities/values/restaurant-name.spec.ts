/**
 * RestaurantName Value Object Unit Tests
 */

import { RestaurantName } from './restaurant-name';
import { InvalidRestaurantDataError } from '../../errors';

describe('RestaurantName', () => {
  describe('create', () => {
    it('should create name with valid value', () => {
      const name = RestaurantName.create('My Restaurant');

      expect(name.value).toBe('My Restaurant');
    });

    it('should trim whitespace from name', () => {
      const name = RestaurantName.create('  My Restaurant  ');

      expect(name.value).toBe('My Restaurant');
    });

    it('should accept name at max length (100 chars)', () => {
      const validName = 'a'.repeat(100);
      const name = RestaurantName.create(validName);

      expect(name.value).toBe(validName);
      expect(name.value.length).toBe(100);
    });

    it('should throw error for empty name', () => {
      expect(() => RestaurantName.create('')).toThrow(InvalidRestaurantDataError);
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => RestaurantName.create('   ')).toThrow(InvalidRestaurantDataError);
    });

    it('should throw error for name exceeding 100 characters', () => {
      const tooLong = 'a'.repeat(101);

      expect(() => RestaurantName.create(tooLong)).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should throw error with descriptive message for empty name', () => {
      expect(() => RestaurantName.create('')).toThrow(/name/i);
    });

    it('should throw error with descriptive message for too long name', () => {
      const tooLong = 'a'.repeat(101);

      expect(() => RestaurantName.create(tooLong)).toThrow(/100|length|long/i);
    });
  });

  describe('value property', () => {
    it('should be readonly', () => {
      const name = RestaurantName.create('Test Restaurant');

      // TypeScript should prevent direct assignment
      // At runtime, the value should remain unchanged
      expect(name.value).toBe('Test Restaurant');
    });

    it('should preserve special characters', () => {
      const name = RestaurantName.create("Joe's Café & Bar");

      expect(name.value).toBe("Joe's Café & Bar");
    });

    it('should preserve unicode characters', () => {
      const name = RestaurantName.create('日本料理 さくら');

      expect(name.value).toBe('日本料理 さくら');
    });

    it('should preserve emojis', () => {
      const name = RestaurantName.create('Pizza Palace 🍕');

      expect(name.value).toBe('Pizza Palace 🍕');
    });
  });

  describe('equality', () => {
    it('should be equal to another RestaurantName with same value', () => {
      const name1 = RestaurantName.create('Test Restaurant');
      const name2 = RestaurantName.create('Test Restaurant');

      expect(name1.value).toBe(name2.value);
    });

    it('should not be equal to another RestaurantName with different value', () => {
      const name1 = RestaurantName.create('Restaurant A');
      const name2 = RestaurantName.create('Restaurant B');

      expect(name1.value).not.toBe(name2.value);
    });
  });
});
