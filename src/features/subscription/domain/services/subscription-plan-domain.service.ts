import {
  ISubscriptionPlanRepositoryPort,
  SubscriptionPlanEntity,
  SubscriptionPlanCreate,
  SubscriptionPlanUpdate,
  SubscriptionPlanNotFoundError,
} from '@features/subscription/domain';

export class SubscriptionPlanDomainService {
  constructor(
    private readonly subscriptionPlanRepository: ISubscriptionPlanRepositoryPort,
  ) {}

  async createSubscriptionPlan(
    data: SubscriptionPlanCreate,
  ): Promise<SubscriptionPlanEntity> {
    return this.subscriptionPlanRepository.create(data);
  }

  async updateSubscriptionPlan(
    data: SubscriptionPlanUpdate,
  ): Promise<SubscriptionPlanEntity> {
    const updated = await this.subscriptionPlanRepository.update(data);

    if (!updated) {
      throw new SubscriptionPlanNotFoundError(data.subscriptionPlanId);
    }

    return updated;
  }

  async findSubscriptionPlanById(
    subscriptionPlanId: string,
  ): Promise<SubscriptionPlanEntity> {
    const plan =
      await this.subscriptionPlanRepository.findById(subscriptionPlanId);

    if (!plan) {
      throw new SubscriptionPlanNotFoundError(subscriptionPlanId);
    }

    return plan;
  }

  async findAllSubscriptionPlans(): Promise<SubscriptionPlanEntity[]> {
    return this.subscriptionPlanRepository.findAll();
  }

  async deleteSubscriptionPlan(subscriptionPlanId: string): Promise<void> {
    const deleted =
      await this.subscriptionPlanRepository.delete(subscriptionPlanId);

    if (!deleted) {
      throw new SubscriptionPlanNotFoundError(subscriptionPlanId);
    }
  }
}
