import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { ThrottleRead } from '@shared/infrastructure/decorators';
import {
  FindRestaurantQuery,
  RestaurantsService,
} from '@features/restaurants/application';
import type {
  ListRestaurantsQuery,
  RestaurantResponseDto,
  PaginatedRestaurantResponse,
} from '@features/restaurants/application';

@ApiTags('Restaurants - Public')
@Controller({ path: 'public/restaurant', version: '1' })
export class PublicRestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar restaurantes públicos (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/public/restaurant' })
    query: ListRestaurantsQuery,
  ): Promise<PaginatedRestaurantResponse> {
    return this.restaurantsService.list(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener un restaurante público por ID' })
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RestaurantResponseDto> {
    const query: FindRestaurantQuery = { restaurantId: id };
    return this.restaurantsService.findOne(query);
  }
}
