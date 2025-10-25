import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionOrmEntity } from '../../../sections/infrastructure/database/typeorm/orm';
import { type SectionReaderForSectionObjectPort } from '../../application/ports';
import { ISectionObjectSectionReaderPort } from '../../domain';

@Injectable()
export class SectionTypeOrmReaderForSectionObject
  implements SectionReaderForSectionObjectPort, ISectionObjectSectionReaderPort
{
  constructor(
    @InjectRepository(SectionOrmEntity)
    private readonly sections: Repository<SectionOrmEntity>,
  ) {}
  async exists(sectionId: string): Promise<boolean> {
    return !!(await this.sections.findOne({ where: { id: sectionId } }));
  }
}
