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

class AuthAnalyticsDistributionItemDto {
  @ApiProperty({ description: 'Etiqueta de agrupación' })
  label: string;

  @ApiProperty({ description: 'Cantidad asociada a la etiqueta' })
  count: number;
}

export class AuthAnalyticsResponseDto {
  @ApiProperty({ type: AuthAnalyticsSummaryDto })
  summary: AuthAnalyticsSummaryDto;

  @ApiProperty({ type: AuthAnalyticsRegistrationsDto })
  registrations: AuthAnalyticsRegistrationsDto;

  @ApiProperty({ type: [AuthAnalyticsDistributionItemDto] })
  roles: AuthAnalyticsDistributionItemDto[];

  @ApiProperty({ type: [AuthAnalyticsDistributionItemDto] })
  permissions: AuthAnalyticsDistributionItemDto[];

  static fromApplication(
    response: AuthAnalyticsResponse,
  ): AuthAnalyticsResponseDto {
    const dto = new AuthAnalyticsResponseDto();
    dto.summary = {
      totalUsers: response.summary.totalUsers,
      activeUsers: response.summary.activeUsers,
      inactiveUsers: response.summary.inactiveUsers,
      activePercentage: response.summary.activePercentage,
      averageRegistrationsPerDay: response.summary.averageRegistrationsPerDay,
    };
    dto.registrations = {
      total: response.registrations.total,
      byDate: response.registrations.byDate.map((point) => ({
        date: point.date,
        count: point.count,
      })),
    };
    dto.roles = response.roles.map((item) => ({
      label: item.label,
      count: item.count,
    }));
    dto.permissions = response.permissions.map((item) => ({
      label: item.label,
      count: item.count,
    }));
    return dto;
  }
}
