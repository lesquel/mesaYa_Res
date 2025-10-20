import {
  ISubscriptionRepositoryPort,
  SubscriptionEntity,
  SubscriptionCreate,
  SubscriptionUpdate,
  SubscriptionCreationFailedError,
  SubscriptionNotFoundError,
} from '@features/subscription/domain';

export class SubscriptionDomainService {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepositoryPort,
  ) {}

  async createSubscription(
    data: SubscriptionCreate,
  ): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptionRepository.create(data);

    if (!subscription) {
      throw new SubscriptionCreationFailedError({
        subscriptionPlanId: data.subscriptionPlanId,
        restaurantId: data.restaurantId,
      });
    }

    return subscription;
  }

  async updateSubscription(
    data: SubscriptionUpdate,
  ): Promise<SubscriptionEntity> {
    const updated = await this.subscriptionRepository.update(data);

    if (!updated) {
      throw new SubscriptionNotFoundError(data.subscriptionId);
    }

    return updated;
  }

  async findSubscriptionById(
    subscriptionId: string,
  ): Promise<SubscriptionEntity> {
    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new SubscriptionNotFoundError(subscriptionId);
    }

    return subscription;
  }

  async findAllSubscriptions(): Promise<SubscriptionEntity[]> {
    return this.subscriptionRepository.findAll();
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    const deleted = await this.subscriptionRepository.delete(subscriptionId);

    if (!deleted) {
      throw new SubscriptionNotFoundError(subscriptionId);
    }
  }
}
