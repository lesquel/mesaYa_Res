import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js';
import { Permissions } from '../auth/decorator/permissions.decorator.js';
import { PermissionsGuard } from '../auth/guard/permissions.guard.js';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Sections')
@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:create')
  @ApiOperation({ summary: 'Crear sección (permiso section:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateSectionDto })
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionService.create(createSectionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar secciones (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'q', required: false, type: String })
  findAll(@Query() pagination: PaginationDto, @Req() req: Request) {
    const route = req.baseUrl || req.path || '/section';
    return this.sectionService.findAll(pagination, route);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sección por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sectionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:update')
  @ApiOperation({ summary: 'Actualizar sección (permiso section:update)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiBody({ type: UpdateSectionDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.sectionService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:delete')
  @ApiOperation({ summary: 'Eliminar sección (permiso section:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sectionService.remove(id);
  }
}
