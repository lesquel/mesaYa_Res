import { PaginatedQueryParams } from '@shared/application/types/pagination';
import { MoneyVO } from '@shared/domain/entities/values';
import { DishCreate, DishUpdate } from './dish.types';

export interface MenuCreate {
  restaurantId: string;
  name: string;
  description: string;
  price: MoneyVO;
  imageId: string | null;
  dishes?: DishCreate[];
}

export interface MenuUpdate {
  menuId: string;
  name?: string;
  description?: string;
  price?: MoneyVO;
  imageId?: string | null;
  dishes?: DishUpdate[];
}

export interface MenuPaginatedQuery extends PaginatedQueryParams {
  restaurantId?: string;
}
