import { DishDto } from './dish.dto';
import { MenuCategoryDto } from './menu-category.dto';

export class MenuDto {
  menuId: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageId: string | null;
  dishes?: DishDto[];
  categories?: MenuCategoryDto[];
  createdAt: Date;
  updatedAt: Date;
}
