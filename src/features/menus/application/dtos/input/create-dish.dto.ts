export interface CreateDishDto {
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  imageId?: number;
}
