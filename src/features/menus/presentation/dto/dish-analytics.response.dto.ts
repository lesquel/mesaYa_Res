import { ApiProperty } from '@nestjs/swagger';
import type { DishAnalyticsResponse } from '../../application/dtos/analytics/dish-analytics.response';

class DishAnalyticsSummaryDto {
  @ApiProperty({ description: 'Total de platos' })
  totalDishes!: number;

  @ApiProperty({ description: 'Precio promedio' })
  averagePrice!: number;

  @ApiProperty({ description: 'Precio mínimo' })
  minPrice!: number;

  @ApiProperty({ description: 'Precio máximo' })
  maxPrice!: number;

  @ApiProperty({ description: 'Cantidad de menús con platos asociados' })
  menusWithDishes!: number;
}

class DishAnalyticsPriceBucketDto {
  @ApiProperty({ description: 'Rango de precio' })
  bucket!: string;

  @ApiProperty({ description: 'Cantidad de platos en el rango' })
  count!: number;
}

class DishAnalyticsRestaurantDistributionDto {
  @ApiProperty({ description: 'Identificador del restaurante' })
  restaurantId!: number;

  @ApiProperty({ description: 'Cantidad de platos' })
  count!: number;
}

class DishAnalyticsTopDishDto {
  @ApiProperty({ description: 'Identificador del plato' })
  id!: string;

  @ApiProperty({ description: 'Nombre del plato' })
  name!: string;

  @ApiProperty({ description: 'Precio del plato' })
  price!: number;

  @ApiProperty({ description: 'Identificador del restaurante' })
  restaurantId!: number;
}

class DishAnalyticsTrendPointDto {
  @ApiProperty({ description: 'Fecha (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ description: 'Platos creados en la fecha' })
  count!: number;

  @ApiProperty({ description: 'Precio promedio en la fecha' })
  averagePrice!: number;
}

export class DishAnalyticsResponseDto {
  @ApiProperty({ type: DishAnalyticsSummaryDto })
  summary!: DishAnalyticsSummaryDto;

  @ApiProperty({ type: [DishAnalyticsPriceBucketDto] })
  priceDistribution!: DishAnalyticsPriceBucketDto[];

  @ApiProperty({ type: [DishAnalyticsRestaurantDistributionDto] })
  restaurantDistribution!: DishAnalyticsRestaurantDistributionDto[];

  @ApiProperty({ type: [DishAnalyticsTopDishDto] })
  topDishes!: DishAnalyticsTopDishDto[];

  @ApiProperty({ type: [DishAnalyticsTrendPointDto] })
  creationTrend!: DishAnalyticsTrendPointDto[];

  static fromApplication(
    response: DishAnalyticsResponse,
  ): DishAnalyticsResponseDto {
    const dto = new DishAnalyticsResponseDto();
    dto.summary = {
      totalDishes: response.summary.totalDishes,
      averagePrice: response.summary.averagePrice,
      minPrice: response.summary.minPrice,
      maxPrice: response.summary.maxPrice,
      menusWithDishes: response.summary.menusWithDishes,
    };
    dto.priceDistribution = response.priceDistribution.map((bucket) => ({
      bucket: bucket.bucket,
      count: bucket.count,
    }));
    dto.restaurantDistribution = response.restaurantDistribution.map(
      (item) => ({
        restaurantId: item.restaurantId,
        count: item.count,
      }),
    );
    dto.topDishes = response.topDishes.map((dish) => ({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      restaurantId: dish.restaurantId,
    }));
    dto.creationTrend = response.creationTrend.map((point) => ({
      date: point.date,
      count: point.count,
      averagePrice: point.averagePrice,
    }));
    return dto;
  }
}
