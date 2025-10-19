import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { SubscriptionPlanNotFoundError } from '@features/subscription/domain';
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
    try {
      return await this.subscriptionPlanService.create(dto);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List subscription plans' })
  @PaginatedEndpoint()
  async getSubscriptionPlans(
    @PaginationParams() params: PaginatedQueryParams,
  ): Promise<SubscriptionPlanListResponseDto> {
    try {
      return await this.subscriptionPlanService.findAll(params);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':subscriptionPlanId')
  @ApiOperation({ summary: 'Find subscription plan by ID' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  async getSubscriptionPlanById(
    @Param('subscriptionPlanId', ParseUUIDPipe) subscriptionPlanId: string,
  ): Promise<SubscriptionPlanResponseDto> {
    try {
      return await this.subscriptionPlanService.findById({
        subscriptionPlanId,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':subscriptionPlanId')
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  async updateSubscriptionPlan(
    @Param('subscriptionPlanId', ParseUUIDPipe) subscriptionPlanId: string,
    @Body() dto: Omit<UpdateSubscriptionPlanDto, 'subscriptionPlanId'>,
  ): Promise<SubscriptionPlanResponseDto> {
    try {
      return await this.subscriptionPlanService.update({
        ...dto,
        subscriptionPlanId,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':subscriptionPlanId')
  @ApiOperation({ summary: 'Delete subscription plan' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  async deleteSubscriptionPlan(
    @Param('subscriptionPlanId', ParseUUIDPipe) subscriptionPlanId: string,
  ): Promise<DeleteSubscriptionPlanResponseDto> {
    try {
      const dto: DeleteSubscriptionPlanDto = { subscriptionPlanId };
      return await this.subscriptionPlanService.delete(dto);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof SubscriptionPlanNotFoundError) {
      throw new NotFoundException(error.message);
    }

    if (error instanceof Error) {
      throw new BadRequestException(error.message);
    }

    throw error as Error;
  }
}
