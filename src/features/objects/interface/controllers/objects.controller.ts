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
import {
  CreateGraphicObjectDto,
  ObjectsService,
  UpdateGraphicObjectDto,
} from '../../application/index.js';
import type {
  CreateGraphicObjectCommand,
  DeleteGraphicObjectCommand,
  FindGraphicObjectQuery,
  ListGraphicObjectsQuery,
  UpdateGraphicObjectCommand,
} from '../../application/index.js';
import {
  GraphicObjectNotFoundError,
  InvalidGraphicObjectDataError,
} from '../../domain/index.js';

@ApiTags('Objects')
@Controller({ path: 'object', version: '1' })
export class ObjectsController {
  constructor(private readonly objects: ObjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('object:create')
  @ApiOperation({ summary: 'Crear objeto gráfico (permiso object:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateGraphicObjectDto })
  async create(@Body() dto: CreateGraphicObjectDto) {
    try {
      const command: CreateGraphicObjectCommand = { ...dto };
      return await this.objects.create(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar objetos gráficos (paginado)' })
  @ApiPaginationQuery()
  async list(
    @PaginationParams({ defaultRoute: '/object' })
    query: ListGraphicObjectsQuery,
  ) {
    try {
      return await this.objects.list(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener objeto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del objeto' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const query: FindGraphicObjectQuery = { objectId: id };
      return await this.objects.findOne(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('object:update')
  @ApiOperation({ summary: 'Actualizar objeto (permiso object:update)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID del objeto' })
  @ApiBody({ type: UpdateGraphicObjectDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGraphicObjectDto,
  ) {
    try {
      const command: UpdateGraphicObjectCommand = { objectId: id, ...dto };
      return await this.objects.update(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('object:delete')
  @ApiOperation({ summary: 'Eliminar objeto (permiso object:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID del objeto' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const command: DeleteGraphicObjectCommand = { objectId: id };
      return await this.objects.delete(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof GraphicObjectNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof InvalidGraphicObjectDataError) {
      throw new BadRequestException(error.message);
    }
    throw error as any;
  }
}
