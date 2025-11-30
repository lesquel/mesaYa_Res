import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableOrmEntity } from '../../infrastructure/database/typeorm/orm/table.orm-entity';
import { SectionOrmEntity } from '../../../sections/infrastructure/database/typeorm/orm/section.orm-entity';
import {
  RESTAURANT_OWNERSHIP_PORT,
  type IRestaurantOwnershipPort,
} from '@shared/application/ports/restaurant-ownership.port';
import { NotFoundError, ForbiddenError } from '@shared/domain/errors';
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
        throw new TableRestaurantNotFoundError(restaurantId);
      }
      if (error instanceof ForbiddenError) {
        throw new TableForbiddenError(
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
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.section', 'section')
      .leftJoinAndSelect('section.restaurant', 'restaurant')
      .where('t.id = :tableId', { tableId })
      .select([
        't.id',
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
      sectionId: table.section.id,
      restaurantId:
        table.section?.restaurantId ?? table.section?.restaurant?.id ?? null,
      restaurantOwnerId: table.section?.restaurant?.ownerId ?? null,
    };
  }
}
