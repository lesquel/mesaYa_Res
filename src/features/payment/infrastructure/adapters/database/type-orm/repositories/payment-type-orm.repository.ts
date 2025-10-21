import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  IPaymentRepositoryPort,
  PaymentEntity,
  PaymentCreate,
  PaymentUpdate,
  PaymentCreationFailedError,
} from '@features/payment/domain';
import {
  PaymentOrmMapperPort,
  PAYMENT_ORM_MAPPER,
} from '@features/payment/application';
import { PaymentOrmEntity } from '../orm/payment.type-orm.entity';

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
}
