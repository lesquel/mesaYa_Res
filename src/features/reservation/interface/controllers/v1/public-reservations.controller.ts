import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { ThrottleRead } from '@shared/infrastructure/decorators';
import {
  FindReservationQuery,
  type ListReservationsQuery,
  type ListRestaurantReservationsQuery,
  type ReservationResponseDto,
  type PaginatedReservationResponse,
} from '@features/reservation/application/dto';
import { ReservationService } from '@features/reservation/application';

@ApiTags('Reservations - Public')
@Controller({ path: 'public/reservations', version: '1' })
export class PublicReservationsController {
  constructor(private readonly reservationsService: ReservationService) {}

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
