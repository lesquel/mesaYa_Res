/**
 * Partner Registration DTOs
 *
 * Data Transfer Objects for partner webhook registration API.
 */

import {
  IsString,
  IsUrl,
  IsArray,
  IsOptional,
  IsEmail,
  IsIn,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Using string literals to match domain PartnerStatus type
export const PARTNER_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const;
export type PartnerStatusDto = typeof PARTNER_STATUS_VALUES[number];

export class RegisterPartnerDto {
  @ApiProperty({
    description: 'Unique partner name/identifier',
    example: 'restaurant-pos-system',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Webhook URL to receive events',
    example: 'https://partner.example.com/webhooks/mesa-ya',
  })
  @IsUrl({ require_tld: false }) // Allow localhost for development
  webhookUrl: string;

  @ApiProperty({
    description: 'Events to subscribe to. Use "*" for all events.',
    example: ['reservation.created', 'reservation.updated', 'payment.completed'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  events: string[];

  @ApiPropertyOptional({
    description: 'Partner description',
    example: 'POS system integration for real-time reservation updates',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Contact email for webhook issues',
    example: 'tech@partner.example.com',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

export class UpdatePartnerDto {
  @ApiPropertyOptional({
    description: 'Updated partner name',
    example: 'restaurant-pos-system-v2',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated webhook URL',
    example: 'https://partner.example.com/v2/webhooks/mesa-ya',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  webhookUrl?: string;

  @ApiPropertyOptional({
    description: 'Updated event subscriptions',
    example: ['reservation.*', 'payment.*'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  events?: string[];

  @ApiPropertyOptional({
    description: 'Updated description',
    example: 'Updated POS integration',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated contact email',
    example: 'support@partner.example.com',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Partner status',
    enum: PARTNER_STATUS_VALUES,
  })
  @IsOptional()
  @IsIn(PARTNER_STATUS_VALUES)
  status?: PartnerStatusDto;
}

export class PartnerResponseDto {
  @ApiProperty({ description: 'Partner UUID' })
  id: string;

  @ApiProperty({ description: 'Partner name' })
  name: string;

  @ApiProperty({ description: 'Webhook URL' })
  webhookUrl: string;

  @ApiProperty({ description: 'Partner status', enum: PARTNER_STATUS_VALUES })
  status: PartnerStatusDto;

  @ApiProperty({ description: 'Subscribed events' })
  events: string[];

  @ApiPropertyOptional({ description: 'Partner description' })
  description?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PartnerRegisteredResponseDto extends PartnerResponseDto {
  @ApiProperty({
    description: 'HMAC secret for webhook signature verification. Store securely - shown only once!',
    example: 'whsec_abc123xyz789...',
  })
  secret: string;
}

export class RegenerateSecretResponseDto {
  @ApiProperty({ description: 'New HMAC secret. Store securely - shown only once!' })
  secret: string;

  @ApiProperty({ description: 'Partner details' })
  partner: PartnerResponseDto;
}

export class WebhookEventDto {
  @ApiProperty({
    description: 'Event type',
    example: 'reservation.created',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Event timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  timestamp: string;

  @ApiProperty({
    description: 'Event payload data',
    example: { reservationId: 'uuid', restaurantId: 'uuid', status: 'confirmed' },
  })
  data: Record<string, unknown>;
}

export class VerifyWebhookDto {
  @ApiProperty({
    description: 'Webhook signature header value',
    example: 't=1705312200,v1=abc123...',
  })
  @IsString()
  signature: string;

  @ApiProperty({
    description: 'Raw webhook payload',
  })
  @IsString()
  payload: string;
}
