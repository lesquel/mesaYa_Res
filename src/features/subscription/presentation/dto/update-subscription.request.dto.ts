import { PartialType } from '@nestjs/mapped-types';
import type { UpdateSubscriptionDto } from '../../application/dtos/input/update-subscription.dto';
import { CreateSubscriptionRequestDto } from './create-subscription.request.dto';

export class UpdateSubscriptionRequestDto
  extends PartialType(CreateSubscriptionRequestDto)
  implements UpdateSubscriptionDto
{
  subscriptionId!: string;
}
