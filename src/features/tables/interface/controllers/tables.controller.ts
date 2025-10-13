import type { Request } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/guard/jwt-auth.guard.js';
import { PermissionsGuard } from '../../../../auth/guard/permissions.guard.js';
import { Permissions } from '../../../../auth/decorator/permissions.decorator.js';
import { PaginationDto } from '../../../../shared/application/dto/pagination.dto.js';
import { ApiPaginationQuery } from '../../../../shared/interface/swagger/decorators/api-pagination-query.decorator.js';
import {
  CreateTableDto,
  CreateTableCommand,
  UpdateTableDto,
  UpdateTableCommand,
  ListTablesQuery,
  ListSectionTablesQuery,
  FindTableQuery,
  DeleteTableCommand,
} from '../../application/dto/index.js';
import { TablesService } from '../../application/services/index.js';
import { InvalidTableDataError, TableNotFoundError, TableSectionNotFoundError } from '../../domain/index.js';

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
    try {
      const command: CreateTableCommand = { ...dto };
      return await this.tablesService.create(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar mesas (paginado)' })
  @ApiPaginationQuery()
  async findAll(@Query() pagination: PaginationDto, @Req() req: Request) {
    try {
      const route = req.baseUrl || req.path || '/table';
      const query: ListTablesQuery = {
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          offset: pagination.offset,
        },
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.q,
        route,
      };
      return await this.tablesService.list(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('section/:sectionId')
  @ApiOperation({ summary: 'Listar mesas por sección' })
  @ApiParam({ name: 'sectionId', description: 'UUID de la sección' })
  @ApiPaginationQuery()
  async findBySection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query() pagination: PaginationDto,
    @Req() req: Request,
  ) {
    try {
      const route = req.baseUrl || req.path || '/table/section';
      const query: ListSectionTablesQuery = {
        sectionId,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          offset: pagination.offset,
        },
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.q,
        route,
      };
      return await this.tablesService.listSection(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mesa por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const query: FindTableQuery = { tableId: id };
      return await this.tablesService.findOne(query);
    } catch (error) {
      this.handleError(error);
    }
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
    try {
      const command: UpdateTableCommand = { ...dto, tableId: id };
      return await this.tablesService.update(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:delete')
  @ApiOperation({ summary: 'Eliminar mesa (permiso table:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const command: DeleteTableCommand = { tableId: id };
      return await this.tablesService.delete(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof TableNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof TableSectionNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof InvalidTableDataError) {
      throw new BadRequestException(error.message);
    }
    throw error as any;
  }
}
