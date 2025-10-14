import type { Request } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/guard/jwt-auth.guard.js';
import { PermissionsGuard } from '../../../../auth/guard/permissions.guard.js';
import { Permissions } from '../../../../auth/decorator/permissions.decorator.js';
import { CurrentUser } from '../../../../auth/decorator/current-user.decorator.js';
import { PaginationDto } from '../../../../shared/application/dto/pagination.dto.js';
import { ApiPaginationQuery } from '../../../../shared/interface/swagger/decorators/api-pagination-query.decorator.js';
import {
  CreateReservationDto,
  CreateReservationCommand,
  UpdateReservationDto,
  UpdateReservationCommand,
  ListReservationsQuery,
  ListRestaurantReservationsQuery,
  FindReservationQuery,
  DeleteReservationCommand,
} from '../../application/dto/index.js';
import { ReservationService } from '../../application/services/index.js';
import {
  ReservationNotFoundError,
  ReservationOwnershipError,
  ReservationRestaurantNotFoundError,
  ReservationUserNotFoundError,
  InvalidReservationDataError,
} from '../../domain/index.js';

@ApiTags('Bookings')
@Controller({ path: 'booking', version: '1' })
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('booking:create')
  @ApiOperation({ summary: 'Crear una reserva (permiso booking:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateReservationDto })
  async create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: { userId: string },
  ) {
    try {
      const command: CreateReservationCommand = {
        ...dto,
        userId: user.userId,
      };
      return await this.reservationsService.create(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar reservas (paginado)' })
  @ApiPaginationQuery()
  async findAll(@Query() pagination: PaginationDto, @Req() req: Request) {
    try {
      const route = req.baseUrl || req.path || '/booking';
      const query: ListReservationsQuery = {
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          offset: pagination.offset,
        },
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.q,
        route,
      };
      return await this.reservationsService.list(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Listar reservas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiPaginationQuery()
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Query() pagination: PaginationDto,
    @Req() req: Request,
  ) {
    try {
      const route = req.baseUrl || req.path || '/booking/restaurant';
      const query: ListRestaurantReservationsQuery = {
        restaurantId,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          offset: pagination.offset,
        },
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.q,
        route,
      };
      return await this.reservationsService.listByRestaurant(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const query: FindReservationQuery = { reservationId: id };
      return await this.reservationsService.findOne(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('booking:update')
  @ApiOperation({
    summary: 'Actualizar reserva propia (permiso booking:update)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiBody({ type: UpdateReservationDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationDto,
    @CurrentUser() user: { userId: string },
  ) {
    try {
      const command: UpdateReservationCommand = {
        ...dto,
        reservationId: id,
        userId: user.userId,
      };
      return await this.reservationsService.update(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('booking:delete')
  @ApiOperation({ summary: 'Eliminar reserva propia (permiso booking:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ) {
    try {
      const command: DeleteReservationCommand = {
        reservationId: id,
        userId: user.userId,
      };
      return await this.reservationsService.delete(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof ReservationNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof ReservationOwnershipError) {
      throw new ForbiddenException(error.message);
    }
    if (error instanceof ReservationRestaurantNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof ReservationUserNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof InvalidReservationDataError) {
      throw new BadRequestException(error.message);
    }
    throw error as any;
  }
}
