import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateGraphicObjectDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  posX?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  posY?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  width?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  height?: number;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  imageId?: string;
}

export type UpdateGraphicObjectCommand = UpdateGraphicObjectDto & {
  objectId: string;
};
