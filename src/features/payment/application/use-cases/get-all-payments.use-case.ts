import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import type { PaginatedResult } from '@shared/application/types/pagination';

import { UseCase } from '@shared/application/ports/use-case.port';
import { IPaymentRepositoryPort } from '@features/payment/domain';
import { PaymentEntityDTOMapper } from '../mappers';
import { PaymentDto } from '../dtos/output/payment.dto';

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

    const query = {
      pagination: params.pagination,
      route: params.route,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      search: params.search,
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
}
