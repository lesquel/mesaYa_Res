import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import {
  IPaymentRepositoryPort,
  PaymentEntity,
  PaymentCreate,
  PaymentUpdate,
  PaymentCreationFailedError,
} from '@features/payment/domain';
import { PaymentOrmMapperPort } from '@features/payment/application';
import { PAYMENT_ORM_MAPPER } from '@features/payment/payment.tokens';
import { PaymentOrmEntity } from '../orm/payment.type-orm.entity';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate';
import { PaginatedResult } from '@shared/application/types/pagination';
import { ListPaymentsQuery } from '@features/payment/application/dtos/input/list-payments.query';

@Injectable()
export class PaymentTypeOrmRepository extends IPaymentRepositoryPort {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly payments: Repository<PaymentOrmEntity>,
    @Inject(PAYMENT_ORM_MAPPER)
    private readonly mapper: PaymentOrmMapperPort<PaymentOrmEntity>,
  ) {
    super();
  }

  async create(data: PaymentCreate): Promise<PaymentEntity> {
    if (!data.reservationId && !data.subscriptionId) {
      throw new PaymentCreationFailedError(
        'Payment must be associated with a reservation or subscription',
      );
    }

    const entity = new PaymentOrmEntity();
    entity.reservationId = data.reservationId ?? undefined;
    entity.subscriptionId = data.subscriptionId ?? undefined;
    entity.amount = data.amount.amount;
    entity.paymentStatus = data.paymentStatus.status;

    const saved = await this.payments.save(entity);
    return this.mapper.toDomain(saved);
  }

  async update(data: PaymentUpdate): Promise<PaymentEntity | null> {
    const entity = await this.payments.findOne({
      where: { id: data.paymentId },
    });

    if (!entity) {
      return null;
    }

    entity.paymentStatus = data.status.status;
    const saved = await this.payments.save(entity);
    return this.mapper.toDomain(saved);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const entity = await this.payments.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<PaymentEntity[]> {
    const entities = await this.payments.find();
    return this.mapper.toDomainList(entities);
  }

  async paginate(
    query: ListPaymentsQuery,
  ): Promise<PaginatedResult<PaymentEntity>> {
    const qb = this.buildBaseQuery();
    return this.executePagination(qb, query);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.payments.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  async findByReservationId(reservationId: string): Promise<PaymentEntity[]> {
    const entities = await this.payments.find({ where: { reservationId } });
    return this.mapper.toDomainList(entities);
  }

  async findBySubscriptionId(subscriptionId: string): Promise<PaymentEntity[]> {
    const entities = await this.payments.find({ where: { subscriptionId } });
    return this.mapper.toDomainList(entities);
  }

  private buildBaseQuery(): SelectQueryBuilder<PaymentOrmEntity> {
    const alias = 'payment';
    return this.payments.createQueryBuilder(alias);
  }

  private async executePagination(
    qb: SelectQueryBuilder<PaymentOrmEntity>,
    query: ListPaymentsQuery,
  ): Promise<PaginatedResult<PaymentEntity>> {
    const alias = qb.alias;

    const sortMap: Record<string, string> = {
      amount: `${alias}.amount`,
      paymentStatus: `${alias}.paymentStatus`,
      createdAt: `${alias}.createdAt`,
    };

    const sortByColumn =
      query.sortBy && sortMap[query.sortBy] ? sortMap[query.sortBy] : undefined;

    const paginationResult = await paginateQueryBuilder(qb, {
      ...query.pagination,
      route: query.route,
      sortBy: sortByColumn,
      sortOrder: query.sortOrder,
      q: query.search,
      allowedSorts: Object.values(sortMap),
      searchable: [`${alias}.paymentStatus`, `${alias}.amount`],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((entity) =>
        this.mapper.toDomain(entity),
      ),
    };
  }
}
