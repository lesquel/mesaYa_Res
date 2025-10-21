import {
  ObjectNotFoundForSectionObjectError,
  SectionNotFoundForSectionObjectError,
  SectionObject,
  SectionObjectNotFoundError,
  type SectionObjectProps,
} from '../entities/section-object.entity';
import { ISectionObjectDomainRepositoryPort } from '../repositories';
import {
  ISectionObjectObjectReaderPort,
  ISectionObjectSectionReaderPort,
} from '../ports';
import {
  type SectionObjectCreateRequest,
  type SectionObjectDeleteRequest,
  type SectionObjectUpdateRequest,
} from '../types';

export class SectionObjectDomainService {
  constructor(
    private readonly sectionObjectRepository: ISectionObjectDomainRepositoryPort,
    private readonly sectionReader: ISectionObjectSectionReaderPort,
    private readonly objectReader: ISectionObjectObjectReaderPort,
  ) {}

  async createSectionObject(
    request: SectionObjectCreateRequest,
  ): Promise<SectionObject> {
    await this.ensureSectionExists(request.sectionId);
    await this.ensureObjectExists(request.objectId);

    const sectionObject = SectionObject.create(request.sectionObjectId, {
      sectionId: request.sectionId,
      objectId: request.objectId,
    });

    return this.sectionObjectRepository.save(sectionObject);
  }

  async updateSectionObject(
    request: SectionObjectUpdateRequest,
  ): Promise<SectionObject> {
    const sectionObject = await this.ensureSectionObject(
      request.sectionObjectId,
    );

    const patch: Partial<SectionObjectProps> = {};

    if (request.sectionId !== undefined) {
      await this.ensureSectionExists(request.sectionId);
      if (request.sectionId !== sectionObject.sectionId) {
        patch.sectionId = request.sectionId;
      }
    }

    if (request.objectId !== undefined) {
      await this.ensureObjectExists(request.objectId);
      if (request.objectId !== sectionObject.objectId) {
        patch.objectId = request.objectId;
      }
    }

    if (Object.keys(patch).length > 0) {
      sectionObject.update(patch);
    }

    return this.sectionObjectRepository.save(sectionObject);
  }

  async deleteSectionObject(
    request: SectionObjectDeleteRequest,
  ): Promise<SectionObject> {
    const sectionObject = await this.ensureSectionObject(
      request.sectionObjectId,
    );

    await this.sectionObjectRepository.delete(sectionObject.id);
    return sectionObject;
  }

  private async ensureSectionObject(
    sectionObjectId: string,
  ): Promise<SectionObject> {
    const sectionObject =
      await this.sectionObjectRepository.findById(sectionObjectId);

    if (!sectionObject) {
      throw new SectionObjectNotFoundError(sectionObjectId);
    }

    return sectionObject;
  }

  private async ensureSectionExists(sectionId: string): Promise<void> {
    const exists = await this.sectionReader.exists(sectionId);

    if (!exists) {
      throw new SectionNotFoundForSectionObjectError(sectionId);
    }
  }

  private async ensureObjectExists(objectId: string): Promise<void> {
    const exists = await this.objectReader.exists(objectId);

    if (!exists) {
      throw new ObjectNotFoundForSectionObjectError(objectId);
    }
  }
}
