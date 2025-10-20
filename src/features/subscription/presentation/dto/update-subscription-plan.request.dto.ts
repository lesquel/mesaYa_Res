import { PartialType } from '@nestjs/mapped-types';
import type { UpdateSubscriptionPlanDto } from '../../application/dtos/input/update-subscription-plan.dto.js';
import { CreateSubscriptionPlanRequestDto } from './create-subscription-plan.request.dto.js';

export class UpdateSubscriptionPlanRequestDto
  extends PartialType(CreateSubscriptionPlanRequestDto)
  implements UpdateSubscriptionPlanDto
{
  subscriptionPlanId!: string;
}
