import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import type { PaymentEntity } from '@features/payment/domain';

import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentDomainService } from '@features/payment/domain';
import { PaymentEntityDTOMapper } from '../mappers';
import { PaymentDto } from '../dtos/output/payment.dto';

export class GetAllPaymentsUseCase
  implements UseCase<PaginatedQueryParams | undefined, PaymentDto[]>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly paymentMapper: PaymentEntityDTOMapper,
  ) {}

  async execute(params?: PaginatedQueryParams): Promise<PaymentDto[]> {
    this.logger.log(
      'Fetching all payments from repository',
      'GetAllPaymentsUseCase',
    );

    const paymentEntities = await this.paymentDomainService.findAllPayments();

    const filtered = this.applySearch(paymentEntities, params?.search);
    const sorted = this.applySorting(
      filtered,
      params?.sortBy,
      params?.sortOrder,
    );
    const paginated = this.applyPagination(sorted, params);

    this.logger.log(
      `Successfully fetched ${paginated.length} payment(s)`,
      'GetAllPaymentsUseCase',
    );

    return paginated.map((entity) =>
      this.paymentMapper.fromEntitytoDTO(entity),
    );
  }

  private applySearch(
    payments: PaymentEntity[],
    search?: string,
  ): PaymentEntity[] {
    if (!search) {
      return payments;
    }

    const term = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const snapshot = payment.snapshot();
      return [
        snapshot.paymentId,
        snapshot.reservationId ?? '',
        snapshot.subscriptionId ?? '',
        snapshot.paymentStatus.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }

  private applySorting(
    payments: PaymentEntity[],
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' | undefined = 'DESC',
  ): PaymentEntity[] {
    const direction = sortOrder === 'ASC' ? 1 : -1;
    const normalized = sortBy?.toLowerCase();

    const comparator = (a: PaymentEntity, b: PaymentEntity) => {
      switch (normalized) {
        case 'amount':
          return (a.amount.amount - b.amount.amount) * direction;
        case 'status':
        case 'paymentstatus':
          return (
            a.paymentStatus.status.localeCompare(b.paymentStatus.status) *
            direction
          );
        case 'reservationid':
          return (
            (a.reservationId ?? '').localeCompare(b.reservationId ?? '') *
            direction
          );
        case 'subscriptionid':
          return (
            (a.subscriptionId ?? '').localeCompare(b.subscriptionId ?? '') *
            direction
          );
        case 'date':
        case 'createdat':
        default:
          return (a.date.getTime() - b.date.getTime()) * direction;
      }
    };

    return [...payments].sort(comparator);
  }

  private applyPagination(
    payments: PaymentEntity[],
    params?: PaginatedQueryParams,
  ): PaymentEntity[] {
    if (!params?.pagination) {
      return payments;
    }

    const limit = params.pagination.limit ?? payments.length;
    const offset =
      params.pagination.offset ??
      ((params.pagination.page ?? 1) - 1) *
        (params.pagination.limit ?? payments.length);

    if (limit <= 0) {
      return payments;
    }

    return payments.slice(offset, offset + limit);
  }
}
