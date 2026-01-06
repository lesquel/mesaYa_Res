import { ReservationEntity } from '../../domain';
import { ReservationOrmEntity } from '../orm';
import { RestaurantOrmEntity } from '../../../restaurants';

/**
 * Mapper for Reservation ORM entities.
 *
 * Note: userId is stored as a plain UUID reference to Auth MS.
 * We don't join with any user table - the user data comes from JWT.
 */
export class ReservationOrmMapper {
  static toDomain(entity: ReservationOrmEntity): ReservationEntity {
    const restaurantId = entity.restaurantId ?? entity.restaurant?.id;
    const userId = entity.userId;

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
      existing?: ReservationOrmEntity;
    } = {},
  ): ReservationOrmEntity {
    const snapshot = reservation.snapshot();
    const entity = relations.existing ?? new ReservationOrmEntity();

    entity.id = snapshot.id;
    entity.userId = snapshot.userId;
    entity.tableId = snapshot.tableId;
    entity.reservationTime = snapshot.reservationTime;
    entity.reservationDate = snapshot.reservationDate;
    entity.numberOfGuests = snapshot.numberOfGuests;
    entity.status = snapshot.status;
    entity.createdAt = snapshot.createdAt;
    entity.updatedAt = snapshot.updatedAt;
    entity.restaurantId = snapshot.restaurantId;

    if (relations.restaurant) {
      entity.restaurant = relations.restaurant;
    }

    return entity;
  }
}
