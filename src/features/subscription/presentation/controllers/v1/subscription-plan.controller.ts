import { SubscriptionPlanService } from '@features/subscription/application';
import { Controller, Get, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Subscription plans')
@Controller('subscription-plans')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @Post()
  createSubscriptionPlan() {
    // Implement subscription creation logic
  }

  @Get()
  getSubscriptionPlans() {
    // Implement logic to retrieve subscription plans
  }

  @Get(':id')
  getSubscriptionPlanById() {
    // Implement logic to retrieve a subscription plan
  }

  @Put(':id')
  updateSubscriptionPlan() {
    // Implement logic to update a subscription plan
  }

  @Patch(':id/status')
  updateSubscriptionPlanStatus() {
    // Implement logic to update subscription status
  }
}
