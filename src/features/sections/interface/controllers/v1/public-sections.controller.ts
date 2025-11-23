import { Controller, Get, Param } from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
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
@Controller({ path: 'public/sections', version: '1' })
export class PublicSectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar todas las secciones públicas (paginado)' })
  @ApiPaginationQuery()
  @ApiPaginatedResponse({
    model: SectionResponseSwaggerDto,
    description: 'Listado paginado de todas las secciones',
  })
  async findAll(
    @PaginationParams({ defaultRoute: '/public/sections' })
    query: ListSectionsQuery,
  ): Promise<PaginatedSectionResponse> {
    return this.sectionsService.list(query);
  }

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
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/public/sections/restaurant/:restaurantId' })
    query: ListRestaurantSectionsQuery,
  ): Promise<PaginatedSectionResponse> {
    return this.sectionsService.listByRestaurant({ ...query, restaurantId });
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
    @Param('id', UUIDPipe) id: string,
  ): Promise<SectionResponseDto> {
    const query: FindSectionQuery = { sectionId: id };
    return this.sectionsService.findOne(query);
  }
}
