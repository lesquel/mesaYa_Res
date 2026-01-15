/**
 * RestaurantEntity Unit Tests
 */

import { RestaurantEntity } from './restaurant.entity';
import { InvalidRestaurantDataError } from '../errors';
import type { RestaurantCreate, RestaurantUpdate } from './restaurant.entity';

describe('RestaurantEntity', () => {
  const createValidProps = (
    overrides: Partial<RestaurantCreate> = {},
  ): RestaurantCreate => ({
    name: 'Test Restaurant',
    description: 'A wonderful test restaurant',
    location: '123 Main Street',
    schedule: '09:00-22:00',
    daysOpen: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    totalCapacity: 50,
    ownerId: 'owner-123',
    ...overrides,
  });

  describe('create', () => {
    it('should create a restaurant with valid props', () => {
      const props = createValidProps();
      const restaurant = RestaurantEntity.create(props);

      expect(restaurant.id).toBeDefined();
      expect(restaurant.name.value).toBe('Test Restaurant');
      expect(restaurant.description).toBe('A wonderful test restaurant');
      expect(restaurant.location).toBe('123 Main Street');
      expect(restaurant.ownerId).toBe('owner-123');
    });

    it('should create a restaurant with provided id', () => {
      const props = createValidProps();
      const restaurant = RestaurantEntity.create(props, 'custom-id-123');

      expect(restaurant.id).toBe('custom-id-123');
    });

    it('should set default status to ACTIVE', () => {
      const props = createValidProps();
      const restaurant = RestaurantEntity.create(props);

      expect(restaurant.status.value).toBe('ACTIVE');
      expect(restaurant.active).toBe(true);
    });

    it('should throw error for empty name', () => {
      const props = createValidProps({ name: '' });

      expect(() => RestaurantEntity.create(props)).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should throw error for name exceeding max length', () => {
      const props = createValidProps({ name: 'a'.repeat(101) });

      expect(() => RestaurantEntity.create(props)).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should throw error for invalid capacity', () => {
      const props = createValidProps({ totalCapacity: 0 });

      expect(() => RestaurantEntity.create(props)).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should throw error for negative capacity', () => {
      const props = createValidProps({ totalCapacity: -10 });

      expect(() => RestaurantEntity.create(props)).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should accept optional subscriptionId', () => {
      const props = createValidProps();
      const restaurant = RestaurantEntity.create({
        ...props,
        subscriptionId: 'sub-123',
      });

      expect(restaurant.subscriptionId).toBe('sub-123');
    });

    it('should accept optional imageId', () => {
      const props = createValidProps();
      const restaurant = RestaurantEntity.create({
        ...props,
        imageId: 'img-456',
      });

      expect(restaurant.imageId).toBe('img-456');
    });
  });

  describe('update', () => {
    it('should update restaurant name', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      restaurant.update({ name: 'Updated Restaurant Name' });

      expect(restaurant.name.value).toBe('Updated Restaurant Name');
    });

    it('should update restaurant description', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      restaurant.update({ description: 'New description' });

      expect(restaurant.description).toBe('New description');
    });

    it('should update restaurant location', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      restaurant.update({ location: '456 New Street' });

      expect(restaurant.location).toBe('456 New Street');
    });

    it('should update restaurant capacity', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      restaurant.update({ totalCapacity: 100 });

      expect(restaurant.totalCapacity.value).toBe(100);
    });

    it('should update multiple fields at once', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      restaurant.update({
        name: 'Multi Update Restaurant',
        description: 'Multi update description',
        totalCapacity: 75,
      });

      expect(restaurant.name.value).toBe('Multi Update Restaurant');
      expect(restaurant.description).toBe('Multi update description');
      expect(restaurant.totalCapacity.value).toBe(75);
    });

    it('should throw error when updating to invalid name', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      expect(() => restaurant.update({ name: '' })).toThrow(
        InvalidRestaurantDataError,
      );
    });

    it('should throw error when updating to invalid capacity', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      expect(() => restaurant.update({ totalCapacity: -5 })).toThrow(
        InvalidRestaurantDataError,
      );
    });
  });

  describe('status management', () => {
    describe('activate', () => {
      it('should activate a suspended restaurant', () => {
        const restaurant = RestaurantEntity.create(createValidProps());
        restaurant.deactivate();

        restaurant.activate();

        expect(restaurant.status.value).toBe('ACTIVE');
        expect(restaurant.active).toBe(true);
      });
    });

    describe('deactivate', () => {
      it('should deactivate an active restaurant', () => {
        const restaurant = RestaurantEntity.create(createValidProps());

        restaurant.deactivate();

        expect(restaurant.status.value).toBe('SUSPENDED');
        expect(restaurant.active).toBe(false);
      });
    });

    describe('setStatus', () => {
      it('should set status to SUSPENDED', () => {
        const restaurant = RestaurantEntity.create(createValidProps());

        restaurant.setStatus('SUSPENDED');

        expect(restaurant.status.value).toBe('SUSPENDED');
      });

      it('should set status to ACTIVE', () => {
        const restaurant = RestaurantEntity.create(createValidProps());
        restaurant.deactivate();

        restaurant.setStatus('ACTIVE');

        expect(restaurant.status.value).toBe('ACTIVE');
      });
    });

    describe('archive', () => {
      it('should archive the restaurant', () => {
        const restaurant = RestaurantEntity.create(createValidProps());

        restaurant.archive();

        expect(restaurant.status.value).toBe('ARCHIVED');
        expect(restaurant.active).toBe(false);
      });

      it('should set admin note when archiving', () => {
        const restaurant = RestaurantEntity.create(createValidProps());

        restaurant.archive('Closed due to policy violation');

        expect(restaurant.adminNote).toBe('Closed due to policy violation');
      });
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership to new owner', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      restaurant.transferOwnership('new-owner-456');

      expect(restaurant.ownerId).toBe('new-owner-456');
    });

    it('should throw error for empty new owner ID', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      expect(() => restaurant.transferOwnership('')).toThrow();
    });

    it('should throw error for whitespace-only new owner ID', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      expect(() => restaurant.transferOwnership('   ')).toThrow();
    });
  });

  describe('setComputedDistance', () => {
    it('should set computed distance', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      restaurant.setComputedDistance(5.5);

      expect(restaurant.computedDistance).toBe(5.5);
    });

    it('should accept zero distance', () => {
      const restaurant = RestaurantEntity.create(createValidProps());

      restaurant.setComputedDistance(0);

      expect(restaurant.computedDistance).toBe(0);
    });
  });

  describe('snapshot and rehydrate', () => {
    it('should create a snapshot of the entity', () => {
      const restaurant = RestaurantEntity.create(createValidProps(), 'rest-123');
      const snapshot = restaurant.snapshot();

      expect(snapshot.id).toBe('rest-123');
      expect(snapshot.name).toBe('Test Restaurant');
      expect(snapshot.location).toBe('123 Main Street');
      expect(snapshot.ownerId).toBe('owner-123');
      expect(snapshot.status).toBe('ACTIVE');
    });

    it('should rehydrate entity from snapshot', () => {
      const original = RestaurantEntity.create(createValidProps(), 'rest-456');
      original.update({ description: 'Updated description' });
      const snapshot = original.snapshot();

      const rehydrated = RestaurantEntity.rehydrate(snapshot);

      expect(rehydrated.id).toBe('rest-456');
      expect(rehydrated.name.value).toBe('Test Restaurant');
      expect(rehydrated.description).toBe('Updated description');
      expect(rehydrated.ownerId).toBe('owner-123');
    });

    it('should rehydrate archived restaurant', () => {
      const original = RestaurantEntity.create(createValidProps(), 'rest-789');
      original.archive('Test archive reason');
      const snapshot = original.snapshot();

      const rehydrated = RestaurantEntity.rehydrate(snapshot);

      expect(rehydrated.status.value).toBe('ARCHIVED');
      expect(rehydrated.active).toBe(false);
    });

    it('should preserve sections in snapshot', () => {
      const original = RestaurantEntity.create(
        {
          ...createValidProps(),
          sections: ['section-1', 'section-2'],
        },
        'rest-sections',
      );
      const snapshot = original.snapshot();

      expect(snapshot.sections).toEqual(['section-1', 'section-2']);
    });
  });
});
