import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
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
  ListNearbyRestaurantsQuery,
} from '@features/restaurants/application';
import { NearbyRestaurantsQueryDto } from '@features/restaurants/application';

@ApiTags('Restaurants - Public')
@Controller({ path: 'public/restaurants', version: '1' })
export class PublicRestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar restaurantes públicos (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/public/restaurants' })
    query: ListRestaurantsQuery,
  ): Promise<PaginatedRestaurantResponse> {
    return this.restaurantsService.list(query);
  }

  @Get('nearby')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar restaurantes cerca del usuario' })
  async findNearby(
    @Query(new ValidationPipe({ transform: true }))
    params: NearbyRestaurantsQueryDto,
  ): Promise<RestaurantResponseDto[]> {
    const query: ListNearbyRestaurantsQuery = {
      latitude: params.latitude,
      longitude: params.longitude,
      radiusKm: params.radiusKm,
      limit: params.limit,
    };
    return this.restaurantsService.listNearby(query);
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
