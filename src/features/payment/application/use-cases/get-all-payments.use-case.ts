import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import type { PaginatedResult } from '@shared/application/types/pagination';

import { UseCase } from '@shared/application/ports/use-case.port';
import {
  IPaymentRepositoryPort,
  PaymentStatusEnum,
  PaymentTypeEnum,
} from '@features/payment/domain';
import { PaymentEntityDTOMapper } from '../mappers';
import { PaymentDto } from '../dtos/output/payment.dto';
import { ListPaymentsQuery } from '../dtos/input/list-payments.query';

export type PaginatedPaymentResponse = PaginatedResult<PaymentDto>;

export class GetAllPaymentsUseCase
  implements UseCase<PaginatedQueryParams, PaginatedPaymentResponse>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly paymentRepository: IPaymentRepositoryPort,
    private readonly paymentMapper: PaymentEntityDTOMapper,
  ) {}

  async execute(
    params: PaginatedQueryParams,
  ): Promise<PaginatedPaymentResponse> {
    this.logger.log(
      'Fetching payments with pagination',
      'GetAllPaymentsUseCase',
    );

    const filters = this.extractFilters(params.filters);

    const query = {
      pagination: params.pagination,
      route: params.route,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      search: params.search,
      ...filters,
    };

    const paginatedResult = await this.paymentRepository.paginate(query);

    this.logger.log(
      `Fetched ${paginatedResult.results.length} payment(s) from ${paginatedResult.total} total`,
      'GetAllPaymentsUseCase',
    );

    return {
      ...paginatedResult,
      results: paginatedResult.results.map((entity) =>
        this.paymentMapper.fromEntitytoDTO(entity),
      ),
    };
  }

  private extractFilters(
    rawFilters?: Record<string, string>,
  ): Partial<ListPaymentsQuery> {
    if (!rawFilters || Object.keys(rawFilters).length === 0) {
      return {};
    }

    const normalizedEntries = Object.entries(rawFilters).map(
      ([key, value]): [string, string] => [key.toLowerCase(), value],
    );

    const toReturn: Partial<ListPaymentsQuery> = {};

    const lookup = new Map<string, string>(normalizedEntries);

    const status = this.parseStatus(lookup.get('status'));
    if (status) {
      toReturn.status = status;
    }

    const type = this.parseType(lookup.get('type'));
    if (type) {
      toReturn.type = type;
    }

    const reservationId = this.normalizeString(lookup.get('reservationid'));
    if (reservationId) {
      toReturn.reservationId = reservationId;
    }

    const restaurantId = this.normalizeString(lookup.get('restaurantid'));
    if (restaurantId) {
      toReturn.restaurantId = restaurantId;
    }

    const startDate = this.parseDate(lookup.get('startdate'), false);
    if (startDate) {
      toReturn.startDate = startDate;
    }

    const endDate = this.parseDate(lookup.get('enddate'), true);
    if (endDate) {
      toReturn.endDate = endDate;
    }

    const minAmount = this.parseNumber(lookup.get('minamount'));
    if (typeof minAmount === 'number') {
      toReturn.minAmount = minAmount;
    }

    const maxAmount = this.parseNumber(lookup.get('maxamount'));
    if (typeof maxAmount === 'number') {
      toReturn.maxAmount = maxAmount;
    }

    return toReturn;
  }

  private parseStatus(value?: string): PaymentStatusEnum | undefined {
    if (!value) {
      return undefined;
    }
    const normalized = value.trim().toUpperCase();
    return (Object.values(PaymentStatusEnum) as string[]).includes(normalized)
      ? (normalized as PaymentStatusEnum)
      : undefined;
  }

  private parseType(value?: string): PaymentTypeEnum | undefined {
    if (!value) {
      return undefined;
    }
    const normalized = value.trim().toUpperCase();
    return (Object.values(PaymentTypeEnum) as string[]).includes(normalized)
      ? (normalized as PaymentTypeEnum)
      : undefined;
  }

  private parseDate(
    value: string | undefined,
    endOfDay: boolean,
  ): Date | undefined {
    if (!value) {
      return undefined;
    }

    const normalized = value.trim();
    if (!normalized) {
      return undefined;
    }

    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }

    if (!normalized.includes('T')) {
      if (endOfDay) {
        parsed.setHours(23, 59, 59, 999);
      } else {
        parsed.setHours(0, 0, 0, 0);
      }
    }

    return parsed;
  }

  private parseNumber(value?: string): number | undefined {
    if (!value) {
      return undefined;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  private normalizeString(value?: string): string | undefined {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }
}
