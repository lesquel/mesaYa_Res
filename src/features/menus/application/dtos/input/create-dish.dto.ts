import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDishDto {
  @ApiProperty({ example: 'abc123-uuid-restaurant' })
  @IsString()
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageId?: string;
}
