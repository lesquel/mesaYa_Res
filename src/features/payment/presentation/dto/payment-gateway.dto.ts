/**
 * Payment Gateway DTOs
 *
 * DTOs for the API Gateway endpoints that proxy to the Payment Microservice.
 */

import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a reservation payment through the gateway.
 */
export class CreateReservationPaymentDto {
  @ApiProperty({
    description: 'Reservation ID to pay for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  reservationId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 25.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  @IsIn(['USD', 'EUR', 'MXN', 'COP'])
  currency?: string = 'USD';

  @ApiPropertyOptional({
    description: 'Payment description',
    example: 'Deposit for table reservation',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

/**
 * Response DTO for created payment.
 */
export class PaymentCreatedResponseDto {
  @ApiProperty({ example: 'pay_abc123' })
  paymentId: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ example: 25.0 })
  amount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: 'https://checkout.stripe.com/...' })
  checkoutUrl: string;

  @ApiProperty({ example: '2026-01-19T10:30:00Z' })
  createdAt: string;
}

/**
 * Response DTO for payment details.
 */
export class PaymentDetailsResponseDto {
  @ApiProperty({ example: 'pay_abc123' })
  id: string;

  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiProperty({ example: 25.0 })
  amount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiPropertyOptional({ example: 'Deposit for table reservation' })
  description?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, string>;

  @ApiProperty({ example: '2026-01-19T10:30:00Z' })
  createdAt: string;
}

/**
 * Response DTO for payment verification.
 */
export class PaymentVerificationResponseDto {
  @ApiProperty({ example: 'pay_abc123' })
  paymentId: string;

  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiProperty({ example: true })
  verified: boolean;

  @ApiPropertyOptional({ example: 25.0 })
  amount?: number;

  @ApiPropertyOptional({ example: 'USD' })
  currency?: string;
}

/**
 * DTO for cancelling a payment.
 */
export class CancelPaymentDto {
  @ApiPropertyOptional({
    description: 'Reason for cancellation',
    example: 'Customer requested cancellation',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
