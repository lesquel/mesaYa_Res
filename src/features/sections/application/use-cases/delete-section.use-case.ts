import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  DeleteSectionCommand,
  DeleteSectionResponseDto,
} from '../dto/index.js';
import { SectionMapper } from '../mappers/index.js';
import { type SectionRepositoryPort } from '../ports/index.js';
import { SectionNotFoundError } from '../../domain/index.js';

export class DeleteSectionUseCase
  implements UseCase<DeleteSectionCommand, DeleteSectionResponseDto>
{
  constructor(private readonly sectionRepository: SectionRepositoryPort) {}

  async execute(
    command: DeleteSectionCommand,
  ): Promise<DeleteSectionResponseDto> {
    const section = await this.sectionRepository.findById(command.sectionId);

    if (!section) {
      throw new SectionNotFoundError(command.sectionId);
    }

    const sectionResponse = SectionMapper.toResponse(section);

    await this.sectionRepository.delete(command.sectionId);

    return { ok: true, section: sectionResponse };
  }
}
