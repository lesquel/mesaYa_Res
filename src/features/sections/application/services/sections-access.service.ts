import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionOrmEntity } from '../../infrastructure/database/typeorm/orm/section.orm-entity';
import { RestaurantOrmEntity } from '@features/restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity';
import {
  SectionForbiddenError,
  SectionNotFoundError,
  SectionRestaurantNotFoundError,
} from '../../domain/errors';

interface SectionOwnershipSnapshot {
  sectionId: string;
  restaurantId: string;
  restaurantOwnerId: string | null;
}

@Injectable()
export class SectionsAccessService {
  constructor(
    @InjectRepository(SectionOrmEntity)
    private readonly sections: Repository<SectionOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {}

  async assertRestaurantOwnership(
    restaurantId: string,
    ownerId: string,
  ): Promise<void> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId },
      select: { id: true, ownerId: true },
    });

    if (!restaurant) {
      throw new SectionRestaurantNotFoundError(restaurantId);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new SectionForbiddenError(
        'Restaurant does not belong to authenticated owner',
      );
    }
  }

  async assertSectionOwnership(
    sectionId: string,
    ownerId: string,
  ): Promise<SectionOwnershipSnapshot> {
    const section = await this.loadSectionOwnership(sectionId);

    if (!section) {
      throw new SectionNotFoundError(sectionId);
    }

    if (section.restaurantOwnerId !== ownerId) {
      throw new SectionForbiddenError(
        'Section does not belong to authenticated owner',
      );
    }

    return {
      sectionId: section.sectionId,
      restaurantId: section.restaurantId,
      restaurantOwnerId: section.restaurantOwnerId,
    };
  }

  private async loadSectionOwnership(
    sectionId: string,
  ): Promise<SectionOwnershipSnapshot | null> {
    const section = await this.sections
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.restaurant', 'restaurant')
      .where('section.id = :sectionId', { sectionId })
      .select([
        'section.id',
        'section.restaurantId',
        'restaurant.id',
        'restaurant.ownerId',
      ])
      .getOne();

    if (!section) {
      return null;
    }

    return {
      sectionId: section.id,
      restaurantId: section.restaurantId,
      restaurantOwnerId: section.restaurant?.ownerId ?? null,
    };
  }
}
