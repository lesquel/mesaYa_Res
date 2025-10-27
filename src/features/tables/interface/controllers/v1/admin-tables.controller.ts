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
  CreateTableDto,
  UpdateTableDto,
} from '@features/tables/application/dto';
import { GetTableAnalyticsUseCase } from '@features/tables/application/use-cases/get-table-analytics.use-case';
import type {
  CreateTableCommand,
  DeleteTableCommand,
  UpdateTableCommand,
  TableResponseDto,
  DeleteTableResponseDto,
} from '@features/tables/application/dto';
import { TablesService } from '@features/tables/application/services';
import { TableAnalyticsRequestDto } from '@features/tables/interface/dto/table-analytics.request.dto';
import { TableAnalyticsResponseDto } from '@features/tables/interface/dto/table-analytics.response.dto';

@ApiTags('Tables - Admin')
@Controller({ path: 'admin/tables', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminTablesController {
  constructor(
    private readonly tablesService: TablesService,
    private readonly getTableAnalytics: GetTableAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @Permissions('table:create')
  @ApiOperation({ summary: 'Crear mesa (permiso table:create)' })
  @ApiBody({ type: CreateTableDto })
  async create(@Body() dto: CreateTableDto): Promise<TableResponseDto> {
    const command: CreateTableCommand = { ...dto };
    return this.tablesService.create(command);
  }

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('table:read')
  @ApiOperation({ summary: 'Indicadores analíticos de mesas' })
  async analytics(
    @Query() query: TableAnalyticsRequestDto,
  ): Promise<TableAnalyticsResponseDto> {
    const analytics = await this.getTableAnalytics.execute(query.toQuery());
    return TableAnalyticsResponseDto.fromApplication(analytics);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('table:update')
  @ApiOperation({ summary: 'Actualizar mesa (permiso table:update)' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  @ApiBody({ type: UpdateTableDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableDto,
  ): Promise<TableResponseDto> {
    const command: UpdateTableCommand = { ...dto, tableId: id };
    return this.tablesService.update(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @Permissions('table:delete')
  @ApiOperation({ summary: 'Eliminar mesa (permiso table:delete)' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteTableResponseDto> {
    const command: DeleteTableCommand = { tableId: id };
    return this.tablesService.delete(command);
  }
}
