import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import {
  IPaymentRepositoryPort,
  PaymentEntity,
  PaymentCreate,
  PaymentUpdate,
  PaymentCreationFailedError,
  PaymentTypeEnum,
} from '@features/payment/domain';
import { PaymentOrmMapperPort } from '@features/payment/application';
import { PAYMENT_ORM_MAPPER } from '@features/payment/payment.tokens';
import { PaymentOrmEntity } from '../orm/payment.type-orm.entity';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination';
import { PaginatedResult } from '@shared/application/types';
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
    console.log(`[PaymentTypeOrmRepository] Looking for payment with id: ${data.paymentId}`);

    const entity = await this.payments.findOne({
      where: { id: data.paymentId },
    });

    console.log(`[PaymentTypeOrmRepository] Found entity:`, entity ? `yes (id=${entity.id})` : 'no');

    if (!entity) {
      // Try to list all payments to debug
      const allPayments = await this.payments.find({ take: 5 });
      console.log(`[PaymentTypeOrmRepository] Sample payments in DB:`, allPayments.map(p => p.id));
      return null;
    }

    entity.paymentStatus = data.status.status;
    const saved = await this.payments.save(entity);
    return this.mapper.toDomain(saved);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    console.log(`[PaymentTypeOrmRepository] findById: ${id}`);

    // Try standard TypeORM query
    const entity = await this.payments.findOne({ where: { id } });
    console.log(`[PaymentTypeOrmRepository] findById result:`, entity ? 'found' : 'not found');

    if (!entity) {
      // Debug: Try raw query to check if it's a TypeORM issue
      const rawResult = await this.payments.query(
        `SELECT payment_id, payment_status FROM payments WHERE payment_id = $1`,
        [id]
      );
      console.log(`[PaymentTypeOrmRepository] Raw SQL result for ${id}:`, rawResult);

      // Also list sample payments
      const allPayments = await this.payments.find({ take: 5 });
      console.log(`[PaymentTypeOrmRepository] Sample payments in DB (first 5):`,
        allPayments.length > 0
          ? allPayments.map(p => ({ id: p.id, status: p.paymentStatus }))
          : 'NO PAYMENTS FOUND IN TABLE'
      );

      const count = await this.payments.count();
      console.log(`[PaymentTypeOrmRepository] Total payments count in table: ${count}`);
    }

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
    this.applyFilters(qb, query);
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

  async findByRestaurantId(restaurantId: string): Promise<PaymentEntity[]> {
    const entities = await this.payments
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.reservation', 'reservation')
      .leftJoinAndSelect('payment.subscription', 'subscription')
      .leftJoin('reservation.restaurant', 'reservationRestaurant')
      .leftJoin('subscription.restaurant', 'subscriptionRestaurant')
      .where(
        'reservationRestaurant.id = :restaurantId OR subscriptionRestaurant.id = :restaurantId',
        { restaurantId },
      )
      .getMany();

    return this.mapper.toDomainList(entities);
  }

  private buildBaseQuery(): SelectQueryBuilder<PaymentOrmEntity> {
    const alias = 'payment';
    return this.payments
      .createQueryBuilder(alias)
      .leftJoinAndSelect('payment.reservation', 'reservation')
      .leftJoinAndSelect('payment.subscription', 'subscription');
  }

  private applyFilters(
    qb: SelectQueryBuilder<PaymentOrmEntity>,
    query: ListPaymentsQuery,
  ): void {
    const alias = qb.alias;

    if (query.status) {
      qb.andWhere(`${alias}.paymentStatus = :status`, {
        status: query.status,
      });
    }

    if (query.type === PaymentTypeEnum.RESERVATION) {
      qb.andWhere(`${alias}.reservationId IS NOT NULL`);
    } else if (query.type === PaymentTypeEnum.SUBSCRIPTION) {
      qb.andWhere(`${alias}.subscriptionId IS NOT NULL`);
    }

    if (query.reservationId) {
      qb.andWhere(`${alias}.reservationId = :reservationId`, {
        reservationId: query.reservationId,
      });
    }

    if (query.restaurantId) {
      qb.andWhere(
        '(reservation.restaurantId = :restaurantId OR subscription.restaurantId = :restaurantId)',
        { restaurantId: query.restaurantId },
      );
    }

    if (query.startDate) {
      qb.andWhere(`${alias}.createdAt >= :startDate`, {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere(`${alias}.createdAt <= :endDate`, {
        endDate: query.endDate,
      });
    }

    if (typeof query.minAmount === 'number') {
      qb.andWhere(`${alias}.amount >= :minAmount`, {
        minAmount: query.minAmount,
      });
    }

    if (typeof query.maxAmount === 'number') {
      qb.andWhere(`${alias}.amount <= :maxAmount`, {
        maxAmount: query.maxAmount,
      });
    }
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
      date: `${alias}.createdAt`,
      status: `${alias}.paymentStatus`,
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
