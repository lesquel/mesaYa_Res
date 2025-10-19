export interface DishDto {
  dishId?: string;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  imageId?: number | null;
}
