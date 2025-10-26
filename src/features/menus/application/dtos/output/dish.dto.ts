export interface DishDto {
  dishId?: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageId?: string | null;
  menuId?: string | null;
}
