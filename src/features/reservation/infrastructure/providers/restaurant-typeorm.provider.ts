import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantOrmEntity } from '../../../restaurants/index';
import { type RestaurantReservationReaderPort } from '../../application/ports/index';
import {
  IReservationRestaurantPort,
  type ReservationRestaurantSnapshot,
} from '../../domain/ports';
import type { RestaurantDay } from '@features/restaurants/domain/entities/values/restaurant-day';

@Injectable()
export class RestaurantTypeOrmReservationProvider
  extends IReservationRestaurantPort
  implements RestaurantReservationReaderPort
{
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {
    super();
  }

  async exists(restaurantId: string): Promise<boolean> {
    if (!restaurantId) {
      return false;
    }

    const count = await this.restaurants.count({ where: { id: restaurantId } });
    return count > 0;
  }

  async loadById(
    restaurantId: string,
  ): Promise<ReservationRestaurantSnapshot | null> {
    if (!restaurantId) {
      return null;
    }

    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId },
    });

    if (
      !restaurant ||
      !restaurant.openTime ||
      !restaurant.closeTime ||
      !restaurant.daysOpen ||
      restaurant.daysOpen.length === 0
    ) {
      return null;
    }

    return {
      restaurantId: restaurant.id,
      openTime: restaurant.openTime,
      closeTime: restaurant.closeTime,
      daysOpen: restaurant.daysOpen as RestaurantDay[],
      active: restaurant.active,
    };
  }
}
