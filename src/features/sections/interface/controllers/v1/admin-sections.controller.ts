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
  CurrentUser,
  type CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateSectionDto,
  SectionsService,
  UpdateSectionDto,
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

const hasRole = (
  user: CurrentUserPayload | undefined,
  role: AuthRoleName,
): boolean => user?.roles?.some((item) => item.name === role) ?? false;

const isAdmin = (user: CurrentUserPayload | undefined): boolean =>
  hasRole(user, AuthRoleName.ADMIN);

@ApiTags('Sections - Admin')
@Controller({ path: 'admin/sections', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminSectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ThrottleCreate()
  @Permissions('section:create')
  @ApiOperation({ summary: 'Crear sección (permiso section:create)' })
  @ApiBody({ type: CreateSectionDto })
  @ApiCreatedResponse({
    description: 'Sección creada correctamente',
    type: SectionResponseSwaggerDto,
  })
  async create(
    @Body() dto: CreateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionResponseDto> {
    const command: CreateSectionCommand = { ...dto };
    if (isAdmin(user)) {
      return this.sectionsService.create(command);
    }

    return this.sectionsService.createForOwner(command, user.userId);
  }

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('section:read')
  @ApiOperation({ summary: 'Indicadores analíticos de secciones' })
  async analytics(
    @Query() query: SectionAnalyticsRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionAnalyticsResponseDto> {
    const analytics = isAdmin(user)
      ? await this.sectionsService.getAnalytics(query.toQuery())
      : await this.sectionsService.getAnalyticsForOwner(
          query.toQuery(),
          user.userId,
        );
    return SectionAnalyticsResponseDto.fromApplication(analytics);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('section:update')
  @ApiOperation({ summary: 'Actualizar sección (permiso section:update)' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiBody({ type: UpdateSectionDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionResponseDto> {
    const command: UpdateSectionCommand = {
      sectionId: id,
      ...dto,
    };
    if (isAdmin(user)) {
      return this.sectionsService.update(command);
    }

    return this.sectionsService.updateForOwner(command, user.userId);
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
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteSectionResponseDto> {
    const command: DeleteSectionCommand = { sectionId: id };
    if (isAdmin(user)) {
      return this.sectionsService.delete(command);
    }

    return this.sectionsService.deleteForOwner(command, user.userId);
  }
}
