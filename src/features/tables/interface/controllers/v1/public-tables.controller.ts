import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
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

@ApiTags('Tables - Public')
@Controller({ path: 'public/table', version: '1' })
export class PublicTablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar mesas públicas (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/public/table' })
    query: ListTablesQuery,
  ): Promise<PaginatedTableResponse> {
    return this.tablesService.list(query);
  }

  @Get('section/:sectionId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar mesas públicas por sección' })
  @ApiParam({ name: 'sectionId', description: 'UUID de la sección' })
  @ApiPaginationQuery()
  async findBySection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @PaginationParams({ defaultRoute: '/public/table/section' })
    pagination: ListTablesQuery,
  ): Promise<PaginatedTableResponse> {
    const query: ListSectionTablesQuery = {
      sectionId,
      ...pagination,
    };
    return this.tablesService.listSection(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener mesa pública por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TableResponseDto> {
    const query: FindTableQuery = { tableId: id };
    return this.tablesService.findOne(query);
  }
}
