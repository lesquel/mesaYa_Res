import { ApiProperty } from '@nestjs/swagger';
import type { AuthAnalyticsResponse } from '../../application/dto/responses/auth-analytics.response.js';

class AuthAnalyticsSummaryDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  inactiveUsers: number;

  @ApiProperty({ description: 'Porcentaje de usuarios activos' })
  activePercentage: number;

  @ApiProperty({ description: 'Promedio de registros por día' })
  averageRegistrationsPerDay: number;
}

class AuthAnalyticsTrendPointDto {
  @ApiProperty({ description: 'Fecha (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ description: 'Total de registros en la fecha' })
  count: number;
}

class AuthAnalyticsRegistrationsDto {
  @ApiProperty({ description: 'Total de registros en el período' })
  total: number;

  @ApiProperty({ type: [AuthAnalyticsTrendPointDto] })
  byDate: AuthAnalyticsTrendPointDto[];
}

export class PublicAuthAnalyticsResponseDto {
  @ApiProperty({ type: AuthAnalyticsSummaryDto })
  summary: AuthAnalyticsSummaryDto;

  @ApiProperty({ type: AuthAnalyticsRegistrationsDto })
  registrations: AuthAnalyticsRegistrationsDto;

  static fromApplication(response: AuthAnalyticsResponse): PublicAuthAnalyticsResponseDto {
    const dto = new PublicAuthAnalyticsResponseDto();
    dto.summary = {
      totalUsers: response.summary.totalUsers,
      activeUsers: response.summary.activeUsers,
      inactiveUsers: response.summary.inactiveUsers,
      activePercentage: response.summary.activePercentage,
      averageRegistrationsPerDay: response.summary.averageRegistrationsPerDay,
    };
    dto.registrations = {
      total: response.registrations.total,
      byDate: response.registrations.byDate.map((p) => ({ date: p.date, count: p.count })),
    };
    return dto;
  }
}
