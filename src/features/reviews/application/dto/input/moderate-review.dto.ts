import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ModerateReviewDto {
  @ApiPropertyOptional({ description: 'Nuevo rating (1-5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Comentario moderado', nullable: true })
  @IsOptional()
  @IsString()
  comment?: string | null;

  @ApiPropertyOptional({
    description: 'Ocultar el comentario (lo establece como null)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hideComment?: boolean;
}

export type ModerateReviewCommand = ModerateReviewDto & {
  reviewId: string;
};
