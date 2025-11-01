import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantOrmEntity } from '@features/restaurants';
import { SubscriptionOrmEntity } from '../../infrastructure/database/orm/subscription.type-orm.entity';
import {
  SubscriptionForbiddenError,
  SubscriptionNotFoundError,
  SubscriptionRestaurantNotFoundError,
} from '@features/subscription/domain';

@Injectable()
export class SubscriptionAccessService {
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptions: Repository<SubscriptionOrmEntity>,
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
      throw new SubscriptionRestaurantNotFoundError(restaurantId);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new SubscriptionForbiddenError(
        'Restaurant does not belong to authenticated owner',
      );
    }
  }

  async assertSubscriptionOwnership(
    subscriptionId: string,
    ownerId: string,
  ): Promise<void> {
    const subscription = await this.subscriptions.findOne({
      where: { id: subscriptionId },
      relations: { restaurant: true },
    });

    if (!subscription) {
      throw new SubscriptionNotFoundError(subscriptionId);
    }

    const restaurantOwnerId = subscription.restaurant?.ownerId ?? null;

    if (restaurantOwnerId !== ownerId) {
      throw new SubscriptionForbiddenError(
        'Subscription does not belong to authenticated owner',
      );
    }
  }
}
