import {
  Money,
  PaymentStatus,
  PaymentType,
} from '@features/payment/domain/entities/values';
import { PaymentEntity } from '../../domain/entities/paymentEntity';
import { PaymentDto } from '../dtos/output/payment.dto';
import { DomainDTOMapper } from '@shared/application/mappers/abstract-domain-dto.mapper';

export class PaymentMapper extends DomainDTOMapper<PaymentEntity, PaymentDto> {
  toDTO(entity: PaymentEntity): PaymentDto {
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

  toDomain(dto: PaymentDto): PaymentEntity {
    const paymentType = new PaymentType(dto.paymentType);
    const amount = new Money(dto.amount);
    const date = new Date(dto.date);
    const status = new PaymentStatus(dto.paymentStatus);

    return new PaymentEntity(
      dto.paymentId,
      dto.payerId,
      paymentType,
      dto.targetId,
      amount,
      date,
      status,
    );
  }
}
