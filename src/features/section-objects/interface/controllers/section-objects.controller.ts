import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { ApiPaginationQuery } from '../../../../shared/interface/swagger/decorators/api-pagination-query.decorator.js';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator.js';
import { SectionObjectsService } from '../../application/services/index.js';
import {
  CreateSectionObjectDto,
  UpdateSectionObjectDto,
} from '../../application/dto/index.js';
import type {
  CreateSectionObjectCommand,
  DeleteSectionObjectCommand,
  FindSectionObjectQuery,
  ListSectionObjectsQuery,
  UpdateSectionObjectCommand,
} from '../../application/dto/index.js';
import {
  InvalidSectionObjectDataError,
  ObjectNotFoundForSectionObjectError,
  SectionNotFoundForSectionObjectError,
  SectionObjectNotFoundError,
} from '../../domain/index.js';

@ApiTags('SectionObjects')
@Controller({ path: 'section-object', version: '1' })
export class SectionObjectsController {
  constructor(private readonly service: SectionObjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section-object:create')
  @ApiOperation({
    summary: 'Crear relacion sección-objeto (permiso section-object:create)',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateSectionObjectDto })
  async create(@Body() dto: CreateSectionObjectDto) {
    try {
      const command: CreateSectionObjectCommand = { ...dto };
      return await this.service.create(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar relaciones sección-objeto (paginado)' })
  @ApiPaginationQuery()
  async list(
    @PaginationParams({ defaultRoute: '/section-object' })
    query: ListSectionObjectsQuery,
  ) {
    try {
      return await this.service.list(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener relación por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la relación' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const query: FindSectionObjectQuery = { sectionObjectId: id };
      return await this.service.findOne(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section-object:update')
  @ApiOperation({
    summary: 'Actualizar relación (permiso section-object:update)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la relación' })
  @ApiBody({ type: UpdateSectionObjectDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionObjectDto,
  ) {
    try {
      const command: UpdateSectionObjectCommand = {
        sectionObjectId: id,
        ...dto,
      };
      return await this.service.update(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section-object:delete')
  @ApiOperation({
    summary: 'Eliminar relación (permiso section-object:delete)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la relación' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const command: DeleteSectionObjectCommand = { sectionObjectId: id };
      return await this.service.delete(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof SectionObjectNotFoundError)
      throw new NotFoundException(error.message);
    if (error instanceof SectionNotFoundForSectionObjectError)
      throw new NotFoundException(error.message);
    if (error instanceof ObjectNotFoundForSectionObjectError)
      throw new NotFoundException(error.message);
    if (error instanceof InvalidSectionObjectDataError)
      throw new BadRequestException(error.message);
    throw error as any;
  }
}
