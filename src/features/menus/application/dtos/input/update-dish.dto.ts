export interface UpdateDishDto {
  dishId: string;
  name?: string;
  description?: string;
  price?: number;
  imageId?: string | null;
}
