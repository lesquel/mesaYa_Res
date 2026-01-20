/**
 * Payments User Controller
 *
 * Endpoints for authenticated users to manage their own payments.
 */

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
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import { ThrottleCreate, ThrottleRead } from '@shared/infrastructure/decorators';
import { PaymentService } from '@features/payment/application';
import type { PaymentResponseDto } from '@features/payment/application';
import {
  CreatePaymentRequestDto,
  PaymentResponseSwaggerDto,
} from '@features/payment/presentation/dto';

@ApiTags('Payments - User')
@Controller({ path: 'payments', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PaymentsUserController {
  constructor(private readonly paymentService: PaymentService) {}

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
}
