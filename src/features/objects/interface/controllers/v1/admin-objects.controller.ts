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
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  ObjectsService,
  type CreateGraphicObjectCommand,
  type DeleteGraphicObjectCommand,
  UpdateGraphicObjectDto,
  UpdateGraphicObjectCommand,
  CreateGraphicObjectDto,
  GetGraphicObjectAnalyticsUseCase,
} from '../../../application';
import {
  GraphicObjectAnalyticsRequestDto,
  GraphicObjectAnalyticsResponseDto,
} from '../../dto';

@ApiTags('Admin Objects')
@Controller({ path: 'admin/object', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminObjectsController {
  constructor(
    private readonly objects: ObjectsService,
    private readonly getGraphicObjectAnalytics: GetGraphicObjectAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @Permissions('object:create')
  @ApiOperation({ summary: 'Crear objeto gráfico (permiso object:create)' })
  @ApiBody({ type: CreateGraphicObjectDto })
  async create(@Body() dto: CreateGraphicObjectDto) {
    const command: CreateGraphicObjectCommand = { ...dto };
    return this.objects.create(command);
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
