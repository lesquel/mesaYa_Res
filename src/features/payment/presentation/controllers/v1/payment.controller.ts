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
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '@features/payment/application';
import type {
  CreatePaymentDto,
  PaymentResponseDto,
  PaymentListResponseDto,
  UpdatePaymentStatusDto,
  DeletePaymentResponseDto,
} from '@features/payment/application';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';

@ApiTags('Payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment' })
  async createPayment(
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payments' })
  @PaginatedEndpoint()
  async getPayments(
    @PaginationParams() params: PaginatedQueryParams,
  ): Promise<PaymentListResponseDto> {
    return this.paymentService.getAllPayments(params);
  }

  @Get(':paymentId')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  async getPaymentById(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentById({ paymentId });
  }

  @Patch(':paymentId/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  async updatePaymentStatus(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Body() dto: UpdatePaymentStatusDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.updatePaymentStatus({
      ...dto,
      paymentId,
    });
  }

  @Delete(':paymentId')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  async deletePayment(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ): Promise<DeletePaymentResponseDto> {
    return this.paymentService.deletePayment({ paymentId });
  }
}
