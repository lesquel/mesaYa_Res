import {
  Money,
  PaymentStatus,
  PaymentType,
} from '@features/payment/domain/entities/values';
import { PaymentDto } from '../dtos/output/payment.dto';
import { EntityDTOMapper } from '@shared/application/mappers/abstract-domain-dto.mapper';
import { CreatePaymentDto } from '../dtos';
import { PaymentCreate, PaymentEntity } from '@features/payment/domain';

export class PaymentMapper extends EntityDTOMapper<PaymentEntity, PaymentDto> {
  fromEntitytoDTO(entity: PaymentEntity): PaymentDto {
    return {
      paymentId: entity.paymentId,
      payerId: entity.payerId,
      paymentType: entity.paymentType.type,
      targetId: entity.targetId,
      amount: entity.amount.amount,
      date: entity.date.toISOString(),
      paymentStatus: entity.paymentStatus.status,
    };
  }

  fromDTOtoEntity(dto: PaymentDto): PaymentEntity {
    const paymentType = new PaymentType(dto.paymentType);
    const amount = new Money(dto.amount);
    const date = new Date(dto.date);
    const status = new PaymentStatus(dto.paymentStatus);

    return new PaymentEntity(
      dto.paymentId ?? '',
      dto.payerId,
      paymentType,
      dto.targetId,
      amount,
      date,
      status,
    );
  }

  fromCreatePaymentDTOtoPaymentCreate(dto: CreatePaymentDto): PaymentCreate {
    const paymentType = new PaymentType(dto.paymentType);
    const amount = new Money(dto.amount);
    const status = new PaymentStatus('PENDING');

    return {
      payerId: dto.payerId,
      paymentType,
      targetId: dto.targetId,
      amount,
      paymentStatus: status,
    };
  }

  fromUpdatePaymentStatusDTOtoPaymentUpdate(dto: {
    paymentId: string;
    status: string;
  }) {
    const status = new PaymentStatus(dto.status);

    return {
      paymentId: dto.paymentId,
      status,
    };
  }
}
