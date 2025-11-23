import { Controller, Get, Param } from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottleRead } from '@shared/infrastructure/decorators';
import { SubscriptionPlanService } from '@features/subscription/application';
import type {
  SubscriptionPlanResponseDto,
  SubscriptionPlanListResponseDto,
} from '@features/subscription/application';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { SubscriptionPlanResponseSwaggerDto } from '@features/subscription/presentation/dto';

@ApiTags('Subscription Plans - Public')
@Controller({ path: 'public/subscription-plans', version: '1' })
export class PublicSubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'List available subscription plans (public)' })
  @PaginatedEndpoint()
  @ApiOkResponse({
    description: 'Array of subscription plans',
    type: SubscriptionPlanResponseSwaggerDto,
    isArray: true,
  })
  async getSubscriptionPlans(
    @PaginationParams({ defaultRoute: '/public/subscription-plans' })
    params: PaginatedQueryParams,
  ): Promise<SubscriptionPlanListResponseDto> {
    return this.subscriptionPlanService.findAll(params);
  }

  @Get(':subscriptionPlanId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Get subscription plan details (public)' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Subscription plan details',
    type: SubscriptionPlanResponseSwaggerDto,
  })
  async findOne(
    @Param('subscriptionPlanId', UUIDPipe) subscriptionPlanId: string,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.subscriptionPlanService.findById({
      subscriptionPlanId,
    });
  }
}
