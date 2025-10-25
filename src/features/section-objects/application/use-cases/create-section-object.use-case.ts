import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { randomUUID } from 'crypto';
import { SectionObjectDomainService } from '../../domain';
import { CreateSectionObjectCommand, SectionObjectResponseDto } from '../dto';
import { SectionObjectMapper } from '../mappers';
import {
  SECTION_OBJECT_EVENT_PUBLISHER,
  type SectionObjectEventPublisherPort,
} from '../ports';

@Injectable()
export class CreateSectionObjectUseCase
  implements UseCase<CreateSectionObjectCommand, SectionObjectResponseDto>
{
  constructor(
    private readonly sectionObjectDomainService: SectionObjectDomainService,
    @Inject(SECTION_OBJECT_EVENT_PUBLISHER)
    private readonly events: SectionObjectEventPublisherPort,
  ) {}

  async execute(
    command: CreateSectionObjectCommand,
  ): Promise<SectionObjectResponseDto> {
    const sectionObject =
      await this.sectionObjectDomainService.createSectionObject({
        sectionObjectId: randomUUID(),
        sectionId: command.sectionId,
        objectId: command.objectId,
      });
    await this.events.publish({
      type: 'section-object.created',
      sectionObjectId: sectionObject.id,
      occurredAt: new Date(),
    });
    return SectionObjectMapper.toResponse(sectionObject);
  }
}
