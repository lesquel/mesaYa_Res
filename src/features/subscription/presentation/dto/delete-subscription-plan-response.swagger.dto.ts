import { ApiProperty } from '@nestjs/swagger';
import type { DeleteSubscriptionPlanResponseDto } from '../../application/dtos/output/delete-subscription-plan-response.dto.js';

export class DeleteSubscriptionPlanResponseSwaggerDto
  implements DeleteSubscriptionPlanResponseDto
{
  @ApiProperty({
    description: 'Identificador del plan eliminado',
    format: 'uuid',
  })
  subscriptionPlanId: string;
}
