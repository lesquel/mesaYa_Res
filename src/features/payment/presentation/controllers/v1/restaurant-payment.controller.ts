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
import { PaymentService } from '@features/payment/application';
import type { PaymentResponseDto } from '@features/payment/application';
import {
  CreatePaymentRequestDto,
  PaymentResponseSwaggerDto,
} from '@features/payment/presentation/dto';

@ApiTags('Restaurant Payments')
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
    // El servicio debe validar que el restaurante pertenece al usuario
    // y que el pago es para una suscripción válida
    return this.paymentService.createPayment(dto);
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
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<PaymentResponseDto[]> {
    // El servicio debe validar que el restaurante pertenece al usuario
    // y filtrar solo los pagos de suscripciones de ese restaurante
    // TODO: Implementar getPaymentsByRestaurant en el servicio
    return [] as PaymentResponseDto[];
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
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<PaymentResponseDto> {
    // El servicio debe validar que el pago pertenece a un restaurante del usuario
    return this.paymentService.getPaymentById({ paymentId });
  }
}
