import { Controller, Get, Param } from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import {
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { ThrottleRead } from '@shared/infrastructure/decorators';
import type {
  FindTableQuery,
  ListSectionTablesQuery,
  ListTablesQuery,
  TableResponseDto,
  PaginatedTableResponse,
} from '@features/tables/application/dto';
import { TablesService } from '@features/tables/application/services';
import { TableResponseSwaggerDto } from '../../dto';

@ApiTags('Tables - Public')
@Controller({ path: 'public/tables', version: '1' })
export class PublicTablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar mesas públicas (paginado)' })
  @ApiPaginatedResponse({
    model: TableResponseSwaggerDto,
    description: 'Listado paginado de mesas públicas',
  })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/public/tables' })
    query: ListTablesQuery,
  ): Promise<PaginatedTableResponse> {
    return this.tablesService.list(query);
  }

  @Get('section/:sectionId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar mesas públicas por sección' })
  @ApiParam({ name: 'sectionId', description: 'UUID de la sección' })
  @ApiPaginatedResponse({
    model: TableResponseSwaggerDto,
    description: 'Listado paginado de mesas de una sección',
  })
  @ApiPaginationQuery()
  async findBySection(
    @Param('sectionId', UUIDPipe) sectionId: string,
    @PaginationParams({ defaultRoute: '/public/tables/section/:sectionId' })
    pagination: ListSectionTablesQuery,
  ): Promise<PaginatedTableResponse> {
    const query: ListSectionTablesQuery = {
      ...pagination,
      sectionId,
    };
    return this.tablesService.listSection(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener mesa pública por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  @ApiOkResponse({
    description: 'Mesa encontrada',
    type: TableResponseSwaggerDto,
  })
  async findOne(
    @Param('id', UUIDPipe) id: string,
  ): Promise<TableResponseDto> {
    const query: FindTableQuery = { tableId: id };
    return this.tablesService.findOne(query);
  }
}
