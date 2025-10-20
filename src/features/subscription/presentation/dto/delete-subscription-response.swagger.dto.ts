import { ApiProperty } from '@nestjs/swagger';
import type { DeleteSubscriptionResponseDto } from '../../application/dtos/output/delete-subscription-response.dto.js';

export class DeleteSubscriptionResponseSwaggerDto
  implements DeleteSubscriptionResponseDto
{
  @ApiProperty({
    description: 'Identificador de la suscripción eliminada',
    format: 'uuid',
  })
  subscriptionId: string;
}
