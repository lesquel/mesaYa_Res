import { Inject, Injectable, Logger } from '@nestjs/common';
import { ISubscriptionPlanRepositoryPort } from '@features/subscription/domain/repositories/subscription-plan-repository.port';
import { ISubscriptionRepositoryPort } from '@features/subscription/domain/repositories/subscription-repository.port';
import { RestaurantRepositoryPort } from '@features/restaurants/application/ports/restaurant-repository.port';
import { RESTAURANT_REPOSITORY } from '@features/restaurants/application/ports/restaurant-repository.port';
import { subscriptionPlansSeed, subscriptionsSeed } from '../data';

@Injectable()
export class SubscriptionSeedService {
  private readonly logger = new Logger(SubscriptionSeedService.name);
  private subscriptionPlanIds: string[] = []; // Track created subscription plan IDs
  private subscriptionIds: string[] = []; // Track created subscription IDs

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

    // Check if subscription plans exist by verifying if we already have IDs tracked
    if (this.subscriptionPlanIds.length > 0) {
      this.logger.log(
        '⏭️  Subscription plans already exist in this session, skipping...',
      );
      return;
    }

    for (const planData of subscriptionPlansSeed) {
      const plan = await this.subscriptionPlanRepository.create(planData);
      this.subscriptionPlanIds.push(plan.id);
    }

    this.logger.log(
      `✅ Created ${subscriptionPlansSeed.length} subscription plans`,
    );
  }

  async seedSubscriptions(): Promise<void> {
    this.logger.log('📋 Seeding subscriptions...');

    // Check if subscriptions exist by verifying if we already have IDs tracked
    if (this.subscriptionIds.length > 0) {
      this.logger.log(
        '⏭️  Subscriptions already exist in this session, skipping...',
      );
      return;
    }

    // Verificar que los planes de suscripción ya fueron creados
    if (this.subscriptionPlanIds.length === 0) {
      this.logger.warn(
        '⚠️  No subscription plans found, cannot seed subscriptions',
      );
      return;
    }

    for (const subscriptionSeed of subscriptionsSeed) {
      const restaurant = await this.restaurantRepository.findAll();
      const targetRestaurant = restaurant[subscriptionSeed.restaurantIndex];

      if (!targetRestaurant) {
        this.logger.warn(
          `Skipping subscription: restaurant not found at index ${subscriptionSeed.restaurantIndex}`,
        );
        continue;
      }

      // Buscar el plan de suscripción por nombre usando los IDs tracked
      const allPlans = await this.subscriptionPlanRepository.findAll();
      const subscriptionPlan = allPlans.find(
        (plan) => plan.name === subscriptionSeed.subscriptionPlanName,
      );

      if (!subscriptionPlan) {
        this.logger.warn(
          `Skipping subscription: plan "${subscriptionSeed.subscriptionPlanName}" not found`,
        );
        continue;
      }

      const subscription = await this.subscriptionRepository.create({
        subscriptionPlanId: subscriptionPlan.id,
        restaurantId: targetRestaurant.id,
        subscriptionStartDate: subscriptionSeed.subscriptionStartDate,
        stateSubscription: subscriptionSeed.stateSubscription,
      });

      this.subscriptionIds.push(subscription.id);
    }

    this.logger.log(`✅ Created ${subscriptionsSeed.length} subscriptions`);
  }

  /**
   * Obtiene el ID del plan de suscripción creado según su índice.
   *
   * @param {number} index - Índice del plan (0-based)
   * @returns {string | undefined} - ID del plan o undefined si no existe
   */
  getSubscriptionPlanId(index: number): string | undefined {
    return this.subscriptionPlanIds[index];
  }

  /**
   * Obtiene el ID de la suscripción creada según su índice.
   *
   * @param {number} index - Índice de la suscripción (0-based)
   * @returns {string | undefined} - ID de la suscripción o undefined si no existe
   */
  getSubscriptionId(index: number): string | undefined {
    return this.subscriptionIds[index];
  }
}
