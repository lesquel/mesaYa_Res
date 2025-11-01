import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
} from '@shared/infrastructure/decorators';
import { SubscriptionService } from '@features/subscription/application';
import type { SubscriptionResponseDto } from '@features/subscription/application';
import {
  CreateSubscriptionRequestDto,
  SubscriptionResponseSwaggerDto,
} from '@features/subscription/presentation/dto';

@ApiTags('Subscriptions - Restaurant ')
@Controller({ path: 'restaurant/subscriptions', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RestaurantSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

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
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findByRestaurantForOwner(
      { restaurantId },
      user.userId,
    );
  }
}
