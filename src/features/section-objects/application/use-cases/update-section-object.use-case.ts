import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { SectionObjectDomainService } from '../../domain';
import { UpdateSectionObjectCommand, SectionObjectResponseDto } from '../dto';
import { SectionObjectMapper } from '../mappers';
import {
  SECTION_OBJECT_EVENT_PUBLISHER,
  type SectionObjectEventPublisherPort,
} from '../ports';

@Injectable()
export class UpdateSectionObjectUseCase
  implements UseCase<UpdateSectionObjectCommand, SectionObjectResponseDto>
{
  constructor(
    private readonly sectionObjectDomainService: SectionObjectDomainService,
    @Inject(SECTION_OBJECT_EVENT_PUBLISHER)
    private readonly events: SectionObjectEventPublisherPort,
  ) {}

  async execute(
    command: UpdateSectionObjectCommand,
  ): Promise<SectionObjectResponseDto> {
    const sectionObject =
      await this.sectionObjectDomainService.updateSectionObject({
        sectionObjectId: command.sectionObjectId,
        sectionId: command.sectionId,
        objectId: command.objectId,
      });
    await this.events.publish({
      type: 'section-object.updated',
      sectionObjectId: sectionObject.id,
      occurredAt: new Date(),
    });
    return SectionObjectMapper.toResponse(sectionObject);
  }
}
