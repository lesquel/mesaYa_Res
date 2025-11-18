import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators/index';
import {
  ObjectsService,
  type CreateGraphicObjectCommand,
  type DeleteGraphicObjectCommand,
  type FindGraphicObjectQuery,
  type ListGraphicObjectsQuery,
  type PaginatedGraphicObjectResponse,
  UpdateGraphicObjectDto,
  UpdateGraphicObjectCommand,
  CreateGraphicObjectDto,
  GetGraphicObjectAnalyticsUseCase,
} from '../../../application/index';
import {
  GraphicObjectAnalyticsRequestDto,
  GraphicObjectAnalyticsResponseDto,
  GraphicObjectResponseSwaggerDto,
} from '../../dto/index';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';

@ApiTags('Objects - Admin')
@Controller({ path: 'admin/objects', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminObjectsController {
  constructor(
    private readonly objects: ObjectsService,
    private readonly getGraphicObjectAnalytics: GetGraphicObjectAnalyticsUseCase,
  ) {}

  @Get()
  @ThrottleRead()
  @Permissions('object:read')
  @ApiOperation({ summary: 'Listar objetos gráficos (permiso object:read)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: GraphicObjectResponseSwaggerDto,
    description: 'Listado paginado de objetos gráficos',
  })
  async list(
    @PaginationParams({ defaultRoute: '/admin/objects' })
    pagination: PaginatedQueryParams,
  ): Promise<PaginatedGraphicObjectResponse> {
    const query: ListGraphicObjectsQuery = { ...pagination };
    return this.objects.list(query);
  }

  @Post()
  @ThrottleCreate()
  @Permissions('object:create')
  @ApiOperation({ summary: 'Crear objeto gráfico (permiso object:create)' })
  @ApiBody({ type: CreateGraphicObjectDto })
  async create(@Body() dto: CreateGraphicObjectDto) {
    const command: CreateGraphicObjectCommand = { ...dto };
    return this.objects.create(command);
  }

  @Get(':id')
  @ThrottleRead()
  @Permissions('object:read')
  @ApiOperation({
    summary: 'Obtener objeto gráfico por ID (permiso object:read)',
  })
  @ApiParam({ name: 'id', description: 'UUID del objeto' })
  @ApiOkResponse({
    description: 'Detalle del objeto gráfico',
    type: GraphicObjectResponseSwaggerDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const query: FindGraphicObjectQuery = { objectId: id };
    return this.objects.findOne(query);
  }

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('object:read')
  @ApiOperation({ summary: 'Datos analíticos de objetos gráficos' })
  async analytics(
    @Query() query: GraphicObjectAnalyticsRequestDto,
  ): Promise<GraphicObjectAnalyticsResponseDto> {
    const analytics = await this.getGraphicObjectAnalytics.execute(
      query.toQuery(),
    );
    return GraphicObjectAnalyticsResponseDto.fromApplication(analytics);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('object:update')
  @ApiOperation({ summary: 'Actualizar objeto (permiso object:update)' })
  @ApiParam({ name: 'id', description: 'UUID del objeto' })
  @ApiBody({ type: UpdateGraphicObjectDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGraphicObjectDto,
  ) {
    const command: UpdateGraphicObjectCommand = { objectId: id, ...dto };
    return this.objects.update(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @Permissions('object:delete')
  @ApiOperation({ summary: 'Eliminar objeto (permiso object:delete)' })
  @ApiParam({ name: 'id', description: 'UUID del objeto' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const command: DeleteGraphicObjectCommand = { objectId: id };
    return this.objects.delete(command);
  }
}
