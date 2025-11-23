import { Controller, Get, Param } from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { ThrottleRead } from '@shared/infrastructure/decorators/index';
import {
  ImagesService,
  type FindImageQuery,
  type ListImagesQuery,
} from '../../../application/index';

@ApiTags('Images - Public')
@Controller({ path: 'public/images', version: '1' })
export class ImagesController {
  constructor(private readonly images: ImagesService) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar imágenes (público)' })
  @ApiPaginationQuery()
  async list(
    @PaginationParams({ defaultRoute: '/public/images' })
    query: ListImagesQuery,
  ) {
    return this.images.list(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener imagen por ID (público)' })
  @ApiParam({ name: 'id', description: 'UUID de la imagen' })
  async findOne(@Param('id', UUIDPipe) id: string) {
    const query: FindImageQuery = { imageId: id };
    return this.images.findOne(query);
  }
}
