import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionOrmEntity } from '../../../sections/infrastructure/database/typeorm/orm/index.js';
import { type SectionReaderForSectionObjectPort } from '../../application/ports/index.js';

@Injectable()
export class SectionTypeOrmReaderForSectionObject implements SectionReaderForSectionObjectPort {
  constructor(@InjectRepository(SectionOrmEntity) private readonly sections: Repository<SectionOrmEntity>) {}
  async exists(sectionId: string): Promise<boolean> { return !!(await this.sections.findOne({ where: { id: sectionId } })); }
}
