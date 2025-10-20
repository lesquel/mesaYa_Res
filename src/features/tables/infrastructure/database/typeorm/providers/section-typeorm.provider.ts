import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionOrmEntity } from '../../../../../sections/infrastructure/database/typeorm/orm/index';
import { type SectionTableReaderPort } from '../../../../application/ports/index';

@Injectable()
export class SectionTypeOrmTableProvider implements SectionTableReaderPort {
  constructor(
    @InjectRepository(SectionOrmEntity)
    private readonly sections: Repository<SectionOrmEntity>,
  ) {}

  async exists(sectionId: string): Promise<boolean> {
    if (!sectionId) return false;
    const count = await this.sections.count({ where: { id: sectionId } });
    return count > 0;
  }
}
