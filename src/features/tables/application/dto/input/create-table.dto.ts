import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsUUID, Min } from 'class-validator';

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

  @ApiProperty({ description: 'Height (> 0)' })
  @IsInt()
  @Min(1)
  height: number;

  @ApiProperty({ example: 'abc123-uuid-image' })
  @IsString()
  tableImageId: string;

  @ApiProperty({ example: 'def456-uuid-image' })
  @IsString()
  chairImageId: string;
}

export type CreateTableCommand = CreateTableDto;
