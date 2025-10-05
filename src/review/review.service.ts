import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity.js';
import { Restaurant } from '../restaurant/entities/restaurant.entity.js';
import { User } from '../auth/entities/user.entity.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import {
  PaginatedResult,
  paginateQueryBuilder,
} from '../common/pagination/paginate.js';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private readonly reviews: Repository<Review>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: string) {
    const { restaurantId, rating, comment } = createReviewDto;

    const [restaurant, user] = await Promise.all([
      this.restaurants.findOne({ where: { id: restaurantId } }),
      this.users.findOne({ where: { id: userId } }),
    ]);
    if (!restaurant)
      throw new NotFoundException(`Restaurant ${restaurantId} not found`);
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    // Optional: ensure one review per user per restaurant
    const existing = await this.reviews.findOne({
      where: { user: { id: userId }, restaurant: { id: restaurantId } },
      relations: ['user', 'restaurant'],
    });
    if (existing) {
      // Update instead
      existing.rating = rating;
      existing.comment = comment;
      return this.reviews.save(existing);
    }

    const review = this.reviews.create({
      user,
      restaurant,
      rating,
      comment,
    });
    await this.reviews.save(review);
    return review;
  }

  async findAll(
    pagination: PaginationDto,
    route: string,
  ): Promise<PaginatedResult<Review>> {
    const alias = 'review';
    const qb = this.reviews
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.user`, 'user')
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant');

    const sortMap: Record<string, string> = {
      createdAt: `${alias}.created_at`,
      rating: `${alias}.rating`,
      restaurant: `restaurant.name`,
      user: `user.name`,
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
        `${alias}.comment`,
        `restaurant.name`,
        `user.name`,
        `user.email`,
      ],
    });
  }

  async findByRestaurant(
    restaurantId: string,
    pagination: PaginationDto,
    route: string,
  ): Promise<PaginatedResult<Review>> {
    const alias = 'review';
    const qb = this.reviews
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.user`, 'user')
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant')
      .where('restaurant.id = :restaurantId', { restaurantId });

    return paginateQueryBuilder(qb, {
      ...pagination,
      route,
      sortBy: `${alias}.created_at`,
      allowedSorts: [`${alias}.created_at`, `${alias}.rating`],
    });
  }

  async findOne(id: string) {
    const review = await this.reviews.findOne({
      where: { id },
      relations: ['user', 'restaurant'],
    });
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string) {
    const review = await this.findOne(id);
    if (review.user.id !== userId)
      throw new ForbiddenException('You can only edit your own reviews');
    Object.assign(review, updateReviewDto);
    return this.reviews.save(review);
  }

  async remove(id: string, userId: string) {
    const review = await this.findOne(id);
    if (review.user.id !== userId)
      throw new ForbiddenException('You can only delete your own reviews');
    await this.reviews.delete({ id });
    return { ok: true };
  }
}
