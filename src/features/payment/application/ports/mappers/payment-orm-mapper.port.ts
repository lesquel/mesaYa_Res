import { PaymentEntity } from '@features/payment/domain';
import { OrmMapperPort } from '@shared/application/ports/mappers/orm-mapper.port';

export abstract class PaymentOrmMapperPort<ORM = unknown> extends OrmMapperPort<
  PaymentEntity,
  ORM
> {}
