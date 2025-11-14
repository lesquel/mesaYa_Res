import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationOrmEntity } from '../../infrastructure/orm';
import { RestaurantOrmEntity } from '../../../restaurants';
import {
  ReservationNotFoundError,
  ReservationOwnershipError,
  ReservationRestaurantNotFoundError,
} from '../../domain/errors';

@Injectable()
export class ReservationOwnerAccessService {
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
    @InjectRepository(ReservationOrmEntity)
    private readonly reservations: Repository<ReservationOrmEntity>,
  ) {}

  async assertRestaurantOwnership(
    restaurantId: string,
    ownerId: string,
  ): Promise<void> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId },
      select: { id: true, ownerId: true },
    });

    if (!restaurant) {
      throw new ReservationRestaurantNotFoundError(restaurantId);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new ReservationOwnershipError();
    }
  }

  async assertReservationOwnership(
    reservationId: string,
    ownerId: string,
  ): Promise<void> {
    const reservation = await this.reservations
      .createQueryBuilder('reservation')
      .leftJoin('reservation.restaurant', 'restaurant')
      .select(['reservation.id', 'restaurant.id', 'restaurant.ownerId'])
      .where('reservation.id = :reservationId', { reservationId })
      .getOne();

    if (!reservation) {
      throw new ReservationNotFoundError(reservationId);
    }

    const reservationOwnerId = reservation.restaurant?.ownerId ?? null;

    if (reservationOwnerId !== ownerId) {
      throw new ReservationOwnershipError();
    }
  }
}
