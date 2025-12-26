import type { MenuProps } from './menu-props.interface';

export interface MenuSnapshot extends MenuProps {
  menuId: string;
  createdAt: Date;
  updatedAt: Date;
}
