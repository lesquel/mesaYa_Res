import { UseCase } from '@shared/application/ports/use-case.port';
import { SectionDomainService } from '../../domain';
import { DeleteSectionCommand, DeleteSectionResponseDto } from '../dto';
import { SectionMapper } from '../mappers';

export class DeleteSectionUseCase
  implements UseCase<DeleteSectionCommand, DeleteSectionResponseDto>
{
  constructor(private readonly sectionDomainService: SectionDomainService) {}

  async execute(
    command: DeleteSectionCommand,
  ): Promise<DeleteSectionResponseDto> {
    const removed = await this.sectionDomainService.deleteSection({
      sectionId: command.sectionId,
    });

    const sectionResponse = SectionMapper.toResponse(removed);

    return { ok: true, section: sectionResponse };
  }
}
