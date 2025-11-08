import { ApiProperty } from '@nestjs/swagger';
import type { RestaurantAnalyticsResponse } from '../../application/dto/analytics/restaurant-analytics.response.js';

class RestaurantAnalyticsSummaryDto {
  @ApiProperty()
  totalRestaurants!: number;

  @ApiProperty()
  activeRestaurants!: number;

  @ApiProperty()
  inactiveRestaurants!: number;

  @ApiProperty({ description: 'Capacidad promedio de los restaurantes' })
  averageCapacity!: number;
}

class RestaurantAnalyticsCapacityBucketDto {
  @ApiProperty({ description: 'Rango de capacidad' })
  bucket!: string;

  @ApiProperty()
  count!: number;
}

class RestaurantAnalyticsDistributionItemDto {
  @ApiProperty({ description: 'Clave del agrupamiento' })
  key!: string | number | null;

  @ApiProperty()
  count!: number;
}

class RestaurantAnalyticsTrendPointDto {
  @ApiProperty({ description: 'Fecha en formato YYYY-MM-DD' })
  date!: string;

  @ApiProperty()
  count!: number;
}

export class RestaurantAnalyticsResponseDto {
  @ApiProperty({ type: RestaurantAnalyticsSummaryDto })
  summary!: RestaurantAnalyticsSummaryDto;

  @ApiProperty({ type: [RestaurantAnalyticsCapacityBucketDto] })
  capacityBuckets!: RestaurantAnalyticsCapacityBucketDto[];

  @ApiProperty({ type: [RestaurantAnalyticsDistributionItemDto] })
  locationDistribution!: RestaurantAnalyticsDistributionItemDto[];

  @ApiProperty({ type: [RestaurantAnalyticsDistributionItemDto] })
  ownerDistribution!: RestaurantAnalyticsDistributionItemDto[];

  @ApiProperty({ type: [RestaurantAnalyticsDistributionItemDto] })
  subscriptionDistribution!: RestaurantAnalyticsDistributionItemDto[];

  @ApiProperty({ type: [RestaurantAnalyticsTrendPointDto] })
  creationTrend!: RestaurantAnalyticsTrendPointDto[];

  static fromApplication(
    response: RestaurantAnalyticsResponse,
  ): RestaurantAnalyticsResponseDto {
    const dto = new RestaurantAnalyticsResponseDto();
    dto.summary = {
      totalRestaurants: response.summary.totalRestaurants,
      activeRestaurants: response.summary.activeRestaurants,
      inactiveRestaurants: response.summary.inactiveRestaurants,
      averageCapacity: response.summary.averageCapacity,
    };
    dto.capacityBuckets = response.capacityBuckets.map((bucket) => ({
      bucket: bucket.bucket,
      count: bucket.count,
    }));
    dto.locationDistribution = response.locationDistribution.map((item) => ({
      key: item.key,
      count: item.count,
    }));
    dto.ownerDistribution = response.ownerDistribution.map((item) => ({
      key: item.key,
      count: item.count,
    }));
    dto.subscriptionDistribution = response.subscriptionDistribution.map(
      (item) => ({
        key: item.key,
        count: item.count,
      }),
    );
    dto.creationTrend = response.creationTrend.map((point) => ({
      date: point.date,
      count: point.count,
    }));
    return dto;
  }
}
