import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard.js';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator.js';
import { ApiPaginationQuery } from '../../../../../shared/interface/swagger/decorators/api-pagination-query.decorator.js';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator.js';
import { CreateTableDto, UpdateTableDto } from '../../../application/dto/index.js';
import type {
  CreateTableCommand,
  DeleteTableCommand,
  FindTableQuery,
  ListSectionTablesQuery,
  ListTablesQuery,
  UpdateTableCommand,
} from '../../../application/dto/index.js';
import { TablesService } from '../../../application/services/index.js';

@ApiTags('Tables')
@Controller({ path: 'table', version: '1' })
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:create')
  @ApiOperation({ summary: 'Crear mesa (permiso table:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateTableDto })
  async create(@Body() dto: CreateTableDto) {
    const command: CreateTableCommand = { ...dto };
    return this.tablesService.create(command);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mesas (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/table' })
    query: ListTablesQuery,
  ) {
    return this.tablesService.list(query);
  }

  @Get('section/:sectionId')
  @ApiOperation({ summary: 'Listar mesas por sección' })
  @ApiParam({ name: 'sectionId', description: 'UUID de la sección' })
  @ApiPaginationQuery()
  async findBySection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @PaginationParams({ defaultRoute: '/table/section' })
    pagination: ListTablesQuery,
  ) {
    const query: ListSectionTablesQuery = {
      sectionId,
      ...pagination,
    };
    return this.tablesService.listSection(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mesa por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const query: FindTableQuery = { tableId: id };
    return this.tablesService.findOne(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:update')
  @ApiOperation({ summary: 'Actualizar mesa (permiso table:update)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  @ApiBody({ type: UpdateTableDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableDto,
  ) {
    const command: UpdateTableCommand = { ...dto, tableId: id };
    return this.tablesService.update(command);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:delete')
  @ApiOperation({ summary: 'Eliminar mesa (permiso table:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const command: DeleteTableCommand = { tableId: id };
    return this.tablesService.delete(command);
  }
}
