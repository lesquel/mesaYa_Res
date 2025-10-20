import type { RestaurantResponseDto } from './restaurant.response.dto';

export interface DeleteRestaurantResponseDto {
  ok: boolean;
  restaurant: RestaurantResponseDto;
}
