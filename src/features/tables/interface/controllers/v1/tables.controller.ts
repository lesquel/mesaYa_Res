import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateTableDto,
  UpdateTableDto,
} from '@features/tables/application/dto';
import { GetTableAnalyticsUseCase } from '@features/tables/application/use-cases/get-table-analytics.use-case';
import type {
  CreateTableCommand,
  DeleteTableCommand,
  FindTableQuery,
  ListSectionTablesQuery,
  ListTablesQuery,
  UpdateTableCommand,
  TableResponseDto,
  PaginatedTableResponse,
  DeleteTableResponseDto,
} from '@features/tables/application/dto';
import { TablesService } from '@features/tables/application/services';
import { TableAnalyticsRequestDto } from '@features/tables/interface/dto/table-analytics.request.dto';
import { TableAnalyticsResponseDto } from '@features/tables/interface/dto/table-analytics.response.dto';

@ApiTags('Tables')
@Controller({ path: 'table', version: '1' })
export class TablesController {
  constructor(
    private readonly tablesService: TablesService,
    private readonly getTableAnalytics: GetTableAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:create')
  @ApiOperation({ summary: 'Crear mesa (permiso table:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateTableDto })
  async create(@Body() dto: CreateTableDto): Promise<TableResponseDto> {
    const command: CreateTableCommand = { ...dto };
    return this.tablesService.create(command);
  }

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar mesas (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/table' })
    query: ListTablesQuery,
  ): Promise<PaginatedTableResponse> {
    return this.tablesService.list(query);
  }

  @Get('section/:sectionId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar mesas por sección' })
  @ApiParam({ name: 'sectionId', description: 'UUID de la sección' })
  @ApiPaginationQuery()
  async findBySection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @PaginationParams({ defaultRoute: '/table/section' })
    pagination: ListTablesQuery,
  ): Promise<PaginatedTableResponse> {
    const query: ListSectionTablesQuery = {
      sectionId,
      ...pagination,
    };
    return this.tablesService.listSection(query);
  }

  @Get('analytics')
  @ThrottleSearch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:read')
  @ApiOperation({ summary: 'Indicadores analíticos de mesas' })
  @ApiBearerAuth()
  async analytics(
    @Query() query: TableAnalyticsRequestDto,
  ): Promise<TableAnalyticsResponseDto> {
    const analytics = await this.getTableAnalytics.execute(query.toQuery());
    return TableAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener mesa por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TableResponseDto> {
    const query: FindTableQuery = { tableId: id };
    return this.tablesService.findOne(query);
  }

  @Patch(':id')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:update')
  @ApiOperation({ summary: 'Actualizar mesa (permiso table:update)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  @ApiBody({ type: UpdateTableDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableDto,
  ): Promise<TableResponseDto> {
    const command: UpdateTableCommand = { ...dto, tableId: id };
    return this.tablesService.update(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:delete')
  @ApiOperation({ summary: 'Eliminar mesa (permiso table:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteTableResponseDto> {
    const command: DeleteTableCommand = { tableId: id };
    return this.tablesService.delete(command);
  }
}
