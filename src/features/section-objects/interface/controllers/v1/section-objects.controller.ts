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
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { ApiPaginationQuery } from '../../../../../shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
} from '@shared/infrastructure/decorators';
import { SectionObjectsService } from '../../../application/services';
import {
  CreateSectionObjectDto,
  UpdateSectionObjectDto,
} from '../../../application/dto';
import type {
  CreateSectionObjectCommand,
  DeleteSectionObjectCommand,
  FindSectionObjectQuery,
  ListSectionObjectsQuery,
  UpdateSectionObjectCommand,
} from '../../../application/dto';

@ApiTags('SectionObjects')
@Controller({ path: 'section-object', version: '1' })
export class SectionObjectsController {
  constructor(private readonly service: SectionObjectsService) {}

  @Post()
  @ThrottleCreate()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section-object:create')
  @ApiOperation({
    summary: 'Crear relacion sección-objeto (permiso section-object:create)',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateSectionObjectDto })
  async create(@Body() dto: CreateSectionObjectDto) {
    const command: CreateSectionObjectCommand = { ...dto };
    return this.service.create(command);
  }

  @Get()
  @ThrottleRead()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section-object:read')
  @ApiOperation({ summary: 'Listar relaciones sección-objeto (paginado)' })
  @ApiBearerAuth()
  @ApiPaginationQuery()
  async list(
    @PaginationParams({ defaultRoute: '/section-object' })
    query: ListSectionObjectsQuery,
  ) {
    return this.service.list(query);
  }

  @Get(':id')
  @ThrottleRead()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section-object:read')
  @ApiOperation({ summary: 'Obtener relación por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la relación' })
  @ApiBearerAuth()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const query: FindSectionObjectQuery = { sectionObjectId: id };
    return this.service.findOne(query);
  }

  @Patch(':id')
  @ThrottleModify()
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
    const command: UpdateSectionObjectCommand = {
      sectionObjectId: id,
      ...dto,
    };
    return this.service.update(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section-object:delete')
  @ApiOperation({
    summary: 'Eliminar relación (permiso section-object:delete)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la relación' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const command: DeleteSectionObjectCommand = { sectionObjectId: id };
    return this.service.delete(command);
  }
}
