import { CreateDishDto } from './create-dish.dto';

export interface CreateMenuDto {
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  dishes?: CreateDishDto[];
}
