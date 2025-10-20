import { DishDto } from './dish.dto';

export interface MenuDto {
  menuId?: string;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  dishes?: DishDto[];
}
