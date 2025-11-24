import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ReassignRestaurantOwnerRequestDto {
  @ApiProperty({ example: '5e2f7c1a-0d83-4fe1-bbe6-01baf2ea9871' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  ownerId!: string;
}
