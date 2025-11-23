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
import type {
  MenuResponseDto,
  MenuListResponseDto,
} from '@features/menus/application';
import {
  MenuService,
  GetMenuAnalyticsUseCase,
} from '@features/menus/application';
import {
  MenuAnalyticsRequestDto,
  MenuAnalyticsResponseDto,
  MenuResponseSwaggerDto,
} from '@features/menus/presentation/dto';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';

@ApiTags('Menus - Public')
@Controller({ path: 'public/menus', version: '1' })
export class PublicMenusController {
  constructor(
    private readonly menuService: MenuService,
    private readonly getMenuAnalyticsUseCase: GetMenuAnalyticsUseCase,
  ) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar menús públicos (paginado)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: MenuResponseSwaggerDto,
    description: 'Listado paginado de menús públicos',
  })
  findAll(
    @PaginationParams({ defaultRoute: '/public/menus' })
    query: PaginatedQueryParams,
  ): Promise<MenuListResponseDto> {
    return this.menuService.findAll(query);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({
    summary: 'Listar menús públicos por restaurante (paginado)',
  })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: MenuResponseSwaggerDto,
    description: 'Listado paginado de menús de un restaurante',
  })
  findByRestaurant(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/public/menus/restaurant' })
    query: PaginatedQueryParams,
  ): Promise<MenuListResponseDto> {
    return this.menuService.findByRestaurant(restaurantId, {
      ...query,
      route: `/public/menus/restaurant/${restaurantId}`,
    });
  }

  @Get('analytics')
  @ThrottleSearch()
  @ApiOperation({ summary: 'Analytics públicas de menús' })
  @ApiOkResponse({
    description: 'Public menu analytics',
    type: MenuAnalyticsResponseDto,
  })
  async getAnalytics(
    @Query() dto: MenuAnalyticsRequestDto,
  ): Promise<MenuAnalyticsResponseDto> {
    const analytics = await this.getMenuAnalyticsUseCase.execute(dto.toQuery());
    return MenuAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':menuId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener detalles públicos de un menú' })
  @ApiParam({ name: 'menuId', description: 'UUID del menú' })
  @ApiOkResponse({
    description: 'Public menu details',
    type: MenuResponseSwaggerDto,
  })
  findById(
    @Param('menuId', UUIDPipe) menuId: string,
  ): Promise<MenuResponseDto> {
    return this.menuService.findById({ menuId });
  }
}
