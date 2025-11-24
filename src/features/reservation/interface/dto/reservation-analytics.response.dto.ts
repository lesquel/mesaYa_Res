import { ApiProperty } from '@nestjs/swagger';
import type { ReservationAnalyticsResponse } from '../../application/dto/analytics/reservation-analytics.response';
import type { ReservationStatus } from '../../domain/types/reservation-status.type';
import { RESERVATION_STATUSES } from '../../domain/types/reservation-status.type';

class ReservationAnalyticsSummaryDto {
  @ApiProperty()
  totalReservations!: number;

  @ApiProperty()
  confirmedReservations!: number;

  @ApiProperty()
  pendingReservations!: number;

  @ApiProperty()
  cancelledReservations!: number;

  @ApiProperty({ description: 'Reservas futuras programadas' })
  upcomingReservations!: number;

  @ApiProperty({ description: 'Promedio de invitados por reserva' })
  averageGuestsPerReservation!: number;

  @ApiProperty({ description: 'Porcentaje de reservas confirmadas' })
  confirmationRate!: number;
}

class ReservationAnalyticsTrendPointDto {
  @ApiProperty({ description: 'Fecha en formato YYYY-MM-DD' })
  date!: string;

  @ApiProperty({ description: 'Cantidad de reservas registradas en la fecha' })
  count!: number;

  @ApiProperty({ description: 'Total de invitados registrados en la fecha' })
  guests!: number;
}

class ReservationAnalyticsReservationsDto {
  @ApiProperty({ description: 'Total de reservas en el período' })
  total!: number;

  @ApiProperty({ type: [ReservationAnalyticsTrendPointDto] })
  byDate!: ReservationAnalyticsTrendPointDto[];
}

class ReservationAnalyticsStatusItemDto {
  @ApiProperty({ enum: RESERVATION_STATUSES })
  status!: ReservationStatus;

  @ApiProperty()
  count!: number;
}

class ReservationAnalyticsGuestSegmentDto {
  @ApiProperty({ description: 'Etiqueta del segmento de invitados' })
  segment!: string;

  @ApiProperty()
  count!: number;
}

class ReservationAnalyticsRestaurantItemDto {
  @ApiProperty({ description: 'Identificador del restaurante' })
  restaurantId!: string;

  @ApiProperty()
  count!: number;
}

class ReservationAnalyticsHourItemDto {
  @ApiProperty({ description: 'Hora del día (0-23)' })
  hour!: number;

  @ApiProperty({ description: 'Hora como texto HH:MM' })
  time!: string;

  @ApiProperty()
  count!: number;
}

export class ReservationAnalyticsResponseDto {
  @ApiProperty({ type: ReservationAnalyticsSummaryDto })
  summary!: ReservationAnalyticsSummaryDto;

  @ApiProperty({ type: ReservationAnalyticsReservationsDto })
  reservations!: ReservationAnalyticsReservationsDto;

  @ApiProperty({ type: [ReservationAnalyticsStatusItemDto] })
  statuses!: ReservationAnalyticsStatusItemDto[];

  @ApiProperty({ type: [ReservationAnalyticsGuestSegmentDto] })
  guestSegments!: ReservationAnalyticsGuestSegmentDto[];

  @ApiProperty({ type: [ReservationAnalyticsRestaurantItemDto] })
  restaurants!: ReservationAnalyticsRestaurantItemDto[];

  @ApiProperty({ type: [ReservationAnalyticsHourItemDto] })
  peakHours!: ReservationAnalyticsHourItemDto[];

  static fromApplication(
    response: ReservationAnalyticsResponse,
  ): ReservationAnalyticsResponseDto {
    const dto = new ReservationAnalyticsResponseDto();
    dto.summary = {
      totalReservations: response.summary.totalReservations,
      confirmedReservations: response.summary.confirmedReservations,
      pendingReservations: response.summary.pendingReservations,
      cancelledReservations: response.summary.cancelledReservations,
      upcomingReservations: response.summary.upcomingReservations,
      averageGuestsPerReservation: response.summary.averageGuestsPerReservation,
      confirmationRate: response.summary.confirmationRate,
    };
    dto.reservations = {
      total: response.reservations.total,
      byDate: response.reservations.byDate.map((point) => ({
        date: point.date,
        count: point.count,
        guests: point.guests,
      })),
    };
    dto.statuses = response.statuses.map((item) => ({
      status: item.status,
      count: item.count,
    }));
    dto.guestSegments = response.guestSegments.map((item) => ({
      segment: item.segment,
      count: item.count,
    }));
    dto.restaurants = response.restaurants.map((item) => ({
      restaurantId: item.restaurantId,
      count: item.count,
    }));
    dto.peakHours = response.peakHours.map((item) => ({
      hour: item.hour,
      time: `${String(item.hour).padStart(2, '0')}:00`,
      count: item.count,
    }));
    return dto;
  }
}
