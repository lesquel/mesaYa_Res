import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({ example: 'https://cdn.mesaya.com/assets/banner.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'Banner' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  title: string;

  @ApiProperty({ example: 'Main banner for the landing section' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  entityId: number;
}

export type CreateImageCommand = CreateImageDto;
