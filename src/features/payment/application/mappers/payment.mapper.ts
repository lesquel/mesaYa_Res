import { PaymentStatusVO } from '@features/payment/domain/entities/values';
import { PaymentDto } from '../dtos/output/payment.dto';
import { EntityDTOMapper } from '@shared/application/mappers/abstract-domain-dto.mapper';
import { CreatePaymentDto } from '../dtos';
import { PaymentCreate, PaymentEntity } from '@features/payment/domain';
import { MoneyVO } from '@shared/domain/entities/values';

export class PaymentMapper extends EntityDTOMapper<PaymentEntity, PaymentDto> {
  fromEntitytoDTO(entity: PaymentEntity): PaymentDto {
    return {
      paymentId: entity.id,
      reservationId: entity.reservationId,
      subscriptionId: entity.subscriptionId,
      amount: entity.amount.amount,
      date: entity.date.toISOString(),
      paymentStatus: entity.paymentStatus.status,
    };
  }

  fromDTOtoEntity(dto: PaymentDto): PaymentEntity {
    const amount = new MoneyVO(dto.amount);
    const date = new Date(dto.date);
    const status = new PaymentStatusVO(dto.paymentStatus);

    return PaymentEntity.create(dto.paymentId ?? '', {
      amount,
      date,
      paymentStatus: status,
      reservationId: dto.reservationId,
      subscriptionId: dto.subscriptionId,
    });
  }

  fromCreatePaymentDTOtoPaymentCreate(dto: CreatePaymentDto): PaymentCreate {
    const amount = new MoneyVO(dto.amount);
    const status = new PaymentStatusVO('PENDING');

    return {
      reservationId: dto.reservationId,
      subscriptionId: dto.subscriptionId,
      amount,
      paymentStatus: status,
    };
  }

  fromUpdatePaymentStatusDTOtoPaymentUpdate(dto: {
    paymentId: string;
    status: string;
  }) {
    const status = new PaymentStatusVO(dto.status);

    return {
      paymentId: dto.paymentId,
      status,
    };
  }
}
