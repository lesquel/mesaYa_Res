import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionOrmEntity } from '../../infrastructure/database/typeorm/orm/section.orm-entity';
import {
  RESTAURANT_OWNERSHIP_PORT,
  type IRestaurantOwnershipPort,
} from '@shared/application/ports/restaurant-ownership.port';
import {
  SectionForbiddenError,
  SectionNotFoundError,
  SectionRestaurantNotFoundError,
} from '../../domain/errors';
import { NotFoundError, ForbiddenError } from '@shared/domain/errors';

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
    @Inject(RESTAURANT_OWNERSHIP_PORT)
    private readonly restaurantOwnership: IRestaurantOwnershipPort,
  ) {}

  async findRestaurantIdByOwner(ownerId: string): Promise<string | null> {
    return this.restaurantOwnership.findRestaurantIdByOwner(ownerId);
  }

  async findRestaurantIdsByOwner(ownerId: string): Promise<string[]> {
    return this.restaurantOwnership.findRestaurantIdsByOwner(ownerId);
  }

  async assertRestaurantOwnership(
    restaurantId: string,
    ownerId: string,
  ): Promise<void> {
    try {
      await this.restaurantOwnership.assertRestaurantOwnership(restaurantId, ownerId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new SectionRestaurantNotFoundError(restaurantId);
      }
      if (error instanceof ForbiddenError) {
        throw new SectionForbiddenError(
          'Restaurant does not belong to authenticated owner',
        );
      }
      throw error;
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
