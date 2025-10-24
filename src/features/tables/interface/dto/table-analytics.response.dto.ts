import { ApiProperty } from '@nestjs/swagger';
import type { TableAnalyticsResponse } from '../../application/dto/analytics/table-analytics.response';

class TableAnalyticsSummaryDto {
  @ApiProperty()
  totalTables!: number;

  @ApiProperty({ description: 'Capacidad promedio' })
  averageCapacity!: number;

  @ApiProperty({ description: 'Capacidad mínima' })
  minCapacity!: number;

  @ApiProperty({ description: 'Capacidad máxima' })
  maxCapacity!: number;
}

class TableAnalyticsCapacityBucketDto {
  @ApiProperty({ description: 'Rango de capacidad' })
  bucket!: string;

  @ApiProperty()
  count!: number;
}

class TableAnalyticsDistributionItemDto {
  @ApiProperty({ description: 'Identificador del recurso' })
  id!: string;

  @ApiProperty()
  count!: number;
}

export class TableAnalyticsResponseDto {
  @ApiProperty({ type: TableAnalyticsSummaryDto })
  summary!: TableAnalyticsSummaryDto;

  @ApiProperty({ type: [TableAnalyticsCapacityBucketDto] })
  capacityBuckets!: TableAnalyticsCapacityBucketDto[];

  @ApiProperty({ type: [TableAnalyticsDistributionItemDto] })
  sectionDistribution!: TableAnalyticsDistributionItemDto[];

  @ApiProperty({ type: [TableAnalyticsDistributionItemDto] })
  restaurantDistribution!: TableAnalyticsDistributionItemDto[];

  static fromApplication(
    response: TableAnalyticsResponse,
  ): TableAnalyticsResponseDto {
    const dto = new TableAnalyticsResponseDto();
    dto.summary = {
      totalTables: response.summary.totalTables,
      averageCapacity: response.summary.averageCapacity,
      minCapacity: response.summary.minCapacity,
      maxCapacity: response.summary.maxCapacity,
    };
    dto.capacityBuckets = response.capacityBuckets.map((bucket) => ({
      bucket: bucket.bucket,
      count: bucket.count,
    }));
    dto.sectionDistribution = response.sectionDistribution.map((item) => ({
      id: item.id,
      count: item.count,
    }));
    dto.restaurantDistribution = response.restaurantDistribution.map(
      (item) => ({
        id: item.id,
        count: item.count,
      }),
    );
    return dto;
  }
}
