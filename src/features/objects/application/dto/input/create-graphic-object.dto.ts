import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateGraphicObjectDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  posX: number;

  @ApiProperty({ example: 20 })
  @IsInt()
  posY: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @IsPositive()
  width: number;

  @ApiProperty({ example: 80 })
  @IsInt()
  @IsPositive()
  height: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  imageId: string;
}

export type CreateGraphicObjectCommand = CreateGraphicObjectDto;
