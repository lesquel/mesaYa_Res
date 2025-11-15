export interface DishDto {
  dishId?: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageId?: string | null;
  menuId?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryDescription?: string | null;
  categoryOrder?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
