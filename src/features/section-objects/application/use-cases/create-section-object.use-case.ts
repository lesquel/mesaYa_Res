import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { randomUUID } from 'crypto';
import {
  SectionObject,
  SectionNotFoundForSectionObjectError,
  ObjectNotFoundForSectionObjectError,
} from '../../domain/index';
import {
  CreateSectionObjectCommand,
  SectionObjectResponseDto,
} from '../dto/index';
import { SectionObjectMapper } from '../mappers/index';
import {
  SECTION_OBJECT_REPOSITORY,
  type SectionObjectRepositoryPort,
  SECTION_READER_FOR_SECTION_OBJECT,
  type SectionReaderForSectionObjectPort,
  OBJECT_READER_FOR_SECTION_OBJECT,
  type ObjectReaderForSectionObjectPort,
  SECTION_OBJECT_EVENT_PUBLISHER,
  type SectionObjectEventPublisherPort,
} from '../ports/index';

@Injectable()
export class CreateSectionObjectUseCase
  implements UseCase<CreateSectionObjectCommand, SectionObjectResponseDto>
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
    command: CreateSectionObjectCommand,
  ): Promise<SectionObjectResponseDto> {
    const [sectionExists, objectExists] = await Promise.all([
      this.sectionReader.exists(command.sectionId),
      this.objectReader.exists(command.objectId),
    ]);
    if (!sectionExists)
      throw new SectionNotFoundForSectionObjectError(command.sectionId);
    if (!objectExists)
      throw new ObjectNotFoundForSectionObjectError(command.objectId);

    const entity = SectionObject.create(randomUUID(), {
      sectionId: command.sectionId,
      objectId: command.objectId,
    });
    const saved = await this.repo.save(entity);
    await this.events.publish({
      type: 'section-object.created',
      sectionObjectId: saved.id,
      occurredAt: new Date(),
    });
    return SectionObjectMapper.toResponse(saved);
  }
}
