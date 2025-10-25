import { ApiProperty } from '@nestjs/swagger';
import type { MenuAnalyticsResponse } from '../../application/dtos/analytics/menu-analytics.response';

class MenuAnalyticsSummaryDto {
  @ApiProperty()
  totalMenus!: number;

  @ApiProperty()
  restaurantsWithMenus!: number;

  @ApiProperty()
  averagePrice!: number;

  @ApiProperty()
  minPrice!: number;

  @ApiProperty()
  maxPrice!: number;
}

class MenuAnalyticsTrendPointDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  count!: number;
}

class MenuAnalyticsMenusDto {
  @ApiProperty()
  total!: number;

  @ApiProperty({ type: () => [MenuAnalyticsTrendPointDto] })
  byDate!: MenuAnalyticsTrendPointDto[];
}

class MenuAnalyticsRestaurantItemDto {
  @ApiProperty()
  restaurantId!: number;

  @ApiProperty()
  count!: number;
}

class MenuAnalyticsPriceRangeItemDto {
  @ApiProperty()
  label!: string;

  @ApiProperty()
  count!: number;
}

export class MenuAnalyticsResponseDto {
  @ApiProperty({ type: MenuAnalyticsSummaryDto })
  summary!: MenuAnalyticsSummaryDto;

  @ApiProperty({ type: MenuAnalyticsMenusDto })
  menus!: MenuAnalyticsMenusDto;

  @ApiProperty({ type: () => [MenuAnalyticsRestaurantItemDto] })
  restaurants!: MenuAnalyticsRestaurantItemDto[];

  @ApiProperty({ type: () => [MenuAnalyticsPriceRangeItemDto] })
  priceRanges!: MenuAnalyticsPriceRangeItemDto[];

  static fromApplication(
    response: MenuAnalyticsResponse,
  ): MenuAnalyticsResponseDto {
    const dto = new MenuAnalyticsResponseDto();
    dto.summary = {
      totalMenus: response.summary.totalMenus,
      restaurantsWithMenus: response.summary.restaurantsWithMenus,
      averagePrice: response.summary.averagePrice,
      minPrice: response.summary.minPrice,
      maxPrice: response.summary.maxPrice,
    };
    dto.menus = {
      total: response.menus.total,
      byDate: response.menus.byDate.map((point) => ({
        date: point.date,
        count: point.count,
      })),
    };
    dto.restaurants = response.restaurants.map((item) => ({
      restaurantId: item.restaurantId,
      count: item.count,
    }));
    dto.priceRanges = response.priceRanges.map((item) => ({
      label: item.label,
      count: item.count,
    }));
    return dto;
  }
}
