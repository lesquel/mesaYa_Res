import { ApiProperty } from '@nestjs/swagger';
import type { DeletePaymentResponseDto } from '../../application/dtos/output/delete-payment-response.dto.js';

export class DeletePaymentResponseSwaggerDto
  implements DeletePaymentResponseDto
{
  @ApiProperty({
    description: 'Identificador del pago eliminado',
    format: 'uuid',
  })
  paymentId: string;
}
