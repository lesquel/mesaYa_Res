import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantOrmEntity } from '@features/restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity';

@Injectable()
export class MenusAccessService {
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {}

  async findRestaurantIdByOwner(ownerId: string): Promise<string | null> {
    const restaurant = await this.restaurants.findOne({
      where: { ownerId },
      select: { id: true },
    });
    return restaurant?.id ?? null;
  }

  async ensureOwnerRestaurant(ownerId: string): Promise<string> {
    const restaurantId = await this.findRestaurantIdByOwner(ownerId);
    if (!restaurantId) {
      throw new ForbiddenException(
        'El owner no tiene un restaurante asignado',
      );
    }
    return restaurantId;
  }
}
