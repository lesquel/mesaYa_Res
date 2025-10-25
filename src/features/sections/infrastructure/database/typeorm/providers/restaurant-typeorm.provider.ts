import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantOrmEntity } from '../../../../../restaurants/infrastructure';
import { type RestaurantSectionReaderPort } from '../../../../application/ports';
import {
  ISectionRestaurantPort,
  type SectionRestaurantSnapshot,
} from '../../../../domain/ports';

@Injectable()
export class RestaurantTypeOrmSectionProvider
  implements RestaurantSectionReaderPort, ISectionRestaurantPort
{
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {}

  async exists(restaurantId: string): Promise<boolean> {
    const restaurant = await this.loadById(restaurantId);
    return Boolean(restaurant);
  }

  async loadById(
    restaurantId: string,
  ): Promise<SectionRestaurantSnapshot | null> {
    if (!restaurantId) {
      return null;
    }

    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return null;
    }

    return {
      restaurantId: restaurant.id,
    };
  }
}
