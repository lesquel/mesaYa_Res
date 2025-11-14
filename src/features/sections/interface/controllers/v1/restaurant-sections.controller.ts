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
import { CurrentUser, type CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
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
  SectionResponseSwaggerDto,
  SectionAnalyticsRequestDto,
  SectionAnalyticsResponseDto,
} from '@features/sections/interface/dto';

@ApiTags('Sections - Restaurant')
@Controller({ path: 'restaurant/sections', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RestaurantSectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Crear sección (propietario)' })
  @ApiBody({ type: CreateSectionDto })
  @ApiCreatedResponse({ type: SectionResponseSwaggerDto })
  async create(
    @Body() dto: CreateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionResponseDto> {
    const command: CreateSectionCommand = { ...dto };
    return this.sectionsService.createForOwner(command, user.userId);
  }

  @Get('analytics')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Indicadores analíticos de secciones (propietario)' })
  async analytics(
    @Query() query: SectionAnalyticsRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionAnalyticsResponseDto> {
    const analytics = await this.sectionsService.getAnalyticsForOwner(
      query.toQuery(),
      user.userId,
    );
    return SectionAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get('restaurant/:restaurantId')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Listar secciones por restaurante (propietario)' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Query() query: any,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const pagination = { ...query, restaurantId };
    return this.sectionsService.listByRestaurantForOwner(pagination, user.userId);
  }

  @Get(':id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Obtener sección por ID (propietario)' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiOkResponse({ type: SectionResponseSwaggerDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionResponseDto> {
    return this.sectionsService.findOneForOwner({ sectionId: id }, user.userId);
  }

  @Patch(':id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Actualizar sección (propietario)' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiBody({ type: UpdateSectionDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionResponseDto> {
    const command: UpdateSectionCommand = { sectionId: id, ...dto };
    return this.sectionsService.updateForOwner(command, user.userId);
  }

  @Delete(':id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Eliminar sección (propietario)' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiOkResponse({ description: 'Sección eliminada correctamente' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteSectionResponseDto> {
    const command: DeleteSectionCommand = { sectionId: id };
    return this.sectionsService.deleteForOwner(command, user.userId);
  }
}
