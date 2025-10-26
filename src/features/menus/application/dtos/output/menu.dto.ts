import { DishDto } from './dish.dto';

export class MenuDto {
  menuId: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  dishes?: DishDto[];
  createdAt: Date;
  updatedAt: Date;
}
