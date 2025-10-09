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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/guard/jwt-auth.guard.js';
import { PermissionsGuard } from '../../../../auth/guard/permissions.guard.js';
import { Permissions } from '../../../../auth/decorator/permissions.decorator.js';
import { CurrentUser } from '../../../../auth/decorator/current-user.decorator.js';
import { PaginationDto } from '../../../../shared/application/dto/pagination.dto.js';
import {
  CreateBookingDto,
  CreateBookingCommand,
  UpdateBookingDto,
  UpdateBookingCommand,
  ListBookingsQuery,
  ListRestaurantBookingsQuery,
  FindBookingQuery,
  DeleteBookingCommand,
} from '../../application/dto/index.js';
import {
  CreateBookingUseCase,
  ListBookingsUseCase,
  ListRestaurantBookingsUseCase,
  FindBookingUseCase,
  UpdateBookingUseCase,
  DeleteBookingUseCase,
} from '../../application/use-cases/index.js';
import {
  BookingNotFoundError,
  BookingOwnershipError,
  BookingRestaurantNotFoundError,
  BookingUserNotFoundError,
  InvalidBookingDataError,
} from '../../domain/index.js';

@ApiTags('Bookings')
@Controller({ path: 'booking', version: '1' })
export class BookingsController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly listBookingsUseCase: ListBookingsUseCase,
    private readonly listRestaurantBookingsUseCase: ListRestaurantBookingsUseCase,
    private readonly findBookingUseCase: FindBookingUseCase,
    private readonly updateBookingUseCase: UpdateBookingUseCase,
    private readonly deleteBookingUseCase: DeleteBookingUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('booking:create')
  @ApiOperation({ summary: 'Crear una reserva (permiso booking:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateBookingDto })
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: { userId: string },
  ) {
    try {
      const command: CreateBookingCommand = {
        ...dto,
        userId: user.userId,
      };
      return await this.createBookingUseCase.execute(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar reservas (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'q', required: false, type: String })
  async findAll(@Query() pagination: PaginationDto, @Req() req: Request) {
    try {
      const route = req.baseUrl || req.path || '/booking';
      const query: ListBookingsQuery = {
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
      return await this.listBookingsUseCase.execute(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Listar reservas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'q', required: false, type: String })
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Query() pagination: PaginationDto,
    @Req() req: Request,
  ) {
    try {
      const route = req.baseUrl || req.path || '/booking/restaurant';
      const query: ListRestaurantBookingsQuery = {
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
      return await this.listRestaurantBookingsUseCase.execute(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const query: FindBookingQuery = { bookingId: id };
      return await this.findBookingUseCase.execute(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('booking:update')
  @ApiOperation({ summary: 'Actualizar reserva propia (permiso booking:update)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiBody({ type: UpdateBookingDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() user: { userId: string },
  ) {
    try {
      const command: UpdateBookingCommand = {
        ...dto,
        bookingId: id,
        userId: user.userId,
      };
      return await this.updateBookingUseCase.execute(command);
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
      const command: DeleteBookingCommand = {
        bookingId: id,
        userId: user.userId,
      };
      return await this.deleteBookingUseCase.execute(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof BookingNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof BookingOwnershipError) {
      throw new ForbiddenException(error.message);
    }
    if (error instanceof BookingRestaurantNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof BookingUserNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof InvalidBookingDataError) {
      throw new BadRequestException(error.message);
    }
    throw error as any;
  }
}
