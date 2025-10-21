import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './create-restaurant.dto';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {}

export type UpdateRestaurantCommand = UpdateRestaurantDto & {
  restaurantId: string;
  ownerId: string;
};
