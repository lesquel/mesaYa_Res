import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
} from '@shared/infrastructure/decorators';
import {
  CreateReservationCommand,
  CreateReservationDto,
  FindReservationQuery,
  type ListReservationsQuery,
  type ListRestaurantReservationsQuery,
  type ReservationResponseDto,
  type PaginatedReservationResponse,
} from '@features/reservation/application/dto';
import { ReservationService } from '@features/reservation/application';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';

@ApiTags('Reservations - Public')
@Controller({ path: 'public/reservations', version: '1' })
export class PublicReservationsController {
  constructor(private readonly reservationsService: ReservationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ThrottleCreate()
  @ApiOperation({ summary: 'Crear una reserva pública autenticada' })
  @ApiBody({ type: CreateReservationDto })
  async create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ReservationResponseDto> {
    if (!user?.userId) {
      throw new UnauthorizedException();
    }
    const command: CreateReservationCommand = {
      ...dto,
      userId: user.userId,
    };
    return this.reservationsService.create(command);
  }

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reservas públicas (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/public/reservations' })
    query: ListReservationsQuery,
  ): Promise<PaginatedReservationResponse> {
    return this.reservationsService.list(query);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reservas públicas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiPaginationQuery()
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/public/reservations/restaurant' })
    pagination: ListReservationsQuery,
  ): Promise<PaginatedReservationResponse> {
    const query: ListRestaurantReservationsQuery = {
      restaurantId,
      ...pagination,
    };
    return this.reservationsService.listByRestaurant(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener una reserva pública por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReservationResponseDto> {
    const query: FindReservationQuery = { reservationId: id };
    return this.reservationsService.findOne(query);
  }
}
