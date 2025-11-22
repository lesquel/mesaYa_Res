import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableOrmEntity } from '../../infrastructure/database/typeorm/orm/table.orm-entity';
import { SectionOrmEntity } from '../../../sections/infrastructure/database/typeorm/orm/section.orm-entity';
import { RestaurantOrmEntity } from '../../../restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity';
import {
  TableForbiddenError,
  TableNotFoundError,
  TableSectionNotFoundError,
  TableRestaurantNotFoundError,
} from '../../domain/errors';

interface SectionOwnershipSnapshot {
  sectionId: string;
  restaurantId: string;
  restaurantOwnerId: string | null;
}

interface TableOwnershipSnapshot extends SectionOwnershipSnapshot {
  tableId: string;
}

@Injectable()
export class TablesAccessService {
  constructor(
    @InjectRepository(TableOrmEntity)
    private readonly tables: Repository<TableOrmEntity>,
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
      throw new TableRestaurantNotFoundError(restaurantId);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new TableForbiddenError(
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
      throw new TableSectionNotFoundError(sectionId);
    }

    if (section.restaurantOwnerId !== ownerId) {
      throw new TableForbiddenError(
        'Section does not belong to authenticated owner',
      );
    }

    return section;
  }

  async assertTableOwnership(
    tableId: string,
    ownerId: string,
  ): Promise<TableOwnershipSnapshot> {
    const table = await this.loadTableOwnership(tableId);

    if (!table) {
      throw new TableNotFoundError(tableId);
    }

    if (table.restaurantOwnerId !== ownerId) {
      throw new TableForbiddenError(
        'Table does not belong to authenticated owner',
      );
    }

    return table;
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

  private async loadTableOwnership(
    tableId: string,
  ): Promise<TableOwnershipSnapshot | null> {
    const table = await this.tables
      .createQueryBuilder('table')
      .leftJoinAndSelect('table.section', 'section')
      .leftJoinAndSelect('section.restaurant', 'restaurant')
      .where('table.id = :tableId', { tableId })
      .select([
        'table.id',
        'table.sectionId',
        'section.id',
        'section.restaurantId',
        'restaurant.id',
        'restaurant.ownerId',
      ])
      .getOne();

    if (!table) {
      return null;
    }

    return {
      tableId: table.id,
      sectionId: table.sectionId,
      restaurantId:
        table.section?.restaurantId ?? table.section?.restaurant?.id ?? null,
      restaurantOwnerId: table.section?.restaurant?.ownerId ?? null,
    };
  }
}
