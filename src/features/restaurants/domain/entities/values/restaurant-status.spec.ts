/**
 * RestaurantStatus Value Object Unit Tests
 */

import { RestaurantStatus } from './restaurant-status';
import { InvalidRestaurantDataError } from '../../errors';

describe('RestaurantStatus', () => {
  describe('create', () => {
    it('should create status with ACTIVE value', () => {
      const status = RestaurantStatus.create('ACTIVE');

      expect(status.value).toBe('ACTIVE');
    });

    it('should create status with SUSPENDED value', () => {
      const status = RestaurantStatus.create('SUSPENDED');

      expect(status.value).toBe('SUSPENDED');
    });

    it('should create status with ARCHIVED value', () => {
      const status = RestaurantStatus.create('ARCHIVED');

      expect(status.value).toBe('ARCHIVED');
    });

    it('should throw error for invalid status', () => {
      expect(() => RestaurantStatus.create('INVALID' as any)).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should throw error for empty status', () => {
      expect(() => RestaurantStatus.create('' as any)).toThrow(
        InvalidRestaurantDataError,
      );
    });
  });

  describe('isActive', () => {
    it('should return true for ACTIVE status', () => {
      const status = RestaurantStatus.create('ACTIVE');

      expect(status.isActive()).toBe(true);
    });

    it('should return false for SUSPENDED status', () => {
      const status = RestaurantStatus.create('SUSPENDED');

      expect(status.isActive()).toBe(false);
    });

    it('should return false for ARCHIVED status', () => {
      const status = RestaurantStatus.create('ARCHIVED');

      expect(status.isActive()).toBe(false);
    });
  });

  describe('suspend', () => {
    it('should create SUSPENDED status from ACTIVE', () => {
      const active = RestaurantStatus.create('ACTIVE');

      const suspended = active.suspend();

      expect(suspended.value).toBe('SUSPENDED');
    });

    it('should return SUSPENDED when already suspended', () => {
      const suspended = RestaurantStatus.create('SUSPENDED');

      const result = suspended.suspend();

      expect(result.value).toBe('SUSPENDED');
    });
  });

  describe('archive', () => {
    it('should create ARCHIVED status from ACTIVE', () => {
      const active = RestaurantStatus.create('ACTIVE');

      const archived = active.archive();

      expect(archived.value).toBe('ARCHIVED');
    });

    it('should create ARCHIVED status from SUSPENDED', () => {
      const suspended = RestaurantStatus.create('SUSPENDED');

      const archived = suspended.archive();

      expect(archived.value).toBe('ARCHIVED');
    });

    it('should return ARCHIVED when already archived', () => {
      const archived = RestaurantStatus.create('ARCHIVED');

      const result = archived.archive();

      expect(result.value).toBe('ARCHIVED');
    });
  });

  describe('activate', () => {
    it('should create ACTIVE status from SUSPENDED', () => {
      const suspended = RestaurantStatus.create('SUSPENDED');

      const active = suspended.activate();

      expect(active.value).toBe('ACTIVE');
    });

    it('should return ACTIVE when already active', () => {
      const active = RestaurantStatus.create('ACTIVE');

      const result = active.activate();

      expect(result.value).toBe('ACTIVE');
    });
  });

  describe('immutability', () => {
    it('should not mutate original status on suspend', () => {
      const active = RestaurantStatus.create('ACTIVE');

      active.suspend();

      expect(active.value).toBe('ACTIVE');
    });

    it('should not mutate original status on archive', () => {
      const active = RestaurantStatus.create('ACTIVE');

      active.archive();

      expect(active.value).toBe('ACTIVE');
    });

    it('should not mutate original status on activate', () => {
      const suspended = RestaurantStatus.create('SUSPENDED');

      suspended.activate();

      expect(suspended.value).toBe('SUSPENDED');
    });
  });
});
