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
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import {
  CreatePaymentRequestDto,
  DeletePaymentResponseSwaggerDto,
  PaymentResponseSwaggerDto,
  UpdatePaymentStatusRequestDto,
  PaymentAnalyticsRequestDto,
  PaymentAnalyticsResponseDto,
} from '@features/payment/presentation/dto';

@ApiTags('Payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly getPaymentAnalyticsUseCase: GetPaymentAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('payment:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment' })
  @ApiBody({ type: CreatePaymentRequestDto })
  @ApiCreatedResponse({
    description: 'Payment successfully created',
    type: PaymentResponseSwaggerDto,
  })
  async createPayment(
    @Body() dto: CreatePaymentRequestDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(dto);
  }

  @Get()
  @ThrottleRead()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('payment:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List payments' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: PaymentResponseSwaggerDto,
    description: 'Paginated collection of payments',
  })
  async getPayments(
    @PaginationParams() params: PaginatedQueryParams,
  ): Promise<PaymentListResponseDto> {
    return this.paymentService.getAllPayments(params);
  }

  @Get('analytics')
  @ThrottleSearch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('payment:read')
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('payment:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Payment details',
    type: PaymentResponseSwaggerDto,
  })
  async getPaymentById(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentById({ paymentId });
  }

  @Patch(':paymentId/status')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('payment:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment status' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdatePaymentStatusRequestDto })
  @ApiOkResponse({
    description: 'Payment status updated',
    type: PaymentResponseSwaggerDto,
  })
  async updatePaymentStatus(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Body() dto: UpdatePaymentStatusRequestDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.updatePaymentStatus({
      ...dto,
      paymentId,
    });
  }

  @Delete(':paymentId')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('payment:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete payment' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Payment removed',
    type: DeletePaymentResponseSwaggerDto,
  })
  async deletePayment(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ): Promise<DeletePaymentResponseDto> {
    return this.paymentService.deletePayment({ paymentId });
  }
}
