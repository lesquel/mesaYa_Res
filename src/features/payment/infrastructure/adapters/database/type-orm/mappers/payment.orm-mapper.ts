import { Injectable } from '@nestjs/common';

import { PaymentEntity } from '@features/payment/domain';
import { PaymentStatusVO } from '@features/payment/domain/entities/values';
import { PaymentOrmMapperPort } from '@features/payment/application';
import { OrmMapperPort } from '@shared/application/ports/mappers/orm-mapper.port';
import { MoneyVO } from '@shared/domain/entities/values';

import { PaymentOrmEntity } from '../orm/payment.type-orm.entity';

@Injectable()
export class PaymentOrmMapper
  extends OrmMapperPort<PaymentEntity, PaymentOrmEntity>
  implements PaymentOrmMapperPort<PaymentOrmEntity>
{
  toDomain(entity: PaymentOrmEntity): PaymentEntity {
    return PaymentEntity.rehydrate({
      paymentId: entity.id,
      reservationId: entity.reservationId ?? undefined,
      subscriptionId: entity.subscriptionId ?? undefined,
      amount: new MoneyVO(Number(entity.amount)),
      date: entity.createdAt,
      paymentStatus: PaymentStatusVO.create(entity.paymentStatus),
    });
  }

  toOrm(domain: PaymentEntity): PaymentOrmEntity {
    const snapshot = domain.snapshot();

    const ormEntity = new PaymentOrmEntity();
    ormEntity.id = snapshot.paymentId;
    ormEntity.reservationId = snapshot.reservationId ?? undefined;
    ormEntity.subscriptionId = snapshot.subscriptionId ?? undefined;
    ormEntity.amount = snapshot.amount.amount;
    ormEntity.paymentStatus = snapshot.paymentStatus.status;
    ormEntity.createdAt = snapshot.date;
    ormEntity.updatedAt = snapshot.date;

    return ormEntity;
  }
}
