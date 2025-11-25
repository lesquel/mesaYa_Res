import type { Buffer } from 'node:buffer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({ example: 'Banner' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Main banner for the landing section' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  entityId: string;
}

export interface ImageFilePayload {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export type CreateImageCommand = CreateImageDto & {
  file: ImageFilePayload;
};
