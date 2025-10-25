import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { ThrottleRead } from '@shared/infrastructure/decorators';
import {
  ObjectsService,
  type FindGraphicObjectQuery,
  type ListGraphicObjectsQuery,
} from '../../../application';

@ApiTags('Public Objects')
@Controller({ path: 'public/object', version: '1' })
export class PublicObjectsController {
  constructor(private readonly objects: ObjectsService) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar objetos gráficos públicos (paginado)' })
  @ApiPaginationQuery()
  async list(
    @PaginationParams({ defaultRoute: '/public/object' })
    query: ListGraphicObjectsQuery,
  ) {
    return this.objects.list(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener objeto gráfico público por ID' })
  @ApiParam({ name: 'id', description: 'UUID del objeto' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const query: FindGraphicObjectQuery = { objectId: id };
    return this.objects.findOne(query);
  }
}
