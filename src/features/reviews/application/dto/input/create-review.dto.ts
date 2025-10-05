import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Restaurant identifier', format: 'uuid' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({
    description: 'Rating between 1 and 5',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Optional comment' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export type CreateReviewCommand = CreateReviewDto & {
  userId: string;
};
