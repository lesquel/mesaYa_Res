import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateTableDto {
  @ApiProperty({ description: 'Section identifier', format: 'uuid' })
  @IsUUID()
  sectionId: string;

  @ApiProperty({ description: 'Table number' })
  @IsInt()
  @IsPositive()
  number: number;

  @ApiProperty({ description: 'Capacity', minimum: 1 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ description: 'Position X (>= 0)' })
  @IsInt()
  @Min(0)
  posX: number;

  @ApiProperty({ description: 'Position Y (>= 0)' })
  @IsInt()
  @Min(0)
  posY: number;

  @ApiProperty({ description: 'Width (> 0)' })
  @IsInt()
  @Min(1)
  width: number;

  @ApiProperty({ description: 'Table image id (>= 0)' })
  @IsInt()
  @Min(0)
  tableImageId: number;

  @ApiProperty({ description: 'Chair image id (>= 0)' })
  @IsInt()
  @Min(0)
  chairImageId: number;
}

export type CreateTableCommand = CreateTableDto;
