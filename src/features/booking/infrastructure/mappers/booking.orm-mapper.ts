import { Booking } from '../../domain/index.js';
import { BookingOrmEntity } from '../orm/index.js';
import { RestaurantOrmEntity } from '../../../restaurants/index.js';
import { User } from '../../../../auth/entities/user.entity.js';

export class BookingOrmMapper {
  static toDomain(entity: BookingOrmEntity): Booking {
    const restaurantId = entity.restaurantId ?? entity.restaurant?.id;
    const userId = entity.userId ?? entity.user?.id;

    if (!restaurantId || !userId) {
      throw new Error('Booking entity is missing relation identifiers');
    }

    return Booking.rehydrate({
      id: entity.id,
      userId,
      restaurantId,
      tableId: entity.tableId,
      reservationTime: entity.reservationTime,
      reservationDate: entity.reservationDate,
      numberOfGuests: entity.numberOfGuests,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      status: entity.status,
    });
  }

  static toOrmEntity(
    booking: Booking,
    relations: {
      restaurant?: RestaurantOrmEntity;
      user?: User;
      existing?: BookingOrmEntity;
    } = {},
  ): BookingOrmEntity {
    const snapshot = booking.snapshot();
    const entity = relations.existing ?? new BookingOrmEntity();

    entity.id = snapshot.id;
    entity.tableId = snapshot.tableId;
    entity.reservationTime = snapshot.reservationTime;
    entity.reservationDate = snapshot.reservationDate;
    entity.numberOfGuests = snapshot.numberOfGuests;
    entity.status = snapshot.status;
    entity.createdAt = snapshot.createdAt;
    entity.updatedAt = snapshot.updatedAt;

    if (relations.restaurant) {
      entity.restaurant = relations.restaurant;
    }

    if (relations.user) {
      entity.user = relations.user;
    }

    return entity;
  }
}
