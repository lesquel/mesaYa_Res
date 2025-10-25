import { Inject, Injectable, Logger } from '@nestjs/common';
import { ISubscriptionPlanRepositoryPort } from '@features/subscription/domain/repositories/subscription-plan-repository.port';
import { ISubscriptionRepositoryPort } from '@features/subscription/domain/repositories/subscription-repository.port';
import type { RestaurantRepositoryPort } from '@features/restaurants/application/ports/restaurant-repository.port';
import { RESTAURANT_REPOSITORY } from '@features/restaurants/application/ports/restaurant-repository.port';
import { subscriptionPlansSeed, subscriptionsSeed } from '../data';

@Injectable()
export class SubscriptionSeedService {
  private readonly logger = new Logger(SubscriptionSeedService.name);

  constructor(
    @Inject(ISubscriptionPlanRepositoryPort)
    private readonly subscriptionPlanRepository: ISubscriptionPlanRepositoryPort,
    @Inject(ISubscriptionRepositoryPort)
    private readonly subscriptionRepository: ISubscriptionRepositoryPort,
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
  ) {}

  async seedSubscriptionPlans(): Promise<void> {
    this.logger.log('💳 Seeding subscription plans...');

    const existing = await this.subscriptionPlanRepository.findAll();
    if (existing.length > 0) {
      this.logger.log('⏭️  Subscription plans already exist, skipping...');
      return;
    }

    for (const planData of subscriptionPlansSeed) {
      await this.subscriptionPlanRepository.create(planData);
    }

    this.logger.log(
      `✅ Created ${subscriptionPlansSeed.length} subscription plans`,
    );
  }

  async seedSubscriptions(): Promise<void> {
    this.logger.log('📋 Seeding subscriptions...');

    const existing = await this.subscriptionRepository.findAll();
    if (existing.length > 0) {
      this.logger.log('⏭️  Subscriptions already exist, skipping...');
      return;
    }

    const restaurants = await this.restaurantRepository.findAll();
    const subscriptionPlans = await this.subscriptionPlanRepository.findAll();

    for (const subscriptionSeed of subscriptionsSeed) {
      const restaurant = restaurants[subscriptionSeed.restaurantIndex];
      const subscriptionPlan = subscriptionPlans.find(
        (plan) => plan.name === subscriptionSeed.subscriptionPlanName,
      );

      if (!restaurant || !subscriptionPlan) {
        this.logger.warn('Skipping subscription: restaurant or plan not found');
        continue;
      }

      await this.subscriptionRepository.create({
        subscriptionPlanId: subscriptionPlan.id,
        restaurantId: restaurant.id,
        subscriptionStartDate: subscriptionSeed.subscriptionStartDate,
        stateSubscription: subscriptionSeed.stateSubscription,
      });
    }

    this.logger.log(`✅ Created ${subscriptionsSeed.length} subscriptions`);
  }
}
