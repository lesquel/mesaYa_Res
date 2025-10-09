import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantOrmEntity } from '../../../restaurants/index.js';
import { type RestaurantReviewReaderPort } from '../../application/ports/index.js';

@Injectable()
export class RestaurantTypeOrmReviewProvider
  implements RestaurantReviewReaderPort
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
