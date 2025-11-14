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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { RolesGuard } from '@features/auth/interface/guards/roles.guard';
import { Roles } from '@features/auth/interface/decorators/roles.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';
import { TablesService } from '@features/tables/application/services';
import {
  CreateTableDto,
  UpdateTableDto,
} from '@features/tables/application/dto';
import type {
  CreateTableCommand,
  DeleteTableCommand,
  UpdateTableCommand,
  TableResponseDto,
  DeleteTableResponseDto,
} from '@features/tables/application/dto';
import {
  TableAnalyticsRequestDto,
  TableAnalyticsResponseDto,
} from '@features/tables/interface/dto';

@ApiTags('Tables - Restaurant')
@Controller({ path: 'restaurant/tables', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RestaurantTablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Crear mesa (propietario)' })
  @ApiBody({ type: CreateTableDto })
  @ApiCreatedResponse({ description: 'Mesa creada' })
  async create(
    @Body() dto: CreateTableDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableResponseDto> {
    const command: CreateTableCommand = { ...dto };
    return this.tablesService.createForOwner(command, user.userId);
  }

  @Get('analytics')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Indicadores analíticos de mesas (propietario)' })
  async analytics(
    @Query() query: TableAnalyticsRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableAnalyticsResponseDto> {
    const analytics = await this.tablesService.getAnalyticsForOwner(
      query.toQuery(),
      user.userId,
    );
    return TableAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get('section/:sectionId')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Listar mesas por sección (propietario)' })
  @ApiParam({ name: 'sectionId', description: 'UUID de la sección' })
  async listBySection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query() query: any,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const pagination = { ...query, sectionId };
    return this.tablesService.listSectionForOwner(pagination, user.userId);
  }

  @Get(':id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Obtener mesa por ID (propietario)' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  @ApiOkResponse({ description: 'Mesa encontrada' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableResponseDto> {
    return this.tablesService.findOneForOwner({ tableId: id }, user.userId);
  }

  @Patch(':id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Actualizar mesa (propietario)' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  @ApiBody({ type: UpdateTableDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableResponseDto> {
    const command: UpdateTableCommand = { ...dto, tableId: id };
    return this.tablesService.updateForOwner(command, user.userId);
  }

  @Delete(':id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Eliminar mesa (propietario)' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteTableResponseDto> {
    const command: DeleteTableCommand = { tableId: id };
    return this.tablesService.deleteForOwner(command, user.userId);
  }
}
