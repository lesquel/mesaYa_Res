import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantOrmEntity } from '@features/restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity';
import { IRestaurantOwnershipPort } from '@shared/application/ports/restaurant-ownership.port';

/**
 * Service for validating restaurant ownership
 */
@Injectable()
export class RestaurantOwnershipService implements IRestaurantOwnershipPort {
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurantRepo: Repository<RestaurantOrmEntity>,
  ) {}

  async validateOwnership(
    restaurantId: string,
    ownerId: string,
  ): Promise<boolean> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return false;
    }

    return restaurant.ownerId === ownerId;
  }

  async getRestaurantOwnerId(restaurantId: string): Promise<string | null> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: restaurantId },
      select: ['ownerId'],
    });

    return restaurant?.ownerId ?? null;
  }

  async findRestaurantIdByOwner(ownerId: string): Promise<string | null> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { ownerId },
      select: ['id'],
    });

    return restaurant?.id ?? null;
  }

  async findRestaurantIdsByOwner(ownerId: string): Promise<string[]> {
    const restaurants = await this.restaurantRepo.find({
      where: { ownerId },
      select: ['id'],
    });

    return restaurants.map((r) => r.id);
  }

  async assertRestaurantOwnership(
    restaurantId: string,
    ownerId: string,
  ): Promise<void> {
    const isOwner = await this.validateOwnership(restaurantId, ownerId);
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to access this restaurant',
      );
    }
  }
}
