import { ReservationEntity } from '../../domain/index.js';
import { ReservationOrmEntity } from '../orm/index.js';
import { RestaurantOrmEntity } from '../../../restaurants/index.js';
import { UserOrmEntity } from '../../../../auth/entities/user.entity.js';

export class ReservationOrmMapper {
  static toDomain(entity: ReservationOrmEntity): ReservationEntity {
    const restaurantId = entity.restaurantId ?? entity.restaurant?.id;
    const userId = entity.userId ?? entity.user?.id;

    if (!restaurantId || !userId) {
      throw new Error('Reservation entity is missing relation identifiers');
    }

    return ReservationEntity.rehydrate({
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
    reservation: ReservationEntity,
    relations: {
      restaurant?: RestaurantOrmEntity;
      user?: UserOrmEntity;
      existing?: ReservationOrmEntity;
    } = {},
  ): ReservationOrmEntity {
    const snapshot = reservation.snapshot();
    const entity = relations.existing ?? new ReservationOrmEntity();

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
