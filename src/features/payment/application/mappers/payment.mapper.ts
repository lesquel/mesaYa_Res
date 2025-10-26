import { EntityDTOMapper } from '@shared/application/mappers/abstract-domain-dto.mapper';
import { MoneyVO } from '@shared/domain/entities/values';
import {
  PaymentEntity,
  PaymentRegistrationRequest,
  PaymentStatusEnum,
  PaymentTargetAmbiguityError,
} from '@features/payment/domain';
import { PaymentStatusVO } from '@features/payment/domain/entities/values';
import { CreatePaymentDto } from '../dtos';
import { PaymentDto } from '../dtos/output/payment.dto';

export class PaymentEntityDTOMapper extends EntityDTOMapper<
  PaymentEntity,
  PaymentDto
> {
  fromEntitytoDTO(entity: PaymentEntity): PaymentDto {
    return {
      paymentId: entity.id,
      reservationId: entity.reservationId,
      subscriptionId: entity.subscriptionId,
      amount: entity.amount.amount,
      date: entity.date.toISOString(),
      paymentStatus: entity.paymentStatus.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  fromDTOtoEntity(dto: PaymentDto): PaymentEntity {
    const amount = new MoneyVO(dto.amount);
    const date = new Date(dto.date);
    const status = PaymentStatusVO.create(dto.paymentStatus);

    return PaymentEntity.create(dto.paymentId ?? '', {
      amount,
      date,
      paymentStatus: status,
      reservationId: dto.reservationId,
      subscriptionId: dto.subscriptionId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }

  toRegistrationRequest(dto: CreatePaymentDto): PaymentRegistrationRequest {
    const target = this.mapTarget(dto);
    const amount = new MoneyVO(dto.amount);
    const expectedTotalValue = dto.expectedTotal ?? dto.amount;
    const expectedTotal = new MoneyVO(expectedTotalValue);

    return {
      target,
      amount,
      expectedTotal,
      allowPartialPayments: dto.allowPartialPayments ?? false,
      occurredAt: new Date(),
    };
  }

  fromUpdatePaymentStatusDTOtoPaymentUpdate(dto: {
    paymentId: string;
    status: PaymentStatusEnum;
  }) {
    const status = PaymentStatusVO.create(dto.status);

    return {
      paymentId: dto.paymentId,
      status,
    };
  }

  private mapTarget(
    dto: CreatePaymentDto,
  ): PaymentRegistrationRequest['target'] {
    const hasReservation = Boolean(dto.reservationId);
    const hasSubscription = Boolean(dto.subscriptionId);

    if (hasReservation === hasSubscription) {
      throw new PaymentTargetAmbiguityError();
    }

    if (hasReservation && dto.reservationId) {
      return {
        type: 'RESERVATION',
        id: dto.reservationId,
      };
    }

    if (dto.subscriptionId) {
      return {
        type: 'SUBSCRIPTION',
        id: dto.subscriptionId,
      };
    }

    throw new PaymentTargetAmbiguityError();
  }
}
