import type { MenuCategoryProps } from './menu-category-props.interface';

export interface MenuCategoryRecord extends MenuCategoryProps {
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}
