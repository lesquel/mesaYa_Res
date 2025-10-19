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
import { ApiPaginationQuery } from '../../../../shared/interface/swagger/decorators/api-pagination-query.decorator.js';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator.js';
import {
  CreateSectionDto,
  SectionsService,
  UpdateSectionDto,
} from '../../application/index.js';
import type {
  CreateSectionCommand,
  DeleteSectionCommand,
  FindSectionQuery,
  ListRestaurantSectionsQuery,
  ListSectionsQuery,
  UpdateSectionCommand,
} from '../../application/index.js';

@ApiTags('Sections')
@Controller('section')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:create')
  @ApiOperation({ summary: 'Crear sección (permiso section:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateSectionDto })
  async create(@Body() dto: CreateSectionDto) {
    const command: CreateSectionCommand = { ...dto };
    return this.sectionsService.create(command);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Listar secciones por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiPaginationQuery()
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/section/restaurant' })
    pagination: ListSectionsQuery,
  ) {
    const query: ListRestaurantSectionsQuery = {
      ...pagination,
      restaurantId,
    };
    return this.sectionsService.listByRestaurant(query);
  }

  @Get()
  @ApiOperation({ summary: 'Listar secciones (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/section' })
    query: ListSectionsQuery,
  ) {
    return this.sectionsService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sección por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const query: FindSectionQuery = { sectionId: id };
    return this.sectionsService.findOne(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:update')
  @ApiOperation({ summary: 'Actualizar sección (permiso section:update)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiBody({ type: UpdateSectionDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
  ) {
    const command: UpdateSectionCommand = {
      sectionId: id,
      ...dto,
    };
    return this.sectionsService.update(command);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:delete')
  @ApiOperation({ summary: 'Eliminar sección (permiso section:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const command: DeleteSectionCommand = { sectionId: id };
    return this.sectionsService.delete(command);
  }
}
