import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GraphicObjectOrmEntity } from '../../../objects/infrastructure/database/typeorm/orm';
import { type ObjectReaderForSectionObjectPort } from '../../application/ports';
import { ISectionObjectObjectReaderPort } from '../../domain';

@Injectable()
export class ObjectTypeOrmReaderForSectionObject
  implements ObjectReaderForSectionObjectPort, ISectionObjectObjectReaderPort
{
  constructor(
    @InjectRepository(GraphicObjectOrmEntity)
    private readonly objects: Repository<GraphicObjectOrmEntity>,
  ) {}
  async exists(objectId: string): Promise<boolean> {
    return !!(await this.objects.findOne({ where: { id: objectId } }));
  }
}
