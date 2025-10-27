import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { ThrottleRead } from '@shared/infrastructure/decorators';
import { SectionsService } from '../../../application';
import type {
  FindSectionQuery,
  ListRestaurantSectionsQuery,
  ListSectionsQuery,
  PaginatedSectionResponse,
  SectionResponseDto,
} from '../../../application';
import { SectionResponseSwaggerDto } from '@features/sections/interface/dto';

@ApiTags('Sections - Public')
@Controller({ path: 'public/section', version: '1' })
export class PublicSectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar secciones públicas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiPaginationQuery()
  @ApiPaginatedResponse({
    model: SectionResponseSwaggerDto,
    description: 'Listado paginado de secciones por restaurante',
  })
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/public/section/restaurant' })
    pagination: ListSectionsQuery,
  ): Promise<PaginatedSectionResponse> {
    const query: ListRestaurantSectionsQuery = {
      ...pagination,
      restaurantId,
    };
    return this.sectionsService.listByRestaurant(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener sección pública por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiOkResponse({
    description: 'Sección encontrada',
    type: SectionResponseSwaggerDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SectionResponseDto> {
    const query: FindSectionQuery = { sectionId: id };
    return this.sectionsService.findOne(query);
  }
}
