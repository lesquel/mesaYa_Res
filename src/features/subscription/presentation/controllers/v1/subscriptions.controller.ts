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
  CurrentUser,
  type CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';
import {
  ThrottleCreate,
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
  CreateSubscriptionRequestDto,
  DeleteSubscriptionResponseSwaggerDto,
  SubscriptionAnalyticsRequestDto,
  SubscriptionAnalyticsResponseDto,
  SubscriptionResponseSwaggerDto,
  UpdateSubscriptionRequestDto,
  UpdateSubscriptionStateRequestDto,
} from '@features/subscription/presentation/dto';

@ApiTags('Subscriptions')
@Controller({ path: 'subscriptions', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly getSubscriptionAnalytics: GetSubscriptionAnalyticsUseCase,
  ) {}

  // --- Restaurant ---

  @Post()
  @ThrottleCreate()
  @Permissions('subscription:create')
  @ApiOperation({
    summary: 'Suscribir mi restaurante a un plan (propietario)',
  })
  @ApiBody({ type: CreateSubscriptionRequestDto })
  @ApiCreatedResponse({
    description: 'Suscripción creada exitosamente',
    type: SubscriptionResponseSwaggerDto,
  })
  async subscribeRestaurant(
    @Body() dto: CreateSubscriptionRequestDto,
    @CurrentUser() user: { userId: string },
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.createForOwner(dto, user.userId);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @Permissions('subscription:read')
  @ApiOperation({
    summary: 'Ver la suscripción activa de mi restaurante (propietario)',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Suscripción del restaurante',
    type: SubscriptionResponseSwaggerDto,
  })
  async getRestaurantSubscription(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findByRestaurantForOwner(
      { restaurantId },
      user.userId,
    );
  }

  // --- Admin ---

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
    @PaginationParams({ allowExtraParams: true }) params: PaginatedQueryParams,
  ): Promise<SubscriptionListResponseDto> {
    const paginated = await this.subscriptionService.findAll(params);
    return {
      data: paginated.results,
      pagination: {
        page: paginated.page,
        pageSize: paginated.limit,
        totalItems: paginated.total,
        totalPages: paginated.pages,
      },
    } as unknown as SubscriptionListResponseDto;
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
  async getSubscription(
    @Param('subscriptionId', UUIDPipe) subscriptionId: string,
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
    @Param('subscriptionId', UUIDPipe) subscriptionId: string,
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
    @Param('subscriptionId', UUIDPipe) subscriptionId: string,
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
    @Param('subscriptionId', UUIDPipe) subscriptionId: string,
  ): Promise<DeleteSubscriptionResponseDto> {
    const dto: DeleteSubscriptionDto = { subscriptionId };
    return this.subscriptionService.delete(dto);
  }
}
