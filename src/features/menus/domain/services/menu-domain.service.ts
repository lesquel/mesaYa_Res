import { PaginatedResult } from '@shared/application/types';
import { IMenuRepositoryPort } from '../repositories/menu-repository.port';
import { MenuEntity } from '../entities/menu.entity';
import { MenuCreate, MenuUpdate, MenuPaginatedQuery } from '../types';
import {
  MenuNotFoundError,
  MenuCreationFailedError,
  MenuUpdateFailedError,
  MenuDeletionFailedError,
} from '../errors';

export class MenuDomainService {
  constructor(private readonly menuRepository: IMenuRepositoryPort) {}

  async createMenu(data: MenuCreate): Promise<MenuEntity> {
    const menu = await this.menuRepository.create(data);

    if (!menu) {
      throw new MenuCreationFailedError('Repository returned null', {
        restaurantId: data.restaurantId,
      });
    }

    return menu;
  }

  async updateMenu(data: MenuUpdate): Promise<MenuEntity> {
    const updated = await this.menuRepository.update(data);

    if (!updated) {
      throw new MenuUpdateFailedError(data.menuId, 'Repository returned null');
    }

    return updated;
  }

  async findMenuById(menuId: string): Promise<MenuEntity> {
    const menu = await this.menuRepository.findById(menuId);

    if (!menu) {
      throw new MenuNotFoundError(menuId);
    }

    return menu;
  }

  async findAllMenus(): Promise<MenuEntity[]> {
    return this.menuRepository.findAll();
  }

  async paginateMenus(
    query: MenuPaginatedQuery,
  ): Promise<PaginatedResult<MenuEntity>> {
    return this.menuRepository.paginate(query);
  }

  async deleteMenu(menuId: string): Promise<void> {
    const deleted = await this.menuRepository.delete(menuId);

    if (!deleted) {
      throw new MenuDeletionFailedError(menuId, 'Repository returned false');
    }
  }
}
