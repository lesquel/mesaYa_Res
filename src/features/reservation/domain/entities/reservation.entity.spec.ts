/**
 * ReservationEntity Unit Tests
 */

import { ReservationEntity } from './reservation.entity';
import { InvalidReservationDataError } from '../errors';
import type { ReservartionProps } from '../types';

describe('ReservationEntity', () => {
  // Helper to create future dates
  const getFutureDate = (daysAhead: number = 1): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date;
  };

  const getFutureTime = (hoursAhead: number = 2): Date => {
    const date = new Date();
    date.setHours(date.getHours() + hoursAhead);
    return date;
  };

  const createValidProps = (overrides: Partial<ReservartionProps> = {}): ReservartionProps => ({
    userId: 'user-123',
    restaurantId: 'restaurant-456',
    tableId: 'table-789',
    reservationDate: getFutureDate(1),
    reservationTime: getFutureTime(2),
    numberOfGuests: 4,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('create', () => {
    it('should create a reservation with valid props', () => {
      const props = createValidProps();
      const reservation = ReservationEntity.create('res-1', props);

      expect(reservation.id).toBe('res-1');
      expect(reservation.userId).toBe('user-123');
      expect(reservation.restaurantId).toBe('restaurant-456');
      expect(reservation.tableId).toBe('table-789');
      expect(reservation.numberOfGuests).toBe(4);
      expect(reservation.status).toBe('PENDING');
    });

    it('should trim whitespace from IDs', () => {
      const props = createValidProps({
        userId: '  user-123  ',
        restaurantId: '  restaurant-456  ',
        tableId: '  table-789  ',
      });
      const reservation = ReservationEntity.create('res-2', props);

      expect(reservation.userId).toBe('user-123');
      expect(reservation.restaurantId).toBe('restaurant-456');
      expect(reservation.tableId).toBe('table-789');
    });

    it('should set default status to PENDING', () => {
      const props = createValidProps({ status: undefined });
      const reservation = ReservationEntity.create('res-3', props);

      expect(reservation.status).toBe('PENDING');
    });

    it('should throw error for empty userId', () => {
      const props = createValidProps({ userId: '' });

      expect(() => ReservationEntity.create('res-4', props)).toThrow(
        InvalidReservationDataError,
      );
      expect(() => ReservationEntity.create('res-4', props)).toThrow(
        'User ID cannot be empty',
      );
    });

    it('should throw error for empty restaurantId', () => {
      const props = createValidProps({ restaurantId: '   ' });

      expect(() => ReservationEntity.create('res-5', props)).toThrow(
        'Restaurant ID cannot be empty',
      );
    });

    it('should throw error for zero guests', () => {
      const props = createValidProps({ numberOfGuests: 0 });

      expect(() => ReservationEntity.create('res-6', props)).toThrow(
        'Number of guests must be greater than zero',
      );
    });

    it('should throw error for negative guests', () => {
      const props = createValidProps({ numberOfGuests: -2 });

      expect(() => ReservationEntity.create('res-7', props)).toThrow(
        'Number of guests must be greater than zero',
      );
    });

    it('should throw error for past reservation date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const props = createValidProps({ reservationDate: pastDate });

      expect(() => ReservationEntity.create('res-8', props)).toThrow(
        'Reservation date must be in the future',
      );
    });
  });

  describe('update', () => {
    it('should update numberOfGuests', () => {
      const props = createValidProps();
      const reservation = ReservationEntity.create('res-10', props);

      reservation.update({ numberOfGuests: 6 });

      expect(reservation.numberOfGuests).toBe(6);
    });

    it('should update reservationDate', () => {
      const props = createValidProps();
      const reservation = ReservationEntity.create('res-11', props);
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 5);

      reservation.update({ reservationDate: newDate });

      expect(reservation.reservationDate).toEqual(newDate);
    });

    it('should update updatedAt timestamp', () => {
      const props = createValidProps();
      const reservation = ReservationEntity.create('res-12', props);
      const originalUpdatedAt = reservation.updatedAt;

      reservation.update({ numberOfGuests: 5 });

      expect(reservation.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should throw error when updating to zero guests', () => {
      const props = createValidProps();
      const reservation = ReservationEntity.create('res-13', props);

      expect(() => reservation.update({ numberOfGuests: 0 })).toThrow(
        'Number of guests must be greater than zero',
      );
    });
  });

  describe('changeStatus', () => {
    it('should change status to CONFIRMED', () => {
      const props = createValidProps();
      const reservation = ReservationEntity.create('res-14', props);

      reservation.changeStatus('CONFIRMED');

      expect(reservation.status).toBe('CONFIRMED');
    });

    it('should change status to CANCELLED', () => {
      const props = createValidProps();
      const reservation = ReservationEntity.create('res-15', props);

      reservation.changeStatus('CANCELLED');

      expect(reservation.status).toBe('CANCELLED');
    });

    it('should update updatedAt when changing status', () => {
      const props = createValidProps();
      const reservation = ReservationEntity.create('res-16', props);
      const originalUpdatedAt = reservation.updatedAt;

      reservation.changeStatus('CONFIRMED');

      expect(reservation.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('snapshot and rehydrate', () => {
    it('should create a snapshot of the entity', () => {
      const props = createValidProps();
      const reservation = ReservationEntity.create('res-17', props);
      const snapshot = reservation.snapshot();

      expect(snapshot.id).toBe('res-17');
      expect(snapshot.userId).toBe('user-123');
      expect(snapshot.restaurantId).toBe('restaurant-456');
      expect(snapshot.tableId).toBe('table-789');
      expect(snapshot.numberOfGuests).toBe(4);
      expect(snapshot.status).toBe('PENDING');
    });

    it('should rehydrate entity from snapshot', () => {
      const props = createValidProps();
      const original = ReservationEntity.create('res-18', props);
      const snapshot = original.snapshot();

      const rehydrated = ReservationEntity.rehydrate(snapshot);

      expect(rehydrated.id).toBe(original.id);
      expect(rehydrated.userId).toBe(original.userId);
      expect(rehydrated.restaurantId).toBe(original.restaurantId);
      expect(rehydrated.numberOfGuests).toBe(original.numberOfGuests);
    });

    it('should allow rehydrating past reservations', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const snapshot = {
        id: 'res-19',
        userId: 'user-123',
        restaurantId: 'restaurant-456',
        tableId: 'table-789',
        reservationDate: pastDate,
        reservationTime: pastDate,
        numberOfGuests: 2,
        status: 'COMPLETED' as const,
        createdAt: pastDate,
        updatedAt: pastDate,
      };

      // Should not throw - past reservations can be rehydrated
      const reservation = ReservationEntity.rehydrate(snapshot);

      expect(reservation.status).toBe('COMPLETED');
    });
  });
});
