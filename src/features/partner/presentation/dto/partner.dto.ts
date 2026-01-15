/**
 * Partner DTOs
 *
 * Data Transfer Objects for Partner API endpoints.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUrl,
  IsArray,
  IsEnum,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import type { PartnerEventType } from '../../domain/entities/partner.entity';

const PARTNER_EVENT_TYPES = [
  'reservation.created',
  'reservation.confirmed',
  'reservation.cancelled',
  'reservation.completed',
  'payment.succeeded',
  'payment.failed',
  'payment.refunded',
] as const;

export class RegisterPartnerDto {
  @ApiProperty({
    description: 'Unique name identifying the partner organization',
    example: 'Galapagos Tours Inc',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'HTTPS URL where webhooks will be sent',
    example: 'https://api.partner.com/webhooks/mesaya',
  })
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  webhookUrl!: string;

  @ApiProperty({
    description: 'List of event types to subscribe to',
    example: ['reservation.confirmed', 'payment.succeeded'],
    enum: PARTNER_EVENT_TYPES,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(PARTNER_EVENT_TYPES, { each: true })
  subscribedEvents!: PartnerEventType[];

  @ApiPropertyOptional({
    description: 'Optional description of the partner',
    example: 'Tour operator offering complementary services to our guests',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Contact email for webhook issues',
    example: 'tech@partner.com',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

export class UpdatePartnerDto {
  @ApiPropertyOptional({
    description: 'New webhook URL',
    example: 'https://api.partner.com/webhooks/v2/mesaya',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  webhookUrl?: string;

  @ApiPropertyOptional({
    description: 'Updated list of subscribed events',
    enum: PARTNER_EVENT_TYPES,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PARTNER_EVENT_TYPES, { each: true })
  subscribedEvents?: PartnerEventType[];

  @ApiPropertyOptional({
    description: 'Updated description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated contact email',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

export class PartnerResponseDto {
  @ApiProperty({ description: 'Partner unique ID' })
  id!: string;

  @ApiProperty({ description: 'Partner name' })
  name!: string;

  @ApiProperty({ description: 'Webhook URL' })
  webhookUrl!: string;

  @ApiProperty({ description: 'Subscribed events', isArray: true })
  subscribedEvents!: string[];

  @ApiProperty({ description: 'Partner status', enum: ['active', 'inactive', 'suspended'] })
  status!: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  contactEmail?: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: string;

  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt!: string;

  @ApiPropertyOptional({ description: 'Last successful webhook timestamp' })
  lastWebhookAt?: string;

  @ApiProperty({ description: 'Consecutive failed webhook count' })
  failedWebhookCount!: number;
}

export class PartnerRegistrationResponseDto extends PartnerResponseDto {
  @ApiProperty({
    description: 'HMAC secret for signing webhooks. SAVE THIS - it will only be shown once!',
    example: 'a1b2c3d4e5f6...',
  })
  secret!: string;
}

export class SendTestWebhookDto {
  @ApiProperty({
    description: 'Event type to test',
    enum: PARTNER_EVENT_TYPES,
    example: 'reservation.confirmed',
  })
  @IsEnum(PARTNER_EVENT_TYPES)
  eventType!: PartnerEventType;
}
