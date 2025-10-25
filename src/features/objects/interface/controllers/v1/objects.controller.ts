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
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import {
  ObjectsService,
  type CreateGraphicObjectCommand,
  type DeleteGraphicObjectCommand,
  type FindGraphicObjectQuery,
  type ListGraphicObjectsQuery,
  UpdateGraphicObjectDto,
  UpdateGraphicObjectCommand,
  CreateGraphicObjectDto,
  GetGraphicObjectAnalyticsUseCase,
} from '../../../application/index';
import {
  GraphicObjectAnalyticsRequestDto,
  GraphicObjectAnalyticsResponseDto,
} from '../../dto/index';

@ApiTags('Objects')
@Controller({ path: 'object', version: '1' })
export class ObjectsController {
  constructor(
    private readonly objects: ObjectsService,
    private readonly getGraphicObjectAnalytics: GetGraphicObjectAnalyticsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('object:create')
  @ApiOperation({ summary: 'Crear objeto gráfico (permiso object:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateGraphicObjectDto })
  async create(@Body() dto: CreateGraphicObjectDto) {
    const command: CreateGraphicObjectCommand = { ...dto };
    return this.objects.create(command);
  }

  @Get()
  @ApiOperation({ summary: 'Listar objetos gráficos (paginado)' })
  @ApiPaginationQuery()
  async list(
    @PaginationParams({ defaultRoute: '/object' })
    query: ListGraphicObjectsQuery,
  ) {
    return this.objects.list(query);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('object:read')
  @ApiOperation({ summary: 'Datos analíticos de objetos gráficos' })
  @ApiBearerAuth()
  async analytics(
    @Query() query: GraphicObjectAnalyticsRequestDto,
  ): Promise<GraphicObjectAnalyticsResponseDto> {
    const analytics = await this.getGraphicObjectAnalytics.execute(
      query.toQuery(),
    );
    return GraphicObjectAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener objeto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del objeto' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const query: FindGraphicObjectQuery = { objectId: id };
    return this.objects.findOne(query);
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
    const command: UpdateGraphicObjectCommand = { objectId: id, ...dto };
    return this.objects.update(command);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('object:delete')
  @ApiOperation({ summary: 'Eliminar objeto (permiso object:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID del objeto' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const command: DeleteGraphicObjectCommand = { objectId: id };
    return this.objects.delete(command);
  }
}
