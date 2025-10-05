import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'UUID del restaurante', format: 'uuid' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ description: 'Puntuación de 1 a 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Comentario', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
