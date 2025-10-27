import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
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
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';

import {
  GetSubscriptionAnalyticsUseCase,
  SubscriptionService,
} from '@features/subscription/application';
import type {
  SubscriptionResponseDto,
  SubscriptionListResponseDto,
  DeleteSubscriptionDto,
  DeleteSubscriptionResponseDto,
} from '@features/subscription/application';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import {
  DeleteSubscriptionResponseSwaggerDto,
  SubscriptionAnalyticsRequestDto,
  SubscriptionAnalyticsResponseDto,
  SubscriptionResponseSwaggerDto,
  UpdateSubscriptionRequestDto,
  UpdateSubscriptionStateRequestDto,
} from '@features/subscription/presentation/dto';

@ApiTags('Subscriptions - Admin')
@Controller({ path: 'admin/subscriptions', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminSubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly getSubscriptionAnalytics: GetSubscriptionAnalyticsUseCase,
  ) {}

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('subscription:read')
  @ApiOkResponse({
    description: 'Resumen analítico de suscripciones',
    type: SubscriptionAnalyticsResponseDto,
  })
  async analytics(
    @Query() query: SubscriptionAnalyticsRequestDto,
  ): Promise<SubscriptionAnalyticsResponseDto> {
    const analytics = await this.getSubscriptionAnalytics.execute(
      query.toQuery(),
    );
    return SubscriptionAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get()
  @ThrottleRead()
  @Permissions('subscription:read')
  @ApiOperation({ summary: 'List all subscriptions (admin)' })
  @PaginatedEndpoint()
  @ApiOkResponse({
    description: 'Array of subscriptions',
    type: SubscriptionResponseSwaggerDto,
    isArray: true,
  })
  async getSubscriptions(
    @PaginationParams() params: PaginatedQueryParams,
  ): Promise<SubscriptionListResponseDto> {
    return this.subscriptionService.findAll(params);
  }

  @Get(':subscriptionId')
  @ThrottleRead()
  @Permissions('subscription:read')
  @ApiOperation({ summary: 'Find subscription by ID (admin)' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Subscription details',
    type: SubscriptionResponseSwaggerDto,
  })
  async getSubscriptionById(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findById({ subscriptionId });
  }

  @Patch(':subscriptionId')
  @ThrottleModify()
  @Permissions('subscription:update')
  @ApiOperation({ summary: 'Update subscription (admin)' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateSubscriptionRequestDto })
  @ApiOkResponse({
    description: 'Subscription updated',
    type: SubscriptionResponseSwaggerDto,
  })
  async updateSubscription(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: UpdateSubscriptionRequestDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.update({
      ...dto,
      subscriptionId,
    });
  }

  @Patch(':subscriptionId/state')
  @ThrottleModify()
  @Permissions('subscription:update')
  @ApiOperation({ summary: 'Update subscription state (admin)' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateSubscriptionStateRequestDto })
  @ApiOkResponse({
    description: 'Subscription state updated',
    type: SubscriptionResponseSwaggerDto,
  })
  async updateSubscriptionState(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: UpdateSubscriptionStateRequestDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.updateState({
      ...dto,
      subscriptionId,
    });
  }

  @Delete(':subscriptionId')
  @ThrottleModify()
  @Permissions('subscription:delete')
  @ApiOperation({ summary: 'Delete subscription (admin)' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Subscription deleted',
    type: DeleteSubscriptionResponseSwaggerDto,
  })
  async deleteSubscription(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
  ): Promise<DeleteSubscriptionResponseDto> {
    const dto: DeleteSubscriptionDto = { subscriptionId };
    return this.subscriptionService.delete(dto);
  }
}
