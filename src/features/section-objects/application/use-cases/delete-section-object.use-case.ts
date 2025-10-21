import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { SectionObjectDomainService } from '../../domain/index';
import {
  DeleteSectionObjectCommand,
  DeleteSectionObjectResponseDto,
} from '../dto/index';
import { SectionObjectMapper } from '../mappers/index';
import {
  SECTION_OBJECT_EVENT_PUBLISHER,
  type SectionObjectEventPublisherPort,
} from '../ports/index';

@Injectable()
export class DeleteSectionObjectUseCase
  implements UseCase<DeleteSectionObjectCommand, DeleteSectionObjectResponseDto>
{
  constructor(
    private readonly sectionObjectDomainService: SectionObjectDomainService,
    @Inject(SECTION_OBJECT_EVENT_PUBLISHER)
    private readonly events: SectionObjectEventPublisherPort,
  ) {}

  async execute(
    command: DeleteSectionObjectCommand,
  ): Promise<DeleteSectionObjectResponseDto> {
    const sectionObject =
      await this.sectionObjectDomainService.deleteSectionObject({
        sectionObjectId: command.sectionObjectId,
      });
    const sectionObjectResponse = SectionObjectMapper.toResponse(sectionObject);
    await this.events.publish({
      type: 'section-object.deleted',
      sectionObjectId: command.sectionObjectId,
      occurredAt: new Date(),
    });
    return { ok: true, sectionObject: sectionObjectResponse };
  }
}
