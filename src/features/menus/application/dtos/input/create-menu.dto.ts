import { CreateDishDto } from './create-dish.dto';

export interface CreateMenuDto {
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageId?: string | null;
  dishes?: CreateDishDto[];
}
