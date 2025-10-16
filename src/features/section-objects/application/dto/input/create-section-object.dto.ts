import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateSectionObjectDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  sectionId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  objectId: string;
}

export type CreateSectionObjectCommand = CreateSectionObjectDto;
