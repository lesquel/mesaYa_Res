import { Controller, Get, Param, Query } from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import type {
  DishResponseDto,
  DishListResponseDto,
} from '@features/menus/application/dtos/output';
import {
  DishService,
  GetDishAnalyticsUseCase,
} from '@features/menus/application';
import type { ListDishesQuery } from '@features/menus/application/dtos/input';
import {
  DishAnalyticsRequestDto,
  DishAnalyticsResponseDto,
  DishResponseSwaggerDto,
} from '@features/menus/presentation/dto';

@ApiTags('Dishes - Public')
@Controller({ path: 'public/dishes', version: '1' })
export class PublicDishesController {
  constructor(
    private readonly dishService: DishService,
    private readonly getDishAnalytics: GetDishAnalyticsUseCase,
  ) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar platos públicos (paginado)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: DishResponseSwaggerDto,
    description: 'Listado paginado de platos públicos',
  })
  findAll(
    @PaginationParams({ defaultRoute: '/public/dishes' })
    query: ListDishesQuery,
  ): Promise<DishListResponseDto> {
    return this.dishService.findAll(query);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({
    summary: 'Listar platos públicos de un restaurante (paginado)',
  })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: DishResponseSwaggerDto,
    description: 'Listado paginado de platos para un restaurante',
  })
  findByRestaurant(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/public/dishes/restaurant' })
    query: ListDishesQuery,
  ): Promise<DishListResponseDto> {
    return this.dishService.findByRestaurant(restaurantId, {
      ...query,
      route: `/public/dishes/restaurant/${restaurantId}`,
    });
  }

  @Get('analytics')
  @ThrottleSearch()
  @ApiOkResponse({
    description: 'Public dish analytics',
    type: DishAnalyticsResponseDto,
  })
  async analytics(
    @Query() query: DishAnalyticsRequestDto,
  ): Promise<DishAnalyticsResponseDto> {
    const analytics = await this.getDishAnalytics.execute(query.toQuery());
    return DishAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':dishId')
  @ThrottleRead()
  @ApiOkResponse({
    description: 'Public dish details',
    type: DishResponseSwaggerDto,
  })
  findById(@Param('dishId') dishId: string): Promise<DishResponseDto> {
    return this.dishService.findById({ dishId });
  }
}
