import { ApiProperty } from '@nestjs/swagger';
import type { ReviewAnalyticsResponse } from '../../application/dto/analytics/review-analytics.response';

class ReviewAnalyticsSummaryDto {
  @ApiProperty({ description: 'Total de reseñas' })
  totalReviews!: number;

  @ApiProperty({ description: 'Calificación promedio' })
  averageRating!: number;

  @ApiProperty({ description: 'Reseñas positivas (>= 4)' })
  positiveReviews!: number;

  @ApiProperty({ description: 'Reseñas neutrales (= 3)' })
  neutralReviews!: number;

  @ApiProperty({ description: 'Reseñas negativas (<= 2)' })
  negativeReviews!: number;
}

class ReviewAnalyticsDistributionItemDto {
  @ApiProperty({ description: 'Identificador del grupo' })
  key!: string;

  @ApiProperty({ description: 'Cantidad de elementos' })
  count!: number;
}

class ReviewAnalyticsTrendPointDto {
  @ApiProperty({ description: 'Fecha (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ description: 'Cantidad de reseñas' })
  count!: number;

  @ApiProperty({ description: 'Calificación promedio del día' })
  averageRating!: number;
}

export class ReviewAnalyticsResponseDto {
  @ApiProperty({ type: ReviewAnalyticsSummaryDto })
  summary!: ReviewAnalyticsSummaryDto;

  @ApiProperty({ type: [ReviewAnalyticsDistributionItemDto] })
  ratingDistribution!: ReviewAnalyticsDistributionItemDto[];

  @ApiProperty({ type: [ReviewAnalyticsDistributionItemDto] })
  restaurantDistribution!: ReviewAnalyticsDistributionItemDto[];

  @ApiProperty({ type: [ReviewAnalyticsTrendPointDto] })
  trend!: ReviewAnalyticsTrendPointDto[];

  static fromApplication(
    response: ReviewAnalyticsResponse,
  ): ReviewAnalyticsResponseDto {
    const dto = new ReviewAnalyticsResponseDto();
    dto.summary = {
      totalReviews: response.summary.totalReviews,
      averageRating: response.summary.averageRating,
      positiveReviews: response.summary.positiveReviews,
      neutralReviews: response.summary.neutralReviews,
      negativeReviews: response.summary.negativeReviews,
    };
    dto.ratingDistribution = response.ratingDistribution.map((item) => ({
      key: item.key,
      count: item.count,
    }));
    dto.restaurantDistribution = response.restaurantDistribution.map(
      (item) => ({
        key: item.key,
        count: item.count,
      }),
    );
    dto.trend = response.trend.map((point) => ({
      date: point.date,
      count: point.count,
      averageRating: point.averageRating,
    }));
    return dto;
  }
}
