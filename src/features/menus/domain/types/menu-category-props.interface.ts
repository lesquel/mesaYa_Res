export interface MenuCategoryProps {
  restaurantId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  position?: number | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
