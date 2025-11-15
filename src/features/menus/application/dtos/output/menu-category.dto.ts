import { DishDto } from './dish.dto';

export interface MenuCategoryDto {
  categoryId: string;
  menuId: string;
  name: string;
  description?: string | null;
  order: number;
  dishes: DishDto[];
  createdAt: Date;
  updatedAt: Date;
}
