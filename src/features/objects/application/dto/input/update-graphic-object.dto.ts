import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

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

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  imageId?: number;
}

export type UpdateGraphicObjectCommand = UpdateGraphicObjectDto & { objectId: string };
