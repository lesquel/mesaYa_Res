import { PaymentEntity } from '../../domain/entities/paymentEntity';
import { PaymentDto } from '../dtos/output/payment.dto';

export class PaymentMapper {
  static toDto(entity: PaymentEntity): PaymentDto {
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

  static toDtoList(entities: PaymentEntity[]): PaymentDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
