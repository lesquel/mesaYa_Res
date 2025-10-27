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
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateSectionDto,
  SectionsService,
  UpdateSectionDto,
  GetSectionAnalyticsUseCase,
} from '../../../application';
import type {
  CreateSectionCommand,
  DeleteSectionCommand,
  DeleteSectionResponseDto,
  UpdateSectionCommand,
  SectionResponseDto,
} from '../../../application';
import {
  DeleteSectionResponseSwaggerDto,
  SectionResponseSwaggerDto,
  SectionAnalyticsRequestDto,
  SectionAnalyticsResponseDto,
} from '@features/sections/interface/dto';

@ApiTags('Sections - Admin')
@Controller({ path: 'admin/section', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminSectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly getSectionAnalytics: GetSectionAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @Permissions('section:create')
  @ApiOperation({ summary: 'Crear sección (permiso section:create)' })
  @ApiBody({ type: CreateSectionDto })
  @ApiCreatedResponse({
    description: 'Sección creada correctamente',
    type: SectionResponseSwaggerDto,
  })
  async create(@Body() dto: CreateSectionDto): Promise<SectionResponseDto> {
    const command: CreateSectionCommand = { ...dto };
    return this.sectionsService.create(command);
  }

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('section:read')
  @ApiOperation({ summary: 'Indicadores analíticos de secciones' })
  async analytics(
    @Query() query: SectionAnalyticsRequestDto,
  ): Promise<SectionAnalyticsResponseDto> {
    const analytics = await this.getSectionAnalytics.execute(query.toQuery());
    return SectionAnalyticsResponseDto.fromApplication(analytics);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('section:update')
  @ApiOperation({ summary: 'Actualizar sección (permiso section:update)' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiBody({ type: UpdateSectionDto })
  @ApiOkResponse({
    description: 'Sección actualizada correctamente',
    type: SectionResponseSwaggerDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
  ): Promise<SectionResponseDto> {
    const command: UpdateSectionCommand = {
      sectionId: id,
      ...dto,
    };
    return this.sectionsService.update(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @Permissions('section:delete')
  @ApiOperation({ summary: 'Eliminar sección (permiso section:delete)' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiOkResponse({
    description: 'Sección eliminada correctamente',
    type: DeleteSectionResponseSwaggerDto,
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteSectionResponseDto> {
    const command: DeleteSectionCommand = { sectionId: id };
    return this.sectionsService.delete(command);
  }
}
