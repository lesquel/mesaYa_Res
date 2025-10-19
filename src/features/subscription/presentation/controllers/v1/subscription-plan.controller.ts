import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SubscriptionPlanService } from '@features/subscription/application';
import type {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  SubscriptionPlanResponseDto,
  SubscriptionPlanListResponseDto,
  DeleteSubscriptionPlanDto,
  DeleteSubscriptionPlanResponseDto,
} from '@features/subscription/application';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';

@ApiTags('Subscription plans')
@Controller({ path: 'subscription-plans', version: '1' })
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create subscription plan' })
  async createSubscriptionPlan(
    @Body() dto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.subscriptionPlanService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List subscription plans' })
  @PaginatedEndpoint()
  async getSubscriptionPlans(
    @PaginationParams() params: PaginatedQueryParams,
  ): Promise<SubscriptionPlanListResponseDto> {
    return this.subscriptionPlanService.findAll(params);
  }

  @Get(':subscriptionPlanId')
  @ApiOperation({ summary: 'Find subscription plan by ID' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  async getSubscriptionPlanById(
    @Param('subscriptionPlanId', ParseUUIDPipe) subscriptionPlanId: string,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.subscriptionPlanService.findById({
      subscriptionPlanId,
    });
  }

  @Patch(':subscriptionPlanId')
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  async updateSubscriptionPlan(
    @Param('subscriptionPlanId', ParseUUIDPipe) subscriptionPlanId: string,
    @Body() dto: Omit<UpdateSubscriptionPlanDto, 'subscriptionPlanId'>,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.subscriptionPlanService.update({
      ...dto,
      subscriptionPlanId,
    });
  }

  @Delete(':subscriptionPlanId')
  @ApiOperation({ summary: 'Delete subscription plan' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  async deleteSubscriptionPlan(
    @Param('subscriptionPlanId', ParseUUIDPipe) subscriptionPlanId: string,
  ): Promise<DeleteSubscriptionPlanResponseDto> {
    const dto: DeleteSubscriptionPlanDto = { subscriptionPlanId };
    return this.subscriptionPlanService.delete(dto);
  }
}
