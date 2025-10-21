import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import type { UpdateSubscriptionStateDto } from '../../application/dtos/input/update-subscription-state.dto';

export class UpdateSubscriptionStateRequestDto
  implements UpdateSubscriptionStateDto
{
  @ApiProperty({
    description: 'Nuevo estado de la suscripción',
    example: 'ACTIVE',
  })
  @IsString()
  stateSubscription: string;

  subscriptionId!: string;
}
