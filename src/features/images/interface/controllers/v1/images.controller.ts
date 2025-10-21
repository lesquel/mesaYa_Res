import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator.js';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator.js';
import {
  ImagesService,
  CreateImageDto,
  UpdateImageDto,
  type CreateImageCommand,
  type DeleteImageCommand,
  type FindImageQuery,
  type ListImagesQuery,
  type UpdateImageCommand,
} from '../../../application/index.js';

@ApiTags('Images')
@Controller({ path: 'image', version: '1' })
export class ImagesController {
  constructor(private readonly images: ImagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('image:create')
  @ApiOperation({ summary: 'Crear imagen (permiso image:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateImageDto })
  async create(@Body() dto: CreateImageDto) {
    const command: CreateImageCommand = { ...dto };
    return this.images.create(command);
  }

  @Get()
  @ApiOperation({ summary: 'Listar imágenes (paginado)' })
  @ApiPaginationQuery()
  async list(
    @PaginationParams({ defaultRoute: '/image' }) query: ListImagesQuery,
  ) {
    return this.images.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener imagen por ID' })
  @ApiParam({ name: 'id', description: 'ID incremental de la imagen' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const query: FindImageQuery = { imageId: id };
    return this.images.findOne(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('image:update')
  @ApiOperation({ summary: 'Actualizar imagen (permiso image:update)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID incremental de la imagen' })
  @ApiBody({ type: UpdateImageDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateImageDto,
  ) {
    const command: UpdateImageCommand = { imageId: id, ...dto };
    return this.images.update(command);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('image:delete')
  @ApiOperation({ summary: 'Eliminar imagen (permiso image:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID incremental de la imagen' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const command: DeleteImageCommand = { imageId: id };
    return this.images.delete(command);
  }
}
