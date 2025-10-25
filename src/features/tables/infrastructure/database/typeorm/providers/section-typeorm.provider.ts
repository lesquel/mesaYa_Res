import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionOrmEntity } from '../../../../../sections/infrastructure/database/typeorm/orm';
import { type SectionTableReaderPort } from '../../../../application/ports';
import {
  ITableSectionPort,
  type TableSectionSnapshot,
} from '../../../../domain/ports';

@Injectable()
export class SectionTypeOrmTableProvider
  implements SectionTableReaderPort, ITableSectionPort
{
  constructor(
    @InjectRepository(SectionOrmEntity)
    private readonly sections: Repository<SectionOrmEntity>,
  ) {}

  async exists(sectionId: string): Promise<boolean> {
    if (!sectionId) return false;
    const count = await this.sections.count({ where: { id: sectionId } });
    return count > 0;
  }

  async loadById(sectionId: string): Promise<TableSectionSnapshot | null> {
    if (!sectionId) return null;

    const section = await this.sections.findOne({ where: { id: sectionId } });
    if (!section) {
      return null;
    }

    return {
      sectionId: section.id,
      restaurantId: section.restaurantId,
      width: section.width,
      height: section.height,
    };
  }
}
