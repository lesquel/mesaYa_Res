import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { SectionObjectNotFoundError } from '../../domain/index';
import {
  DeleteSectionObjectCommand,
  DeleteSectionObjectResponseDto,
} from '../dto/index';
import { SectionObjectMapper } from '../mappers/index';
import {
  SECTION_OBJECT_REPOSITORY,
  type SectionObjectRepositoryPort,
  SECTION_OBJECT_EVENT_PUBLISHER,
  type SectionObjectEventPublisherPort,
} from '../ports/index';

@Injectable()
export class DeleteSectionObjectUseCase
  implements UseCase<DeleteSectionObjectCommand, DeleteSectionObjectResponseDto>
{
  constructor(
    @Inject(SECTION_OBJECT_REPOSITORY)
    private readonly repo: SectionObjectRepositoryPort,
    @Inject(SECTION_OBJECT_EVENT_PUBLISHER)
    private readonly events: SectionObjectEventPublisherPort,
  ) {}

  async execute(
    command: DeleteSectionObjectCommand,
  ): Promise<DeleteSectionObjectResponseDto> {
    const entity = await this.repo.findById(command.sectionObjectId);
    if (!entity) throw new SectionObjectNotFoundError(command.sectionObjectId);
    const sectionObjectResponse = SectionObjectMapper.toResponse(entity);

    await this.repo.delete(command.sectionObjectId);
    await this.events.publish({
      type: 'section-object.deleted',
      sectionObjectId: command.sectionObjectId,
      occurredAt: new Date(),
    });
    return { ok: true, sectionObject: sectionObjectResponse };
  }
}
