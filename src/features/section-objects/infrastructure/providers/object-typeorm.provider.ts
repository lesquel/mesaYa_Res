import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GraphicObjectOrmEntity } from '../../../objects/infrastructure/database/typeorm/orm/index';
import { type ObjectReaderForSectionObjectPort } from '../../application/ports/index';

@Injectable()
export class ObjectTypeOrmReaderForSectionObject
  implements ObjectReaderForSectionObjectPort
{
  constructor(
    @InjectRepository(GraphicObjectOrmEntity)
    private readonly objects: Repository<GraphicObjectOrmEntity>,
  ) {}
  async exists(objectId: string): Promise<boolean> {
    return !!(await this.objects.findOne({ where: { id: objectId } }));
  }
}
