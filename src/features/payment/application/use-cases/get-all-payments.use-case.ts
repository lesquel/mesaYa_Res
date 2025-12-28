import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types';
import type { PaginatedResult } from '@shared/application/types';
import {
  parseOptionalNumber,
  normalizeOptionalString,
  parseOptionalDate,
  parseEnumValue,
} from '@shared/application/utils';

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

    const normalizedEntries: [string, string][] = Object.entries(
      rawFilters,
    ).map(([key, value]) => [key.toLowerCase(), value]);

    const toReturn: Partial<ListPaymentsQuery> = {};

    const lookup = new Map<string, string>(normalizedEntries);

    const status = parseEnumValue(lookup.get('status'), PaymentStatusEnum);
    if (status) {
      toReturn.status = status;
    }

    const type = parseEnumValue(lookup.get('type'), PaymentTypeEnum);
    if (type) {
      toReturn.type = type;
    }

    const reservationId = normalizeOptionalString(lookup.get('reservationid'));
    if (reservationId) {
      toReturn.reservationId = reservationId;
    }

    const restaurantId = normalizeOptionalString(lookup.get('restaurantid'));
    if (restaurantId) {
      toReturn.restaurantId = restaurantId;
    }

    const startDate = parseOptionalDate(lookup.get('startdate'), false);
    if (startDate) {
      toReturn.startDate = startDate;
    }

    const endDate = parseOptionalDate(lookup.get('enddate'), true);
    if (endDate) {
      toReturn.endDate = endDate;
    }

    const minAmount = parseOptionalNumber(lookup.get('minamount'));
    if (typeof minAmount === 'number') {
      toReturn.minAmount = minAmount;
    }

    const maxAmount = parseOptionalNumber(lookup.get('maxamount'));
    if (typeof maxAmount === 'number') {
      toReturn.maxAmount = maxAmount;
    }

    return toReturn;
  }
}
