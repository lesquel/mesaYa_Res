import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMenuCategoryRepositoryPort } from '@features/menus/domain';
import { MenuCategoryCreate, MenuCategoryEntity, MenuCategoryUpdate } from '@features/menus/domain';
import { MenuCategoryOrmEntity } from '../orm';
import { MenuCategoryOrmMapper } from '../mappers';

@Injectable()
export class MenuCategoryTypeOrmRepository extends IMenuCategoryRepositoryPort {
  constructor(
    @InjectRepository(MenuCategoryOrmEntity)
    private readonly categories: Repository<MenuCategoryOrmEntity>,
  ) {
    super();
  }

  async create(data: MenuCategoryCreate): Promise<MenuCategoryEntity> {
    const entity = MenuCategoryOrmMapper.fromCreate(data);
    const saved = await this.categories.save(entity);
    return MenuCategoryOrmMapper.toDomain(saved);
  }

  async update(data: MenuCategoryUpdate): Promise<MenuCategoryEntity | null> {
    const category = await this.categories.findOne({ where: { id: data.categoryId } });

    if (!category) {
      return null;
    }

    const updated = MenuCategoryOrmMapper.applyUpdate(category, data);
    const saved = await this.categories.save(updated);
    return MenuCategoryOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<MenuCategoryEntity | null> {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) {
      return null;
    }
    return MenuCategoryOrmMapper.toDomain(category);
  }

  async findAll(): Promise<MenuCategoryEntity[]> {
    const categories = await this.categories.find();
    return categories.map((category) => MenuCategoryOrmMapper.toDomain(category));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.categories.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  async findByRestaurant(restaurantId: string): Promise<MenuCategoryEntity[]> {
    const categories = await this.categories.find({
      where: { restaurantId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
    return categories.map((category) => MenuCategoryOrmMapper.toDomain(category));
  }
}