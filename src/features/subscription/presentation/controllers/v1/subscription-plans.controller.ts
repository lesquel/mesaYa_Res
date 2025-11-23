import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';

import {
  GetSubscriptionPlanAnalyticsUseCase,
  SubscriptionPlanService,
} from '@features/subscription/application';
import type {
  SubscriptionPlanResponseDto,
  DeleteSubscriptionPlanDto,
  DeleteSubscriptionPlanResponseDto,
  SubscriptionPlanListResponseDto,
} from '@features/subscription/application';
import {
  CreateSubscriptionPlanRequestDto,
  DeleteSubscriptionPlanResponseSwaggerDto,
  SubscriptionPlanAnalyticsRequestDto,
  SubscriptionPlanAnalyticsResponseDto,
  SubscriptionPlanResponseSwaggerDto,
  UpdateSubscriptionPlanRequestDto,
} from '@features/subscription/presentation/dto';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';

@ApiTags('Subscription Plans')
@Controller({ path: 'subscription-plans', version: '1' })
export class SubscriptionPlansController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly getSubscriptionPlanAnalytics: GetSubscriptionPlanAnalyticsUseCase,
  ) {}

  @Get('analytics')
  @ThrottleSearch()
  @ApiOkResponse({
    description: 'Subscription plan analytics',
    type: SubscriptionPlanAnalyticsResponseDto,
  })
  async analytics(
    @Query() query: SubscriptionPlanAnalyticsRequestDto,
  ): Promise<SubscriptionPlanAnalyticsResponseDto> {
    const analytics = await this.getSubscriptionPlanAnalytics.execute(
      query.toQuery(),
    );
    return SubscriptionPlanAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'List subscription plans' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: SubscriptionPlanResponseSwaggerDto,
    description: 'List of subscription plans',
  })
  async findAll(
    @PaginationParams({
      defaultRoute: '/subscription-plans',
      allowExtraParams: true,
    })
    params: PaginatedQueryParams,
  ): Promise<SubscriptionPlanListResponseDto> {
    return this.subscriptionPlanService.findAll(params);
  }

  @Get(':subscriptionPlanId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Get subscription plan details' })
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

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleCreate()
  @Permissions('subscription-plan:create')
  @ApiOperation({ summary: 'Create subscription plan' })
  @ApiBody({ type: CreateSubscriptionPlanRequestDto })
  @ApiCreatedResponse({
    description: 'Subscription plan created',
    type: SubscriptionPlanResponseSwaggerDto,
  })
  async create(
    @Body() dto: CreateSubscriptionPlanRequestDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.subscriptionPlanService.create(dto);
  }

  @Patch(':subscriptionPlanId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @Permissions('subscription-plan:update')
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateSubscriptionPlanRequestDto })
  @ApiOkResponse({
    description: 'Subscription plan updated',
    type: SubscriptionPlanResponseSwaggerDto,
  })
  async update(
    @Param('subscriptionPlanId', UUIDPipe) subscriptionPlanId: string,
    @Body() dto: UpdateSubscriptionPlanRequestDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.subscriptionPlanService.update({
      ...dto,
      subscriptionPlanId,
    });
  }

  @Delete(':subscriptionPlanId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @Permissions('subscription-plan:delete')
  @ApiOperation({ summary: 'Delete subscription plan' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Subscription plan deleted',
    type: DeleteSubscriptionPlanResponseSwaggerDto,
  })
  async delete(
    @Param('subscriptionPlanId', UUIDPipe) subscriptionPlanId: string,
  ): Promise<DeleteSubscriptionPlanResponseDto> {
    const dto: DeleteSubscriptionPlanDto = { subscriptionPlanId };
    return this.subscriptionPlanService.delete(dto);
  }
}
