import { PaymentEntity } from '@features/payment/domain';
import { OrmMapperPort } from '@shared/application/ports/mappers/orm-mapper.port';

export const PAYMENT_ORM_MAPPER = Symbol('PAYMENT_ORM_MAPPER');

export abstract class PaymentOrmMapperPort<ORM = unknown> extends OrmMapperPort<
  PaymentEntity,
  ORM
> {}
