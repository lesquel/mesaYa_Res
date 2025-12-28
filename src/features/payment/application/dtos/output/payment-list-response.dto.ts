import { PaginatedResult } from '@shared/application/types';
import { PaymentDto } from './payment.dto';

export type PaymentListResponseDto = PaginatedResult<PaymentDto>;
