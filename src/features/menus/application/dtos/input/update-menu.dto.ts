import { UpdateDishDto } from './update-dish.dto';

export interface UpdateMenuDto {
  menuId: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  dishes?: UpdateDishDto[];
}
