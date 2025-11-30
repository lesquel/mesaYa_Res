import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for temporarily selecting a table during the reservation process.
 * This creates a temporary "hold" on the table to prevent race conditions.
 */
export class SelectTableDto {
  @ApiProperty({ description: 'Restaurant identifier', format: 'uuid' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ description: 'Section identifier', format: 'uuid' })
  @IsUUID()
  sectionId: string;

  @ApiProperty({
    description: 'Optional session identifier for multi-tab coordination',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sessionId?: string;
}

export type SelectTableCommand = SelectTableDto & {
  tableId: string;
  userId: string;
};

/**
 * DTO for releasing a temporarily selected table.
 */
export class ReleaseTableDto {
  @ApiProperty({ description: 'Restaurant identifier', format: 'uuid' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ description: 'Section identifier', format: 'uuid' })
  @IsUUID()
  sectionId: string;
}

export type ReleaseTableCommand = ReleaseTableDto & {
  tableId: string;
  userId: string;
};

/**
 * Result DTO for table selection operations.
 */
export class TableSelectionResultDto {
  @ApiProperty({ description: 'Whether the operation was successful' })
  success: boolean;

  @ApiProperty({ description: 'Table identifier', format: 'uuid' })
  tableId: string;

  @ApiProperty({ description: 'User who selected the table', format: 'uuid', required: false })
  selectedBy?: string;

  @ApiProperty({ description: 'When the selection expires', required: false })
  expiresAt?: Date;

  @ApiProperty({ description: 'Optional message', required: false })
  message?: string;
}
