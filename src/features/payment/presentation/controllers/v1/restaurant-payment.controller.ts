import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
} from '@shared/infrastructure/decorators';
import { PaymentService } from '@features/payment/application';
import type { PaymentResponseDto } from '@features/payment/application';
import {
  CreatePaymentRequestDto,
  PaymentResponseSwaggerDto,
} from '@features/payment/presentation/dto';

@ApiTags('Payments - Restaurants')
@Controller({ path: 'restaurant/payments', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RestaurantPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ThrottleCreate()
  @Permissions('payment:create')
  @ApiOperation({
    summary: 'Create payment for subscription (restaurant owner)',
  })
  @ApiBody({ type: CreatePaymentRequestDto })
  @ApiCreatedResponse({
    description: 'Payment for subscription successfully created',
    type: PaymentResponseSwaggerDto,
  })
  async createSubscriptionPayment(
    @Body() dto: CreatePaymentRequestDto,
    @CurrentUser() user: { userId: string },
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createSubscriptionPaymentForOwner(
      dto,
      user.userId,
    );
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @Permissions('payment:read')
  @ApiOperation({
    summary: 'Get payments of my restaurant (restaurant owner)',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'List of restaurant payments',
    type: PaymentResponseSwaggerDto,
    isArray: true,
  })
  async getRestaurantPayments(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<PaymentResponseDto[]> {
    return this.paymentService.getPaymentsByRestaurantForOwner(
      restaurantId,
      user.userId,
    );
  }

  @Get(':paymentId')
  @ThrottleRead()
  @Permissions('payment:read')
  @ApiOperation({
    summary: 'Get my restaurant payment by ID (restaurant owner)',
  })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Payment details',
    type: PaymentResponseSwaggerDto,
  })
  async getPaymentById(
    @Param('paymentId', UUIDPipe) paymentId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getOwnerPaymentById(paymentId, user.userId);
  }
}
