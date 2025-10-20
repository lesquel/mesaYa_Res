import { PartialType } from '@nestjs/mapped-types';
import type { UpdateSubscriptionDto } from '../../application/dtos/input/update-subscription.dto.js';
import { CreateSubscriptionRequestDto } from './create-subscription.request.dto.js';

export class UpdateSubscriptionRequestDto
  extends PartialType(CreateSubscriptionRequestDto)
  implements UpdateSubscriptionDto
{
  subscriptionId!: string;
}
