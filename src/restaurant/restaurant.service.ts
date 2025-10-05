import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity.js';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  PaginatedResult,
  paginateQueryBuilder,
} from '../common/pagination/paginate';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto, ownerId: string) {
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException(`User ${ownerId} not found`);
    const restaurant = this.restaurantRepository.create({
      ...createRestaurantDto,
      active: true,
      owner,
    });

    await this.restaurantRepository.save(restaurant);

    return restaurant;
  }

  async findAll(
    pagination: PaginationDto,
    route: string,
  ): Promise<PaginatedResult<Restaurant>> {
    const alias = 'restaurant';
    const qb = this.restaurantRepository.createQueryBuilder(alias);

    // Map client sort keys to safe DB columns
    const sortMap: Record<string, string> = {
      name: `${alias}.name`,
      location: `${alias}.location`,
      totalCapacity: `${alias}.total_capacity`,
      openTime: `${alias}.open_time`,
      closeTime: `${alias}.close_time`,
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
      searchable: [
        `${alias}.name`,
        `${alias}.description`,
        `${alias}.location`,
      ],
    });
  }

  async findMine(
    ownerId: string,
    pagination: PaginationDto,
    route: string,
  ): Promise<PaginatedResult<Restaurant>> {
    const alias = 'restaurant';
    const qb = this.restaurantRepository
      .createQueryBuilder(alias)
      .leftJoin(`${alias}.owner`, 'owner')
      .where('owner.id = :ownerId', { ownerId });

    const sortMap: Record<string, string> = {
      name: `${alias}.name`,
      location: `${alias}.location`,
      totalCapacity: `${alias}.total_capacity`,
      openTime: `${alias}.open_time`,
      closeTime: `${alias}.close_time`,
      createdAt: `${alias}.created_at`,
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
      searchable: [
        `${alias}.name`,
        `${alias}.description`,
        `${alias}.location`,
      ],
    });
  }

  async findOne(id: string) {
    const found = await this.restaurantRepository.findOne({
      where: { id },
    });
    if (!found) throw new NotFoundException(`Restaurant ${id} not found`);
    return found;
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
    ownerId: string,
  ) {
    const restaurant = await this.findOne(id);
    if (restaurant.owner?.id !== ownerId)
      throw new ForbiddenException('You can only update your own restaurants');
    Object.assign(restaurant, updateRestaurantDto);
    return this.restaurantRepository.save(restaurant);
  }

  async remove(id: string, ownerId: string) {
    const restaurant = await this.findOne(id);
    if (restaurant.owner?.id !== ownerId)
      throw new ForbiddenException('You can only delete your own restaurants');
    const { affected } = await this.restaurantRepository.delete({ id });
    if (!affected) throw new NotFoundException(`Restaurant ${id} not found`);
    return { ok: true };
  }
}
