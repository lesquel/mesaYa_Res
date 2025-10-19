import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
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
import {
  PaymentCreationFailedError,
  PaymentDeletionFailedError,
  PaymentNotFoundError,
  PaymentUpdateFailedError,
} from '@features/payment/domain';
import { PaymentMustBeAssociatedError } from '@features/payment/domain/errors/payment-must-be-associated.error';
import { NotFoundException } from '@nestjs/common';
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
    try {
      return await this.paymentService.createPayment(dto);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List payments' })
  @PaginatedEndpoint()
  async getPayments(
    @PaginationParams() params: PaginatedQueryParams,
  ): Promise<PaymentListResponseDto> {
    try {
      return await this.paymentService.getAllPayments(params);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':paymentId')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  async getPaymentById(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ): Promise<PaymentResponseDto> {
    try {
      return await this.paymentService.getPaymentById({ paymentId });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':paymentId/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  async updatePaymentStatus(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Body() dto: UpdatePaymentStatusDto,
  ): Promise<PaymentResponseDto> {
    try {
      return await this.paymentService.updatePaymentStatus({
        ...dto,
        paymentId,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':paymentId')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  async deletePayment(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ): Promise<DeletePaymentResponseDto> {
    try {
      return await this.paymentService.deletePayment({ paymentId });
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof PaymentNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof PaymentMustBeAssociatedError) {
      throw new BadRequestException(error.message);
    }
    if (
      error instanceof PaymentCreationFailedError ||
      error instanceof PaymentUpdateFailedError ||
      error instanceof PaymentDeletionFailedError
    ) {
      throw new InternalServerErrorException(error.message);
    }

    throw error as Error;
  }
}
