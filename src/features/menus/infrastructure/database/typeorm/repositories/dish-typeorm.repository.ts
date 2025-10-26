import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDishRepositoryPort,
  DishEntity,
  DishCreate,
  DishUpdate,
} from '@features/menus/domain';
import { DishOrmEntity } from '../orm';
import { DishOrmMapper } from '../mappers';

@Injectable()
export class DishTypeOrmRepository extends IDishRepositoryPort {
  constructor(
    @InjectRepository(DishOrmEntity)
    private readonly dishes: Repository<DishOrmEntity>,
  ) {
    super();
  }

  async create(data: DishCreate): Promise<DishEntity> {
    const entity = DishOrmMapper.fromCreate(data, data.menuId);
    const saved = await this.dishes.save(entity);
    return DishOrmMapper.toDomain(saved);
  }

  async update(data: DishUpdate): Promise<DishEntity | null> {
    const entity = await this.dishes.findOne({ where: { id: data.dishId } });

    if (!entity) {
      return null;
    }

    const updated = DishOrmMapper.applyUpdate(entity, data);
    const saved = await this.dishes.save(updated);
    return DishOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<DishEntity | null> {
    const entity = await this.dishes.findOne({ where: { id } });
    return entity ? DishOrmMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<DishEntity[]> {
    const entities = await this.dishes.find();
    return entities.map((dish) => DishOrmMapper.toDomain(dish));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dishes.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
