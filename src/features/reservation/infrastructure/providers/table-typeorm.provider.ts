import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableOrmEntity } from '@features/tables/infrastructure/database/typeorm/orm/table.orm-entity';
import { SectionOrmEntity } from '@features/sections/infrastructure/database/typeorm/orm/section.orm-entity';
import {
  IReservationTablePort,
  type ReservationTableSnapshot,
} from '../../domain/ports';

@Injectable()
export class TableTypeOrmReservationProvider extends IReservationTablePort {
  constructor(
    @InjectRepository(TableOrmEntity)
    private readonly tables: Repository<TableOrmEntity>,
    @InjectRepository(SectionOrmEntity)
    private readonly sections: Repository<SectionOrmEntity>,
  ) {
    super();
  }

  async loadById(tableId: string): Promise<ReservationTableSnapshot | null> {
    if (!tableId) {
      return null;
    }

    const table = await this.tables.findOne({
      where: { id: tableId },
      relations: ['section', 'section.restaurant'],
    });

    if (!table || !table.section) {
      return null;
    }

    const restaurantId =
      table.section.restaurantId ?? table.section.restaurant?.id ?? null;

    if (!restaurantId) {
      return null;
    }

    return {
      tableId: table.id,
      sectionId: table.section.id,
      restaurantId,
      capacity: table.capacity,
    };
  }
}
