import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  SectionObjectNotFoundError,
  SectionNotFoundForSectionObjectError,
  ObjectNotFoundForSectionObjectError,
} from '../../domain/index.js';
import {
  UpdateSectionObjectCommand,
  SectionObjectResponseDto,
} from '../dto/index.js';
import { SectionObjectMapper } from '../mappers/index.js';
import {
  SECTION_OBJECT_REPOSITORY,
  type SectionObjectRepositoryPort,
  SECTION_READER_FOR_SECTION_OBJECT,
  type SectionReaderForSectionObjectPort,
  OBJECT_READER_FOR_SECTION_OBJECT,
  type ObjectReaderForSectionObjectPort,
  SECTION_OBJECT_EVENT_PUBLISHER,
  type SectionObjectEventPublisherPort,
} from '../ports/index.js';

@Injectable()
export class UpdateSectionObjectUseCase
  implements UseCase<UpdateSectionObjectCommand, SectionObjectResponseDto>
{
  constructor(
    @Inject(SECTION_OBJECT_REPOSITORY)
    private readonly repo: SectionObjectRepositoryPort,
    @Inject(SECTION_READER_FOR_SECTION_OBJECT)
    private readonly sectionReader: SectionReaderForSectionObjectPort,
    @Inject(OBJECT_READER_FOR_SECTION_OBJECT)
    private readonly objectReader: ObjectReaderForSectionObjectPort,
    @Inject(SECTION_OBJECT_EVENT_PUBLISHER)
    private readonly events: SectionObjectEventPublisherPort,
  ) {}

  async execute(
    command: UpdateSectionObjectCommand,
  ): Promise<SectionObjectResponseDto> {
    const entity = await this.repo.findById(command.sectionObjectId);
    if (!entity) throw new SectionObjectNotFoundError(command.sectionObjectId);

    if (command.sectionId) {
      const exists = await this.sectionReader.exists(command.sectionId);
      if (!exists)
        throw new SectionNotFoundForSectionObjectError(command.sectionId);
    }
    if (command.objectId) {
      const exists = await this.objectReader.exists(command.objectId);
      if (!exists)
        throw new ObjectNotFoundForSectionObjectError(command.objectId);
    }

    const { sectionObjectId, ...patch } = command as any;
    entity.update(patch);
    const saved = await this.repo.save(entity);
    await this.events.publish({
      type: 'section-object.updated',
      sectionObjectId: saved.id,
      occurredAt: new Date(),
    });
    return SectionObjectMapper.toResponse(saved);
  }
}
