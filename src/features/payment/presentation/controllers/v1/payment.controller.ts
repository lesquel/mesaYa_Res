import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentService } from '@features/payment/application';
import type {
  PaymentResponseDto,
  PaymentListResponseDto,
  DeletePaymentResponseDto,
} from '@features/payment/application';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator.js';
import {
  CreatePaymentRequestDto,
  DeletePaymentResponseSwaggerDto,
  PaymentResponseSwaggerDto,
  UpdatePaymentStatusRequestDto,
} from '@features/payment/presentation/dto/index.js';

@ApiTags('Payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
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

  @Get(':paymentId')
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
