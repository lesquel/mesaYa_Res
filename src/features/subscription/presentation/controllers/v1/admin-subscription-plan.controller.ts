import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
} from '@features/subscription/application';
import {
  CreateSubscriptionPlanRequestDto,
  DeleteSubscriptionPlanResponseSwaggerDto,
  SubscriptionPlanAnalyticsRequestDto,
  SubscriptionPlanAnalyticsResponseDto,
  SubscriptionPlanResponseSwaggerDto,
  UpdateSubscriptionPlanRequestDto,
} from '@features/subscription/presentation/dto';

@ApiTags('Admin Subscription Plans')
@Controller({ path: 'admin/subscription-plans', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminSubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly getSubscriptionPlanAnalytics: GetSubscriptionPlanAnalyticsUseCase,
  ) {}

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('subscription-plan:read')
  @ApiOkResponse({
    description: 'Resumen analítico de planes de suscripción',
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

  @Post()
  @ThrottleCreate()
  @Permissions('subscription-plan:create')
  @ApiOperation({ summary: 'Create subscription plan (admin)' })
  @ApiBody({ type: CreateSubscriptionPlanRequestDto })
  @ApiCreatedResponse({
    description: 'Subscription plan created',
    type: SubscriptionPlanResponseSwaggerDto,
  })
  async createSubscriptionPlan(
    @Body() dto: CreateSubscriptionPlanRequestDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.subscriptionPlanService.create(dto);
  }

  @Patch(':subscriptionPlanId')
  @ThrottleModify()
  @Permissions('subscription-plan:update')
  @ApiOperation({ summary: 'Update subscription plan (admin)' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateSubscriptionPlanRequestDto })
  @ApiOkResponse({
    description: 'Subscription plan updated',
    type: SubscriptionPlanResponseSwaggerDto,
  })
  async updateSubscriptionPlan(
    @Param('subscriptionPlanId', ParseUUIDPipe) subscriptionPlanId: string,
    @Body() dto: UpdateSubscriptionPlanRequestDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.subscriptionPlanService.update({
      ...dto,
      subscriptionPlanId,
    });
  }

  @Delete(':subscriptionPlanId')
  @ThrottleModify()
  @Permissions('subscription-plan:delete')
  @ApiOperation({ summary: 'Delete subscription plan (admin)' })
  @ApiParam({ name: 'subscriptionPlanId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Subscription plan deleted',
    type: DeleteSubscriptionPlanResponseSwaggerDto,
  })
  async deleteSubscriptionPlan(
    @Param('subscriptionPlanId', ParseUUIDPipe) subscriptionPlanId: string,
  ): Promise<DeleteSubscriptionPlanResponseDto> {
    const dto: DeleteSubscriptionPlanDto = { subscriptionPlanId };
    return this.subscriptionPlanService.delete(dto);
  }
}
