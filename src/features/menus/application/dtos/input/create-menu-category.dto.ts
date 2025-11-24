export interface CreateMenuCategoryDto {
  restaurantId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  position?: number | null;
  isActive?: boolean;
}
