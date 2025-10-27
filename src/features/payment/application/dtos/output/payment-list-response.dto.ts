import { PaginatedResult } from '@shared/application/types/pagination';
import { PaymentDto } from './payment.dto';

export type PaymentListResponseDto = PaginatedResult<PaymentDto>;
