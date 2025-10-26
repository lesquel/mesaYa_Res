import { SectionObject } from '../../../../domain';
import { SectionObjectOrmEntity } from '../orm';

export class SectionObjectOrmMapper {
  static toDomain(entity: SectionObjectOrmEntity): SectionObject {
    return SectionObject.create(entity.id, {
      sectionId: entity.sectionId,
      objectId: entity.objectId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrmEntity(domain: SectionObject): SectionObjectOrmEntity {
    const s = domain.snapshot();
    const e = new SectionObjectOrmEntity();
    e.id = s.id;
    (e as any).sectionId = s.sectionId;
    (e as any).objectId = s.objectId;
    e.createdAt = s.createdAt;
    e.updatedAt = s.updatedAt;
    return e;
  }
}
