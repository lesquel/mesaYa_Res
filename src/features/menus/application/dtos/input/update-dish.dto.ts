export interface UpdateDishDto {
  dishId: string;
  name?: string;
  description?: string;
  price?: number;
  imageId?: string | null;
  menuId?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryDescription?: string | null;
  categoryOrder?: number | null;
}
