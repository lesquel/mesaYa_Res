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

  @ApiPropertyOptional({
    description:
      "Acción de moderación por parte del admin: 'approve'|'reject'|'hide'",
    enum: ['approve', 'reject', 'hide'],
  })
  @IsOptional()
  @IsString()
  action?: 'approve' | 'reject' | 'hide';

  @ApiPropertyOptional({ description: 'Notas del moderador', nullable: true })
  @IsOptional()
  @IsString()
  moderationNotes?: string | null;
}

export type ModerateReviewCommand = ModerateReviewDto & {
  reviewId: string;
};
