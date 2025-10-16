import { SectionObject } from '../../../../domain/index.js';
import { SectionObjectOrmEntity } from '../orm/index.js';

export class SectionObjectOrmMapper {
  static toDomain(entity: SectionObjectOrmEntity): SectionObject {
    return SectionObject.create(entity.id, { sectionId: entity.sectionId, objectId: entity.objectId });
  }

  static toOrmEntity(domain: SectionObject): SectionObjectOrmEntity {
    const s = domain.snapshot();
    const e = new SectionObjectOrmEntity();
    e.id = s.id;
    (e as any).sectionId = s.sectionId;
    (e as any).objectId = s.objectId;
    return e;
  }
}
