import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, IsNumber } from 'class-validator';

/**
 * Payment status received from n8n workflow
 * These map to PaymentStatusEnum but in lowercase from external systems
 */
export enum N8nPaymentStatus {
  APPROVED = 'approved',
  SUCCEEDED = 'succeeded',
  PROCESSING = 'processing',
  PENDING = 'pending',
  FAILED = 'failed',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
}

/**
 * DTO for n8n payment status update webhook
 * This is called by n8n workflow to update both payment and reservation status
 */
export class N8nPaymentStatusUpdateDto {
  @ApiProperty({
    description: 'Payment ID from the payment microservice',
    example: '9f88d44f-71f0-4bee-866e-436df2bfb877',
  })
  @IsUUID()
  payment_id: string;

  @ApiProperty({
    description: 'Reservation ID associated with this payment',
    example: '563a1d56-56b8-482c-b9b7-8383cf11e448',
  })
  @IsUUID()
  reservation_id: string;

  @ApiProperty({
    enum: N8nPaymentStatus,
    description: 'Payment status from external system (lowercase)',
    example: 'processing',
  })
  @IsEnum(N8nPaymentStatus)
  payment_status: N8nPaymentStatus;

  @ApiPropertyOptional({
    description: 'Payment amount',
    example: 25.0,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Transaction ID from the payment provider',
  })
  @IsOptional()
  @IsString()
  transaction_id?: string;
}

/**
 * Response DTO for n8n payment status update
 */
export class N8nPaymentStatusUpdateResponseDto {
  @ApiProperty({ description: 'Whether the update was successful' })
  success: boolean;

  @ApiProperty({ description: 'Updated payment ID' })
  payment_id: string;

  @ApiProperty({ description: 'Updated reservation ID' })
  reservation_id: string;

  @ApiProperty({ description: 'New payment status' })
  payment_status: string;

  @ApiProperty({ description: 'New reservation status' })
  reservation_status: string;

  @ApiPropertyOptional({ description: 'Message describing the action taken' })
  message?: string;
}
