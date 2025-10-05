import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from './entities/section.entity.js';
import { RestaurantOrmEntity } from '../features/restaurants/infrastructure/orm/restaurant.orm-entity.js';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { paginateQueryBuilder } from '../common/pagination/paginate.js';
import { PaginatedResult } from '../shared/core/pagination.js';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurantRepository: Repository<RestaurantOrmEntity>,
  ) {}

  async create(createSectionDto: CreateSectionDto) {
    const { restaurantId, ...rest } = createSectionDto;
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant)
      throw new NotFoundException(`Restaurant ${restaurantId} not found`);

    const section = this.sectionRepository.create({ ...rest, restaurant });
    await this.sectionRepository.save(section);
    return section;
  }

  async findAll(
    pagination: PaginationDto,
    route: string,
  ): Promise<PaginatedResult<Section>> {
    const alias = 'section';
    const qb = this.sectionRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant');

    const sortMap: Record<string, string> = {
      name: `${alias}.name`,
      restaurant: `restaurant.name`,
    };

    const sortByColumn =
      pagination.sortBy && sortMap[pagination.sortBy]
        ? sortMap[pagination.sortBy]
        : undefined;

    return paginateQueryBuilder(qb, {
      ...pagination,
      route,
      sortBy: sortByColumn,
      allowedSorts: Object.values(sortMap),
      searchable: [`${alias}.name`, `${alias}.description`, `restaurant.name`],
    });
  }

  async findOne(id: string) {
    const found = await this.sectionRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });
    if (!found) throw new NotFoundException(`Section ${id} not found`);
    return found;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    const section = await this.findOne(id);
    Object.assign(section, updateSectionDto);
    return this.sectionRepository.save(section);
  }

  async remove(id: string) {
    const { affected } = await this.sectionRepository.delete({ id });
    if (!affected) throw new NotFoundException(`Section ${id} not found`);
    return { ok: true };
  }
}
