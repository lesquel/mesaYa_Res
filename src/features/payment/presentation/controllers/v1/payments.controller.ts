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
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  PaymentService,
  GetPaymentAnalyticsUseCase,
} from '@features/payment/application';
import type {
  PaymentResponseDto,
  PaymentListResponseDto,
  DeletePaymentResponseDto,
} from '@features/payment/application';
import type { PaginatedQueryParams } from '@shared/application/types';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import {
  DeletePaymentResponseSwaggerDto,
  PaymentResponseSwaggerDto,
  UpdatePaymentStatusRequestDto,
  PaymentAnalyticsRequestDto,
  PaymentAnalyticsResponseDto,
  CreatePaymentRequestDto,
} from '@features/payment/presentation/dto';
import {
  PaymentStatusEnum,
  PaymentTypeEnum,
} from '@features/payment/domain';

@ApiTags('Payments')
@Controller({ path: 'payments', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly getPaymentAnalyticsUseCase: GetPaymentAnalyticsUseCase,
  ) {}

  // --- Admin Endpoints ---

  @Get()
  @ThrottleRead()
  @Permissions('payment:read')
  @ApiOperation({ summary: 'List payments (Admin)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: PaymentResponseSwaggerDto,
    description: 'Paginated collection of payments',
  })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatusEnum })
  @ApiQuery({ name: 'type', required: false, enum: PaymentTypeEnum })
  @ApiQuery({
    name: 'reservationId',
    required: false,
    type: String,
    description: 'Filter by reservation identifier',
  })
  @ApiQuery({
    name: 'restaurantId',
    required: false,
    type: String,
    description: 'Filter by restaurant identifier',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'ISO date or datetime (inclusive start)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'ISO date or datetime (inclusive end)',
  })
  @ApiQuery({
    name: 'minAmount',
    required: false,
    type: Number,
    description: 'Minimum payment amount',
  })
  @ApiQuery({
    name: 'maxAmount',
    required: false,
    type: Number,
    description: 'Maximum payment amount',
  })
  async getPayments(
    @PaginationParams({ allowExtraParams: true })
    params: PaginatedQueryParams,
  ): Promise<PaymentListResponseDto> {
    return this.paymentService.getAllPayments(params);
  }

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('payment:read')
  @ApiOperation({ summary: 'Payment analytics overview' })
  @ApiOkResponse({
    description: 'Dashboard analytics for payments',
    type: PaymentAnalyticsResponseDto,
  })
  async getAnalytics(
    @Query() query: PaymentAnalyticsRequestDto,
  ): Promise<PaymentAnalyticsResponseDto> {
    const analytics = await this.getPaymentAnalyticsUseCase.execute(
      query.toQuery(),
    );
    return PaymentAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':paymentId')
  @ThrottleRead()
  @Permissions('payment:read')
  @ApiOperation({ summary: 'Get payment by ID (Admin)' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Payment details',
    type: PaymentResponseSwaggerDto,
  })
  async getPaymentById(
    @Param('paymentId', UUIDPipe) paymentId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentById({ paymentId });
  }

  @Patch(':paymentId/status')
  @ThrottleModify()
  @Permissions('payment:update')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdatePaymentStatusRequestDto })
  @ApiOkResponse({
    description: 'Payment status updated',
    type: PaymentResponseSwaggerDto,
  })
  async updatePaymentStatus(
    @Param('paymentId', UUIDPipe) paymentId: string,
    @Body() dto: UpdatePaymentStatusRequestDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.updatePaymentStatus({
      paymentId,
      status: dto.status,
    });
  }

  @Delete(':paymentId')
  @ThrottleModify()
  @Permissions('payment:delete')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Payment deleted',
    type: DeletePaymentResponseSwaggerDto,
  })
  async deletePayment(
    @Param('paymentId', UUIDPipe) paymentId: string,
  ): Promise<DeletePaymentResponseDto> {
    return this.paymentService.deletePayment({ paymentId });
  }

  // --- User Endpoints ---

  @Post('user')
  @ThrottleCreate()
  @ApiOperation({ summary: 'Create a payment for reservation (user)' })
  @ApiBody({ type: CreatePaymentRequestDto })
  @ApiCreatedResponse({
    description: 'Payment successfully created',
    type: PaymentResponseSwaggerDto,
  })
  async createPayment(
    @Body() dto: CreatePaymentRequestDto,
    @CurrentUser() user: { userId: string },
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createReservationPaymentForUser(
      dto,
      user.userId,
    );
  }

  @Get('user/:paymentId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Get my payment by ID (user)' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Payment details',
    type: PaymentResponseSwaggerDto,
  })
  async getUserPaymentById(
    @Param('paymentId', UUIDPipe) paymentId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getUserPaymentById(paymentId, user.userId);
  }

  // --- Restaurant Endpoints ---

  @Post('restaurant')
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

  @Get('restaurant/by-restaurant/:restaurantId')
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

  @Get('restaurant/:paymentId')
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
  async getRestaurantPaymentById(
    @Param('paymentId', UUIDPipe) paymentId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getOwnerPaymentById(paymentId, user.userId);
  }
}
