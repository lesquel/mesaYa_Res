import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator.js';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator.js';
import { ThrottleRead } from '@shared/infrastructure/decorators';
import {
  ImagesService,
  type FindImageQuery,
  type ListImagesQuery,
} from '../../../application/index.js';

@ApiTags('Images')
@Controller({ path: 'image', version: '1' })
export class ImagesController {
  constructor(private readonly images: ImagesService) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar imágenes (público)' })
  @ApiPaginationQuery()
  async list(
    @PaginationParams({ defaultRoute: '/image' }) query: ListImagesQuery,
  ) {
    return this.images.list(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener imagen por ID (público)' })
  @ApiParam({ name: 'id', description: 'UUID de la imagen' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const query: FindImageQuery = { imageId: id };
    return this.images.findOne(query);
  }
}
