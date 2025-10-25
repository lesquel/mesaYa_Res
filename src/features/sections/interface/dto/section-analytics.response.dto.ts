import { ApiProperty } from '@nestjs/swagger';
import type { SectionAnalyticsResponse } from '../../application/dto/analytics/section-analytics.response';

class SectionAnalyticsSummaryDto {
  @ApiProperty()
  totalSections!: number;

  @ApiProperty({ description: 'Promedio de ancho' })
  averageWidth!: number;

  @ApiProperty({ description: 'Promedio de alto' })
  averageHeight!: number;

  @ApiProperty({ description: 'Área promedio (ancho x alto)' })
  averageArea!: number;
}

class SectionAnalyticsAreaBucketDto {
  @ApiProperty({ description: 'Rango de área' })
  bucket!: string;

  @ApiProperty()
  count!: number;
}

class SectionAnalyticsDistributionItemDto {
  @ApiProperty({ description: 'Identificador del restaurante' })
  restaurantId!: string;

  @ApiProperty()
  count!: number;
}

class SectionAnalyticsDimensionExtremesDto {
  @ApiProperty()
  minWidth!: number;

  @ApiProperty()
  maxWidth!: number;

  @ApiProperty()
  minHeight!: number;

  @ApiProperty()
  maxHeight!: number;
}

export class SectionAnalyticsResponseDto {
  @ApiProperty({ type: SectionAnalyticsSummaryDto })
  summary!: SectionAnalyticsSummaryDto;

  @ApiProperty({ type: [SectionAnalyticsAreaBucketDto] })
  areaBuckets!: SectionAnalyticsAreaBucketDto[];

  @ApiProperty({ type: [SectionAnalyticsDistributionItemDto] })
  restaurantDistribution!: SectionAnalyticsDistributionItemDto[];

  @ApiProperty({ type: SectionAnalyticsDimensionExtremesDto })
  dimensionExtremes!: SectionAnalyticsDimensionExtremesDto;

  static fromApplication(
    response: SectionAnalyticsResponse,
  ): SectionAnalyticsResponseDto {
    const dto = new SectionAnalyticsResponseDto();
    dto.summary = {
      totalSections: response.summary.totalSections,
      averageWidth: response.summary.averageWidth,
      averageHeight: response.summary.averageHeight,
      averageArea: response.summary.averageArea,
    };
    dto.areaBuckets = response.areaBuckets.map((bucket) => ({
      bucket: bucket.bucket,
      count: bucket.count,
    }));
    dto.restaurantDistribution = response.restaurantDistribution.map(
      (item) => ({
        restaurantId: item.restaurantId,
        count: item.count,
      }),
    );
    dto.dimensionExtremes = {
      minWidth: response.dimensionExtremes.minWidth,
      maxWidth: response.dimensionExtremes.maxWidth,
      minHeight: response.dimensionExtremes.minHeight,
      maxHeight: response.dimensionExtremes.maxHeight,
    };
    return dto;
  }
}
