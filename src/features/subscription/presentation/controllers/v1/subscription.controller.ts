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
  CreateSubscriptionRequestDto,
  DeleteSubscriptionResponseSwaggerDto,
  SubscriptionAnalyticsRequestDto,
  SubscriptionAnalyticsResponseDto,
  SubscriptionResponseSwaggerDto,
  UpdateSubscriptionRequestDto,
  UpdateSubscriptionStateRequestDto,
} from '@features/subscription/presentation/dto/index';

@ApiTags('Subscriptions')
@Controller({ path: 'subscriptions', version: '1' })
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly getSubscriptionAnalytics: GetSubscriptionAnalyticsUseCase,
  ) {}
  @Get('analytics')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscription:read')
  @ApiBearerAuth()
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

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscription:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create subscription' })
  @ApiBody({ type: CreateSubscriptionRequestDto })
  @ApiCreatedResponse({
    description: 'Subscription successfully created',
    type: SubscriptionResponseSwaggerDto,
  })
  async createSubscription(
    @Body() dto: CreateSubscriptionRequestDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscription:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List subscriptions' })
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscription:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find subscription by ID' })
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscription:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscription' })
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscription:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscription state' })
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscription:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete subscription' })
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
