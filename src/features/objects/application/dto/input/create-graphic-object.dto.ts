import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

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

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  imageId: string;
}

export type CreateGraphicObjectCommand = CreateGraphicObjectDto;
