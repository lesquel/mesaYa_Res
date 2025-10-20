import type { RestaurantResponseDto } from './restaurant.response.dto.js';

export interface DeleteRestaurantResponseDto {
  ok: boolean;
  restaurant: RestaurantResponseDto;
}
