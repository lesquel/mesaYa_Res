import { Injectable } from '@nestjs/common';

import { IPaymentRepositoryPort } from '@features/payment/application/ports/repositories';

@Injectable()
export class PaymentTypeOrmRepository extends IPaymentRepositoryPort {

  
}
