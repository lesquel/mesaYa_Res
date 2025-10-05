import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantOrmEntity } from '../../../restaurants/infrastructure/orm/restaurant.orm-entity.js';
import { type RestaurantSectionReaderPort } from '../../application/ports/restaurant-reader.port.js';

@Injectable()
export class RestaurantTypeOrmSectionProvider
  implements RestaurantSectionReaderPort
{
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {}

  async exists(restaurantId: string): Promise<boolean> {
    if (!restaurantId) {
      return false;
    }

    const count = await this.restaurants.count({ where: { id: restaurantId } });
    return count > 0;
  }
}
