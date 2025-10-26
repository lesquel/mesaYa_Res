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

@ApiTags('Admin Section Objects')
@Controller({ path: 'admin/section-objects', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminSectionObjectsController {
  constructor(private readonly service: SectionObjectsService) {}

  @Post()
  @ThrottleCreate()
  @Permissions('section-object:create')
  @ApiOperation({
    summary: 'Crear relacion sección-objeto (permiso section-object:create)',
  })
  @ApiBody({ type: CreateSectionObjectDto })
  async create(@Body() dto: CreateSectionObjectDto) {
    const command: CreateSectionObjectCommand = { ...dto };
    return this.service.create(command);
  }

  @Get()
  @ThrottleRead()
  @Permissions('section-object:read')
  @ApiOperation({ summary: 'Listar relaciones sección-objeto (paginado)' })
  @ApiPaginationQuery()
  async list(
    @PaginationParams({ defaultRoute: '/admin/section-objects' })
    query: ListSectionObjectsQuery,
  ) {
    return this.service.list(query);
  }

  @Get(':id')
  @ThrottleRead()
  @Permissions('section-object:read')
  @ApiOperation({ summary: 'Obtener relación por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la relación' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const query: FindSectionObjectQuery = { sectionObjectId: id };
    return this.service.findOne(query);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('section-object:update')
  @ApiOperation({
    summary: 'Actualizar relación (permiso section-object:update)',
  })
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
  @Permissions('section-object:delete')
  @ApiOperation({
    summary: 'Eliminar relación (permiso section-object:delete)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la relación' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const command: DeleteSectionObjectCommand = { sectionObjectId: id };
    return this.service.delete(command);
  }
}
