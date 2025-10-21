import { SectionObject } from '../entities/section-object.entity';

export abstract class ISectionObjectDomainRepositoryPort {
  abstract save(entity: SectionObject): Promise<SectionObject>;
  abstract findById(sectionObjectId: string): Promise<SectionObject | null>;
  abstract delete(sectionObjectId: string): Promise<void>;
}
